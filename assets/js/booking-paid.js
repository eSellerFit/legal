const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbznMW1S5Dm036R-AgD8AeNANgDrGwU74Zg1Y1XLtZRaNN548R68VhNsDGpkeWGb0Izh-Q/exec';

const PAID_CALENDAR_LINKS = {
  'entry-strategy-449': 'https://calendar.app.google/4F69KMakEsaPsGG5A',
  'entry-strategy-549': 'https://calendar.app.google/RZDvSptiAbqw9bE3A'
};

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
    timestamp: new Date().toISOString()
  };
}

document.querySelectorAll('input[name="product"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    document.querySelectorAll('.product-box').forEach(box => box.classList.remove('selected'));
    e.target.closest('.product-box').classList.add('selected');
    validateForm();
  });
});

function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const productSelected = document.querySelector('input[name="product"]:checked');
  const agreementConsent = document.getElementById('agreementConsent').checked;
  const refundConsent = document.getElementById('refundConsent').checked;

  const isValid = fullName && email && productSelected && agreementConsent && refundConsent;
  document.getElementById('submitBtn').disabled = !isValid;
}

document.getElementById('fullName').addEventListener('input', validateForm);
document.getElementById('email').addEventListener('input', validateForm);
document.getElementById('agreementConsent').addEventListener('change', validateForm);
document.getElementById('refundConsent').addEventListener('change', validateForm);

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const clientInfo = await getClientInfo();
  const selectedProduct = document.querySelector('input[name="product"]:checked');
  const productValue = selectedProduct.value;
  const productPrice = selectedProduct.closest('.product-box').dataset.price;
  const now = new Date().toISOString();

  const consentData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    product: productValue,
    price: productPrice,
    service: `Entry Strategy $${productPrice}`,
    agreementAgreed: document.getElementById('agreementConsent').checked,
    agreementTimestamp: now,
    refundAgreed: document.getElementById('refundConsent').checked,
    refundTimestamp: now,
    ipAddress: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    platform: clientInfo.platform,
    consentTimestamp: now,
    allConsentsObtained: true
  };

  localStorage.setItem('esellerfit_paid_booking_consent', JSON.stringify(consentData));

  try {
    const payload = {
      source: 'paid-booking',
      fullName: consentData.fullName,
      email: consentData.email,
      product: consentData.product,
      price: consentData.price,
      consents: {
        clientAgreement: consentData.agreementAgreed,
        refundPolicy: consentData.refundAgreed
      },
      tracking: {
        ip: consentData.ipAddress,
        userAgent: consentData.userAgent,
        platform: consentData.platform,
        deviceType: /mobile|android|iphone|ipad|tablet/i.test(clientInfo.userAgent) ? 'mobile' : 'desktop'
      }
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error sending to Apps Script:', error);
  }

  setTimeout(() => {
    window.location.href = PAID_CALENDAR_LINKS[productValue];
  }, 400);
});
