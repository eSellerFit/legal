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
      const categoryOk = categoryEl ? category.length > 0 : true;
      const ok = this.validateEmail(email) && categoryOk && consent;
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
    if (!url) {
      console.error('ESF_CONFIG.webAppUrl is missing');
      return;
    }

    const body = {
      email: payload.clientEmail || '',
      tool_type: payload.toolType || '',
      source_page: payload.sourcePage || window.location.href,
      source_entry_point: payload.sourceEntryPoint || '',
      accepted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,

      capital: payload.capital ?? '',
      risk: payload.risk ?? '',
      execution: payload.execution ?? '',
      market: payload.market ?? '',

      capitalTier: payload.capitalTier || '',
      startPlatform: payload.startPlatform || '',
      scalePlatform: payload.scalePlatform || '',
      greyZone: payload.greyZone || '',
      waitState: payload.waitState || '',
      weakestMuscle: payload.weakestMuscle || '',

      customerFit: payload.customerFit ?? '',
      operationalFit: payload.operationalFit ?? '',
      financialFit: payload.financialFit ?? '',
      amazonScore: payload.amazonScore ?? '',
      shopifyScore: payload.shopifyScore ?? '',
      etsyScore: payload.etsyScore ?? '',
      topPlatform: payload.topPlatform || '',
      secondPlatform: payload.secondPlatform || '',
      platformGap: payload.platformGap ?? '',

      clientCategory: payload.clientCategory || '',
      demand: payload.demand ?? '',
      supply: payload.supply ?? '',
      advertising: payload.advertising ?? '',
      margin: payload.margin ?? '',
      index: payload.index ?? '',
      ocean: payload.ocean || '',
      dominantForce: payload.dominantForce || '',

      rawAnswersJson: payload.rawAnswersJson || '',
      scoresJson: payload.scoresJson || '',
      resultSummary: payload.resultSummary || '',
      recommendedDirection: payload.recommendedDirection || ''
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`Submission failed: ${res.status}`);
      }
    } catch (err) {
      console.error('Submission failed', err);
    }
  }
};
