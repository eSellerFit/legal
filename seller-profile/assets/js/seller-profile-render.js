window.SELLER_PROFILE_RENDER = {
  buildQuestions(containerId, answers, onPick) {
    const body = document.getElementById(containerId);
    if (!body) return;

    body.innerHTML = '';
    ['c','r','e','m'].forEach(dim => {
      const meta = window.SELLER_PROFILE_DATA.dimMeta[dim];
      const block = document.createElement('div');
      block.className = 'dim-block';
      block.innerHTML = `<div class="dim-hdr"><span class="dim-tag ${meta.cls}">${meta.tag}</span><div><div class="dim-name">${meta.name}</div><div class="dim-desc">${meta.desc}</div></div></div>`;

      window.SELLER_PROFILE_DATA.questions.filter(q => q.dim === dim).forEach((q, qi) => {
        const qb = document.createElement('div');
        qb.className = 'q-block';
        qb.style.animationDelay = `${qi * 0.04}s`;
        qb.innerHTML = `
          <div class="q-lbl"><span class="q-num">${q.id}</span><span>${q.text}</span></div>
          <div class="opts">
            ${q.opts.map((opt, i) => `
              <button type="button" class="opt ${answers[q.id] === i ? 'sel' : ''}" data-q="${q.id}" data-i="${i}">
                <div class="dot"></div><span class="opt-txt">${opt}</span>
              </button>
            `).join('')}
          </div>
        `;
        qb.querySelectorAll('.opt').forEach(btn => btn.addEventListener('click', () => onPick(q.id, Number(btn.dataset.i))));
        block.appendChild(qb);
      });
      body.appendChild(block);
    });
  },

  drawRadar(scores) {
    const cv = document.getElementById('radarCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, cx = W/2, cy = H/2+12, R = Math.min(W,H)/2-76, n = 4;
    const dims = ['c','r','e','m'];
    const labels = ['Capital','Risk\nAppetite','Execution','Market\nCreation'];
    const colors = ['#caa25f','#4ecdc4','#e8635a','#9b8ec4'];

    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#222230';
    ctx.fillRect(0,0,W,H);

    [0.25,0.5,0.75,1].forEach((t,i)=>{
      ctx.beginPath();
      for(let j=0;j<n;j++){
        const a=(Math.PI*2*j/n)-Math.PI/2;
        const x=cx+Math.cos(a)*R*t;
        const y=cy+Math.sin(a)*R*t;
        if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle=i===3?'#3a3a4a':'#2e2e3e';
      ctx.lineWidth=i===3?1.5:1;
      ctx.stroke();
    });

    for(let j=0;j<n;j++){
      const a=(Math.PI*2*j/n)-Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);
      ctx.strokeStyle='#2e2e3e';
      ctx.lineWidth=1;
      ctx.stroke();
    }

    for(let j=0;j<n;j++){
      const a=(Math.PI*2*j/n)-Math.PI/2;
      const lx=cx+Math.cos(a)*(R+48);
      const ly=cy+Math.sin(a)*(R+48);
      ctx.fillStyle=colors[j];
      ctx.font='500 12px Syne,sans-serif';
      ctx.textAlign='center';
      labels[j].split('\n').forEach((line,li,arr)=>ctx.fillText(line,lx,ly+(li-(arr.length-1)/2)*16));
    }

    const vals = dims.map(d => scores[d] !== null ? scores[d] / 10 : 0);
    ctx.beginPath();
    for(let j=0;j<n;j++){
      const a=(Math.PI*2*j/n)-Math.PI/2;
      const r=vals[j]*R;
      const x=cx+Math.cos(a)*r;
      const y=cy+Math.sin(a)*r;
      if(j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle='rgba(15,110,86,0.10)';
    ctx.fill();
    ctx.strokeStyle='#0f6e56';
    ctx.lineWidth=1.5;
    ctx.stroke();

    for(let j=0;j<n;j++){
      if(scores[dims[j]]===null) continue;
      const a=(Math.PI*2*j/n)-Math.PI/2;
      const r=vals[j]*R;
      const x=cx+Math.cos(a)*r;
      const y=cy+Math.sin(a)*r;
      ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fillStyle=colors[j]+'20';ctx.fill();
      ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=colors[j];ctx.fill();
      ctx.strokeStyle='#222230';ctx.lineWidth=1.5;ctx.stroke();
    }
  },

  renderResults(scores, recommendation) {
    this.drawRadar(scores);
    const slot = document.getElementById('directionSlot');
    if (!slot) return;

    if (recommendation?.state === 'wait') {
      slot.innerHTML = `
        <div class="wait-section">
          <div class="wait-lbl">Your Result</div>
          <div class="wait-title">One area to strengthen before you launch</div>
          <div class="wait-body">
            Based on your answers, the most important thing to focus on right now is
            <strong style="color:#2a7a7a">${recommendation.weakest.dim}</strong>
            — before picking a platform or investing in products.<br><br>
            ${recommendation.weakest.advice}<br><br>
            <em style="color:var(--t4);font-size:13px;">This is a starting point based on your answers. A live session can help you figure out the right next step for your specific situation.</em>
          </div>
        </div>`;
      return;
    }

    slot.innerHTML = `
      <div class="r-section">
        <div class="r-section-eyebrow">Where to Start</div>
        <div style="font-size:14px;color:var(--t3);margin-bottom:22px;line-height:1.75;">${recommendation.intro}</div>
        <div class="dir-step">
          <div class="dir-badge db1">1</div>
          <div>
            <div class="dir-lbl">Best starting point for you</div>
            <div class="dir-plat" style="color:${recommendation.step1.color}">${recommendation.step1.icon} ${recommendation.step1.platform}</div>
            <div class="dir-why">${recommendation.step1.why}</div>
          </div>
        </div>
        <div class="dir-step">
          <div class="dir-badge db2">2</div>
          <div>
            <div class="dir-lbl">Where to grow next</div>
            <div class="dir-plat" style="color:${recommendation.step2.color}">${recommendation.step2.icon} ${recommendation.step2.platform}</div>
            <div class="dir-when">↳ ${recommendation.step2.when}</div>
          </div>
        </div>
        <div class="dir-caveat">This is a starting direction based on your answers — not a guarantee. A live session helps turn this into a real plan.</div>
      </div>`;
  }
};
