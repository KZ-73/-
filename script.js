// script.js

// 1. 初始化本地数据结构 (Se vuoto)
const defaultData = {
    vocaboli: {
        latino: [], francese: [], spagnolo: [], inglese: []
    },
    coniugazioni: {
        latino: [], francese: [], spagnolo: [], inglese: []
    },
    declinazioni: {
        latino: [] // 仅限拉丁语
    }
};

let appData = JSON.parse(localStorage.getItem('ripassoData')) || defaultData;
let linguaAttuale = ''; // 当前选中的语言
let esercizioCorrente = null; // 当前的题目数据

// 2. 导航与视图切换
function naviga(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function selezionaLingua(lingua) {
    linguaAttuale = lingua;
    document.getElementById('titolo-lingua').innerText = lingua.toUpperCase();
    
    // 如果是拉丁语，显示变格按钮；否则隐藏
    const btnDeclinazione = document.getElementById('btn-declinazione');
    if (lingua === 'latino') {
        btnDeclinazione.style.display = 'flex';
    } else {
        btnDeclinazione.style.display = 'none';
    }
    naviga('menu-esercizi');
}

// 3. 练习核心逻辑
function avviaEsercizio(tipo) {
    naviga(`ex-${tipo}`);
    const datiLingua = appData[tipo === 'declinazione' ? 'declinazioni' : (tipo === 'coniugazione' ? 'coniugazioni' : 'vocaboli')][linguaAttuale];
    
    // 重置所有表单和UI
    document.getElementById(`form-${tipo}`).reset();
    const esitoEl = document.getElementById(`risultato-${tipo}`);
    if(esitoEl) esitoEl.innerText = '';

    if (!datiLingua || datiLingua.length === 0) {
        alert("Nessun dato trovato per questa lingua. Vai in Gestione Dati per aggiungere contenuti.");
        return;
    }

    // 随机选择一题
    esercizioCorrente = datiLingua[Math.floor(Math.random() * datiLingua.length)];

    if (tipo === 'coniugazione') {
        document.getElementById('verbo-testo').innerText = esercizioCorrente.infinito || esercizioCorrente.verbo;
        document.getElementById('card-risposta-coniugazione').classList.add('hidden');
    } 
    else if (tipo === 'declinazione') {
        const modo = document.getElementById('lingua-prompt-declinazione').value;
        document.getElementById('declinazione-testo').innerText = 
            (modo === 'latino') ? esercizioCorrente.parola : esercizioCorrente.italiano;
    }
    else if (tipo === 'vocaboli') {
        const modo = document.getElementById('lingua-prompt-vocaboli').value;
        document.getElementById('vocabolo-testo').innerText = 
            (modo === 'italiano') ? esercizioCorrente.italiano : esercizioCorrente.target;
    }
}

// 4. 表单提交验证逻辑
function verificaConiugazione(e) {
    e.preventDefault();
    const modo = document.getElementById('select-modo').value;
    const tempo = document.getElementById('select-tempo').value;
    const persona = document.getElementById('select-persona').value;
    const inputVerbo = document.getElementById('input-coniugazione').value.trim().toLowerCase();

    // 假设 JSON 数据中有确切的答案。如果是真实刷题，数据应包含 {modo, tempo, persona, risposta}
    // 简单起见，这里假设用户录入时针对特定的 modo/tempo/persona 提供了一个 risposta
    const isCorretto = (modo === esercizioCorrente.modo && 
                        tempo === esercizioCorrente.tempo && 
                        persona === esercizioCorrente.persona && 
                        inputVerbo === esercizioCorrente.risposta.toLowerCase());

    // 渲染右侧答案卡片
    document.getElementById('ans-modo').innerText = esercizioCorrente.modo;
    document.getElementById('ans-tempo').innerText = esercizioCorrente.tempo;
    document.getElementById('ans-persona').innerText = esercizioCorrente.persona;
    document.getElementById('ans-verbo').innerText = esercizioCorrente.risposta;
    
    const esito = document.getElementById('risultato-coniugazione');
    esito.innerText = isCorretto ? 'Corretto! Bravissimo!' : `Errato. Hai scritto "${inputVerbo}"`;
    esito.className = isCorretto ? 'esito corretto' : 'esito errato';

    document.getElementById('card-risposta-coniugazione').classList.remove('hidden');
}

function verificaDeclinazione(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('#form-declinazione input[type="checkbox"]');
    let selezionati = [];
    checkboxes.forEach(cb => { if(cb.checked) selezionati.push(cb.value); });

    // array 比较 (esercizioCorrente.casi 是一个数组，例如 ['nom_s', 'voc_s'])
    const casiCorretti = esercizioCorrente.casi || [];
    const isCorretto = selezionati.length === casiCorretti.length && 
                       selezionati.every(val => casiCorretti.includes(val));

    const esito = document.getElementById('risultato-declinazione');
    if (isCorretto) {
        esito.innerText = 'Corretto!';
        esito.className = 'esito corretto';
    } else {
        esito.innerText = 'Errato. I casi corretti sono: ' + casiCorretti.join(', ');
        esito.className = 'esito errato';
    }
}

function verificaVocabolo(e) {
    e.preventDefault();
    const inputVal = document.getElementById('input-vocabolo').value.trim().toLowerCase();
    const modo = document.getElementById('lingua-prompt-vocaboli').value;
    
    // 如果看意语写外语，目标是 target；如果看外语写意语，目标是 italiano
    const rispostaCorretta = (modo === 'italiano') ? 
        esercizioCorrente.target.toLowerCase() : esercizioCorrente.italiano.toLowerCase();

    const esito = document.getElementById('risultato-vocaboli');
    if (inputVal === rispostaCorretta) {
        esito.innerText = 'Corretto!';
        esito.className = 'esito corretto';
    } else {
        esito.innerText = `Errato. La risposta era: ${rispostaCorretta}`;
        esito.className = 'esito errato';
    }
}

// 5. 数据管理 (Gestione Dati)
function salvaDatiNelBrowser() {
    localStorage.setItem('ripassoData', JSON.stringify(appData));
}

function salvaSingoloDato() {
    const tipo = document.getElementById('tipo-dato').value;
    const lang = document.getElementById('lingua-dato').value;
    const jsonStr = document.getElementById('json-input').value;
    
    try {
        const nuovoDato = JSON.parse(jsonStr);
        if (!appData[tipo][lang]) {
            appData[tipo][lang] = [];
        }
        appData[tipo][lang].push(nuovoDato);
        salvaDatiNelBrowser();
        alert('Dato aggiunto con successo!');
        document.getElementById('json-input').value = '';
    } catch (e) {
        alert('Errore JSON: Assicurati che il formato sia corretto e usi le virgolette doppie ("").');
    }
}

function esportaDati() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ripasso_dati.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importaDati(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            appData = importedData;
            salvaDatiNelBrowser();
            alert('Dati importati con successo!');
        } catch (err) {
            alert('Errore durante la lettura del file JSON.');
        }
    };
    reader.readAsText(file);
}

function svuotaDati() {
    if (confirm('Sei sicuro di voler cancellare TUTTI i dati salvati?')) {
        appData = JSON.parse(JSON.stringify(defaultData)); // Reset
        salvaDatiNelBrowser();
        alert('Dati svuotati.');
    }
}