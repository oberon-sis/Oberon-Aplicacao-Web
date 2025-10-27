const express = require('express');
const path = require('path');
const router = express.Router(); // Cria um mini-aplicativo de rota

// Rota: /api/download/agente (Exemplo de nome limpo)
router.get('/agente', (req, res) => {
    // __dirname aponta para src/routes. Navegamos de volta com '..'
const downloadsPath = path.join(__dirname, '..', '..', 'downloads');
const filePath = path.join(downloadsPath, 'Agente_Monitoramento_Windows.zip');

    // Express envia o arquivo forçando o download
    res.download(filePath, 'AgenteMonitoramentoOberon.zip', (err) => {
        if (err) {
            console.error('Erro ao tentar enviar o arquivo:', err);
            // Se você está servindo um arquivo estático que pode estar faltando
            if (err.code === 'ENOENT') {
                return res.status(404).send("Arquivo do Agente não encontrado no servidor.");
            }
            res.status(500).send("Erro interno ao processar o download.");
        }
    });
});

router.get('/manual', (req, res) => {
    // __dirname aponta para src/routes. Navegamos de volta com '..'
const downloadsPath = path.join(__dirname, '..', '..', 'downloads');
const filePath = path.join(downloadsPath, 'manual_de_instalacao.pdf');

    // Express envia o arquivo forçando o download
    res.download(filePath, 'ManualDeInstacao.pdf', (err) => {
        if (err) {
            console.error('Erro ao tentar enviar o arquivo:', err);
            // Se você está servindo um arquivo estático que pode estar faltando
            if (err.code === 'ENOENT') {
                return res.status(404).send("Manual de instação não encontrado no servidor.");
            }
            res.status(500).send("Erro interno ao processar o download.");
        }
    });
});

module.exports = router;