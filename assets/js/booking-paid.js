const APPS_SCRIPT_URL = 'https://hook.us2.make.com/nlz437jbe9lx9f2llujukmpnpdgtyoqv';

const PAID_CHECKOUT_LINKS = {
  'entry-strategy-449': 'https://buy.stripe.com/14AeV7cR52mJ2p81O4enS00',
  'entry-strategy-549': 'https://buy.stripe.com/fZu8wJ5oD3qN5Bk9gwenS01'
};

const LEGAL_DOCS = {
  termsOfService: {
    accepted: true,
    url: '../legal/terms.html',
    name: 'Terms of Service'
  },
  clientAgreement: {
    accepted: true,
    url: '../legal/client-agreement.html',
    name: 'Client Agreement'
  },
  refundPolicy: {
    accepted: true,
    url: '../legal/refund-policy.html',
    name: 'Refund Policy'
  },
  privacyPolicy: {
    accepted: true,
    url: '../legal/privacy.html',
    name: 'Privacy Policy'
  },
  disclaimer: {
    accepted: true,
    url: '../legal/disclaimer.html',
    name: 'Disclaimer'
  }
};

function getDeviceType(userAgent) {
  return /mobile|android|iphone|ipad|tablet/i.test(userAgent) ? 'mobile' : 'desktop';
}

async function getClientInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let ip = 'unknown';
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ip = data.ip;
  } catch (e) {
    console.log('Could not fetch IP');
  }

  return {
    ip,
    userAgent,
    platform,
    timestamp: new Date().toISOString(),
    deviceType: getDeviceType(userAgent)
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearProductSelection() {
  document.querySelectorAll('.product-box').forEach((box) => {
    box.classList.remove('selected');
  });
}

function selectProduct(productId) {
  const radio = document.getElementById(productId);
  if (!radio) return;

  radio.checked = true;
  clearProductSelection();

  const box = radio.closest('.product-box');
  if (box) {
    box.classList.add('selected');
  }
}

function preselectPlanFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan');

  if (plan === '449') {
    selectProduct('product449');
  } else if (plan === '549') {
    selectProduct('product549');
  }
}

function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const productSelected = document.querySelector('input[name="product"]:checked');
  const legalConsent = document.getElementById('legalConsent').checked;

  const fullNameError = document.getElementById('fullNameError');
  const emailError = document.getElementById('emailError');

  if (fullNameError) fullNameError.textContent = '';
  if (emailError) emailError.textContent = '';

  let isValid = true;

  if (!fullName) {
    isValid = false;
  }

  if (!email || !validateEmail(email)) {
    isValid = false;
  }

  if (!productSelected || !legalConsent) {
    isValid = false;
  }

  document.getElementById('submitBtn').disabled = !isValid;
  return isValid;
}

function attachProductSelectionHandlers() {
  document.querySelectorAll('input[name="product"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      clearProductSelection();

      const selectedBox = e.target.closest('.product-box');
      if (selectedBox) {
        selectedBox.classList.add('selected');
      }

      validateForm();
    });
  });
}

function attachValidationHandlers() {
  document.getElementById('fullName').addEventListener('input', validateForm);
  document.getElementById('email').addEventListener('input', validateForm);
  document.getElementById('legalConsent').addEventListener('change', validateForm);
}

async function sendToMake(payload) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Make webhook error:', response.status, response.statusText);
    }

    return response;
  } catch (error) {
    console.error('Error sending to Make:', error);
    throw error;
  }
}

function buildConsentData({ fullName, email, productValue, productPrice, clientInfo, now }) {
  const checkboxText =
    'I have read and agree to the documents governing this purchase. Terms of Service · Client Agreement · Refund Policy · Privacy Policy · Disclaimer';

  return {
    fullName,
    email,
    product: productValue,
    price: Number(productPrice),
    service: `Entry Strategy $${productPrice}`,
    legalConsentAgreed: true,
    legalConsentTimestamp: now,
    consentTimestamp: now,
    accepted_at: now,
    allConsentsObtained: true,
    checkboxText,
    sourcePage: window.location.href,
    legalDocsAccepted: LEGAL_DOCS,
    ipAddress: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    platform: clientInfo.platform,
    deviceType: clientInfo.deviceType,
    nextStep: 'stripe-checkout',
    intendedRedirectAfterPayment: 'google-calendar'
  };
}

function buildPayload(consentData) {
  return {
    source: 'paid-booking',
    flow: 'booking-page -> stripe -> google-calendar',

    fullName: consentData.fullName,
    email: consentData.email,
    product: consentData.product,
    price: consentData.price,
    service: consentData.service,

    accepted: true,
    accepted_at: consentData.accepted_at,
    consentTimestamp: consentData.consentTimestamp,
    legalConsentTimestamp: consentData.legalConsentTimestamp,

    consentType: 'Paid Booking Consent',
    legalBundleVersion: 'legal-bundle-apr-2026-v1',
    documentsCount: 5,
    expectedDocumentsCount: 5,

    sourcePage: consentData.sourcePage,
    checkbox_text_shown: consentData.checkboxText,

    consents: {
      legalConsent: true,
      termsOfService: true,
      clientAgreement: true,
      refundPolicy: true,
      privacyPolicy: true,
      disclaimer: true
    },

    legalDocs: consentData.legalDocsAccepted,

    tracking: {
      ip: consentData.ipAddress,
      userAgent: consentData.userAgent,
      platform: consentData.platform,
      deviceType: consentData.deviceType
    },

    raw_payload_snapshot: JSON.stringify(consentData),

    nextStep: consentData.nextStep,
    intendedRedirectAfterPayment: consentData.intendedRedirectAfterPayment
  };
}

document.addEventListener('DOMContentLoaded', () => {
  attachProductSelectionHandlers();
  attachValidationHandlers();
  preselectPlanFromUrl();
  validateForm();

  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const selectedProduct = document.querySelector('input[name="product"]:checked');
    const legalConsentChecked = document.getElementById('legalConsent').checked;
    const submitBtn = document.getElementById('submitBtn');

    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');

    if (fullNameError) fullNameError.textContent = '';
    if (emailError) emailError.textContent = '';

    let hasError = false;

    if (!fullName) {
      if (fullNameError) fullNameError.textContent = 'Please enter your full name.';
      hasError = true;
    }

    if (!email) {
      if (emailError) emailError.textContent = 'Please enter your email address.';
      hasError = true;
    } else if (!validateEmail(email)) {
      if (emailError) emailError.textContent = 'Please enter a valid email address.';
      hasError = true;
    }

    if (!selectedProduct || !legalConsentChecked) {
      hasError = true;
    }

    if (hasError) {
      validateForm();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting...';

    try {
      const clientInfo = await getClientInfo();
      const productValue = selectedProduct.value;
      const productPrice = selectedProduct.closest('.product-box').dataset.price;
      const checkoutUrl = PAID_CHECKOUT_LINKS[productValue];
      const now = new Date().toISOString();

      if (!checkoutUrl) {
        console.error(`Missing Stripe checkout link for product: ${productValue}`);
        submitBtn.textContent = 'Continue to Payment';
        validateForm();
        return;
      }

      const consentData = buildConsentData({
        fullName,
        email,
        productValue,
        productPrice,
        clientInfo,
        now
      });

      localStorage.setItem(
        'esellerfit_paid_booking_consent',
        JSON.stringify(consentData)
      );

      const payload = buildPayload(consentData);
      await sendToMake(payload);

      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 300);
    } catch (error) {
      console.error('Submission error:', error);
      submitBtn.textContent = 'Continue to Payment';
      validateForm();
    }
  });
});
