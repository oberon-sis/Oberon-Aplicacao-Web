// /controllers/dashboardEstrategicaController.js
var riscoModel = require("../models/dashboardEstrategicaModel");

function getDadosGerais(req, res) {
    const idEmpresa = req.params.idEmpresa;

    if (!idEmpresa) {
        return res.status(400).send("idEmpresa undefined");
    }

    Promise.all([
        riscoModel.buscarKpis(idEmpresa),
        riscoModel.buscarTendencia(idEmpresa),
        riscoModel.buscarComparativo(idEmpresa),
        riscoModel.buscarRanking(idEmpresa)
    ])
        .then(([kpisResult, tendencia, comparativo, ranking]) => {

            const kpisRow = (kpisResult && kpisResult[0]) ? kpisResult[0] : {};

            res.json({
                kpis: {
                    kpi_incidentes_criticos: kpisRow.kpi_incidentes_criticos || 0,
                    kpi_maquinas_saturacao: kpisRow.kpi_maquinas_saturacao || 0,
                    kpi_comunicacao_estavel: kpisRow.kpi_comunicacao_estavel || 0,
                    kpi_integridade_logs: kpisRow.kpi_integridade_logs || 0,
                    kpi_score_risco: kpisRow.kpi_score_risco || 0
                },
                graficos: {
                    tendencia: {
                        labels: tendencia.map(l => l.periodo),
                        tipos: ["CRÍTICO", "ATENÇÃO", "OCIOSO"],
                        valores: [
                            tendencia.map(l => l.critico),
                            tendencia.map(l => l.atencao),
                            tendencia.map(l => l.ocioso)
                        ]
                    },
                    demanda: {
                        labels: comparativo.map(c => c.componente),
                        data: comparativo.map(c => c.quantidade)
                    },
                    ranking: {
                        labels: ranking.map(r => r.maquina),
                        data: ranking.map(r => r.total_alertas),
                        tabela: ranking.map(r => ({
                            maquina: r.maquina,
                            alertasBimestre: r.total_alertas
                        }))
                    }
                }
            });
        })
        .catch(err => {
            console.error("Erro no controller (dashboardEstrategica):", err.sqlMessage || err.message || err);
            res.status(500).json({ erro: err.sqlMessage || err.message || "Erro interno" });
        });
}

module.exports = {
    getDadosGerais
};
