const model = require('../models/dashboardEstrategicaModel');

module.exports = {
    async getKpis(req, res) {
        try {
            const [
                crescimentoAlertas,
                tempoEntreAlertas,
                componenteCritico,
                previsaoAlertas,
                maquinasSuspeitas
            ] = await Promise.all([
                model.buscarCrescimentoAlertas(),
                model.buscarTempoEntreAlertas(),
                model.buscarComponenteCritico(),
                model.buscarPrevisaoAlertas(),
                model.buscarMaquinasSuspeitas()
            ]);

            res.json({
                crescimentoAlertas,
                tempoEntreAlertas,
                componenteCritico,
                previsaoAlertas,
                maquinasSuspeitas
            });
        } catch (error) {
            console.error('Erro ao buscar KPIs:', error);
            res.status(500).json({ error: 'Erro ao buscar KPIs estratégicos' });
        }
    },

    async getTendenciaDesgaste(req, res) {
        try {
            const dados = await model.buscarTendenciaDesgaste();
            res.json(dados);
        } catch (error) {
            console.error('Erro ao buscar tendência de desgaste:', error);
            res.status(500).json({ error: 'Erro ao buscar tendência de desgaste' });
        }
    },

    async getProgressaoAlertas(req, res) {
        try {
            const dados = await model.buscarProgressaoAlertas();
            res.json(dados);
        } catch (error) {
            console.error('Erro ao buscar progressão de alertas:', error);
            res.status(500).json({ error: 'Erro ao buscar progressão de alertas' });
        }
    },

    async getRankingIntervencao(req, res) {
        try {
            const ranking = await model.buscarRankingIntervencao();
            res.json(ranking);
        } catch (error) {
            console.error('Erro ao buscar ranking de intervenção:', error);
            res.status(500).json({ error: 'Erro ao buscar ranking de intervenção' });
        }
    },

    async getMapaRisco(req, res) {
        try {
            const dados = await model.buscarMapaRisco();
            res.json(dados);
        } catch (error) {
            console.error('Erro ao buscar mapa de risco:', error);
            res.status(500).json({ error: 'Erro ao buscar mapa de risco' });
        }
    }
};
