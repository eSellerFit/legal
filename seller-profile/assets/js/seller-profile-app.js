(() => {
  const state = {
    clientEmail: '',
    answers: {}
  };

  function countAnswered() {
    return Object.keys(state.answers).length;
  }

  function pickAnswer(qid, idx) {
    state.answers[qid] = idx;
    window.SELLER_PROFILE_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
    window.ESF_SHELL.setProgress(countAnswered(), window.SELLER_PROFILE_DATA.totalQuestions, 'progTxt', 'progFill');
    document.getElementById('cBar')?.classList.toggle('show', countAnswered() === window.SELLER_PROFILE_DATA.totalQuestions);
  }

  async function submitAssessment() {
    if (countAnswered() < window.SELLER_PROFILE_DATA.totalQuestions) {
      alert('Please answer all 19 questions before submitting');
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
      btn.textContent = 'Processing...';
    }
    window.ESF_SHELL.toggleOverlay(true);

    const scores = window.SELLER_PROFILE_ENGINE.score(state.answers);
    const recommendation = window.SELLER_PROFILE_ENGINE.recommend(scores);

    await window.ESF_SHELL.submitLead({
      clientEmail: state.clientEmail,
      capital: scores.c,
      risk: scores.r,
      execution: scores.e,
      market: scores.m,
      capitalTier: window.SELLER_PROFILE_ENGINE.capTier(scores.c),
      startPlatform: recommendation?.state === 'wait' ? 'Wait' : (recommendation?.step1?.platform || ''),
      scalePlatform: recommendation?.state !== 'wait' ? (recommendation?.step2?.platform || '') : '',
      greyZone: recommendation?.greyZone ? 'Yes' : 'No',
      waitState: recommendation?.state === 'wait' ? 'Yes' : 'No',
      weakestMuscle: recommendation?.state === 'wait' ? recommendation.weakest.dim : ''
    });

    setTimeout(() => {
      window.ESF_SHELL.toggleOverlay(false);
      window.SELLER_PROFILE_RENDER.renderResults(scores, recommendation);
      window.ESF_SHELL.show('resultsScreen');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Generate My Profile →';
      }
    }, 1800);
  }

  document.addEventListener('DOMContentLoaded', () => {
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
      document.getElementById('aSubtitle').textContent = 'Seller Profile Diagnostic';
      window.SELLER_PROFILE_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
      window.ESF_SHELL.setProgress(0, window.SELLER_PROFILE_DATA.totalQuestions, 'progTxt', 'progFill');
      document.getElementById('cBar')?.classList.remove('show');
      window.ESF_SHELL.show('assessScreen');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    document.getElementById('cBtn')?.addEventListener('click', submitAssessment);

    document.getElementById('ctaBtn')?.addEventListener('click', () => {
      window.location.href = window.ESF_CONFIG.paidBookingUrl;
    });

    document.getElementById('ctaBtn2')?.addEventListener('click', () => {
      window.location.href = window.ESF_CONFIG.freeCallUrl;
    });
  });
})();
