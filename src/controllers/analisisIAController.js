const axios = require('axios'); 
const PYTHON_API_URL = process.env.PYTHON_HOST 

async function buscarDadosGrafico(req, res) {
    const { tipoAnalise } = req.body; 
    const rotasPython = {
        'previsao': '/ai/previsao',
        'comparacao': '/ai/comparar', 
        'correlacao': '/ai/correlacao'
    };

    if (!tipoAnalise || !rotasPython[tipoAnalise]) {
        return res.status(400).json({ 
            mensagem: `Tipo de análise '${tipoAnalise}' inválido ou não fornecido.` 
        });
    }

    try {
        const urlDestino = `${PYTHON_API_URL}${rotasPython[tipoAnalise]}`;
        
        console.log(`[NODE] Redirecionando requisição para Python: ${urlDestino}`);
        console.log(`[NODE] Payload:`, req.body);

        const response = await axios.post(urlDestino, req.body);

        return res.status(200).json(response.data);

    } catch (erro) {
        console.error('[NODE] Erro ao comunicar com o serviço de IA:', erro.message);
        
        if (erro.response) {
            return res.status(erro.response.status).json(erro.response.data);
        } else if (erro.request) {
            return res.status(503).json({ 
                mensagem: 'Serviço de Inteligência Artificial indisponível no momento.' 
            });
        } else {
            return res.status(500).json({ mensagem: 'Erro interno no servidor Node.js.' });
        }
    }
}

module.exports = {
    buscarDadosGrafico,
};