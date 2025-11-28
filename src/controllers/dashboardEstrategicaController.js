// Certifique-se de que a variável 'riscoModel' está definida e contém as funções necessárias
var riscoModel = require("../models/dashboardEstrategicaModel");

function getDadosGerais(req, res) {
    const idEmpresa = req.params.idEmpresa;

    if (!idEmpresa) {
        return res.status(400).send("idEmpresa undefined");
    }

    Promise.all([
        riscoModel.buscarKpis(idEmpresa),
        riscoModel.buscarTendencia(idEmpresa),
        riscoModel.buscarComparativo(idEmpresa), // Comparativo de Componentes (original)
        riscoModel.buscarRanking(idEmpresa),
        riscoModel.buscarComparativoPorNivel(idEmpresa) // <--- NOVA CHAMADA
    ])
    .then(([kpisResult, tendencia, comparativo, ranking, comparativoNivelResult]) => {

        const kpisRow = (kpisResult && kpisResult[0]) ? kpisResult[0] : {};

        // --- Processamento de Dados (Comparativo por Nível) ---
        // Garante que a ordem dos níveis seja consistente
        const niveis = ['CRÍTICO', 'ATENÇÃO', 'OCIOSO'];
        
        const comparativoNivelFormatado = {
            labels: niveis,
            // Mapeia os dados, garantindo que se um nível não tiver alertas, retorne 0
            atual: niveis.map(n => {
                const item = comparativoNivelResult.find(r => r.nivel_alerta === n);
                return item ? item.atual : 0;
            }),
            passado: niveis.map(n => {
                const item = comparativoNivelResult.find(r => r.nivel_alerta === n);
                return item ? item.passado : 0;
            })
        };
        // -----------------------------------------------------------


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
                demanda: { // O gráfico de Comparativo de Componentes
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
                },
                // ENVIANDO O NOVO GRÁFICO PARA O FRONT-END
                comparativoNivel: comparativoNivelFormatado
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