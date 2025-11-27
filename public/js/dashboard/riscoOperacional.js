document.addEventListener("DOMContentLoaded", () => {
    carregarDashboardRisco();
});

async function carregarDashboardRisco() {
    try {
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));

        if (!usuario || !usuario.fkEmpresa) {
            console.error("Usuário não autenticado ou fkEmpresa ausente.");
            return;
        }

        const fkEmpresa = usuario.fkEmpresa;

        const resposta = await fetch(`/dashboardEstrategica/geral/${fkEmpresa}`);
        if (!resposta.ok) throw new Error("Falha ao buscar dados da API");

        const dados = await resposta.json();
        preencherKPIs(dados.kpis);
        preencherGraficos(dados.graficos);

    } catch (erro) {
        console.error("Erro ao carregar dashboard: ", erro);
    }
}

function preencherKPIs(kpis) {
    document.getElementById("kpi_incidentes_criticos").textContent = kpis.kpi_incidentes_criticos;
    document.getElementById("kpi_maquinas_saturacao").textContent = kpis.kpi_maquinas_saturacao;
    document.getElementById("kpi_comunicacao_estavel").textContent = kpis.kpi_comunicacao_estavel + "%";
    document.getElementById("kpi_integridade_logs").textContent = kpis.kpi_integridade_logs + "%";
    document.getElementById("kpi_score_risco").textContent = kpis.kpi_score_risco;
}

function preencherGraficos(graficos) {
    atualizarGraficoLinha("riscoCriticoTendenciaChart", graficos.tendencia.labels, graficos.tendencia.data);
    atualizarGraficoBarra("comparativoDemandaChart", graficos.demanda.labels, graficos.demanda.data);
    atualizarGraficoBarra("rankingPrioridade", graficos.ranking.labels, graficos.ranking.data);
}

function atualizarGraficoLinha(id, labels, data) {
    new Chart(document.getElementById(id), {
        type: "line",
        data: { labels, datasets: [{ label: "Tendência", data }] },
    });
}

function atualizarGraficoBarra(id, labels, data) {
    new Chart(document.getElementById(id), {
        type: "bar",
        data: { labels, datasets: [{ label: "Valores", data }] },
    });
}
