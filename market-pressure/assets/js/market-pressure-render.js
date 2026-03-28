window.MARKET_PRESSURE_RENDER = {
  buildQuestions(containerId, answers, onPick) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const questionsByForce = window.MARKET_PRESSURE_ENGINE.getQuestionsByForce();
    const forceNames = {
      d: 'Demand Pressure',
      s: 'Supply Pressure',
      a: 'Advertising Pressure',
      m: 'Margin Corridor'
    };
    const forceTags = {
      d: 'td',
      s: 'ts',
      a: 'ta',
      m: 'tm'
    };

    container.innerHTML = '';

    ['d', 's', 'a', 'm'].forEach(force => {
      const block = document.createElement('div');
      block.className = 'dim-block';
      block.innerHTML = `<div class="dim-hdr"><span class="dim-tag ${forceTags[force]}">${forceNames[force]}</span></div>`;

      questionsByForce[force].forEach((q, qi) => {
        const qb = document.createElement('div');
        qb.className = 'q-block';
        qb.style.animationDelay = `${qi * 0.04}s`;
        qb.innerHTML = `
          <div class="q-lbl"><span class="q-num">${q.id}</span><span>${q.text}</span></div>
          <div class="opts">
            ${q.opts.map((o, i) => `
              <button type="button" class="opt ${answers[q.id]?.idx === i ? 'sel' : ''}" data-q="${q.id}" data-i="${i}">
                <div class="dot"></div>
                <span class="opt-txt">${o.text}</span>
                <span class="opt-score">${window.MARKET_PRESSURE_DATA.band[o.band]}</span>
              </button>
            `).join('')}
          </div>
        `;

        qb.querySelectorAll('.opt').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.i);
            onPick(q.id, idx);
          });
        });

        block.appendChild(qb);
      });

      container.appendChild(block);
    });
  },

  renderResults(scores, category) {
    const oceanCopy = window.MARKET_PRESSURE_DATA.oceanCopy[scores.ocean];
    const dominantData = window.MARKET_PRESSURE_DATA.dominantData[scores.dominant];

    document.getElementById('categoryLine').textContent =
      `Scanning: "${category}" — this score reflects what you observed in that category. The more accurate your observations, the more useful this result.`;

    const gaugeHtml = this.buildGauge(scores.index, scores.ocean, oceanCopy);
    const card = document.getElementById('indexCard');
    card.className = `index-card index-${scores.ocean}`;
    card.innerHTML = gaugeHtml;

    const forceRows = document.getElementById('forceRows');
    forceRows.innerHTML = '';

    ['d', 's', 'a', 'm'].forEach(force => {
      const meta = window.MARKET_PRESSURE_DATA.forceMeta[force];
      const val = scores[force];
      const isTop = force === scores.dominant;
      const pct = (val / 10) * 100;

      const row = document.createElement('div');
      row.className = 'force-row';
      row.innerHTML = `
        <div class="force-label" style="color:${meta.color}">${meta.name}</div>
        <div class="force-bar-wrap">
          <div class="force-bar-fill" data-pct="${pct}" style="width:0%;background:${meta.hex};"></div>
        </div>
        <div class="force-score-txt" style="color:${meta.color}">${val.toFixed(1)}</div>
        ${isTop
          ? `<div class="force-dominant-badge" style="background:${meta.hex}20;color:${meta.hex};">dominant</div>`
          : '<div style="width:60px"></div>'}
      `;
      forceRows.appendChild(row);
    });

    setTimeout(() => {
      document.querySelectorAll('.force-bar-fill').forEach(el => {
        el.style.transition = 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)';
        el.style.width = `${el.dataset.pct}%`;
      });
    }, 100);

    document.getElementById('dominantSlot').innerHTML = `
      <div class="dominant-card ${dominantData.cardClass}">
        <div class="dominant-eyebrow" style="color:${dominantData.eyecolor}">
          Primary Risk Factor — Dominant Force
        </div>
        <div class="dominant-title">${dominantData.title}</div>
        <div class="dominant-what">${dominantData.what}</div>
        <div class="dominant-action-lbl">High-Level Strategic Prescription</div>
        <div class="dominant-action">${dominantData.action}</div>
      </div>
    `;
  },

  buildGauge(index, ocean, oceanCopy) {
    const value = Math.max(1, Math.min(10, index));
    const zoneRange =
      ocean === 'blue' ? '1.0 – 3.0' :
      ocean === 'amber' ? '3.1 – 6.9' :
      '7.0 – 10.0';

    return `
      <div style="text-align:center;">
        <div class="index-card-label" style="margin-bottom:18px;">Your Market Pressure</div>

        <div style="position:relative;width:320px;height:220px;margin:0 auto 12px;">
          <svg viewBox="0 0 320 220" width="320" height="220" style="display:block;margin:0 auto;overflow:hidden;">
            <path d="M 40 160 A 120 120 0 0 1 280 160"
              fill="none"
              stroke="#e7e1d8"
              stroke-width="18"
              stroke-linecap="round"/>

            <path d="M 40 160 A 120 120 0 0 1 108 56"
              fill="none"
              stroke="#4f8f7a"
              stroke-width="18"
              stroke-linecap="round"/>

            <path d="M 108 56 A 120 120 0 0 1 212 56"
              fill="none"
              stroke="#c28a3a"
              stroke-width="18"
              stroke-linecap="butt"/>

            <path d="M 212 56 A 120 120 0 0 1 280 160"
              fill="none"
              stroke="#c94a3a"
              stroke-width="18"
              stroke-linecap="round"/>
          </svg>

          <div style="position:absolute;left:0;right:0;top:76px;">
            <div style="
              font-family:'JetBrains Mono',monospace;
              font-size:56px;
              font-weight:700;
              line-height:1;
              color:var(--ink);
            ">${value.toFixed(1)}</div>

            <div style="
              margin-top:10px;
              font-family:'JetBrains Mono',monospace;
              font-size:10px;
              letter-spacing:0.12em;
              text-transform:uppercase;
              color:${ocean === 'blue' ? '#4f8f7a' : ocean === 'amber' ? '#a06d24' : '#b04b3d'};
            ">${zoneRange}</div>

            <div style="
              margin-top:10px;
              font-family:'Playfair Display',serif;
              font-size:30px;
              color:var(--ink);
            ">${oceanCopy.label}</div>
          </div>
        </div>

        <div class="index-body" style="max-width:560px;margin:0 auto;">
          ${oceanCopy.body}
        </div>
      </div>
    `;
  }
};
