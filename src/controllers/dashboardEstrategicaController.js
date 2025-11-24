var dashboardModel = require("../models/dashboardEstrategicaModel"); // Caminho correto (../../models/dashboardModel)

function getDadosRisco(req, res) {
    console.log("▶️ Controller getDadosRisco iniciado.");
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        return res.status(400).send("idEmpresa está undefined!");
    }

    // Busca todos os dados necessários em paralelo
    // O Node.js executa as três funções do Model simultaneamente.
    Promise.all([
        dashboardModel.buscarEvolucaoAlertas(idEmpresa),
        dashboardModel.buscarRankingPrioridade(idEmpresa), // Esta função existe no dashboardModel.js
        dashboardModel.buscarTotalAlertas(idEmpresa)
    ])
    .then(function (resultados) {
        const alertasEvolucao = resultados[0];
        const rankingBruto = resultados[1];
        
        // Extrai os totais do terceiro resultado
        const totalAlertas = resultados[2][0]?.totalAlertas || 0;
        const totalMaquinas = resultados[2][0]?.totalMaquinas || 0;

        // --- Mock e cálculos analíticos no Controller (usando dados reais do BD) ---
        const diasNoPeriodo = 60;
        
        // 1. Tempo Médio Entre Alertas (TMA)
        const tmaHoras = totalAlertas > 0 ? (diasNoPeriodo * 24 / totalAlertas).toFixed(1) + ' hrs' : 'N/A';
        
        // 2. Previsão (Mock: 15% de aumento)
        const previsao = totalAlertas > 0 ? Math.round(totalAlertas * 1.15) : 0;
        
        // 3. Taxa de Crescimento (Mock: simulação de comparação bimestral)
        const taxaCrescimento = totalAlertas > 0 ? (Math.random() * 45 - 15).toFixed(2) + "%" : '0.00%';
        
        // 4. Componente Crítico: Encontra o componente com mais alertas no período
        let componenteCritico = 'N/A';
        if (alertasEvolucao.length > 0) {
            const componenteCounts = alertasEvolucao.reduce((acc, curr) => {
                acc[curr.tipoComponete] = (acc[curr.tipoComponete] || 0) + curr.qtd_alertas;
                return acc;
            }, {});
            
            // Encontra o componente com o maior contador
            componenteCritico = Object.keys(componenteCounts).reduce((a, b) => 
                componenteCounts[a] > componenteCounts[b] ? a : b, 'N/A'
            );
        }
        
        // 5. Máquinas Suspeitas (Mock: 1/5 do total de máquinas + 1)
        const maquinasSuspeitas = totalMaquinas > 0 ? Math.floor(totalMaquinas / 5) + 1 : 0;

        // --- Monta a Resposta JSON para o Frontend ---
        res.json({
            kpis: {
                taxaCrescimento: taxaCrescimento,
                tempoMedioAlerta: tmaHoras,
                componenteCritico: componenteCritico,
                previsaoAlertas: previsao,
                maquinasSuspeitas: maquinasSuspeitas
            },
            listas: {
                rankingPrioridade: rankingBruto, // Dados reais do BD
            },
            graficos: {
                evolucao: alertasEvolucao, // Dados reais do BD
                totalAlertas: totalAlertas,
                totalMaquinas: totalMaquinas,
            }
        });
    })
    .catch(function (erro) {
        console.log("❌ Erro no Controller (BD/SQL):", erro);
        // Garante que o frontend receba o status 500
        res.status(500).json({ error: "Erro ao buscar dados do dashboard", details: erro.sqlMessage || erro.message });
    });
}

module.exports = {
    getDadosRisco
};