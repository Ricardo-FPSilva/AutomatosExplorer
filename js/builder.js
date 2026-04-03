// ===============================================
// --- CONSTRUTOR DINÂMICO DE AUTÔMATOS ---
// ===============================================
let bldInitialized = false;
let bldConfig = { type: 'afd', numStates: 3, alpha: ['a', 'b'], finais: new Set(['q2']) };
let bldDelta = {};
let bldTape = [];
let bldHead = 0;
let bldActive = [];
let bldDebounceTimer = null;
let bldPlayInterval = null;

function buildTableUI() {
    bldSimPause();
    const type = document.getElementById('bld-type').value;
    const n = parseInt(document.getElementById('bld-states').value);
    const aStr = document.getElementById('bld-alphabet').value;
    let alphaRaw = aStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (alphaRaw.length === 0) alphaRaw = ['a', 'b'];
    let alpha = [...new Set(alphaRaw.map(s => s[0]))];
    bldConfig.type = type; bldConfig.numStates = n; bldConfig.alpha = alpha;
    if (bldConfig.finais.size === 0) bldConfig.finais.add(`q${n - 1}`);

    document.getElementById('bld-table-tip').innerText = type === 'afd'
        ? "Modo AFD: Digite apenas UM destino exato (ex: q1). Deixar em branco gera um erro e mata a máquina instantaneamente."
        : "Modo AFN: Pode usar múltiplos destinos separados por vírgula (ex: q0,q1). Deixar em branco indica um ramo morto.";

    let chkHtml = '';
    for (let i = 0; i < n; i++) {
        const q = `q${i}`;
        const checked = bldConfig.finais.has(q) ? 'checked' : '';
        chkHtml += `<label class="inline-flex items-center bg-white border border-slate-200 px-4 py-2 rounded shadow-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors font-bold"><input type="checkbox" class="mr-2 bld-chk-final accent-amber-600 scale-125" value="${q}" ${checked} onchange="updateFinais()"> ${q}</label>`;
    }
    document.getElementById('bld-final-states').innerHTML = chkHtml;

    let thHtml = `<tr class="border-b border-slate-600"><th class="py-3 px-2 font-bold text-amber-400">Estado Base</th>`;
    alpha.forEach(sym => thHtml += `<th class="py-3 font-bold">Se ler '${sym}' vai para:</th>`);
    thHtml += `</tr>`;

    let tbHtml = '';
    for (let i = 0; i < n; i++) {
        const q = `q${i}`;
        const isStart = i === 0 ? '&rarr; ' : '';
        tbHtml += `<tr class="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"><td class="py-3 font-mono font-bold text-lg">${isStart}${q}</td>`;
        alpha.forEach(sym => {
            let oldVal = '';
            if (bldDelta[q] && bldDelta[q][sym]) { oldVal = bldDelta[q][sym].join(','); }
            else if (i === 0 && type === 'afd') { oldVal = q; }
            tbHtml += `<td class="py-3 px-2"><input type="text" id="cell-${q}-${sym}" value="${oldVal}" oninput="debouncedParseBuilderData()" class="w-full bg-slate-900 border border-slate-600 text-amber-300 font-mono text-center rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none transition-colors shadow-inner text-lg"></td>`;
        });
        tbHtml += `</tr>`;
    }
    document.getElementById('bld-table').innerHTML = `<thead>${thHtml}</thead><tbody>${tbHtml}</tbody>`;
    parseBuilderData();
}

function updateFinais() {
    bldConfig.finais.clear();
    document.querySelectorAll('.bld-chk-final:checked').forEach(chk => bldConfig.finais.add(chk.value));
    drawBuilderGraph();
}

function debouncedParseBuilderData() {
    clearTimeout(bldDebounceTimer);
    bldDebounceTimer = setTimeout(() => { parseBuilderData(); }, 300);
}

function parseBuilderData() {
    bldDelta = {};
    const n = bldConfig.numStates;
    const validStates = new Set();
    for (let i = 0; i < n; i++) validStates.add(`q${i}`);
    for (let i = 0; i < n; i++) {
        const q = `q${i}`;
        bldDelta[q] = {};
        bldConfig.alpha.forEach(sym => {
            const inputEl = document.getElementById(`cell-${q}-${sym}`);
            const rawVal = inputEl.value;
            let targets = rawVal.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
            let hasError = false;
            let validTargets = targets.filter(s => { if (validStates.has(s)) return true; hasError = true; return false; });
            if (bldConfig.type === 'afd' && validTargets.length > 1) { validTargets = [validTargets[0]]; inputEl.value = validTargets[0]; }
            if (hasError && rawVal.length > 0) { inputEl.classList.add('bld-input-error'); }
            else { inputEl.classList.remove('bld-input-error'); }
            bldDelta[q][sym] = validTargets;
        });
    }
    document.getElementById('bld-result').innerText = '';
    document.getElementById('btn-bld-step').disabled = true;
    document.getElementById('btn-bld-play').disabled = true;
    bldSimPause(); bldActive = [];
    drawBuilderGraph();
    updateProgress('builder');
}

function drawBuilderGraph() {
    const canvas = document.getElementById('bld-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width; const n = bldConfig.numStates; const nodes = {};
    const startX = w * 0.15; const endX = w * 0.85;
    const stepX = n > 1 ? (endX - startX) / (n - 1) : 0;
    for (let i = 0; i < n; i++) {
        const nx = n === 1 ? w / 2 : startX + (i * stepX);
        nodes[`q${i}`] = { x: nx, y: 140, idx: i };
    }
    const edgesMap = {};
    for (let i = 0; i < n; i++) {
        const qFrom = `q${i}`;
        bldConfig.alpha.forEach(sym => {
            const targets = bldDelta[qFrom][sym] || [];
            targets.forEach(qTo => {
                const key = `${qFrom}->${qTo}`;
                if (!edgesMap[key]) edgesMap[key] = { from: qFrom, to: qTo, labels: [] };
                edgesMap[key].labels.push(sym);
            });
        });
    }
    for (let key in edgesMap) {
        const edge = edgesMap[key];
        const nodeF = nodes[edge.from]; const nodeT = nodes[edge.to];
        const lbl = edge.labels.join(', ');
        let drawType = 'straight';
        if (nodeF.idx === nodeT.idx) { drawType = 'loop-bottom'; }
        else if (Math.abs(nodeF.idx - nodeT.idx) === 1) { drawType = 'straight'; }
        else if (nodeF.idx < nodeT.idx) { drawType = 'curve-top'; }
        else { drawType = 'curve-bottom-back'; }
        drawCanvasEdge(ctx, nodeF.x, nodeF.y, nodeT.x, nodeT.y, lbl, drawType);
    }
    for (let q in nodes) {
        const isFinal = bldConfig.finais.has(q);
        const isActive = bldActive.includes(q);
        drawCanvasNode(ctx, nodes[q].x, nodes[q].y, q, isFinal, isActive, 'bld');
    }
}

function bldSimLoad() {
    bldSimPause(); parseBuilderData();
    let rawInput = document.getElementById('bld-sim-input').value;
    const validAlpha = new Set(bldConfig.alpha);
    bldTape = rawInput.split('').filter(char => validAlpha.has(char));
    document.getElementById('bld-sim-input').value = bldTape.join('');
    bldHead = 0; bldActive = ['q0'];
    document.getElementById('bld-result').innerText = '';
    document.getElementById('btn-bld-step').disabled = bldTape.length === 0;
    document.getElementById('btn-bld-play').disabled = bldTape.length === 0;
    bldRenderTape(); drawBuilderGraph();
    document.getElementById('bld-status-badge').innerText = 'Máquina Ativa no q0';
}

function bldRenderTape() {
    const c = document.getElementById('bld-tape-container');
    c.innerHTML = '';
    if (bldTape.length === 0) { c.innerHTML = '<span class="text-slate-400 italic text-sm">Fita vazia. Digite algo para começar.</span>'; return; }
    bldTape.forEach((s, i) => {
        const el = document.createElement('div');
        el.className = `tape-cell min-w-[40px] h-12 text-xl flex items-center justify-center bg-white border border-slate-300 rounded-lg shadow-sm font-mono ${i === bldHead ? 'bg-amber-300 border-amber-500 font-bold scale-110 z-10 text-slate-900' : (i < bldHead ? 'consumed' : '')}`;
        el.innerText = s;
        c.appendChild(el);
    });
}

function bldSimStep() {
    if (bldHead >= bldTape.length) { bldSimPause(); return; }
    const sym = bldTape[bldHead];
    let nextStates = new Set();
    bldActive.forEach(state => { const dests = bldDelta[state][sym] || []; dests.forEach(d => nextStates.add(d)); });
    bldActive = [...nextStates]; bldHead++;
    bldRenderTape(); drawBuilderGraph();
    const badge = document.getElementById('bld-status-badge');
    if (bldActive.length === 0) { badge.innerHTML = '<span class="text-rose-400 font-bold drop-shadow-sm">∅ ERRO: Estado Morto!</span>'; }
    else if (bldConfig.type === 'afd') { badge.innerText = `Estado de Rastreio: ${bldActive[0]}`; }
    else { badge.innerText = `Clones Paralelos: { ${bldActive.join(',')} }`; }
    if (bldHead >= bldTape.length) {
        bldSimPause();
        document.getElementById('btn-bld-step').disabled = true;
        document.getElementById('btn-bld-play').disabled = true;
        const r = document.getElementById('bld-result');
        const accepted = bldActive.some(q => bldConfig.finais.has(q));
        if (accepted) {
            r.innerText = "✓ SUCESSO! A MÁQUINA QUE VOCÊ CONSTRUIU RECONHECEU A CADEIA!";
            r.className = "text-center font-black text-2xl mt-6 text-emerald-600 drop-shadow-sm p-4 bg-emerald-50 rounded-xl border border-emerald-200";
        } else {
            r.innerText = "✗ ERRO DE SINTAXE LIDA! A SUA MÁQUINA RECUSOU A PALAVRA!";
            r.className = "text-center font-black text-2xl mt-6 text-rose-500 drop-shadow-sm p-4 bg-rose-50 rounded-xl border border-rose-200";
        }
    }
}

function bldSimPlay() {
    if (bldHead >= bldTape.length) return;
    document.getElementById('btn-bld-play').classList.add('hidden');
    document.getElementById('btn-bld-pause').classList.remove('hidden');
    bldSimStep();
    if (bldHead < bldTape.length) {
        bldPlayInterval = setInterval(() => { bldSimStep(); }, 1000);
    }
}

function bldSimPause() {
    clearInterval(bldPlayInterval);
    document.getElementById('btn-bld-pause').classList.add('hidden');
    document.getElementById('btn-bld-play').classList.remove('hidden');
}
