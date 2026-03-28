window.MARKETPLACE_FIT_RENDER = {
  buildQuestions(containerId, answers, onPick) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    ['cf', 'of', 'ff'].forEach(layer => {
      const meta = window.MARKETPLACE_FIT_DATA.layerMeta[layer];
      const block = document.createElement('div');
      block.className = 'layer-block';
      block.innerHTML = `
        <div class="layer-hdr">
          <div class="layer-badge" style="background:${meta.hex}18;color:${meta.hex}">${layer === 'cf' ? '01' : layer === 'of' ? '02' : '03'}</div>
          <span class="layer-tag ${meta.cls}">${meta.tag}</span>
          <div>
            <div class="layer-name">${meta.name}</div>
            <div class="layer-question" style="color:${meta.hex}">${meta.question}</div>
          </div>
        </div>
        <div class="layer-context">${meta.context}</div>
      `;

      window.MARKETPLACE_FIT_DATA.questions.filter(q => q.layer === layer).forEach((q, qi) => {
        const qb = document.createElement('div');
        qb.className = 'q-block';
        qb.style.animationDelay = `${qi * 0.04}s`;
        qb.innerHTML = `
          <div class="q-lbl"><span class="q-num">${q.id}</span><span>${q.text}</span></div>
          <div class="opts">
            ${q.opts.map((opt, i) => `
              <button type="button" class="opt ${answers[q.id] === i ? 'sel' : ''}" data-q="${q.id}" data-i="${i}">
                <div class="dot"></div>
                <span class="opt-txt">${opt}</span>
              </button>
            `).join('')}
          </div>
        `;

        qb.querySelectorAll('.opt').forEach(btn => {
          btn.addEventListener('click', () => {
            onPick(q.id, Number(btn.dataset.i));
          });
        });

        block.appendChild(qb);
      });

      container.appendChild(block);
    });
  },

  renderResults(layerScores, platformScores) {
    const sorted = window.MARKETPLACE_FIT_ENGINE.sortedPlatforms(platformScores);
    const topKey = sorted[0][0];

    const grid = document.getElementById('platformCards');
    grid.innerHTML = '';

    sorted.forEach(([key, score]) => {
      const p = window.MARKETPLACE_FIT_DATA.platforms[key];
      const card = document.createElement('div');
      card.className = `plat-card${key === topKey ? ' top-pick' : ''}`;
      card.innerHTML = `
        <div class="plat-icon">${p.icon}</div>
        <div class="plat-name" style="color:${p.color}">${p.name}</div>
        <div class="plat-score-row">
          <div class="plat-score" style="color:${p.color}">${score.toFixed(1)}</div>
          <div class="plat-bar-bg"><div class="plat-bar-fill" style="width:${score * 10}%;background:${p.color}"></div></div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t4)">/10</div>
        </div>
        <div class="plat-why">${window.MARKETPLACE_FIT_ENGINE.platformWhy(key, layerScores)}</div>
        <div class="plat-flags">${p.flags.map(f => `<span class="plat-flag" style="background:${f.h}18;color:${f.h}">${f.l}</span>`).join('')}</div>
      `;
      grid.appendChild(card);
    });

    const breakdown = document.getElementById('layerBreakdown');
    breakdown.innerHTML = '';
    [['cf', 'Customer Fit'], ['of', 'Operational Fit'], ['ff', 'Financial Fit']].forEach(([key, label]) => {
      const meta = window.MARKETPLACE_FIT_DATA.layerMeta[key];
      const val = layerScores[key] || 0;
      const insight = window.MARKETPLACE_FIT_ENGINE.layerInsight(key, layerScores[key]);
      breakdown.innerHTML += `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
          <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:${meta.hex};width:130px;flex-shrink:0;">${label}</div>
          <div style="flex:1;height:5px;background:#2e2e3e;border-radius:3px;overflow:hidden;"><div style="height:5px;background:${meta.hex};width:${val * 10}%;border-radius:3px;transition:width 0.6s cubic-bezier(0.34,1.56,0.64,1)"></div></div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${meta.hex};width:26px;text-align:right;">${val.toFixed(1)}</div>
        </div>
        ${insight ? `<div style="font-size:11px;color:var(--t4);margin-bottom:16px;padding-left:142px;line-height:1.5;font-style:italic;">${insight}</div>` : '<div style="margin-bottom:16px;"></div>'}
      `;
    });

    const topPlatform = window.MARKETPLACE_FIT_DATA.platforms[topKey];
    const [wcf, wof, wff] = topPlatform.weights;
    document.getElementById('platformDetail').innerHTML = `
      <div class="r-section-eyebrow">Top Pick — Weight Analysis</div>
      <div class="r-section-title">${topPlatform.icon} ${topPlatform.name} — How each layer contributes to your score</div>
      <div style="font-size:13px;color:var(--t3);line-height:1.7;margin-bottom:20px;">Your score on each layer, weighted by how much ${topPlatform.name} depends on that layer.</div>
      ${[['cf','Customer Fit','#3a72b0',wcf],['of','Operational Fit','#b8620a',wof],['ff','Financial Fit','#2a6a3a',wff]].map(([layer, name, hex, weight]) => {
        const score = layerScores[layer] || 0;
        const contrib = parseFloat((score * weight).toFixed(1));
        return `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:${hex};width:130px;flex-shrink:0;">${name}</div>
            <div style="flex:1;height:5px;background:#2e2e3e;border-radius:3px;overflow:hidden;"><div style="height:5px;background:${hex};width:${score * 10}%;border-radius:3px;"></div></div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${hex};width:32px;text-align:right;">${score.toFixed(1)}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--t4);width:72px;text-align:right;">×${(weight * 100).toFixed(0)}% = ${contrib}</div>
          </div>
        `;
      }).join('')}
    `;

    const ctaBtn = document.getElementById('ctaBtn');
    const ctaBtn2 = document.getElementById('ctaBtn2');

    if (ctaBtn) {
      ctaBtn.onclick = () => {
        window.location.href = '../booking/paid.html';
      };
    }

    if (ctaBtn2) {
      ctaBtn2.onclick = () => {
        window.location.href = '../booking/free-call.html';
      };
    }
  }
};
