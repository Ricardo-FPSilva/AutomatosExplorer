// ==========================================
// --- FUNDAMENTOS ---
// ==========================================
function analyzeString() {
    const input = document.getElementById('string-input').value;
    const len = input.length;
    document.getElementById('str-length').innerText = len;
    const vc = document.getElementById('visual-word-array');
    vc.innerHTML = '';
    if (len === 0) {
        document.getElementById('str-prefixes').innerText = '{ ε }';
        document.getElementById('str-suffixes').innerText = '{ ε }';
        vc.innerHTML = '<div class="text-slate-400 italic font-mono bg-white p-3 rounded border border-slate-200">Sua caixa de texto está limpa. Trata-se da Palavra Vazia (ε). Ela não contém átomos, por isso o índice matemático é inacessível. Seu comprimento é nulo.</div>';
        updateProgress('analyzer');
        return;
    }
    for (let i = 0; i < len; i++) {
        vc.innerHTML += `<div class="flex flex-col items-center group"><div class="w-12 h-12 bg-emerald-100 text-emerald-800 font-mono font-bold text-2xl rounded shadow-sm border border-emerald-300 flex items-center justify-center cursor-default hover:bg-emerald-200 transition-colors">${input[i]}</div><div class="text-[11px] text-slate-500 font-bold font-mono mt-1 uppercase">Índice ${i}</div></div>`;
    }
    let pref = ['ε'], suff = ['ε'];
    for (let i = 1; i <= len; i++) pref.push(input.substring(0, i));
    for (let i = len - 1; i >= 0; i--) suff.push(input.substring(i));
    document.getElementById('str-prefixes').innerHTML = '<span class="text-emerald-400 font-bold">{</span> ' + pref.join('<span class="text-slate-500">,</span> ') + ' <span class="text-emerald-400 font-bold">}</span>';
    document.getElementById('str-suffixes').innerHTML = '<span class="text-emerald-400 font-bold">{</span> ' + suff.sort((a, b) => a.length - b.length).join('<span class="text-slate-500">,</span> ') + ' <span class="text-emerald-400 font-bold">}</span>';
    updateProgress('analyzer');
}

function updateJourney() {
    const alphaRaw = document.getElementById('journey-alpha').value;
    const alphaArr = [...new Set(alphaRaw.split(',').map(s => s.trim().substring(0, 1)).filter(s => s.length > 0))];
    document.getElementById('journey-alpha-display').innerText = alphaArr.join(', ');
    const word = document.getElementById('journey-word').value;
    const wordValEl = document.getElementById('journey-word-validation');
    let isWordValid = true;
    if (alphaArr.length === 0) {
        wordValEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-sm flex items-center justify-center border bg-rose-50 text-rose-600 border-rose-200";
        wordValEl.innerHTML = 'Alfabeto Vazio';
        isWordValid = false;
    } else if (word === "") {
        wordValEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-sm flex items-center justify-center border bg-emerald-50 text-emerald-700 border-emerald-200";
        wordValEl.innerHTML = 'w = ε (Palavra Vazia)';
    } else {
        const invalidChars = word.split('').filter(c => !alphaArr.includes(c));
        if (invalidChars.length > 0) {
            wordValEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-sm flex items-center justify-center border bg-rose-50 text-rose-600 border-rose-200 shadow-inner";
            wordValEl.innerHTML = `Inválida! '${invalidChars[0]}' &notin; Σ`;
            isWordValid = false;
        } else {
            wordValEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-sm flex items-center justify-center border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-inner";
            wordValEl.innerHTML = 'w &isin; Σ* (Válida)';
        }
    }
    const rule = document.getElementById('journey-rule').value;
    const langResEl = document.getElementById('journey-lang-result');
    if (!isWordValid) {
        langResEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-[15px] border bg-slate-100 text-slate-400 border-slate-200";
        langResEl.innerHTML = 'Pendente...';
        return;
    }
    let belongs = false;
    if (word === "") {
        if (rule === "even") belongs = true;
    } else {
        if (rule === "starts") belongs = word.startsWith(alphaArr[0]);
        else if (rule === "ends") belongs = word.endsWith(alphaArr[alphaArr.length - 1]);
        else if (rule === "even") belongs = word.length % 2 === 0;
        else if (rule === "odd") belongs = word.length % 2 !== 0;
    }
    if (belongs) {
        langResEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-black min-w-[150px] text-[15px] border bg-purple-100 text-purple-700 border-purple-300 shadow-inner";
        langResEl.innerHTML = '✓ w &isin; L (Pertence)';
    } else {
        langResEl.className = "w-full md:w-auto px-5 py-3 rounded-lg text-center font-bold min-w-[150px] text-[15px] border bg-slate-100 text-rose-500 border-rose-200 shadow-inner";
        langResEl.innerHTML = '✗ w &notin; L (Rejeitada)';
    }
}

// ==========================================
// --- GRAMÁTICAS ---
// ==========================================
let currentDerivStep = 0;
const derivSteps = [
    { str: "S", rule: "Símbolo Inicial", desc: "Todo processo de derivação começa pelo Axioma (S)." },
    { str: "CMD ARG", rule: "S → CMD ARG", desc: "A Regra 1 dita a estrutura base." },
    { str: "GET ARG", rule: "CMD → GET", desc: "O comando vira 'GET'." },
    { str: "GET LETRA ARG", rule: "ARG → LETRA ARG", desc: "Iniciamos a injeção recursiva." },
    { str: "GET d ARG", rule: "LETRA → d", desc: "A primeira letra é processada." },
    { str: "GET d LETRA ARG", rule: "ARG → LETRA ARG", desc: "Continua o loop recursivo." },
    { str: "GET d a ARG", rule: "LETRA → a", desc: "Segunda letra." },
    { str: "GET d a LETRA ARG", rule: "ARG → LETRA ARG", desc: "Mais expansão." },
    { str: "GET d a t ARG", rule: "LETRA → t", desc: "Terceira letra." },
    { str: "GET d a t LETRA", rule: "ARG → LETRA", desc: "Parando o loop recursivo infinito." },
    { str: "GET d a t a", rule: "LETRA → a", desc: "Concluído!" }
];

function updateDerivUI() {
    let f = derivSteps[currentDerivStep].str
        .replace(/GET/g, '<span class="text-emerald-500 font-black">GET</span>')
        .replace(/SET/g, '<span class="text-emerald-500 font-black">SET</span>')
        .replace(/\b([a-z])\b/g, '<span class="text-emerald-500 font-black">$1</span>');
    document.getElementById('deriv-display').innerHTML = f;
    document.getElementById('deriv-rule').innerText = derivSteps[currentDerivStep].rule;
    document.getElementById('deriv-explanation').innerText = derivSteps[currentDerivStep].desc;
    document.getElementById('btn-deriv-prev').disabled = currentDerivStep === 0;
    document.getElementById('btn-deriv-next').disabled = currentDerivStep === derivSteps.length - 1;
    const hc = document.getElementById('deriv-history');
    hc.innerHTML = '';
    for (let i = 0; i <= currentDerivStep; i++) {
        hc.innerHTML += `<span class="px-2 py-1 bg-slate-700 rounded font-mono text-slate-300 border border-slate-600 shadow-sm">${derivSteps[i].str}</span>`;
        if (i < currentDerivStep) hc.innerHTML += `<span class="text-slate-500 font-bold">⇒</span>`;
    }
}

function derivStep(dir) {
    currentDerivStep = Math.max(0, Math.min(derivSteps.length - 1, currentDerivStep + dir));
    updateDerivUI();
    if (currentDerivStep === derivSteps.length - 1) updateProgress('derivator');
}

function derivReset() {
    currentDerivStep = 0;
    updateDerivUI();
}

// ==========================================
// --- HIERARQUIA DE CHOMSKY ---
// ==========================================
function showChomsky(lvl, e) {
    e.stopPropagation();
    const cData = [
        { t: "Tipo 0 - Estrutura de Frase", r: "α → β", d: "Máquina de Turing (O Santo Graal da Computação)", c: "bg-slate-700 text-white", bc: "border-t-slate-500" },
        { t: "Tipo 1 - Sensíveis ao Contexto", r: "αAβ → αγβ", d: "Autômato Linearmente Limitado", c: "bg-blue-600 text-white", bc: "border-t-blue-500" },
        { t: "Tipo 2 - Livres de Contexto", r: "A → β", d: "Autômato de Pilha (Compiladores)", c: "bg-purple-600 text-white", bc: "border-t-purple-500" },
        { t: "Tipo 3 - Regulares", r: "A → aB ou A → a", d: "Autômato Finito (Leitor de Regex)", c: "bg-emerald-600 text-white", bc: "border-t-emerald-500" }
    ];
    [0, 1, 2, 3].forEach(i => {
        const l = document.getElementById(`chomsky-layer-${i}`);
        if (i === lvl) l.classList.add('ring-4', 'ring-offset-2', 'ring-slate-300');
        else l.classList.remove('ring-4', 'ring-offset-2', 'ring-slate-300');
    });
    const data = cData[lvl];
    const panel = document.getElementById('chomsky-info-panel');
    panel.className = `bg-white p-8 rounded-2xl border border-slate-200 shadow-md min-h-[450px] flex flex-col border-t-8 ${data.bc} transition-colors duration-300 relative overflow-hidden`;
    panel.innerHTML = `<h3 class="text-3xl font-bold text-slate-800 mb-2 mt-4">${data.t}</h3><div class="inline-block px-4 py-2 rounded-full font-bold text-sm mb-6 ${data.c} shadow-sm border border-transparent border-b-black/20">🤖 O Processador Biológico: ${data.d}</div><div class="bg-slate-50 p-5 mb-6 rounded-xl border border-slate-200 shadow-inner"><div class="text-xs font-bold text-slate-400 uppercase">A Fórmula da Restrição Matemática que impõe o Limite:</div><div class="text-3xl font-mono font-bold text-slate-700 bg-white p-4 rounded-lg text-center border mt-2 shadow-sm">${data.r}</div></div>`;
    updateProgress('chomsky');
}
