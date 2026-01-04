const validateVPA = (vpa) => {
  const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return vpaRegex.test(vpa);
};

const luhnAlgorithm = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const detectCardNetwork = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  if (cleaned.startsWith("4")) {
    return "visa";
  }

  const firstTwo = cleaned.substring(0, 2);
  if (["51", "52", "53", "54", "55"].includes(firstTwo)) {
    return "mastercard";
  }

  if (["34", "37"].includes(firstTwo)) {
    return "amex";
  }

  if (["60", "65"].includes(firstTwo)) {
    return "rupay";
  }

  const firstTwoNum = parseInt(firstTwo);
  if (firstTwoNum >= 81 && firstTwoNum <= 89) {
    return "rupay";
  }

  return "unknown";
};

const validateCardExpiry = (expiryMonth, expiryYear) => {
  const month = parseInt(expiryMonth);

  if (month < 1 || month > 12) {
    return false;
  }

  let year = parseInt(expiryYear);
  if (year < 100) {
    year += 2000;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
};

const generateId = (prefix) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix;
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = {
  validateVPA,
  luhnAlgorithm,
  detectCardNetwork,
  validateCardExpiry,
  generateId,
};
