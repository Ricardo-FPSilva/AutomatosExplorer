// ===============================================
// --- JOGO: LEMA DO BOMBEAMENTO ---
// ===============================================
let pumpP = 4;
let pumpWord = "";
let pumpX = "", pumpY = "", pumpZ = "";
let pumpK = 2;

function pumpSubmitWord() {
    const input = document.getElementById('pump-word-input').value.trim();
    const err = document.getElementById('pump-word-error');
    err.classList.add('hidden');
    if (input.length < pumpP) {
        err.innerText = `A palavra tem que ter tamanho >= ${pumpP} (O limite estático da memória RAM do computador original).`;
        err.classList.remove('hidden'); return;
    }
    if (!/^0+1+$/.test(input)) {
        err.innerText = "A palavra deve conter apenas uma sequência de '0's seguida de '1's ininterruptos (ex: 0011).";
        err.classList.remove('hidden'); return;
    }
    const count0 = (input.match(/0/g) || []).length;
    const count1 = (input.match(/1/g) || []).length;
    if (count0 !== count1) {
        err.innerText = `A palavra não pertence à Linguagem L. Deve ter o exato mesmo número de 0s e 1s (Você validou ${count0} zeros e ${count1} uns, quebrando a balança original requerida).`;
        err.classList.remove('hidden'); return;
    }
    pumpWord = input;
    pumpX = pumpWord.substring(0, 1);
    pumpY = pumpWord.substring(1, 3);
    pumpZ = pumpWord.substring(3);
    document.getElementById('pump-step-1').classList.add('opacity-50', 'pointer-events-none');
    document.getElementById('pump-step-2').classList.remove('hidden');
    document.getElementById('pump-step-3').classList.remove('hidden');
    const vis = document.getElementById('pump-division-visual');
    vis.innerHTML = `
        <div class="bg-indigo-200 text-indigo-900 px-4 py-2 border-2 border-indigo-400 rounded-l-lg shadow-sm">${pumpX}</div>
        <div class="bg-orange-200 text-orange-900 px-6 py-2 border-y-2 border-x-4 border-orange-500 font-black shadow-lg transform scale-110 z-10 animate-pulse">${pumpY}</div>
        <div class="bg-indigo-200 text-indigo-900 px-6 py-2 border-2 border-indigo-400 rounded-r-lg shadow-sm">${pumpZ}</div>`;
    document.getElementById('pump-step-2').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function pumpApplyK() {
    pumpK = parseInt(document.getElementById('pump-k-input').value) || 0;
    const resBox = document.getElementById('pump-result');
    resBox.classList.remove('hidden');
    let pumpedY = "";
    for (let i = 0; i < pumpK; i++) pumpedY += pumpY;
    const newWord = pumpX + pumpedY + pumpZ;
    const newCount0 = (newWord.match(/0/g) || []).length;
    const newCount1 = (newWord.match(/1/g) || []).length;
    if (newCount0 === newCount1) {
        resBox.className = "p-6 rounded-xl border transition-all duration-500 mt-6 shadow-inner text-center bg-rose-50 border-rose-300";
        resBox.innerHTML = `
            <div class="text-4xl mb-2 drop-shadow-md">🤖 O Computador Sobreviveu Intacto ao Rastreio!</div>
            <p class="text-lg text-rose-800 font-bold mb-2">A palavra gerada e reestruturada foi codificada como: <span class="font-mono bg-white px-2 py-1 border border-rose-200 shadow-sm rounded">${newWord}</span></p>
            <p class="text-sm text-rose-700 font-medium">Você escolheu k=${pumpK}, o que matematicamente manteve a integridade estrutural da palavra na linguagem (preservando perfeitamente a lógica de ${newCount0} zeros cruzados com ${newCount1} uns). Tente bombear agora forçando o loop com um fator diferente de k (ex: injete k=2, 3 ou suprima com k=0) para quebrar a mecânica da máquina!</p>`;
    } else {
        resBox.className = "p-6 rounded-xl border transition-all duration-500 mt-6 shadow-inner text-center bg-emerald-50 border-emerald-300";
        resBox.innerHTML = `
            <div class="text-5xl mb-3 animate-bounce drop-shadow-md">🏆 O UTILIZADOR QUEBROU MAGISTRALMENTE A MÁQUINA!</div>
            <p class="text-lg text-emerald-800 font-bold mb-2">A Nova Palavra Bombeada: <span class="font-mono bg-white px-3 py-1 border rounded shadow-sm text-xl tracking-widest border-emerald-200">${pumpX}<span class="text-orange-600 font-black">${pumpedY}</span>${pumpZ}</span></p>
            <div class="bg-white p-4 rounded-lg mt-4 text-sm text-emerald-900 border border-emerald-200 shadow-sm">
                A nova cadeia possui empiricamente <b>${newCount0} zeros</b> iterativos e <b>${newCount1} uns</b> puros.<br>
                Como a regra da linguagem exigia que ambas as polaridades estivessem igualadas, esta nova cadeia falha esmagadoramente!<br>
                <span class="font-bold text-emerald-700 block mt-2 p-2 bg-emerald-100 rounded shadow-inner border border-emerald-200">Conclusão Matemática Exata: Está provado por contradição que é mecânicamente impossível construir um Autômato Finito (AFD/AFN) que conte infinitamente sem Pilha de memória (LIFO). A linguagem L não é Regular!</span>
            </div>`;
        updateProgress('pumping');
    }
    resBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function pumpReset() {
    document.getElementById('pump-step-1').classList.remove('opacity-50', 'pointer-events-none');
    document.getElementById('pump-step-2').classList.add('hidden');
    document.getElementById('pump-step-3').classList.add('hidden');
    document.getElementById('pump-result').classList.add('hidden');
    document.getElementById('pump-word-input').value = '';
    document.getElementById('pump-k-input').value = '2';
}
