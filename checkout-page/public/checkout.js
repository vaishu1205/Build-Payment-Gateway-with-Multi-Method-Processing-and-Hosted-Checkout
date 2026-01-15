(function () {
  "use strict";

  class PaymentGateway {
    constructor(options) {
      // Validate required options
      if (!options || !options.key || !options.orderId) {
        throw new Error("PaymentGateway requires key and orderId");
      }

      this.key = options.key;
      this.orderId = options.orderId;
      this.onSuccess = options.onSuccess || function () {};
      this.onFailure = options.onFailure || function () {};
      this.onClose = options.onClose || function () {};

      this.modal = null;
      this.iframe = null;

      this.boundMessageHandler = this.handleMessage.bind(this);
    }

    open() {
      // Create modal overlay
      this.modal = document.createElement("div");
      this.modal.id = "payment-gateway-modal";
      this.modal.setAttribute("data-test-id", "payment-modal");

      // Apply modal styles
      this.modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
      `;

      // Create modal content container
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";
      modalContent.style.cssText = `
        position: relative;
        width: 90%;
        max-width: 500px;
        height: 90%;
        max-height: 700px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
      `;

      // Create close button
      const closeButton = document.createElement("button");
      closeButton.setAttribute("data-test-id", "close-modal-button");
      closeButton.className = "close-button";
      closeButton.innerHTML = "×";
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        width: 30px;
        height: 30px;
        background: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      `;
      closeButton.onclick = () => this.close();

      // Create iframe
      this.iframe = document.createElement("iframe");
      this.iframe.setAttribute("data-test-id", "payment-iframe");
      this.iframe.src = `http://localhost:3001/checkout?order_id=${this.orderId}&embedded=true`;
      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;

      // Assemble modal
      modalContent.appendChild(closeButton);
      modalContent.appendChild(this.iframe);
      this.modal.appendChild(modalContent);

      // Add to document
      document.body.appendChild(this.modal);

      // Set up message listener
      window.addEventListener("message", this.boundMessageHandler);
    }

    handleMessage(event) {
      // Accept messages from any origin for development
      // In production, validate event.origin

      if (!event.data || !event.data.type) {
        return;
      }

      switch (event.data.type) {
        case "payment_success":
          this.onSuccess(event.data.data);
          this.close();
          break;
        case "payment_failed":
          this.onFailure(event.data.data);
          break;
        case "close_modal":
          this.close();
          break;
      }
    }

    close() {
      // Remove message listener
      window.removeEventListener("message", this.boundMessageHandler);

      // Remove modal from DOM
      if (this.modal && this.modal.parentNode) {
        this.modal.parentNode.removeChild(this.modal);
      }

      this.modal = null;
      this.iframe = null;

      // Call onClose callback
      this.onClose();
    }
  }

  // Expose globally
  window.PaymentGateway = PaymentGateway;
})();
