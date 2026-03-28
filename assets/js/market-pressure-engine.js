window.MARKET_PRESSURE_ENGINE = {
  getQuestionsByForce() {
    const groups = { d: [], s: [], a: [], m: [] };
    window.MARKET_PRESSURE_DATA.questions.forEach(q => groups[q.force].push(q));
    return groups;
  },

  calculate(answers) {
    const forces = { d: [], s: [], a: [], m: [] };
    window.MARKET_PRESSURE_DATA.questions.forEach(q => {
      if (answers[q.id]) forces[q.force].push(answers[q.id].score);
    });

    const out = {};
    Object.entries(forces).forEach(([key, vals]) => {
      out[key] = vals.length ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;
    });

    const vals = Object.values(out);
    out.index = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
    out.dominant = this.getDominant(out);
    out.ocean = this.getOcean(out.index);
    return out;
  },

  getDominant(scores) {
    let top = 'd';
    let topVal = -1;
    ['d', 's', 'a', 'm'].forEach(key => {
      if (scores[key] > topVal) {
        top = key;
        topVal = scores[key];
      }
    });
    return top;
  },

  getOcean(index) {
    if (index <= 3.0) return 'blue';
    if (index <= 6.9) return 'amber';
    return 'red';
  }
};
