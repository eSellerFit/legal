(() => {
  const state = {
    clientEmail: '',
    answers: {}
  };

  function answeredCount() {
    return Object.keys(state.answers).length;
  }

  function pickAnswer(qid, idx) {
    state.answers[qid] = idx;
    window.MARKETPLACE_FIT_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
    window.ESF_SHELL.setProgress(answeredCount(), window.MARKETPLACE_FIT_DATA.totalQuestions, 'progTxt', 'progFill');
    document.getElementById('cBar')?.classList.toggle('show', answeredCount() === window.MARKETPLACE_FIT_DATA.totalQuestions);
  }

  async function submitAssessment() {
    if (answeredCount() < window.MARKETPLACE_FIT_DATA.totalQuestions) {
      alert('Please answer all 12 questions before submitting');
      return;
    }

    if (!window.ESF_SHELL.validateEmail(state.clientEmail)) {
      alert('Invalid email. Please start from the beginning.');
      window.ESF_SHELL.show('welcomeScreen');
      return;
    }

    const btn = document.getElementById('cBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Calculating...';
    }

    window.ESF_SHELL.toggleOverlay(true);

    const layerScores = window.MARKETPLACE_FIT_ENGINE.scoreLayers(state.answers);
    const platformScores = window.MARKETPLACE_FIT_ENGINE.platformScores(layerScores);
    const topPlatform = window.MARKETPLACE_FIT_ENGINE.sortedPlatforms(platformScores)[0][0];

    await window.ESF_SHELL.submitLead({
      clientEmail: state.clientEmail,
      source: 'client-marketplace-fit',
      customerFit: layerScores.cf,
      operationalFit: layerScores.of,
      financialFit: layerScores.ff,
      amazonScore: platformScores.amazon,
      shopifyScore: platformScores.shopify,
      etsyScore: platformScores.etsy,
      topPlatform
    });

    setTimeout(() => {
      window.ESF_SHELL.toggleOverlay(false);
      window.MARKETPLACE_FIT_RENDER.renderResults(layerScores, platformScores);
      window.ESF_SHELL.show('resultsScreen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'See My Fit →';
      }
    }, 1800);
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.ESF_SHELL.bindStartGate({
      emailId: 'emailInput',
      categoryId: null,
      consentId: 'consentCheck',
      startBtnId: 'startBtn'
    });

    // Marketplace Fit does not use category, so patch validation directly
    const emailEl = document.getElementById('emailInput');
    const consentEl = document.getElementById('consentCheck');
    const startBtn = document.getElementById('startBtn');
    const validate = () => {
      const ok = window.ESF_SHELL.validateEmail(emailEl?.value || '') && !!consentEl?.checked;
      if (startBtn) startBtn.disabled = !ok;
    };
    emailEl?.addEventListener('input', validate);
    consentEl?.addEventListener('change', validate);
    emailEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && startBtn && !startBtn.disabled) startBtn.click();
    });
    validate();

    window.ESF_SHELL.bindBookingConsent({
      consentId: 'bookingConsent',
      buttonIds: ['ctaBtn', 'ctaBtn2']
    });

    document.getElementById('startBtn')?.addEventListener('click', () => {
      state.clientEmail = document.getElementById('emailInput')?.value.trim() || '';
      state.answers = {};
      window.MARKETPLACE_FIT_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
      window.ESF_SHELL.setProgress(0, window.MARKETPLACE_FIT_DATA.totalQuestions, 'progTxt', 'progFill');
      document.getElementById('cBar')?.classList.remove('show');
      window.ESF_SHELL.show('assessScreen');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    document.getElementById('cBtn')?.addEventListener('click', submitAssessment);
    document.getElementById('ctaBtn')?.addEventListener('click', () => { window.location.href = window.ESF_CONFIG.bookingUrl; });
    document.getElementById('ctaBtn2')?.addEventListener('click', () => { window.location.href = window.ESF_CONFIG.bookingUrl; });
  });
})();
