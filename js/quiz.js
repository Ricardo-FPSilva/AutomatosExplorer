// ===============================================
// --- QUIZ GERAL COM BARALHAMENTO ---
// ===============================================



let quizActive = false;
let quizPool = [];
let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnsweredCurrent = false;

async function initQuiz() {
    quizActive = true; 
    quizScore = 0; 
    quizCurrentIndex = 0;

    try {
        // 1. Carrega o ficheiro JSON gerado com as 100 perguntas reais
        const response = await fetch('../data/questoes.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const questoes = await response.json();
        
        // 2. Embaralha as perguntas e adiciona ao pool do quiz
        quizPool = questoes.sort(() => Math.random() - 0.5).slice(0, 100);

    } catch (error) {
        console.error("Erro ao carregar questoes.json:", error);
        const qTextEl = document.getElementById('quiz-question-text');
        if (qTextEl) {
            qTextEl.innerHTML = `<span class="mb-4 block text-lg font-medium bg-rose-50 border border-rose-200 p-6 rounded-xl text-rose-800">
                ⚠️ <strong>Erro ao carregar as perguntas.</strong><br><br>
                Não foi possível carregar o ficheiro <code>questoes.json</code>. Se estiveres a abrir o ficheiro HTML diretamente a partir do explorador de ficheiros (file://), o navegador bloqueia o carregamento do JSON por segurança.<br><br>
                <strong>Solução:</strong> Corre o teu projeto num servidor local (ex: extensão "Live Server" no VSCode).
            </span>`;
        }
        return;
    }

    document.getElementById('quiz-final-screen').classList.add('hidden');
    document.getElementById('btn-quiz-next').classList.add('hidden');
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (quizCurrentIndex >= quizPool.length) { showQuizResults(); return; }
    quizAnsweredCurrent = false;
    const q = quizPool[quizCurrentIndex];
    document.getElementById('quiz-progress').innerText = `Questão Analítica ${quizCurrentIndex + 1} de ${quizPool.length}`;
    document.getElementById('quiz-score').innerText = `Pontuação de Mérito: ${quizScore}`;
    const qTextEl = document.getElementById('quiz-question-text');
    qTextEl.innerHTML = '';
    const textSpan = document.createElement('span');
    textSpan.className = "mb-4 block text-xl font-medium leading-relaxed bg-white border border-slate-200 p-6 rounded-xl shadow-sm text-slate-800";
    textSpan.innerText = q.q;
    qTextEl.appendChild(textSpan);
    document.getElementById('quiz-feedback-box').classList.add('hidden');
    document.getElementById('btn-quiz-next').classList.add('hidden');
    const optsContainer = document.getElementById('quiz-options-container');
    optsContainer.innerHTML = '';
    let optionsWithIndex = q.o.map((text, idx) => ({ text, isCorrect: idx === q.a })).sort(() => Math.random() - 0.5);
    let correctNewIndex = optionsWithIndex.findIndex(x => x.isCorrect);
    optionsWithIndex.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt shadow-sm hover:shadow-md text-lg p-4 transition-all duration-300 active:scale-95 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 hover:border-slate-400 font-medium leading-snug w-full block text-left mb-3';
        btn.id = `qopt-${i}`;
        btn.innerText = opt.text;
        btn.onclick = () => selectQuizAnswer(i, correctNewIndex, q.e);
        optsContainer.appendChild(btn);
    });
}

function selectQuizAnswer(selectedIdx, correctIdx, explanation) {
    if (quizAnsweredCurrent) return;
    quizAnsweredCurrent = true;
    document.querySelectorAll('.quiz-opt').forEach((btn, i) => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-slate-100', 'hover:border-slate-400', 'hover:shadow-md', 'active:scale-95', 'cursor-pointer');
        if (i === correctIdx) {
            btn.classList.add('correct', 'border-emerald-500', 'bg-emerald-50', 'text-emerald-800', 'font-bold', 'ring-2', 'ring-emerald-200', 'shadow-inner');
            btn.classList.remove('bg-slate-50', 'border-slate-300', 'text-slate-700');
        } else if (i === selectedIdx) {
            btn.classList.add('incorrect', 'border-rose-500', 'bg-rose-50', 'text-rose-800', 'font-bold');
            btn.classList.remove('bg-slate-50', 'border-slate-300', 'text-slate-700');
        } else {
            btn.classList.add('opacity-50', 'bg-slate-100');
        }
    });
    const fbBox = document.getElementById('quiz-feedback-box');
    fbBox.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-rose-50', 'text-rose-800', 'border-rose-200', 'border-slate-200', 'bg-slate-50', 'shadow-inner');
    fbBox.classList.add('border', 'p-5', 'rounded-xl', 'shadow-sm');
    if (selectedIdx === correctIdx) {
        quizScore++;
        fbBox.classList.add('bg-emerald-50', 'text-emerald-900', 'border-emerald-300');
        fbBox.innerHTML = `<div class="flex items-start gap-3"><span class="text-3xl drop-shadow-sm">✅</span><div><strong class="text-lg block mb-1">Raciocínio Correto e Matemático!</strong> <span class="text-emerald-700 mt-2 block font-medium leading-relaxed">${explanation}</span></div></div>`;
        updateProgress('quiz');
    } else {
        fbBox.classList.add('bg-rose-50', 'text-rose-900', 'border-rose-300');
        fbBox.innerHTML = `<div class="flex items-start gap-3"><span class="text-3xl drop-shadow-sm">❌</span><div><strong class="text-lg block mb-1">Análise Lógica Incorreta.</strong> <span class="text-rose-700 mt-2 block font-medium leading-relaxed">A premissa correta e universal ditada pela teoria prova que: ${explanation}</span></div></div>`;
    }
    document.getElementById('quiz-score').innerText = `Pontuação de Mérito: ${quizScore}`;
    const nextBtn = document.getElementById('btn-quiz-next');
    nextBtn.classList.remove('hidden');
    nextBtn.innerText = quizCurrentIndex === quizPool.length - 1 ? "Finalizar e Gerar Diploma 🏁" : "Avançar para Próximo Desafio Teórico →";
}

function nextQuizQuestion() {
    quizCurrentIndex++;
    renderQuizQuestion();
}

function showQuizResults() {
    document.getElementById('quiz-final-screen').classList.remove('hidden');
    document.getElementById('quiz-final-score').innerText = quizScore;
    const scoreEl = document.getElementById('quiz-final-score');
    if (quizScore >= 80) scoreEl.className = "text-emerald-600 text-6xl mt-4 block font-black bg-emerald-50 px-4 py-2 border border-emerald-100 rounded-xl shadow-inner inline-block mx-auto";
    else if (quizScore >= 50) scoreEl.className = "text-sky-600 text-6xl mt-4 block font-black bg-sky-50 px-4 py-2 border border-sky-100 rounded-xl shadow-inner inline-block mx-auto";
    else scoreEl.className = "text-rose-600 text-6xl mt-4 block font-black bg-rose-50 px-4 py-2 border border-rose-100 rounded-xl shadow-inner inline-block mx-auto";
}
