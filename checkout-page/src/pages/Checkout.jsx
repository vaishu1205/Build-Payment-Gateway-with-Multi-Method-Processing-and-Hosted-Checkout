import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderSummary from "../components/OrderSummary";
import PaymentMethodSelector from "../components/PaymentMethodSelector";
import UPIForm from "../components/UPIForm";
import CardForm from "../components/CardForm";
import ProcessingState from "../components/ProcessingState";
import SuccessState from "../components/SuccessState";
import ErrorState from "../components/ErrorState";

const Checkout = () => {
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get("order_id");
    const embedded = params.get("embedded");

    setIsEmbedded(embedded === "true");

    if (order_id) {
      setOrderId(order_id);
      fetchOrderDetails(order_id);
    } else {
      setLoading(false);
      setErrorMessage("Order ID not provided");
    }
  }, []);

  const sendMessageToParent = (type, data) => {
    if (isEmbedded && window.parent) {
      window.parent.postMessage(
        {
          type: type,
          data: data,
        },
        "*"
      );
    }
  };

  const fetchOrderDetails = async (order_id) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/orders/${order_id}/public`
      );
      setOrderData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      setErrorMessage("Order not found");
      setLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentStatus("");
    setErrorMessage("");
  };

  const handleUPISubmit = async (vpa) => {
    setProcessing(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/payments/public",
        {
          order_id: orderId,
          method: "upi",
          vpa: vpa,
        }
      );

      const payment = response.data;
      setPaymentId(payment.id);
      pollPaymentStatus(payment.id);
    } catch (error) {
      setProcessing(false);
      const errorMsg =
        error.response?.data?.error?.description || "Payment failed";
      setErrorMessage(errorMsg);

      sendMessageToParent("payment_failed", {
        error: errorMsg,
      });
    }
  };

  const handleCardSubmit = async (cardData) => {
    setProcessing(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/payments/public",
        {
          order_id: orderId,
          method: "card",
          card: cardData,
        }
      );

      const payment = response.data;
      setPaymentId(payment.id);
      pollPaymentStatus(payment.id);
    } catch (error) {
      setProcessing(false);
      const errorMsg =
        error.response?.data?.error?.description || "Payment failed";
      setErrorMessage(errorMsg);

      sendMessageToParent("payment_failed", {
        error: errorMsg,
      });
    }
  };

  const pollPaymentStatus = (payment_id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/payments/${payment_id}/public`
        );
        const payment = response.data;

        if (payment.status === "success") {
          setPaymentStatus("success");
          setProcessing(false);
          clearInterval(interval);

          sendMessageToParent("payment_success", {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: payment.amount,
            status: payment.status,
          });
        } else if (payment.status === "failed") {
          setPaymentStatus("failed");
          const errorMsg = payment.error_description || "Payment failed";
          setErrorMessage(errorMsg);
          setProcessing(false);
          clearInterval(interval);

          sendMessageToParent("payment_failed", {
            error: errorMsg,
          });
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      if (processing) {
        setProcessing(false);
        setErrorMessage("Payment timeout");

        sendMessageToParent("payment_failed", {
          error: "Payment timeout",
        });
      }
    }, 30000);
  };

  const handleRetry = () => {
    setPaymentStatus("");
    setErrorMessage("");
    setSelectedMethod("");
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!orderData) {
    return <div style={styles.error}>Order not found</div>;
  }

  return (
    <div style={styles.container}>
      <div data-test-id="checkout-container" style={styles.checkoutBox}>
        {paymentStatus === "" && !processing && (
          <>
            <OrderSummary orderData={orderData} />

            {!selectedMethod && (
              <PaymentMethodSelector onSelectMethod={handleMethodSelect} />
            )}

            {selectedMethod === "upi" && (
              <UPIForm
                orderAmount={orderData.amount}
                onSubmit={handleUPISubmit}
                errorMessage={errorMessage}
              />
            )}

            {selectedMethod === "card" && (
              <CardForm
                orderAmount={orderData.amount}
                onSubmit={handleCardSubmit}
                errorMessage={errorMessage}
              />
            )}
          </>
        )}

        {processing && <ProcessingState />}

        {paymentStatus === "success" && <SuccessState paymentId={paymentId} />}

        {paymentStatus === "failed" && (
          <ErrorState errorMessage={errorMessage} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  checkoutBox: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#dc3545",
  },
};

export default Checkout;
