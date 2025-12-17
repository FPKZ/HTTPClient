const dropZone = document.getElementById('drop-zone');
const btnSelect = document.getElementById('btn-select');
const logsDiv = document.getElementById('logs');

function addLog(message) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerText = message;
    logsDiv.appendChild(div);
    logsDiv.scrollTop = logsDiv.scrollHeight;
}

// Botão Selecionar Pasta (Modo Bulk)
btnSelect.addEventListener('click', async () => {
    const path = await window.electronAPI.selectFolder();
    if (path) {
        addLog(`📂 Pasta selecionada: ${path}`);
        // No modo botão, salva na própria pasta (padrão do script)
        window.electronAPI.startConversion({ inputPath: path, outputPath: null, isFile: false });
    }
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('hover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('hover');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('hover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        // --- MUDANÇA AQUI ---
        // Antigo: const filePath = files[0].path;
        // Novo: Usamos a API segura para pegar o caminho
        const filePath = window.electronAPI.getFilePath(files[0]); 
        // --------------------

        // Detecção simples de arquivo vs pasta (verifica se tem extensão no nome)
        // Nota: Isso é uma verificação visual, o backend fará a validação real
        const isFile = filePath.split('/').pop().includes('.');

        addLog(`📄 Arquivo/Pasta solto: ${filePath}`);

        const outputPath = await window.electronAPI.selectSaveLocation();
        
        if (outputPath) {
            window.electronAPI.startConversion({ 
                inputPath: filePath, 
                outputPath: outputPath, 
                isFile: isFile 
            });
        } else {
            addLog("Cancelado pelo usuário.");
        }
    }
    // IMPORTANTE: Limpa os dados do dataTransfer para a próxima rodada
    e.dataTransfer.clearData();
});

// Listeners do Main
window.electronAPI.onLog((msg) => addLog(msg));
window.electronAPI.onFinished((res) => {
    if(res.success) addLog(`✨ Concluído! Conversões: ${res.count}`);
});