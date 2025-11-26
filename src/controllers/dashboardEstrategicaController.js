// Arquivo: src/controllers/riscoTendenciaController.js

const riscoTendenciaModel = require('../models/dashboardEstrategicaModel'); // Certifique-se de que o caminho está correto!

async function buscarDadosRiscoTendencia(req, res) {
    try {
        const kpis = await riscoTendenciaModel.getKpisEstrategicos();
        const kpiData = kpis[0]; 

        const [
            tendenciaRisco,
            comparativoDemanda,
            evolucaoIndisponibilidade,
            integridadeEvolucao,
            rankingPrioridade
        ] = await riscoTendenciaModel.getGraficosEstrategicos();

        // Formatar e enviar a resposta
        res.json({
            kpis: {
                mediaDiariaMaquinasAlerta: kpiData.mediaDiariaMaquinasAlerta || 0,
                taxaCrescimentoUso: kpiData.taxaCrescimentoUso || 0,
                percIncidentesAltoRisco: kpiData.percIncidentesAltoRisco || 0,
                taxaMediaIndisponibilidade: kpiData.taxaMediaIndisponibilidade || 0,
                percIntegridadeLogs: kpiData.percIntegridadeLogs || 0,
            },
            graficos: {
                tendenciaRisco,
                comparativoDemanda,
                evolucaoIndisponibilidade,
                integridadeEvolucao,
                rankingPrioridade
            }
        });

    } catch (erro) {
        console.error("Erro ao buscar dados do dashboard de Risco e Tendência:", erro);
        res.status(500).json({ erro: "Erro interno do servidor ao carregar dados." });
    }
}

module.exports = {
    buscarDadosRiscoTendencia
};