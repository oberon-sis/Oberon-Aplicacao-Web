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
        preencherTabelaRankingPrioridade(dados.graficos?.ranking?.tabela);

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
    if (graficos?.tendencia) {
        atualizarHeatmapTendenciaRisco(
            "riscoCriticoTendenciaChart",
            graficos.tendencia.labels,
            graficos.tendencia.tipos,
            graficos.tendencia.valores
        );


    }
    if (graficos?.demanda) {
        atualizarGraficoBarra("comparativoDemandaChart", graficos.demanda.labels, graficos.demanda.data);
    }
    if (graficos?.ranking?.tabela) {
        preencherTabelaRankingPrioridade(graficos.ranking.tabela);
    }
}

function atualizarHeatmapTendenciaRisco(id, labels, tipos, valores) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const cores = {
        "CRÍTICO": "#FF4C4C",
        "ATENÇÃO": "#FFD700",
        "OCIOSO": "#A9A9A9"
    };

    const datasets = tipos.map((tipo, i) => ({
        label: tipo,
        data: valores[i],
        backgroundColor: cores[tipo],
        stack: "alertas"
    }));

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: { size: 12 },
                        boxWidth: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} alertas`
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: "Semana"
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Nº de Alertas"
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}





function atualizarGraficoBarra(id, labels, data) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.warn("Canvas não encontrado:", id);
        return;
    }

    new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Quantidade",
                    data: data,
                    backgroundColor: "#6C63FF",
                    borderRadius: 6
                }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: "end",
                    align: "right",
                    formatter: value => value
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Nº de Alertas"
                    },
                    ticks: { beginAtZero: true }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function preencherTabelaRankingPrioridade(ranking) {
    const tbody = document.getElementById("tbody-ranking-prioridade");
    tbody.innerHTML = "";

    if (!ranking || !Array.isArray(ranking)) {
        console.warn("Ranking não encontrado ou inválido");
        return;
    }

    ranking.forEach(item => {
        const tr = document.createElement("tr");

        const tdMaquina = document.createElement("td");
        tdMaquina.textContent = item.maquina || item.nome || "—";

        const tdAlertas = document.createElement("td");
        tdAlertas.textContent = item.alertasBimestre || item.totalAlertas || 0;

        tr.appendChild(tdMaquina);
        tr.appendChild(tdAlertas);

        tbody.appendChild(tr);
    });
}
