const isValidEmail = (email) => {
  const emailExpresion = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailExpresion.test(email);
};

const isValidPhoneNumber = (phone) => {
  const phoneNuberExpresion = /^\+?[0-9]{10,15}$/;
  return phoneNuberExpresion.test(phone);
};

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
};
