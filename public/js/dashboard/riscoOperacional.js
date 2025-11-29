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
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.style.display = 'block';

        const resposta = await fetch(`/dashboardEstrategica/geral/${fkEmpresa}`);
        if (!resposta.ok) throw new Error("Falha ao buscar dados da API");

        const dados = await resposta.json();
        if (loadingMessage) loadingMessage.style.display = 'none';

        preencherKPIs(dados.kpis);
        preencherGraficos(dados.graficos);
        preencherTabelaRankingPrioridade(dados.graficos?.ranking?.tabela);

    } catch (erro) {
        console.error("Erro ao carregar dashboard: ", erro);
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.textContent = "Erro ao carregar dados. Verifique o console.";
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
    if (graficos?.comparativoNivel) {
        atualizarGraficoComparativoBimestre(
            "comparativoBimestreChartNivel",
            graficos.comparativoNivel.labels,
            graficos.comparativoNivel.atual,
            graficos.comparativoNivel.passado
        );
    }

    if (graficos?.comparativoBimestre) {
        atualizarGraficoComparativoBimestre(
            "comparativoBimestreChart",
            graficos.comparativoBimestre.labels,
            graficos.comparativoBimestre.atual,
            graficos.comparativoBimestre.passado
        );
    }

    if (graficos?.demanda) {
        atualizarGraficoBarra("comparativoDemandaChart", graficos.demanda.labels, graficos.demanda.data);
    }

    // Dentro de preencherGraficos(graficos), substitua o bloco de severidade:
    if (graficos?.severidadeComparativa?.dadosBrutos) {
        const selectFiltro = document.getElementById("filtro-severidade");
        const dados = graficos.severidadeComparativa.dadosBrutos;

        function atualizarGraficoSeveridadeUnico(severidadeSelecionada) {
            const canvas = document.getElementById("graficoSeveridadeUnico");
            if (!canvas) return;
            if (canvas.chartInstance) canvas.chartInstance.destroy();

            // Padroniza severidade (Média, Alta, Crítica) para corresponder ao backend
            const normalize = s => (s === "Crítica" ? "Critica" : s);

            const componentes = ["CPU", "RAM", "DISCO", "REDE"];
            const atual = componentes.map(comp => {
                const item = dados.find(r => r.componente === comp && r.severidade === normalize(severidadeSelecionada));
                return item ? parseInt(item.atual) : 0;
            });
            const passado = componentes.map(comp => {
                const item = dados.find(r => r.componente === comp && r.severidade === normalize(severidadeSelecionada));
                return item ? parseInt(item.passado) : 0;
            });

            const chart = new Chart(canvas, {
                type: "bar",
                data: {
                    labels: componentes,
                    datasets: [
                        {
                            label: "Bimestre Atual",
                            data: atual,
                            backgroundColor: "rgba(87, 111, 230, 0.8)",
                            borderRadius: 6
                        },
                        {
                            label: "Bimestre Passado",
                            data: passado,
                            backgroundColor: "rgba(180, 180, 200, 0.8)",
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${ctx.raw} incidentes`
                            }
                        },
                        datalabels: {
                            anchor: "end",
                            align: "top",
                            formatter: v => (v > 0 ? v : ""),
                            color: "#444",
                            font: { weight: "bold" }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: "Quantidade de Incidentes" },
                            ticks: { precision: 0 }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });

            canvas.chartInstance = chart;
        }

        // Render inicial com o valor atual do select
        atualizarGraficoSeveridadeUnico(selectFiltro.value);

        // Atualiza ao trocar filtro
        selectFiltro.addEventListener("change", () => {
            atualizarGraficoSeveridadeUnico(selectFiltro.value);
        });
    }





    if (graficos?.ranking?.tabela) {
        preencherTabelaRankingPrioridade(graficos.ranking.tabela);
    }
}

function atualizarGraficoComparativoBimestre(id, labels, atual, passado) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    const newChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Bimestre Atual", data: atual, backgroundColor: "rgba(87, 111, 230, 0.8)", borderRadius: 5 },
                { label: "Bimestre Passado", data: passado, backgroundColor: "rgba(180, 180, 200, 0.8)", borderRadius: 5 }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} alertas` } }
            },
            scales: {
                x: { beginAtZero: true, title: { display: true, text: "Quantidade de Alertas" } }
            }
        }
    });
    canvas.chartInstance = newChart;
}

function atualizarGraficoBarra(id, labels, data) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    const newChart = new Chart(canvas, {
        type: "bar",
        data: { labels: labels, datasets: [{ label: "Quantidade", data: data, backgroundColor: "#6C63FF", borderRadius: 5 }] },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { display: false },
                datalabels: { anchor: "end", align: "right", formatter: value => value }
            },
            scales: {
                x: { title: { display: true, text: "Nº de Alertas" }, ticks: { beginAtZero: true } }
            }
        },
        plugins: [ChartDataLabels]
    });
    canvas.chartInstance = newChart;
}

function atualizarGraficoSeveridade(id, labels, atual, passado) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    const newChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Bimestre Atual", data: atual, backgroundColor: "rgba(87, 111, 230, 0.8)", borderRadius: 5 },
                { label: "Bimestre Passado", data: passado, backgroundColor: "rgba(180, 180, 200, 0.8)", borderRadius: 5 }
            ]
        },
        options: {
            indexAxis: "x",
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} incidentes` } }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "Quantidade de Incidentes" } }
            }
        }
    });
    canvas.chartInstance = newChart;
}


function preencherTabelaRankingPrioridade(ranking) {
    const tbody = document.getElementById("tbody-ranking-prioridade");
    tbody.innerHTML = "";
    if (!ranking || !Array.isArray(ranking)) return;

    ranking.forEach(item => {
        const tr = document.createElement("tr");

        const tdMaquina = document.createElement("td");
        tdMaquina.textContent = item.maquina || "—";

        const tdAlertas = document.createElement("td");
        tdAlertas.textContent = item.alertasBimestre ?? 0;

        const tdCpu = document.createElement("td");
        tdCpu.textContent = item.cpuMedia ? item.cpuMedia + "%" : "—";

        const tdRam = document.createElement("td");
        tdRam.textContent = item.ramMedia ? item.ramMedia + "%" : "—";

        const tdDisco = document.createElement("td");
        tdDisco.textContent = item.discoUso ? item.discoUso + "%" : "—";

        const tdIncidentes = document.createElement("td");
        tdIncidentes.textContent = item.totalIncidentes ?? "—";

        const tdSeveridade = document.createElement("td");
        tdSeveridade.textContent = item.severidadeMedia || "—";

        const tdStatus = document.createElement("td");
        tdStatus.textContent = item.status || "—";

        tr.appendChild(tdMaquina);
        tr.appendChild(tdAlertas);
        tr.appendChild(tdCpu);
        tr.appendChild(tdRam);
        tr.appendChild(tdDisco);
        tr.appendChild(tdIncidentes);
        tr.appendChild(tdSeveridade);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}

