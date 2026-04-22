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
    window.ESF_SHELL.setProgress(
      countAnswered(),
      window.SELLER_PROFILE_DATA.totalQuestions,
      'progTxt',
      'progFill'
    );
    document.getElementById('cBar')?.classList.toggle(
      'show',
      countAnswered() === window.SELLER_PROFILE_DATA.totalQuestions
    );
  }

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
      deviceType: getDeviceType(userAgent)
    };
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

    try {
      const scores = window.SELLER_PROFILE_ENGINE.score(state.answers);
      const clientInfo = await getClientInfo();
      const acceptedAt = new Date().toISOString();

      const recommendation = window.SELLER_PROFILE_ENGINE.recommend(scores);

      const capitalTier = window.SELLER_PROFILE_ENGINE.capTier(scores.c);

      const startPlatform =
        recommendation?.state === 'wait'
          ? 'Wait'
          : (recommendation?.step1?.platform || '');

      const scalePlatform =
        recommendation?.state !== 'wait'
          ? (recommendation?.step2?.platform || '')
          : '';

      const greyZone = recommendation?.greyZone ? 'Yes' : 'No';
      const waitState = recommendation?.state === 'wait' ? 'Yes' : 'No';

      const weakestMuscle =
        recommendation?.state === 'wait'
          ? (recommendation?.weakest?.dim || '')
          : '';

      let recommendedDirection =
        recommendation?.state === 'wait'
          ? 'Wait'
          : (recommendation?.step1?.platform || '');

      if (recommendedDirection === 'Niche / D2C') {
        recommendedDirection = 'Shopify';
      }

      const resultSummary =
        recommendation?.state === 'wait'
          ? `Not ready to launch yet. Primary gap: ${recommendation?.weakest?.dim || 'unknown'}`
          : `Best starting platform: ${recommendedDirection || 'unknown'}`;

      const checkboxText =
        'I agree to the Terms of Service, Disclaimer, and Privacy Policy and understand that this tool provides directional advisory insight only.';

      const payload = {
        clientEmail: state.clientEmail,
        toolType: 'Seller Profile',
        sourcePage: window.location.href,
        sourceEntryPoint: 'seller-profile-start',

        accepted_at: acceptedAt,
        checkbox_text_shown: checkboxText,

        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        platform: clientInfo.platform,
        device_type: clientInfo.deviceType,

        rawAnswersJson: JSON.stringify(state.answers),
        scoresJson: JSON.stringify({
          capital: scores.c,
          risk: scores.r,
          execution: scores.e,
          market: scores.m
        }),

        capital: scores.c,
        risk: scores.r,
        execution: scores.e,
        market: scores.m,

        capitalTier,
        startPlatform,
        scalePlatform,
        greyZone,
        waitState,
        weakestMuscle,

        recommendedDirection,
        resultSummary
      };

      payload.raw_payload_snapshot = JSON.stringify(payload);

      await window.ESF_SHELL.submitLead(payload);

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
    } catch (err) {
      console.error('Seller Profile submission failed', err);
      window.ESF_SHELL.toggleOverlay(false);

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Generate My Profile →';
      }

      alert('Something went wrong while saving your profile. Please try again.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const emailEl = document.getElementById('emailInput');
    const consentEl = document.getElementById('consentCheck');
    const startBtn = document.getElementById('startBtn');

    const validate = () => {
      const ok =
        window.ESF_SHELL.validateEmail(emailEl?.value || '') &&
        !!consentEl?.checked;

      if (startBtn) startBtn.disabled = !ok;
    };

    emailEl?.addEventListener('input', validate);
    consentEl?.addEventListener('change', validate);
    emailEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && startBtn && !startBtn.disabled) {
        startBtn.click();
      }
    });

    validate();

    window.ESF_SHELL.bindBookingConsent({
      consentId: 'bookingConsent',
      buttonIds: ['ctaBtn', 'ctaBtnMp', 'ctaBtn2', 'ctaBtn3']
    });

    document.getElementById('startBtn')?.addEventListener('click', () => {
      state.clientEmail = document.getElementById('emailInput')?.value.trim() || '';
      state.answers = {};

      document.getElementById('aSubtitle').textContent = 'Seller Profile Diagnostic';
      window.SELLER_PROFILE_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
      window.ESF_SHELL.setProgress(
        0,
        window.SELLER_PROFILE_DATA.totalQuestions,
        'progTxt',
        'progFill'
      );
      document.getElementById('cBar')?.classList.remove('show');
      window.ESF_SHELL.show('assessScreen');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    document.getElementById('cBtn')?.addEventListener('click', submitAssessment);

    document.getElementById('ctaBtn')?.addEventListener('click', () => {
      window.location.href = '../market-pressure/';
    });

    document.getElementById('ctaBtnMp')?.addEventListener('click', () => {
      window.location.href = '../marketplace-fit/';
    });

    document.getElementById('ctaBtn2')?.addEventListener('click', () => {
      window.location.href = window.ESF_CONFIG.freeCallUrl;
    });

    document.getElementById('ctaBtn3')?.addEventListener('click', () => {
      window.location.href = window.ESF_CONFIG.paidBookingUrl;
    });
  });
})();
