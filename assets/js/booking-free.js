const FREE_CALL_REDIRECT_URL = 'https://calendar.google.com/';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();

  const termsConsent = document.getElementById('termsConsent').checked;
  const privacyConsent = document.getElementById('privacyConsent').checked;
  const disclaimerConsent = document.getElementById('disclaimerConsent').checked;
  const noSalesPitch = document.getElementById('noSalesPitch').checked;

  const fullNameError = document.getElementById('fullNameError');
  const emailError = document.getElementById('emailError');
  const submitBtn = document.getElementById('submitBtn');

  if (fullNameError) fullNameError.textContent = '';
  if (emailError) emailError.textContent = '';

  let isValid = true;

  if (!fullName) {
    isValid = false;
  }

  if (!email || !validateEmail(email)) {
    isValid = false;
  }

  if (!termsConsent || !privacyConsent || !disclaimerConsent || !noSalesPitch) {
    isValid = false;
  }

  submitBtn.disabled = !isValid;
  return isValid;
}

document.addEventListener('DOMContentLoaded', () => {
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const termsConsent = document.getElementById('termsConsent');
  const privacyConsent = document.getElementById('privacyConsent');
  const disclaimerConsent = document.getElementById('disclaimerConsent');
  const noSalesPitch = document.getElementById('noSalesPitch');
  const form = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');

  fullName.addEventListener('input', validateForm);
  email.addEventListener('input', validateForm);
  termsConsent.addEventListener('change', validateForm);
  privacyConsent.addEventListener('change', validateForm);
  disclaimerConsent.addEventListener('change', validateForm);
  noSalesPitch.addEventListener('change', validateForm);

  validateForm();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const fullNameValue = fullName.value.trim();
    const emailValue = email.value.trim();

    if (fullNameError) fullNameError.textContent = '';
    if (emailError) emailError.textContent = '';

    let hasError = false;

    if (!fullNameValue) {
      if (fullNameError) fullNameError.textContent = 'Please enter your full name.';
      hasError = true;
    }

    if (!emailValue) {
      if (emailError) emailError.textContent = 'Please enter your email address.';
      hasError = true;
    } else if (!validateEmail(emailValue)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      hasError = true;
    }

    if (hasError || !validateForm()) {
      validateForm();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting...';

    window.location.href = FREE_CALL_REDIRECT_URL;
  });
});
