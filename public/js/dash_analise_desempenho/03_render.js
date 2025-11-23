// dash_analise_desempenho/03_render.js

let chartInstance = null; 

/**
 * Renderiza o gráfico principal com base no tipo selecionado.
 * @param {string} tipoGrafico - 'Tendência', 'Correlação' ou 'Previsões'.
 * @param {object} [data=mockData] - Dados para o gráfico (real ou mock).
 */
function renderizarGraficoMock(tipoGrafico, data = mockData) {
    const chartPlaceholder = document.querySelector('.chart-skeleton');
    const chartCanvas = document.getElementById('alertTrendChart');
    
    if (chartPlaceholder) {
        chartPlaceholder.classList.replace('d-flex', 'd-none');
        chartCanvas.classList.replace('d-none', 'd-flex')
    }

    if (chartCanvas) {
        if (chartInstance) {
            chartInstance.destroy();
        }
    } else {
        console.error("Elemento canvas 'alertTrendChart' não encontrado.");
        return;
    }

    const ctx = chartCanvas.getContext('2d');
    
    const tipoGraficoAjustado = tipoGrafico || 'Tendencia'; 

    const agrupamento = document.getElementById('selectAgrupamento').value;
    const metrica = document.getElementById('selectMetricaPrincipal').value;
    const variavelRelacionada = document.getElementById('selectVariavelRelacionada').value;

    let config = {};
    
    const labelsKey = 'labels_' + agrupamento;
    const labelsDoGrafico = data.graficoData[labelsKey] || data.graficoData.labels_Mês;


    if (tipoGraficoAjustado === 'Tendencia') {
        config = {
            type: 'line',
            data: {
                labels: labelsDoGrafico,
                datasets: [{
                    label: 'Período Atual',
                    data: data.graficoData.dataAtual,
                    borderColor: '#0d6efd', 
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.2,
                    fill: false,
                    pointRadius: 5
                }, {
                    label: 'Período Anterior',
                    data: data.graficoData.dataAnterior,
                    borderColor: '#ced4da', 
                    borderDash: [5, 5], 
                    tension: 0.2,
                    fill: false,
                    pointRadius: 3
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: `Tempo (${agrupamento})` } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    } else if (tipoGraficoAjustado === 'Correlacao') {
        const scatterData = data.graficoData.correlaçãoData || data.graficoData.dataAtual.map((y, i) => ({ x: data.graficoData.dataAnterior[i], y: y }));

        config = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `Relação (${metrica} vs ${variavelRelacionada})`,
                    data: scatterData,
                    backgroundColor: '#dc3545', 
                    pointRadius: 7,
                }, {
                    type: 'line', 
                    label: 'Linha de Tendência (Mock)',
                    data: [{x: 40, y: 40}, {x: 85, y: 85}],
                    borderColor: '#17a2b8',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    showLine: true
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: variavelRelacionada } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    } else if (tipoGraficoAjustado === 'Previsoes') {
        const atual = data.graficoData.dataAtual;
        const labelsHistorico = labelsDoGrafico;
        
        const futureProjection = [atual[atual.length-1] + 5, atual[atual.length-1] + 10];
        const futureLabels = ['Próx', 'Seg'];

        config = {
            type: 'line',
            data: {
                labels: labelsHistorico.concat(futureLabels),
                datasets: [{
                    label: 'Histórico',
                    data: atual.concat(Array(futureLabels.length).fill(null)), 
                    borderColor: '#28a745', 
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    spanGaps: true
                }, {
                    label: 'Previsão (Mock)',
                    data: Array(labelsHistorico.length - 1).fill(null).concat([atual[atual.length-1]]).concat(futureProjection), 
                    borderColor: '#ffc107',
                    borderDash: [10, 5],
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: `Período (${agrupamento})` } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    }

    chartInstance = new Chart(ctx, config);
}

/**
 * @param {object} iaMetricas 
 */
function renderizarInterpretacoes(iaMetricas) {
    const { interpretacao, metricasRegressao } = iaMetricas;

    const interpretacoesContent = document.getElementById('interpretacoes-content');
    if (interpretacoesContent) {
        interpretacoesContent.innerHTML = interpretacao.map(p => `<p class="mb-4">${p}</p>`).join('');
    }

    const metricasContent = document.getElementById('metricas-content');
    if (metricasContent) {
        metricasContent.innerHTML = `
            <div class="info-metric-card d-flex align-items-center justify-content-between p-3 mb-3 border rounded">
                <div>
                    <h6 class="mb-0">Coeficiente de Correlação (R)</h6>
                    <p class="mb-0">${metricasRegressao.R}</p>
                </div>
                <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
            </div>
            
            <div class="info-metric-card d-flex align-items-center justify-content-between p-3 mb-3 border rounded">
                <div>
                    <h6 class="mb-0">Coeficiente de Determinação (R²)</h6>
                    <p class="mb-0">${metricasRegressao.R2}</p>
                </div>
                <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
            </div>
            
            <div class="info-metric-card d-flex align-items-center justify-content-between p-3 mb-3 border rounded">
                <div>
                    <h6 class="mb-0">Erro Padrão Residual (RSE)</h6>
                    <p class="mb-0">${metricasRegressao.RSE}</p>
                </div>
                <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
            </div>
            
            <div class="info-metric-card d-flex align-items-center justify-content-between p-3 border rounded">
                <div>
                    <h6 class="mb-0">Índice de Confiabilidade da Projeção</h6>
                    <p class="mb-0">${metricasRegressao.indiceConfiabilidade}</p>
                </div>
                <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
            </div>
        `;
    }
}
/**
 * Atualiza todos os elementos dinâmicos do dashboard (KPIs e Tabela) usando IDs.
 * @param {object} data - Objeto JSON retornado pelo fetch orquestrado.
 */
function renderizarDados(data) {
    // 1. Desestrutura dados
    const { kpis, iaMetricas, topMaquinas } = data;
    const periodoLabel = 'período passado'; 
    
    // KPI 1: Uptime
    document.getElementById('kpi_uptime_valor').innerText = kpis.uptime.valor;
    document.getElementById('kpi_uptime_variacao').innerText = kpis.uptime.variacao;
    document.getElementById('kpi_uptime_variacao').className = `kpi-variation ${kpis.uptime.classeVariacao}`;
    document.getElementById('kpi_uptime_passado').innerHTML = `${periodoLabel}: ${kpis.uptime.periodoAnterior}`;

    // KPI 2: Total de Alertas
    document.getElementById('kpi_alertas_totais_valor').innerText = kpis.alertasTotais.valor;
    document.getElementById('kpi_alertas_totais_variacao').innerText = kpis.alertasTotais.variacao;
    document.getElementById('kpi_alertas_totais_variacao').className = `kpi-variation ${kpis.alertasTotais.classeVariacao}`;
    document.getElementById('kpi_alertas_totais_passado').innerHTML = `${periodoLabel}: ${kpis.alertasTotais.periodoAnterior}`;

    // KPI 3: Alertas Críticos
    document.getElementById('kpi_criticos_valor').innerText = kpis.alertasCriticos.valor;
    document.getElementById('kpi_criticos_variacao').innerText = kpis.alertasCriticos.variacao;
    document.getElementById('kpi_criticos_variacao').className = `kpi-variation ${kpis.alertasCriticos.classeVariacao}`;
    document.getElementById('kpi_criticos_passado').innerHTML = `${periodoLabel}: ${kpis.alertasCriticos.periodoAnterior}`;

    // KPI 4: Métrica Frequente
    document.getElementById('kpi_frequente_nome').innerText = kpis.metricaFrequente.nome;
    document.getElementById('kpi_frequente_detalhe').innerHTML = kpis.metricaFrequente.detalhe;
    
    // 3. Renderiza Informações Complementares (Abas de Interpretação/Métricas)
    if (iaMetricas) {
        renderizarInterpretacoes(iaMetricas);
    }
    
    // 4. Renderiza a Tabela
    renderizarTabela(topMaquinas);
    
    // 5. Renderiza o Gráfico com o tipo de filtro atual
    const selectTipoGrafico = document.getElementById('selectTipoGrafico');
    const tipoGraficoAtual = selectTipoGrafico ? selectTipoGrafico.value : null; 

    renderizarGraficoMock(tipoGraficoAtual, data);
}

/**
 * Preenche a tabela "Top 3 Máquinas com maior taxa de downtime".
 * @param {Array<object>} maquinas - Lista de máquinas.
 */
function renderizarTabela(maquinas) {
    const tableBody = document.querySelector('.table-responsive tbody');
    tableBody.innerHTML = ''; 

    maquinas.forEach(maq => {
        const row = `
            <tr>
                <td>${maq.nome}</td>
                <td class="${maq.downtimeClasse}">${maq.downtime}</td>
                <td class="${maq.difMesPassadoClasse}">${maq.difMesPassado}</td>
                <td class="${maq.alertaClasse}">${maq.totalAlertas}</td>
                <td class="${maq.difMesPassadoClasseAlerta}">${maq.difMesPassadoAlerta}</td>
                <td>${maq.top1}</td>
                <td>${maq.top2}</td>
                <td>${maq.top3}</td>
                <td>
                    <button class="btn btn-info btn-sm me-1"
                        onclick="filtrar_maquina('${maq.nome}', ${maq.id})">Analisar Desempenho</button>
                    <button class="btn btn-primary btn-sm"
                        onclick="redirecionar_dash_risco('${maq.nome}', ${maq.id})">Analise de Risco</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}