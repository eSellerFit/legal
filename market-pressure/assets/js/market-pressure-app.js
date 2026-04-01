(() => {
  const state = {
    clientEmail: '',
    clientCategory: '',
    answers: {}
  };

  function countAnswered() {
    return Object.keys(state.answers).length;
  }

  function pickAnswer(qid, idx) {
    const q = window.MARKET_PRESSURE_DATA.questions.find(x => x.id === qid);

    state.answers[qid] = {
      idx,
      band: q.opts[idx].band,
      score: window.MARKET_PRESSURE_DATA.band[q.opts[idx].band]
    };

    window.MARKET_PRESSURE_RENDER.buildQuestions('aBody', state.answers, pickAnswer);

    const answered = countAnswered();
    window.ESF_SHELL.setProgress(
      answered,
      window.MARKET_PRESSURE_DATA.totalQuestions,
      'progTxt',
      'progFill'
    );

    const cBar = document.getElementById('cBar');
    if (cBar) {
      cBar.classList.toggle(
        'show',
        answered === window.MARKET_PRESSURE_DATA.totalQuestions
      );
    }
  }

  async function submitAssessment() {
    if (countAnswered() < window.MARKET_PRESSURE_DATA.totalQuestions) {
      alert('Please answer all 12 signals before submitting');
      return;
    }

    if (!window.ESF_SHELL.validateEmail(state.clientEmail) || !state.clientCategory) {
      alert('Invalid email or category. Please start from the beginning.');
      window.ESF_SHELL.show('welcomeScreen');
      return;
    }

    const submitBtn = document.getElementById('cBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Calculating...';
    }

    window.ESF_SHELL.toggleOverlay(true);

    try {
      const result = window.MARKET_PRESSURE_ENGINE.calculate(state.answers);

      const recommendedDirection =
        result?.ocean === 'blue'
          ? 'Favorable'
          : result?.ocean === 'red'
            ? 'High pressure'
            : 'Mixed';

      const resultSummary =
        `Pressure Index: ${result.index}. ` +
        `Ocean: ${result.ocean}. ` +
        `Dominant force: ${result.dominant}.`;

      await window.ESF_SHELL.submitLead({
        clientEmail: state.clientEmail,
        toolType: 'Market Pressure',
        sourcePage: window.location.href,
        sourceEntryPoint: 'market-pressure-start',

        rawAnswersJson: JSON.stringify({
          category: state.clientCategory,
          answers: state.answers
        }),

        scoresJson: JSON.stringify({
          demand: result.d,
          supply: result.s,
          advertising: result.a,
          margin: result.m,
          index: result.index
        }),

        clientCategory: state.clientCategory,

        demand: result.d,
        supply: result.s,
        advertising: result.a,
        margin: result.m,
        index: result.index,
        ocean: result.ocean,
        dominantForce: result.dominant,

        recommendedDirection,
        resultSummary
      });

      setTimeout(() => {
        window.ESF_SHELL.toggleOverlay(false);
        window.MARKET_PRESSURE_RENDER.renderResults(result, state.clientCategory);
        window.ESF_SHELL.show('resultsScreen');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'See My Index →';
        }
      }, 1800);
    } catch (err) {
      console.error('Market Pressure submission failed', err);
      window.ESF_SHELL.toggleOverlay(false);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'See My Index →';
      }

      alert('Something went wrong while saving your results. Please try again.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.ESF_SHELL.bindStartGate({
      emailId: 'emailInput',
      categoryId: 'categoryInput',
      consentId: 'consentCheck',
      startBtnId: 'startBtn'
    });

    window.ESF_SHELL.bindBookingConsent({
      consentId: 'bookingConsent',
      buttonIds: ['ctaBtn', 'ctaBtn2']
    });

    document.getElementById('startBtn')?.addEventListener('click', () => {
      state.clientEmail = document.getElementById('emailInput')?.value.trim() || '';
      state.clientCategory = document.getElementById('categoryInput')?.value.trim() || '';
      state.answers = {};

      window.MARKET_PRESSURE_RENDER.buildQuestions('aBody', state.answers, pickAnswer);
      window.ESF_SHELL.setProgress(
        0,
        window.MARKET_PRESSURE_DATA.totalQuestions,
        'progTxt',
        'progFill'
      );
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
