window.ESF_SHELL = {
  show(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  },

  toggleOverlay(show) {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.classList.toggle('show', !!show);
  },

  setProgress(answered, total, textId, fillId) {
    const textEl = document.getElementById(textId);
    const fillEl = document.getElementById(fillId);
    if (textEl) textEl.textContent = `${answered} / ${total}`;
    if (fillEl) fillEl.style.width = `${(answered / total) * 100}%`;
  },

  bindStartGate({ emailId, categoryId, consentId, startBtnId }) {
    const emailEl = document.getElementById(emailId);
    const categoryEl = document.getElementById(categoryId);
    const consentEl = document.getElementById(consentId);
    const startBtn = document.getElementById(startBtnId);

    const validate = () => {
      const email = emailEl ? emailEl.value.trim() : '';
      const category = categoryEl ? categoryEl.value.trim() : '';
      const consent = !!(consentEl && consentEl.checked);
      const ok = this.validateEmail(email) && category.length > 0 && consent;
      if (startBtn) startBtn.disabled = !ok;
    };

    if (emailEl) {
      emailEl.addEventListener('input', validate);
      emailEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && startBtn && !startBtn.disabled) startBtn.click();
      });
    }

    if (categoryEl) {
      categoryEl.addEventListener('input', validate);
      categoryEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' && startBtn && !startBtn.disabled) startBtn.click();
      });
    }

    if (consentEl) consentEl.addEventListener('change', validate);
    validate();
  },

  bindBookingConsent({ consentId, buttonIds }) {
    const consentEl = document.getElementById(consentId);
    const apply = () => {
      const checked = !!(consentEl && consentEl.checked);
      buttonIds.forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = !checked;
        btn.style.opacity = checked ? '1' : '0.35';
      });
    };
    if (consentEl) consentEl.addEventListener('change', apply);
    apply();
  },

  async submitLead(payload) {
    const url = window.ESF_CONFIG?.webAppUrl;
    if (!url || !url.includes('script.google.com')) return;

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value == null ? '' : String(value));
    });

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
    } catch (err) {
      console.log('Submission skipped');
    }
  }
};
