// ==========================================
// --- SISTEMA DE PROGRESSO GAMIFICADO ---
// ==========================================
let userProgress = JSON.parse(localStorage.getItem('alfProgress')) || {
    intro: false, apostila: false, analyzer: false, grammars: false, derivator: false,
    regex: false, chomsky: false, afd: false, afn: false,
    builder: false, pumping: false, quiz: false, ai: false
};

const progressLabels = {
    intro: "Ler Fundamentos", apostila: "Explorar Apostila", analyzer: "Analisar Cadeia", grammars: "Ler Gramáticas",
    derivator: "Completar Derivação", regex: "Compilar Regex", chomsky: "Explorar Chomsky",
    afd: "Simular AFD", afn: "Simular AFN", builder: "Criar Autômato",
    pumping: "Vencer o Computador", quiz: "Acertar 1 Questão", ai: "Consultar Tutor IA"
};

const progressTargetSection = {
    intro: 'intro', analyzer: 'intro',apostila: 'apostila', grammars: 'grammars', derivator: 'grammars',
    regex: 'regex', chomsky: 'chomsky', afd: 'afd', afn: 'afn',
    builder: 'builder', pumping: 'pumping', quiz: 'quiz', ai: 'ai'
};

function updateProgress(key) {
    if (!userProgress[key]) {
        userProgress[key] = true;
        localStorage.setItem('alfProgress', JSON.stringify(userProgress));
        renderProgress();
    }
}

function renderProgress() {
    const keys = Object.keys(userProgress);
    const completed = keys.filter(k => userProgress[k]).length;
    const total = keys.length;
    const pct = Math.round((completed / total) * 100);
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').innerText = pct === 100 ? '100% 🏆' : pct + '%';
    const detailsBox = document.getElementById('progress-details');
    detailsBox.innerHTML = '';
    keys.forEach(k => {
        const isDone = userProgress[k];
        const icon = isDone ? '<span class="text-emerald-500 font-bold">✓</span>' : '<span class="text-slate-300 font-bold">○</span>';
        const textCls = isDone ? 'text-slate-400 line-through' : 'text-slate-600 font-medium hover:text-emerald-600';
        const targetSec = progressTargetSection[k];
        detailsBox.innerHTML += `<div onclick="navigate('${targetSec}')" class="text-[11px] flex items-center gap-2 p-1.5 rounded hover:bg-slate-200 cursor-pointer transition-colors active:bg-slate-300 border border-transparent hover:border-slate-300" title="Pular para o exercício"><div class="w-4 text-center">${icon}</div><span class="${textCls} transition-colors">${progressLabels[k]}</span></div>`;
    });
}

function toggleProgressDetails() {
    const box = document.getElementById('progress-details');
    const icon = document.getElementById('progress-toggle-icon');
    box.classList.toggle('hidden');
    icon.innerText = box.classList.contains('hidden') ? '▾' : '▴';
}

// ==========================================
// --- NAVEGAÇÃO SEGURA ---
// ==========================================
function navigate(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove(
            'bg-purple-100', 'border-purple-500', 'border-r-4',
            'bg-sky-100', 'border-sky-500',
            'bg-emerald-100', 'border-emerald-500',
            'bg-indigo-100', 'border-indigo-500',
            'bg-amber-100', 'border-amber-500',
            'bg-rose-100', 'border-rose-500',
            'bg-orange-100', 'border-orange-500',
            'nav-active'
        );
    });

    document.getElementById(`sec-${sectionId}`).classList.remove('hidden');
    const btn = document.getElementById(`btn-${sectionId}`);

    if (sectionId === 'ai') {
        btn.classList.add('bg-purple-100', 'border-r-4', 'border-purple-500');
    } else if (sectionId === 'quiz') {
        btn.classList.add('bg-sky-100', 'border-r-4', 'border-sky-500');
        if (typeof quizActive !== 'undefined' && !quizActive) initQuiz();
    } else if (sectionId === 'afd') {
        btn.classList.add('bg-emerald-100', 'border-r-4', 'border-emerald-500');
        setTimeout(() => { if (typeof drawAfdGraph === 'function') drawAfdGraph(dfaState); }, 50);
    } else if (sectionId === 'afn') {
        btn.classList.add('bg-indigo-100', 'border-r-4', 'border-indigo-500');
        setTimeout(() => { if (typeof drawAfnGraph === 'function') drawAfnGraph(afnActiveStates); }, 50);
    } else if (sectionId === 'builder') {
        btn.classList.add('bg-amber-100', 'border-r-4', 'border-amber-500');
        setTimeout(() => {
            if (typeof bldInitialized !== 'undefined') {
                if (!bldInitialized) { buildTableUI(); bldInitialized = true; }
                else { drawBuilderGraph(); }
            }
        }, 50);
    } else if (sectionId === 'regex') {
        btn.classList.add('bg-rose-100', 'border-r-4', 'border-rose-500');
        setTimeout(() => {
            if (typeof regexBuildHistory !== 'undefined' && regexBuildHistory.length > 0)
                drawRegexASTSnapshot(regexBuildHistory[currentRegexStepIndex].stackSnapshot);
            testRegexMatch();
        }, 50);
    } else if (sectionId === 'pumping') {
        btn.classList.add('bg-orange-100', 'border-r-4', 'border-orange-500');
    } else if (sectionId === 'apostila') {
        btn.classList.add('bg-slate-200', 'border-r-4', 'border-slate-500');
        updateProgress('apostila'); // Marca como concluído ao abrir
    } else {
        btn.classList.add('nav-active');
    }

    if (sectionId === 'intro') updateProgress('intro');
    if (sectionId === 'grammars') updateProgress('grammars');
}
