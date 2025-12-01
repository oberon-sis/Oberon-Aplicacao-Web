const riscoModel = require("../models/dashboardEstrategicaModel");

function getDadosGerais(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const bimestre = parseInt(req.query.bimestre);
    const ano = new Date().getFullYear();

    if (!idEmpresa) {
        return res.status(400).send("idEmpresa undefined");
    }
    Promise.all([
        riscoModel.buscarKpis(idEmpresa, ano, bimestre),
        riscoModel.buscarTendencia(idEmpresa, ano, bimestre), // aqui também
        riscoModel.buscarComparativoDemanda(idEmpresa, ano, bimestre),
        riscoModel.buscarRanking(idEmpresa, ano, bimestre),
        riscoModel.buscarComparativoPorNivel(idEmpresa, ano, bimestre),
        riscoModel.buscarComparativoSeveridadePorComponente(idEmpresa, ano, bimestre)
    ])
        .then(([kpisResult, tendencia, comparativoDemanda, ranking, comparativoNivelResult, severidadePorComponente]) => {
            const kpisRow = (kpisResult && kpisResult[0]) ? kpisResult[0] : {};

            // Comparativo por nível
            const niveis = ['CRÍTICO', 'ATENÇÃO', 'OCIOSO'];
            const comparativoNivelFormatado = {
                labels: niveis,
                atual: niveis.map(n => {
                    const item = comparativoNivelResult.find(r => r.nivel_alerta === n);
                    return item ? item.atual : 0;
                }),
                passado: niveis.map(n => {
                    const item = comparativoNivelResult.find(r => r.nivel_alerta === n);
                    return item ? item.passado : 0;
                })
            };

            // Severidade por componente
            const componentes = [...new Set(severidadePorComponente.map(r => r.componente))];
            const severidades = [...new Set(severidadePorComponente.map(r => r.severidade))];

            const severidadeComparativa = {
                labels: severidades,
                porComponente: componentes.map(componente => ({
                    componente,
                    atual: severidades.map(s => {
                        const item = severidadePorComponente.find(r => r.componente === componente && r.severidade === s);
                        return item ? item.atual : 0;
                    }),
                    passado: severidades.map(s => {
                        const item = severidadePorComponente.find(r => r.componente === componente && r.severidade === s);
                        return item ? item.passado : 0;
                    })
                })),
                dadosBrutos: severidadePorComponente
            };

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
                        labels: comparativoDemanda.map(c => c.componente),
                        data: comparativoDemanda.map(c => c.quantidade)
                    },
                    ranking: {
                        labels: ranking.map(r => r.maquina),
                        data: ranking.map(r => r.total_alertas),
                        tabela: ranking.map(r => ({
                            maquina: r.maquina,
                            alertasBimestre: r.total_alertas,
                            cpuMedia: r.cpuMedia,
                            ramMedia: r.ramMedia,
                            discoUso: r.discoUso,
                            totalIncidentes: r.totalIncidentes,
                            severidadeMedia: r.severidadeMedia,
                            status: r.status
                        }))
                    },
                    comparativoNivel: comparativoNivelFormatado,
                    severidadeComparativa
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