// ═══════════════════════════════════════════════════════════════
// chomsky.js — Hierarquia de Chomsky
// Inicializado via initChomsky() após o DOM da seção ser injetado
// ═══════════════════════════════════════════════════════════════

const CHOMSKY_DATA = [
  {
    tipo: "Tipo 0 — Linguagens Recursivamente Enumeráveis",
    badge: "bg-slate-100 text-slate-700",
    maquina: "Máquina de Turing (MT)",
    restricao: "Nenhuma restrição nas produções, exceto α ≠ ε.",
    regra_latex: "αAβ → αγβ",
    regras_ex: [
      "AB → BA",
      "aS → Sa",
      "ε-produções permitidas (com cuidado)"
    ],
    linguagens: [
      "L = { w | uma MT M aceita w }",
      "L = { ⟨M,w⟩ | M para com w } — Problema da Parada (não decidível!)",
      "Qualquer linguagem que uma MT consiga enumerar"
    ],
    aceita: ["qualquer string que uma MT enumere"],
    rejeita: ["linguagens não recursivamente enumeráveis"],
    limites: "Não se pode determinar, em geral, se uma MT para (Problema da Parada). Essas linguagens são semi-decidíveis: se a string é aceita, a MT para; se não é aceita, a MT pode loopar para sempre.",
    dica: "A distinção entre Tipo 0 e linguagens não computáveis é o limite absoluto da computação."
  },
  {
    tipo: "Tipo 1 — Linguagens Sensíveis ao Contexto",
    badge: "bg-blue-100 text-blue-800",
    maquina: "Autômato Linearmente Limitado (LBA)",
    restricao: "|α| ≤ |β| — a cadeia nunca pode encolher durante uma derivação.",
    regra_latex: "αAβ → αγβ  (|γ| ≥ 1)",
    regras_ex: [
      "aA → ab  (A só vira 'b' após 'a')",
      "Bc → cC  (contexto à direita importa)",
      "Exemplo: aAbB → aabB  (contexto 'a' antes de A)"
    ],
    linguagens: [
      "L = { aⁿbⁿcⁿ | n ≥ 1 } — igual quantidade de a, b e c",
      "L = { ww | w ∈ {a,b}* } — duplicação de strings",
      "Sintaxe de algumas linguagens naturais humanas"
    ],
    aceita: ["aaabbbccc (n=3)", "abcabc (ww com w=abc)"],
    rejeita: ["aabbcc com quantidades desiguais", "aabbbc (quantidades desiguais de b e c)"],
    limites: "É decidível (sempre para). O LBA é uma MT com fita limitada ao tamanho da entrada — sem memória extra ilimitada. Mais poderoso que PDA, mas menos que MT completa.",
    dica: "L = {aⁿbⁿcⁿ} é o exemplo clássico que separa Tipo 1 de Tipo 2: um PDA não consegue rastrear três contadores independentes."
  },
  {
    tipo: "Tipo 2 — Linguagens Livres de Contexto",
    badge: "bg-purple-100 text-purple-800",
    maquina: "Autômato de Pilha (PDA — Pushdown Automaton)",
    restricao: "Lado esquerdo deve ser exatamente um não-terminal: A → β.",
    regra_latex: "A → β  (A é sempre um único não-terminal)",
    regras_ex: [
      "S → aSb | ε  (gera aⁿbⁿ)",
      "E → E + E | E * E | (E) | id  (expressões aritméticas)",
      "S → AB, A → aA | a, B → bB | b"
    ],
    linguagens: [
      "L = { aⁿbⁿ | n ≥ 0 } — n 'a's seguidos de n 'b's",
      "Expressões aritméticas com parênteses aninhados",
      "A maior parte da sintaxe de linguagens de programação (C, Java, Python...)",
      "{ w | w é um palíndromo sobre {a,b} }"
    ],
    aceita: ["aabb (n=2)", "aaabbb (n=3)", "if (x > 0) { ... }"],
    rejeita: ["aab (a ≠ b)", "aabbcc (precisa de Tipo 1)"],
    limites: "O PDA usa uma pilha LIFO para contar. Com ela, consegue parear dois contadores (aⁿbⁿ), mas não três (aⁿbⁿcⁿ). A maioria dos parsers de compiladores opera nessa camada.",
    dica: "A pilha permite aninhamento: ela 'lembra' quantos parênteses foram abertos. É por isso que Python e C usam CFG para sua gramática."
  },
  {
    tipo: "Tipo 3 — Linguagens Regulares",
    badge: "bg-emerald-100 text-emerald-800",
    maquina: "Autômato Finito (AFD ou AFN)",
    restricao: "Produções são lineares: A → aB (linear à direita) ou A → Ba (linear à esquerda).",
    regra_latex: "A → aB | a | ε",
    regras_ex: [
      "S → aS | bS | a | b  (gera {a,b}⁺)",
      "S → 0A | 1S | ε, A → 0A | 1S  (binários terminando em 00)",
      "S → aB, B → bS | b  (strings (ab)ⁿ)"
    ],
    linguagens: [
      "L = { w | w termina em '00' } — reconhecida por AFD de 3 estados",
      "L = { w | w tem número par de 'a' }",
      "CEPs, CPFs, e-mails, IPs (com limites) — todas são regex",
      "Palavras-chave de linguagens de programação (identificadores, literais)"
    ],
    aceita: ["100 (termina em 00)", "00 (termina em 00)", "aabaa (par de 'a': 4)"],
    rejeita: ["101 (termina em 01)", "aaabbb (Tipo 2, não regular)"],
    limites: "Sem memória além do estado atual — não consegue contar até n arbitrário. O Lema do Bombeamento prova que aⁿbⁿ não é regular.",
    dica: "Expressões regulares (regex) no shell, grep, e editores de texto são exatamente Tipo 3. Todo regex se compila para AFD via Thompson + Powerset Construction."
  }
];

const CHOMSKY_TABS = [
  {
    cor: "bg-emerald-100 text-emerald-800",
    titulo: "Tipo 3 — Regulares",
    ferramenta: "AFD com 3 estados. Sem memória adicional.",
    regra: "S → 0S | 1S | 0A\nA → 0F | 1S\nF → 0F | 1S  (F = final)",
    exemplos: [
      { lang: "L = strings terminando em '00'", regex: "(0|1)*00", aceita: ["100","000","1100"], rejeita: ["01","10","101"] },
      { lang: "L = número par de 'a'", regex: "b*(ab*ab*)*", aceita: ["aa","aabaa","bb"], rejeita: ["a","aab","bab"] }
    ]
  },
  {
    cor: "bg-purple-100 text-purple-800",
    titulo: "Tipo 2 — Livres de Contexto",
    ferramenta: "PDA: usa pilha para contar aⁿ e depois consumir bⁿ.",
    regra: "S → aSb | ε\n(para aⁿbⁿ)",
    exemplos: [
      { lang: "L = aⁿbⁿ (n≥0)", aceita: ["ε","ab","aabb","aaabbb"], rejeita: ["aab","abb","ba"] },
      { lang: "L = palíndromos sobre {a,b}", aceita: ["aba","aabaa","bb","a"], rejeita: ["ab","abc","aab"] }
    ]
  },
  {
    cor: "bg-blue-100 text-blue-800",
    titulo: "Tipo 1 — Sensíveis ao Contexto",
    ferramenta: "LBA: MT com fita limitada ao tamanho da entrada.",
    regra: "aA → ab (A vira 'b' após 'a')\nBc → cC (B muda com contexto)",
    exemplos: [
      { lang: "L = aⁿbⁿcⁿ (n≥1)", aceita: ["abc","aabbcc","aaabbbccc"], rejeita: ["aab","aabbc"] },
      { lang: "L = ww (duplicação)", aceita: ["abab","aabbaabb"], rejeita: ["abba","aba","ab"] }
    ]
  },
  {
    cor: "bg-slate-100 text-slate-700",
    titulo: "Tipo 0 — Irrestritas",
    ferramenta: "Máquina de Turing completa. Memória ilimitada.",
    regra: "AB → BA (troca livre)\naS → Sa (sem restrição de tamanho)",
    exemplos: [
      { lang: "Qualquer linguagem semidecidível", aceita: ["qualquer string que a MT aceita"], rejeita: ["problema da parada — indecidível"] },
      { lang: "L(M) para alguma MT M", aceita: ["⟨M,w⟩ com M aceitando w"], rejeita: ["se M loopa, nunca sabemos"] }
    ]
  }
];

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function showChomsky(i) {
  [0, 1, 2, 3].forEach(function(j) {
    var btn = document.getElementById('btn' + j);
    if (btn) btn.classList.toggle('active', j === i);
  });

  var d = CHOMSKY_DATA[i];

  var empty = document.getElementById('chomsky-empty');
  var content = document.getElementById('chomsky-content');
  if (!empty || !content) return;

  empty.style.display = 'none';
  content.style.display = 'block';

  // Badge + título
  var badge = document.getElementById('chomsky-badge');
  badge.className = 'px-2 py-0.5 rounded text-xs font-bold ' + d.badge;
  badge.textContent = 'TIPO ' + i;
  document.getElementById('chomsky-title').textContent = d.tipo;
  document.getElementById('chomsky-restricao').textContent = d.restricao;

  // Máquina
  document.getElementById('chomsky-maquina').textContent = d.maquina;
  document.getElementById('chomsky-limites').textContent = d.limites;

  // Produções
  document.getElementById('chomsky-forma').textContent = d.regra_latex;
  document.getElementById('chomsky-regras').innerHTML = d.regras_ex
    .map(function(r) { return '<div class="code-block mt-2">' + escHtml(r) + '</div>'; })
    .join('');

  // Linguagens
  document.getElementById('chomsky-linguagens').innerHTML = d.linguagens
    .map(function(l) { return '<div class="code-block">' + escHtml(l) + '</div>'; })
    .join('');

  // Aceitas
  document.getElementById('chomsky-aceita').innerHTML = d.aceita
    .map(function(s) {
      return '<div class="font-mono text-sm text-emerald-700"><span class="font-bold">✓</span> ' + escHtml(s) + '</div>';
    }).join('');

  // Rejeitadas
  document.getElementById('chomsky-rejeita').innerHTML = d.rejeita
    .map(function(s) {
      return '<div class="font-mono text-sm text-rose-700"><span class="font-bold">✗</span> ' + escHtml(s) + '</div>';
    }).join('');

  // Dica
  document.getElementById('chomsky-dica').innerHTML = '<b>Dica:</b> ' + escHtml(d.dica);
}

function switchChomskyTab(i) {
  document.querySelectorAll('#tabrow .tab-btn').forEach(function(t, j) {
    t.classList.toggle('on', j === i);
  });
  renderChomskyTab(i);
}

function renderChomskyTab(i) {
  var d = CHOMSKY_TABS[i];
  var tc = document.getElementById('tab-content');
  if (!tc) return;

  var html = '';

  // Cabeçalho
  html += '<div class="flex items-center gap-2 mb-4">';
  html += '<span class="px-2 py-0.5 rounded text-xs font-bold ' + d.cor + '">' + d.titulo + '</span>';
  html += '<span class="text-xs text-slate-400 font-medium">' + escHtml(d.ferramenta) + '</span>';
  html += '</div>';

  // Gramática
  html += '<div class="bg-white border border-slate-200 rounded-xl p-4 mb-4">';
  html += '<h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gramática Exemplo</h4>';
  html += '<div class="code-block">' + escHtml(d.regra) + '</div>';
  html += '</div>';

  // Exemplos
  d.exemplos.forEach(function(ex) {
    html += '<div class="bg-white border border-slate-200 rounded-xl p-4 mb-3">';
    html += '<h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">' + escHtml(ex.lang) + '</h4>';

    if (ex.regex && ex.regex !== '—') {
      html += '<div class="code-block mb-3">Regex: ' + escHtml(ex.regex) + '</div>';
    }

    html += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">';

    // Aceita
    html += '<div>';
    html += '<h5 class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Aceita</h5>';
    ex.aceita.forEach(function(s) {
      html += '<div class="font-mono text-sm text-emerald-700"><span class="font-bold">✓</span> ' + escHtml(s) + '</div>';
    });
    html += '</div>';

    // Rejeita
    html += '<div>';
    html += '<h5 class="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">Rejeita</h5>';
    ex.rejeita.forEach(function(s) {
      html += '<div class="font-mono text-sm text-rose-700"><span class="font-bold">✗</span> ' + escHtml(s) + '</div>';
    });
    html += '</div>';

    html += '</div></div>';
  });

  tc.innerHTML = html;
}

// Chamada pelo main.js após a seção ser carregada no DOM
function initChomsky() {
  renderChomskyTab(0);
}
