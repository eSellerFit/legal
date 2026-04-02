const APPS_SCRIPT_URL = 'https://hook.us2.make.com/nlz437jbe9lx9f2llujukmpnpdgtyoqv';
const FREE_CALENDAR_URL = 'https://calendar.app.google/pyGqWmbNSGP1xfxu6';

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

function validateForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const termsConsent = document.getElementById('termsConsent').checked;
  const privacyConsent = document.getElementById('privacyConsent').checked;
  const disclaimerConsent = document.getElementById('disclaimerConsent').checked;
  const noSalesPitch = document.getElementById('noSalesPitch').checked;

  const isValid = fullName && email && termsConsent && privacyConsent && disclaimerConsent && noSalesPitch;
  document.getElementById('submitBtn').disabled = !isValid;
}

document.getElementById('fullName').addEventListener('input', validateForm);
document.getElementById('email').addEventListener('input', validateForm);
document.getElementById('termsConsent').addEventListener('change', validateForm);
document.getElementById('privacyConsent').addEventListener('change', validateForm);
document.getElementById('disclaimerConsent').addEventListener('change', validateForm);
document.getElementById('noSalesPitch').addEventListener('change', validateForm);

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const clientInfo = await getClientInfo();
  const now = new Date().toISOString();

  try {
    const payload = {
      source: 'free-call',
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      consents: {
        terms: document.getElementById('termsConsent').checked,
        privacy: document.getElementById('privacyConsent').checked,
        disclaimer: document.getElementById('disclaimerConsent').checked,
        noSalesPitch: document.getElementById('noSalesPitch').checked
      },
      tracking: {
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        platform: clientInfo.platform,
        deviceType: /mobile|android|iphone|ipad|tablet/i.test(clientInfo.userAgent) ? 'mobile' : 'desktop'
      }
    };

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Error sending to Apps Script:', error);
  }

  const consentData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    service: 'Free Call',
    termsAgreed: document.getElementById('termsConsent').checked,
    privacyAgreed: document.getElementById('privacyConsent').checked,
    disclaimerAgreed: document.getElementById('disclaimerConsent').checked,
    noSalesPitchAgreed: document.getElementById('noSalesPitch').checked,
    consentTimestamp: now,
    allConsentsObtained: true
  };

  localStorage.setItem('esellerfit_free_call_consent', JSON.stringify(consentData));

  setTimeout(() => {
    window.location.href = FREE_CALENDAR_URL;
  }, 400);
});
