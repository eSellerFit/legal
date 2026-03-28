window.MARKETPLACE_FIT_ENGINE = {
  scoreLayers(answers) {
    const layers = { cf: [], of: [], ff: [] };
    window.MARKETPLACE_FIT_DATA.questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        layers[q.layer].push(answers[q.id] / (q.opts.length - 1) * 10);
      }
    });

    const out = {};
    Object.entries(layers).forEach(([layer, vals]) => {
      out[layer] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : null;
    });
    return out;
  },

  platformScores(layerScores) {
    const scores = {};
    Object.entries(window.MARKETPLACE_FIT_DATA.platforms).forEach(([key, platform]) => {
      const [wcf, wof, wff] = platform.weights;
      scores[key] = parseFloat((((layerScores.cf || 0) * wcf) + ((layerScores.of || 0) * wof) + ((layerScores.ff || 0) * wff)).toFixed(1));
    });
    return scores;
  },

  sortedPlatforms(platformScores) {
    return Object.entries(platformScores).sort((a, b) => b[1] - a[1]);
  },

  platformWhy(key, layerScores) {
    const { cf, of } = layerScores;
    return {
      amazon: cf >= 6 ? 'Your buyers search with intent — Amazon\'s built-in traffic works in your favour.' : of >= 6 ? 'Strong execution is an asset on Amazon, but customer fit signals are weak. Review buyer intent before committing.' : 'Amazon requires search-driven demand, strong process discipline, and upfront capital. Review all three layers carefully.',
      shopify: cf >= 6 ? 'Your buyer responds to brand and story — Shopify\'s owned channel model is a natural match. Plan your content engine.' : 'Shopify rewards brand-led sellers with a consistent content strategy. Strong match if you can build the traffic system.',
      etsy: cf >= 6 ? 'Your product fits Etsy\'s discovery and community-driven model — a natural match for story-led products.' : 'Etsy rewards craft, story, and differentiation. Strong match if your product has a clear creative or handmade angle.'
    }[key];
  },

  layerInsight(key, value) {
    if (value === null) return '';
    return {
      cf: value >= 7 ? 'Strong buyer-platform alignment. The platform your buyer naturally uses matches your product type.' : value >= 4 ? 'Moderate buyer fit. Your buyer could exist on multiple platforms — platform differentiation matters at this score.' : 'Weak buyer alignment. The platform may not be where your buyers naturally shop. Re-examine your target buyer profile.',
      of: value >= 7 ? 'Strong operational readiness. You can match the execution rhythm most platforms require.' : value >= 4 ? 'Moderate execution capacity. Start with a lower-complexity platform to build operational habits.' : 'Operational gap. Most platforms will overwhelm your current capacity. Build consistent habits before committing.',
      ff: value >= 7 ? 'Solid financial foundation. You can survive long enough for most platforms to work.' : value >= 4 ? 'Moderate runway. Choose a platform with lower upfront capital requirements and faster time to first sale.' : 'Financial constraint is the binding factor. Choose the lowest-cost entry path and extend runway before scaling.'
    }[key] || '';
  }
};
