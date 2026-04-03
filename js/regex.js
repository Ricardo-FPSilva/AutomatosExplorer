// ===============================================
// --- EXPRESSÕES REGULARES E COMPILADOR DE THOMPSON ---
// ===============================================
let regexBuildHistory = [];
let currentRegexStepIndex = 0;

function testRegexMatch() {
    const ruleInput = document.getElementById('regex-test-rule').value.trim();
    const wordInput = document.getElementById('regex-test-word').value.trim();
    const resBox = document.getElementById('regex-test-result');
    if (!ruleInput) {
        resBox.innerHTML = "<span class='text-slate-400'>Aguardando Regra...</span>";
        resBox.className = "mt-4 p-3 rounded-lg text-center font-bold text-sm border bg-slate-50 border-slate-200 transition-all";
        return;
    }
    try {
        if (ruleInput.includes('+') || ruleInput.includes('?')) {
            resBox.innerHTML = "⚠️ Operadores '+' ou '?' não são suportados na base teórica. Use apenas: *, | e ()";
            resBox.className = "mt-4 p-3 rounded-lg text-center font-bold text-sm border transition-all bg-amber-50 border-amber-300 text-amber-700 shadow-inner";
            return;
        }
        const regexObj = new RegExp('^' + ruleInput + '$');
        if (regexObj.test(wordInput)) {
            resBox.innerHTML = "✅ Padrão Encontrado e Validado!";
            resBox.className = "mt-4 p-3 rounded-lg text-center font-bold text-sm border transition-all bg-emerald-50 border-emerald-300 text-emerald-700 shadow-inner";
        } else {
            resBox.innerHTML = "❌ Padrão Recusado. Não obedece à Regex.";
            resBox.className = "mt-4 p-3 rounded-lg text-center font-bold text-sm border transition-all bg-rose-50 border-rose-300 text-rose-700 shadow-inner";
        }
    } catch (e) {
        resBox.innerHTML = "⚠️ Erro de Sintaxe na sua Regex";
        resBox.className = "mt-4 p-3 rounded-lg text-center font-bold text-sm border transition-all bg-amber-50 border-amber-300 text-amber-700 shadow-inner";
    }
}

function parseRegexToAST(regexStr) {
    let formatted = '';
    for (let i = 0; i < regexStr.length; i++) {
        let c1 = regexStr[i]; formatted += c1;
        if (i + 1 < regexStr.length) {
            let c2 = regexStr[i + 1];
            let isC1Value = /[a-zA-Z0-9)]/.test(c1) || c1 === '*';
            let isC2Value = /[a-zA-Z0-9(]/.test(c2);
            if (isC1Value && isC2Value) formatted += '.';
        }
    }
    let output = [], stack = [];
    let prec = { '*': 3, '.': 2, '|': 1 };
    for (let i = 0; i < formatted.length; i++) {
        let c = formatted[i];
        if (/[a-zA-Z0-9]/.test(c)) { output.push(c); }
        else if (c === '(') { stack.push(c); }
        else if (c === ')') { while (stack.length > 0 && stack[stack.length - 1] !== '(') output.push(stack.pop()); stack.pop(); }
        else { while (stack.length > 0 && stack[stack.length - 1] !== '(' && prec[c] <= prec[stack[stack.length - 1]]) { output.push(stack.pop()); } stack.push(c); }
    }
    while (stack.length > 0) output.push(stack.pop());
    return output;
}

function buildNFAFromPostfixWithSteps(postfix) {
    regexBuildHistory = [];
    let stack = [], stateCounter = 0;
    regexBuildHistory.push({
        token: 'Início', stackSnapshot: [],
        description: `O compilador leu a expressão que você digitou e a traduziu para a memória interina: <span class="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold text-lg mx-1">[ ${postfix.join(' ')} ]</span>.<br><br>Vamos iniciar a leitura matemática da esquerda para a direita, empilhando as peças uma por uma.`
    });

    for (let i = 0; i < postfix.length; i++) {
        let token = postfix[i], desc = "";
        if (/[a-zA-Z0-9]/.test(token)) {
            let s0 = `q${stateCounter++}`, s1 = `q${stateCounter++}`;
            stack.push({ start: s0, end: s1, edges: [{ from: s0, to: s1, label: token, type: 'straight' }] });
            desc = `O símbolo base <b>'${token}'</b> foi lido. O compilador criou um mini-autômato independente na memória com apenas dois estados e uma transição exata para o reconhecer. Eles estão soltos por enquanto.`;
        } else if (token === '.') {
            if (stack.length < 2) throw new Error("Operador de Concatenação sem blocos suficientes para colar.");
            let right = stack.pop(), left = stack.pop();
            let edges = [...left.edges, ...right.edges];
            edges.push({ from: left.end, to: right.start, label: 'ε', type: 'straight' });
            stack.push({ start: left.start, end: right.end, edges: edges });
            desc = `Ação: <b>Concatenação (Ligação Direta)</b>. O computador pegou o bloco da esquerda e o da direita, e soldou o final do primeiro no início do segundo usando uma <b>transição-ε</b> (um pulo vazio que une as peças sem gastar a fita de entrada).`;
        } else if (token === '|') {
            if (stack.length < 2) throw new Error("Operador de União '|' sem blocos suficientes.");
            let right = stack.pop(), left = stack.pop();
            let s0 = `q${stateCounter++}`, s1 = `q${stateCounter++}`;
            let edges = [...left.edges, ...right.edges];
            edges.push({ from: s0, to: left.start, label: 'ε', type: 'curve-top' });
            edges.push({ from: s0, to: right.start, label: 'ε', type: 'curve-bottom-back' });
            edges.push({ from: left.end, to: s1, label: 'ε', type: 'curve-top' });
            edges.push({ from: right.end, to: s1, label: 'ε', type: 'curve-bottom-back' });
            stack.push({ start: s0, end: s1, edges: edges });
            desc = `Ação: <b>União '|' (OU Lógico)</b>. O compilador criou um novo Estado Inicial Global e ramificou-o com setas ε para apontar para os dois blocos paralelamente (O nascimento do Multiverso do AFN!). Ambos os blocos desembocam num único novo Estado Final comum.`;
        } else if (token === '*') {
            if (stack.length < 1) throw new Error("Operador Estrela '*' sem bloco atômico para atuar.");
            let block = stack.pop();
            let s0 = `q${stateCounter++}`, s1 = `q${stateCounter++}`;
            let edges = [...block.edges];
            edges.push({ from: s0, to: block.start, label: 'ε', type: 'straight' });
            edges.push({ from: block.end, to: s1, label: 'ε', type: 'straight' });
            edges.push({ from: block.end, to: block.start, label: 'ε', type: 'curve-top-deep' });
            edges.push({ from: s0, to: s1, label: 'ε', type: 'curve-bottom-deep' });
            stack.push({ start: s0, end: s1, edges: edges });
            desc = `Ação: <b>Fecho de Kleene '*' (Loop)</b>. O bloco anterior inteiro foi "envelopado". Uma super transição-ε permite <b>repetir</b> o bloco indefinidamente (loop superior), enquanto outra ponte por fora permite <b>pular</b> o bloco totalmente (caminho de fuga).`;
        }
        regexBuildHistory.push({ token: token, stackSnapshot: JSON.parse(JSON.stringify(stack)), description: desc });
    }
    if (stack.length !== 1) throw new Error("A expressão possui operadores mal colocados ou blocos de memória não resolvidos.");
    regexBuildHistory[regexBuildHistory.length - 1].description += " <br><br><span class='text-emerald-400 font-bold block mt-2 text-lg'>🎉 COMPILAÇÃO CONCLUÍDA! O labirinto final de transições-ε representa matematicamente a sua Regex original. O motor de busca está pronto.</span>";
}

function compileRegex() {
    const inputEl = document.getElementById('regex-test-rule');
    if (!inputEl) return;
    const input = inputEl.value.trim();
    const errBox = document.getElementById('regex-error');
    const visContainer = document.getElementById('regex-visualizer-container');
    errBox.classList.add('hidden'); visContainer.classList.add('hidden');
    if (!input) { errBox.innerText = "Por favor, digite uma Regex válida no Testador antes de iniciar a compilação cruzada."; errBox.classList.remove('hidden'); return; }
    if (input.includes('+') || input.includes('?')) { errBox.innerHTML = "Neste simulador orgânico de base teórica, usamos apenas os conectores matemáticos puros de Thompson: Concatenação, União (|) e Fecho de Kleene (*)."; errBox.classList.remove('hidden'); return; }
    try {
        const postfix = parseRegexToAST(input);
        buildNFAFromPostfixWithSteps(postfix);
        visContainer.classList.remove('hidden');
        currentRegexStepIndex = 0;
        renderRegexCurrentStep();
        updateProgress('regex');
        testRegexMatch();
    } catch (e) {
        errBox.innerText = "Erro de Sintaxe Crítico detectado na abstração: " + e.message;
        errBox.classList.remove('hidden');
    }
}

function renderRegexCurrentStep() {
    const stepData = regexBuildHistory[currentRegexStepIndex];
    document.getElementById('regex-explanation').innerHTML = stepData.description;
    document.getElementById('regex-step-counter').innerText = `Passo ${currentRegexStepIndex} de ${regexBuildHistory.length - 1}`;
    document.getElementById('btn-regex-prev').disabled = (currentRegexStepIndex === 0);
    document.getElementById('btn-regex-next').disabled = (currentRegexStepIndex === regexBuildHistory.length - 1);
    drawRegexASTSnapshot(stepData.stackSnapshot);
}

function regexStepNext() {
    if (currentRegexStepIndex < regexBuildHistory.length - 1) { currentRegexStepIndex++; renderRegexCurrentStep(); }
}

function regexStepPrev() {
    if (currentRegexStepIndex > 0) { currentRegexStepIndex--; renderRegexCurrentStep(); }
}

function drawRegexASTSnapshot(stackSnapshot) {
    const canvas = document.getElementById('regex-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!stackSnapshot || stackSnapshot.length === 0) return;
    let allEdges = [], statesSet = new Set(), finalStatesSet = new Set();
    stackSnapshot.forEach(block => {
        block.edges.forEach(e => { allEdges.push(e); statesSet.add(e.from); statesSet.add(e.to); });
        finalStatesSet.add(block.end);
    });
    const stateArr = [...statesSet].sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1)));
    const w = canvas.width; const startX = 60; const endX = w - 60;
    const stepX = stateArr.length > 1 ? (endX - startX) / (stateArr.length - 1) : 0;
    const nodes = {};
    stateArr.forEach((s, i) => { nodes[s] = { x: startX + (i * stepX), y: 160 }; });
    allEdges.forEach(edge => {
        const nodeF = nodes[edge.from]; const nodeT = nodes[edge.to];
        let type = edge.type;
        if (nodeF.x === nodeT.x) type = 'loop-top';
        else if (Math.abs(nodeF.x - nodeT.x) <= stepX + 5 && type === 'straight') type = 'straight';
        drawCanvasEdge(ctx, nodeF.x, nodeF.y, nodeT.x, nodeT.y, edge.label, type);
    });
    stateArr.forEach(s => { drawCanvasNode(ctx, nodes[s].x, nodes[s].y, s, finalStatesSet.has(s), false, 'regex'); });
}
