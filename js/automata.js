// ===============================================
// --- CANVAS RENDERER MATH CORE ---
// ===============================================
function drawCanvasNode(ctx, x, y, label, isFinal, isActive, type = 'afd') {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, 2 * Math.PI);
    ctx.fillStyle = isActive
        ? (type === 'afd' ? '#a7f3d0' : (type === 'afn' ? '#c7d2fe' : (type === 'regex' ? '#fecdd3' : '#fde68a')))
        : '#ffffff';
    ctx.fill();
    ctx.lineWidth = isActive ? 4 : 2;
    ctx.strokeStyle = isActive
        ? (type === 'afd' ? '#059669' : (type === 'afn' ? '#4f46e5' : (type === 'regex' ? '#e11d48' : '#b45309')))
        : '#64748b';
    ctx.stroke();
    if (isFinal) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, 2 * Math.PI);
        ctx.stroke();
    }
    ctx.fillStyle = '#1e293b';
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
}

function drawCanvasEdge(ctx, fromX, fromY, toX, toY, label, type) {
    ctx.beginPath();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    let textX = 0, textY = 0;
    if (type === 'loop-top') {
        ctx.arc(fromX, fromY - 26, 14, 0, 2 * Math.PI); ctx.stroke();
        textX = fromX; textY = fromY - 48;
    } else if (type === 'loop-bottom') {
        ctx.arc(fromX, fromY + 26, 14, 0, 2 * Math.PI); ctx.stroke();
        textX = fromX; textY = fromY + 48;
    } else if (type === 'straight') {
        ctx.moveTo(fromX + 22, fromY); ctx.lineTo(toX - 25, toY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX - 25, toY); ctx.lineTo(toX - 35, toY - 6); ctx.lineTo(toX - 35, toY + 6);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        textX = (fromX + toX) / 2; textY = fromY - 12;
    } else if (type === 'curve-top') {
        ctx.moveTo(fromX + 12, fromY - 18); ctx.quadraticCurveTo((fromX + toX) / 2, fromY - 100, toX - 12, toY - 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX - 12, toY - 18); ctx.lineTo(toX - 24, toY - 12); ctx.lineTo(toX - 24, toY - 24);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        textX = (fromX + toX) / 2; textY = fromY - 65;
    } else if (type === 'curve-bottom-back') {
        ctx.moveTo(fromX - 12, fromY + 18); ctx.quadraticCurveTo((fromX + toX) / 2, fromY + 100, toX + 12, toY + 18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX + 12, toY + 18); ctx.lineTo(toX + 24, toY + 12); ctx.lineTo(toX + 24, toY + 24);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        textX = (fromX + toX) / 2; textY = fromY + 65;
    } else if (type === 'curve-bottom-deep') {
        ctx.moveTo(fromX, fromY + 22); ctx.quadraticCurveTo((fromX + toX) / 2, fromY + 140, toX, toY + 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX, toY + 22); ctx.lineTo(toX - 6, toY + 32); ctx.lineTo(toX + 6, toY + 32);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        textX = (fromX + toX) / 2; textY = fromY + 80;
    } else if (type === 'curve-top-deep') {
        ctx.moveTo(fromX, fromY - 22); ctx.quadraticCurveTo((fromX + toX) / 2, fromY - 140, toX, toY - 22); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX, toY - 22); ctx.lineTo(toX - 6, toY - 32); ctx.lineTo(toX + 6, toY - 32);
        ctx.fillStyle = '#94a3b8'; ctx.fill();
        textX = (fromX + toX) / 2; textY = fromY - 80;
    }
    ctx.fillStyle = '#0f172a';
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(label, textX, textY);
}

// ===============================================
// --- AFD (AUTÔMATO FINITO DETERMINÍSTICO) ---
// ===============================================
const automataDFA = {
    'q0': { '0': 'q0', '1': 'q1' },
    'q1': { '0': 'q2', '1': 'q1' },
    'q2': { '0': 'q0', '1': 'q3' },
    'q3': { '0': 'q3', '1': 'q3' }
};
let dfaTape = [], dfaHead = 0, dfaState = 'q0';

function drawAfdGraph(activeState) {
    const canvas = document.getElementById('afd-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const nodes = {
        'q0': { x: w * 0.15, y: 100 }, 'q1': { x: w * 0.4, y: 100 },
        'q2': { x: w * 0.65, y: 100 }, 'q3': { x: w * 0.9, y: 100 }
    };
    drawCanvasEdge(ctx, nodes.q0.x, nodes.q0.y, nodes.q0.x, nodes.q0.y, "0", 'loop-bottom');
    drawCanvasEdge(ctx, nodes.q0.x, nodes.q0.y, nodes.q1.x, nodes.q1.y, "1", 'straight');
    drawCanvasEdge(ctx, nodes.q1.x, nodes.q1.y, nodes.q1.x, nodes.q1.y, "1", 'loop-top');
    drawCanvasEdge(ctx, nodes.q1.x, nodes.q1.y, nodes.q2.x, nodes.q2.y, "0", 'straight');
    drawCanvasEdge(ctx, nodes.q2.x, nodes.q2.y, nodes.q3.x, nodes.q3.y, "1", 'straight');
    drawCanvasEdge(ctx, nodes.q2.x, nodes.q2.y, nodes.q0.x, nodes.q0.y, "0", 'curve-bottom-back');
    drawCanvasEdge(ctx, nodes.q3.x, nodes.q3.y, nodes.q3.x, nodes.q3.y, "0, 1", 'loop-bottom');
    for (let q in nodes) drawCanvasNode(ctx, nodes[q].x, nodes[q].y, q, q === 'q3', activeState === q, 'afd');
}

function dfaLoad() {
    dfaTape = document.getElementById('dfa-input').value.replace(/[^01]/g, '').split('');
    dfaHead = 0; dfaState = 'q0';
    document.getElementById('dfa-result').innerText = '';
    document.getElementById('btn-dfa-step').disabled = dfaTape.length === 0;
    renderDfaTape();
    document.getElementById('dfa-step-info').innerHTML = 'Log de Sistema iniciado. Estado resetado para [q0].';
    drawAfdGraph(dfaState);
    ['q0', 'q1', 'q2', 'q3'].forEach(q => {
        const row = document.getElementById(`row-dfa-${q}`);
        if (row) row.classList.remove('bg-emerald-700', 'text-white');
    });
    const row = document.getElementById(`row-dfa-q0`);
    if (row) row.classList.add('bg-emerald-700', 'text-white');
}

function renderDfaTape() {
    const c = document.getElementById('dfa-tape-container');
    c.innerHTML = '';
    dfaTape.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = `tape-cell min-w-[42px] h-14 text-xl flex items-center justify-center bg-white border border-slate-300 rounded-lg shadow-sm font-mono ${i === dfaHead ? 'bg-emerald-300 border-emerald-500 font-bold scale-110 z-10' : (i < dfaHead ? 'consumed' : '')}`;
        el.innerText = s;
        c.appendChild(el);
    });
}

function dfaStep() {
    if (dfaHead >= dfaTape.length) return;
    const sym = dfaTape[dfaHead], prev = dfaState;
    dfaState = automataDFA[dfaState][sym];
    document.getElementById('dfa-step-info').innerHTML = `<span class="bg-slate-700 text-emerald-400 px-2 py-0.5 rounded font-mono shadow-sm">δ(${prev}, ${sym}) &rarr; ${dfaState}</span> <br><span class="text-xs text-slate-400 mt-1 block font-medium">O trem leu '${sym}' e foi para a estação ${dfaState}.</span>`;
    ['q0', 'q1', 'q2', 'q3'].forEach(q => {
        const row = document.getElementById(`row-dfa-${q}`);
        if (row) row.classList.remove('bg-emerald-700', 'text-white');
    });
    const row = document.getElementById(`row-dfa-${dfaState}`);
    if (row) row.classList.add('bg-emerald-700', 'text-white');
    dfaHead++; renderDfaTape(); drawAfdGraph(dfaState);
    if (dfaHead >= dfaTape.length) {
        document.getElementById('btn-dfa-step').disabled = true;
        const r = document.getElementById('dfa-result');
        r.innerText = dfaState === 'q3' ? "✓ CADEIA VALIDADA E ACEITA PELO AFD!" : "✗ ERRO LIDO! CADEIA REJEITADA PELO AFD!";
        r.className = dfaState === 'q3'
            ? "text-center font-bold text-2xl mt-6 text-emerald-600 drop-shadow-sm px-4 py-2 border border-emerald-100 bg-emerald-50 rounded-xl"
            : "text-center font-bold text-2xl mt-6 text-rose-500 drop-shadow-sm px-4 py-2 border border-rose-100 bg-rose-50 rounded-xl";
        updateProgress('afd');
    }
}

// ===============================================
// --- AFN (AUTÔMATO FINITO NÃO-DETERMINÍSTICO) ---
// ===============================================
const automataNFA = {
    'q0': { '0': ['q0'], '1': ['q0', 'q1'] },
    'q1': { '0': ['q2'], '1': [] },
    'q2': { '0': [], '1': ['qf'] },
    'qf': { '0': ['qf'], '1': ['qf'] }
};
let afnTape = [], afnHead = 0, afnActiveStates = ['q0'];

function drawAfnGraph(activeStatesArr) {
    const canvas = document.getElementById('afn-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const nodes = {
        'q0': { x: w * 0.15, y: 100 }, 'q1': { x: w * 0.4, y: 100 },
        'q2': { x: w * 0.65, y: 100 }, 'qf': { x: w * 0.9, y: 100 }
    };
    drawCanvasEdge(ctx, nodes.q0.x, nodes.q0.y, nodes.q0.x, nodes.q0.y, "0, 1", 'loop-bottom');
    drawCanvasEdge(ctx, nodes.q0.x, nodes.q0.y, nodes.q1.x, nodes.q1.y, "1", 'straight');
    drawCanvasEdge(ctx, nodes.q1.x, nodes.q1.y, nodes.q2.x, nodes.q2.y, "0", 'straight');
    drawCanvasEdge(ctx, nodes.q2.x, nodes.q2.y, nodes.qf.x, nodes.qf.y, "1", 'straight');
    drawCanvasEdge(ctx, nodes.qf.x, nodes.qf.y, nodes.qf.x, nodes.qf.y, "0, 1", 'loop-bottom');
    for (let q in nodes) drawCanvasNode(ctx, nodes[q].x, nodes[q].y, q, q === 'qf', activeStatesArr.includes(q), 'afn');
}

function afnLoad() {
    afnTape = document.getElementById('afn-input').value.replace(/[^01]/g, '').split('');
    afnHead = 0; afnActiveStates = ['q0'];
    document.getElementById('afn-result').innerText = '';
    document.getElementById('btn-afn-step').disabled = afnTape.length === 0;
    document.getElementById('afn-branches-info').innerHTML = '<span class="bg-indigo-900 text-indigo-100 border border-indigo-500 px-3 py-1 rounded-full font-mono text-lg font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">q0</span>';
    renderAfnTape(); drawAfnGraph(afnActiveStates);
    ['q0', 'q1', 'q2', 'qf'].forEach(q => {
        const row = document.getElementById(`row-afn-${q}`);
        if (row) row.classList.remove('bg-indigo-700', 'text-white');
    });
    const row = document.getElementById(`row-afn-q0`);
    if (row) row.classList.add('bg-indigo-700', 'text-white');
}

function renderAfnTape() {
    const c = document.getElementById('afn-tape-container');
    c.innerHTML = '';
    afnTape.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = `tape-cell min-w-[42px] h-14 text-xl flex items-center justify-center bg-white border border-slate-300 rounded-lg shadow-sm font-mono ${i === afnHead ? 'bg-indigo-300 border-indigo-500 font-bold scale-110 z-10' : (i < afnHead ? 'consumed' : '')}`;
        el.innerText = s;
        c.appendChild(el);
    });
}

function afnStep() {
    if (afnHead >= afnTape.length) return;
    const sym = afnTape[afnHead];
    let next = [];
    [...new Set(afnActiveStates)].forEach(s => {
        const dest = automataNFA[s][sym] || [];
        next.push(...dest);
    });
    afnActiveStates = next; afnHead++;
    const branchesContainer = document.getElementById('afn-branches-info');
    if (afnActiveStates.length === 0) {
        branchesContainer.innerHTML = '<span class="text-rose-400 font-bold">∅ (Extinção Total - Todos os clones morreram)</span>';
    } else {
        branchesContainer.innerHTML = [...new Set(afnActiveStates)].map((q, idx) =>
            `<span class="bg-indigo-900 text-indigo-100 border border-indigo-500 px-3 py-1 rounded-full font-mono text-lg font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">Clone ${idx + 1}: ${q}</span>`
        ).join('');
    }
    ['q0', 'q1', 'q2', 'qf'].forEach(q => {
        const row = document.getElementById(`row-afn-${q}`);
        if (row) row.classList.remove('bg-indigo-700', 'text-white');
    });
    afnActiveStates.forEach(q => {
        const row = document.getElementById(`row-afn-${q}`);
        if (row) row.classList.add('bg-indigo-700', 'text-white');
    });
    renderAfnTape(); drawAfnGraph(afnActiveStates);
    if (afnHead >= afnTape.length) {
        document.getElementById('btn-afn-step').disabled = true;
        const r = document.getElementById('afn-result');
        r.innerText = afnActiveStates.includes('qf')
            ? "✓ CADEIA ACEITA PELO AFN: Pelo menos um caminho chegou ao sucesso!"
            : "✗ CADEIA REJEITADA PELO AFN: Todos os caminhos falharam.";
        r.className = afnActiveStates.includes('qf')
            ? "text-center font-bold text-xl mt-6 text-indigo-600 drop-shadow-sm px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl"
            : "text-center font-bold text-xl mt-6 text-rose-500 drop-shadow-sm px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl";
        updateProgress('afn');
    }
}
