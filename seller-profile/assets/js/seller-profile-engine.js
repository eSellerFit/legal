window.SELLER_PROFILE_ENGINE = {
  score(answers) {
    const dims = { c: [], r: [], e: [], m: [] };
    window.SELLER_PROFILE_DATA.questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        dims[q.dim].push(answers[q.id] / (q.opts.length - 1) * 10);
      }
    });

    const out = {};
    Object.entries(dims).forEach(([key, vals]) => {
      out[key] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    });
    return out;
  },

  capTier(capitalScore) {
    if (capitalScore === null) return null;
    if (capitalScore < 2.5) return 'very_low';
    if (capitalScore < 4.5) return 'low';
    if (capitalScore < 6.5) return 'medium';
    return 'high';
  },

  recommend(scores) {
    const ct = this.capTier(scores.c);
    if (!ct) return null;

    const E = scores.e || 0;
    const M = scores.m || 0;
    const R = scores.r || 0;
    const C = scores.c || 0;

    if (ct === 'very_low' && (E < 3.5 || M < 3.5)) {
      const dims = [
        {dim:'Capital',score:C,advice:'Building a minimum launch budget before committing to any platform may reduce early operational risk.'},
        {dim:'Execution',score:E,advice:'Developing consistent operational habits before taking on platform complexity may support a more stable launch.'},
        {dim:'Market Creation',score:M,advice:'Clarifying your differentiation and buyer story before choosing a platform is typically a valuable early step.'},
        {dim:'Risk Appetite',score:R,advice:'Starting with smaller experiments can help build experience and reduce exposure.'}
      ].sort((a,b)=>a.score-b.score);
      return { state:'wait', weakest:dims[0] };
    }

    if (ct === 'low') {
      if (M >= E) return {
        state:'go',
        intro:'Your profile suggests an audience-first directional path may align with your current structure.',
        step1:{platform:'Niche / D2C',icon:'🎯',color:'#9b8ec4',why:'Your differentiation strength may be a viable entry asset. Building an owned audience channel could be a logical starting point.'},
        step2:{platform:'Shopify',icon:'🛍',color:'#4a8a5a',when:'Consider when monthly revenue demonstrates consistent traction with a proven content approach'}
      };
      return {
        state:'go',
        intro:'Your profile suggests a low-barrier, execution-first directional path may align with your current structure.',
        step1:{platform:'Etsy',icon:'🧵',color:'#e8635a',why:'Operational readiness with limited capital may make a lower ad-spend entry viable. Early demand validation could be a useful first step.'},
        step2:{platform:E>=6?'Amazon':'Shopify',icon:E>=6?'📦':'🛍',color:E>=6?'#caa25f':'#4a8a5a',when:E>=6?'Consider when initial revenue demonstrates consistent traction and capital buffer grows':'Consider when initial revenue demonstrates consistent traction and brand direction clarifies'}
      };
    }

    if (ct === 'medium') {
      const grey = (E >= 5.5 && M >= 5.5) || (Math.abs(E - M) < 2);
      if (E >= 6.5 && M < 5) return {
        state:'go', greyZone:grey,
        intro:'Your profile suggests a structured marketplace entry may align with your operational strengths.',
        step1:{platform:'Amazon',icon:'📦',color:'#caa25f',why:'Execution discipline may be a primary structural asset. An operations-first platform could reward this tendency.'},
        step2:{platform:'Shopify',icon:'🛍',color:'#4a8a5a',when:'Consider building alongside once initial cash flow stabilises'}
      };
      if (M >= 6.5 && E < 5) return {
        state:'go', greyZone:grey,
        intro:'Your profile suggests an owned-channel strategy may align with your brand strengths.',
        step1:{platform:'Shopify',icon:'🛍',color:'#4a8a5a',why:'Brand creation capability may be a primary structural asset. Building an owned audience channel could be a logical starting point.'},
        step2:{platform:'Etsy',icon:'🧵',color:'#e8635a',when:'Consider running alongside to validate product-market direction with lower risk'}
      };
      return {
        state:'go', greyZone:true,
        intro:'Your profile shows balanced structural strengths — multiple directional paths may be worth evaluating.',
        step1:{platform:E>=M?'Amazon':'Shopify',icon:E>=M?'📦':'🛍',color:E>=M?'#caa25f':'#4a8a5a',why:E>=M?'A slight execution tendency may point toward an operations-first environment.':'A slight brand tendency may point toward an audience-building model.'},
        step2:{platform:'Etsy',icon:'🧵',color:'#e8635a',when:'Consider running alongside to validate demand and reduce platform concentration'}
      };
    }

    if (E >= M) return {
      state:'go',
      intro:'Your profile suggests a structured, capital-supported entry may be worth evaluating.',
      step1:{platform:'Amazon',icon:'📦',color:'#caa25f',why:'Capital and process alignment may support an inventory-first, PPC-driven approach.'},
      step2:{platform:'Shopify',icon:'🛍',color:'#4a8a5a',when:'Consider building alongside as a brand equity and owned-audience channel'}
    };

    return {
      state:'go',
      intro:'Your profile suggests an owned-channel, brand-led approach may be worth evaluating.',
      step1:{platform:'Shopify',icon:'🛍',color:'#4a8a5a',why:'Capital and creative alignment may support a brand-first, margin-controlled approach.'},
      step2:{platform:'Amazon',icon:'📦',color:'#caa25f',when:'Consider adding once initial product-market direction validates at scale'}
    };
  }
};
