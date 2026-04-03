// ===============================================
// --- TUTOR IA (GEMINI) ---
// ===============================================
const apiKey = "";

function parseMarkdown(text) {
    let p = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    p = p.replace(/`(.*?)`/g, '<code>$1</code>');
    p = p.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    p = p.replace(/<\/ul>\n<ul>/gim, '');
    return p.replace(/\n/g, '<br>');
}

async function fetchWithRetry(url, options, max = 5) {
    let delay = 1000;
    for (let i = 0; i < max; i++) {
        try {
            const r = await fetch(url, options);
            if (!r.ok) throw new Error();
            return await r.json();
        } catch (e) {
            if (i === max - 1) throw e;
            await new Promise(res => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

async function askGemini() {
    const q = document.getElementById('ai-query-input').value.trim();
    if (!q) return;
    const res = document.getElementById('ai-response-container');
    const load = document.getElementById('ai-loading');
    const text = document.getElementById('ai-response-text');
    res.classList.remove('hidden');
    load.classList.remove('hidden');
    text.innerHTML = '';
    const payload = {
        contents: [{ parts: [{ text: q }] }],
        systemInstruction: {
            parts: [{ text: "Atue como um Tutor Universitário no Brasil (use PT-BR). Foque em responder sobre Linguagens Formais, Autômatos e Compiladores de forma didática e muito completa." }]
        }
    };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    try {
        const result = await fetchWithRetry(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            text.innerHTML = parseMarkdown(result.candidates[0].content.parts[0].text);
            updateProgress('ai');
        } else throw new Error();
    } catch (e) {
        text.innerHTML = `<p class="text-rose-600 font-bold">Erro a contactar a rede neuronal central. Verifique a API Key ou tente mais tarde.</p>`;
    } finally {
        load.classList.add('hidden');
    }
}

// ===============================================
// --- INICIALIZAÇÃO GLOBAL ---
// ===============================================
window.onload = function () {
    renderProgress();
    updateProgress('intro');
    analyzeString();
    dfaLoad();
    afnLoad();
    derivReset();

    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById('sec-intro').classList.remove('hidden');

    testRegexMatch();

    window.addEventListener('resize', () => {
        drawAfdGraph(dfaState);
        drawAfnGraph(afnActiveStates);
        if (typeof bldInitialized !== 'undefined' && bldInitialized) drawBuilderGraph();
        if (!document.getElementById('sec-regex').classList.contains('hidden') &&
            typeof regexBuildHistory !== 'undefined' && regexBuildHistory.length > 0) {
            drawRegexASTSnapshot(regexBuildHistory[currentRegexStepIndex].stackSnapshot);
        }
    });
};
