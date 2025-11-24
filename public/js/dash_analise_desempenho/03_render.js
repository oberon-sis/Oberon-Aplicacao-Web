// dash_analise_desemPENHO/03_render.js

let chartInstance = null; 

function renderizarGraficoMock(tipoGrafico, data = mockData) {
    const chartPlaceholder = document.querySelector('.chart-skeleton');
    const chartCanvas = document.getElementById('alertTrendChart');
    
    if (chartPlaceholder) {
        chartPlaceholder.classList.replace('d-flex', 'd-none');
        chartCanvas.classList.replace('d-none', 'd-flex')
    }

    if (!chartCanvas) return;
    if (chartInstance) chartInstance.destroy();

    const ctx = chartCanvas.getContext('2d');
    const tipoGraficoAjustado = tipoGrafico || 'comparar'; 
    const agrupamento = data.agrupamento || 'Mês'; 
    const metrica = document.getElementById('selectMetricaPrincipal')?.value || 'Métrica';
    const variavelRelacionada = document.getElementById('selectVariavelRelacionada')?.value || 'Variável';

    let config = {};
    const labelsDoGrafico = data.graficoData.labels_Data || [];

    if (tipoGraficoAjustado === 'comparar' || data.analise_tipo === 'comparacao') {
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
                    fill: false
                }, {
                    label: 'Período Anterior',
                    data: data.graficoData.dataAnterior,
                    borderColor: '#ced4da', 
                    borderDash: [5, 5], 
                    tension: 0.2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: `Tempo (${agrupamento})` } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    } else if (tipoGraficoAjustado === 'correlacao' || data.analise_tipo === 'correlacao') {
        const scatterData = data.graficoData.dataAtual.map((y, i) => ({ 
            x: data.graficoData.dataAnterior[i] || 0, 
            y: y 
        }));

        config = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `Relação (${metrica} vs ${variavelRelacionada})`,
                    data: scatterData,
                    backgroundColor: '#dc3545'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: variavelRelacionada } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    } else if (tipoGraficoAjustado === 'previsao' || data.analise_tipo === 'previsao') {
        const atual = data.graficoData.dataAtual;
        const futuro = data.graficoData.dataFutura;
        
        let labelsCompleta = [...labelsDoGrafico];
        if (labelsCompleta.length < (atual.length + futuro.length)) {
             const qtdFalta = (atual.length + futuro.length) - labelsCompleta.length;
             for(let i=0; i<qtdFalta; i++) labelsCompleta.push(`Futuro ${i+1}`);
        }

        config = {
            type: 'line',
            data: {
                labels: labelsCompleta,
                datasets: [{
                    label: 'Histórico',
                    data: atual.concat(Array(futuro.length).fill(null)), 
                    borderColor: '#28a745', 
                    tension: 0.2
                }, {
                    label: 'Previsão',
                    data: Array(atual.length - 1).fill(null).concat([atual[atual.length-1]]).concat(futuro), 
                    borderColor: '#ffc107',
                    borderDash: [10, 5],
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Período' } },
                    y: { title: { display: true, text: metrica } }
                }
            }
        };
    }

    chartInstance = new Chart(ctx, config);
}

function renderizarInterpretacoes(iaMetricas) {
    if (!iaMetricas) return;
    const { interpretacao, chave_metricas } = iaMetricas;

    const interpretacoesContent = document.getElementById('interpretacoes-content');
    if (interpretacoesContent && interpretacao) {
        interpretacoesContent.innerHTML = interpretacao.map(p => `<p class="mb-4">${p}</p>`).join('');
    }

    const metricasContent = document.getElementById('metricas-content');
    if (metricasContent && chave_metricas) {
        let htmlContent = '';
        chave_metricas.forEach(metric => {
             htmlContent += `
                <div class="info-metric-card d-flex align-items-center justify-content-between p-3 mb-3 border rounded">
                    <div>
                        <h6 class="mb-0">${metric.titulo}</h6>
                        <p class="mb-0">${metric.valor}</p>
                    </div>
                    <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
                </div>
            `;
        });
        metricasContent.innerHTML = htmlContent;
    }
}

function renderizarDados(data) {
    const { kpis, iaMetricas, topMaquinas, tipo_de_modelo } = data;
    const periodoLabel = 'período passado'; 

    if (kpis && kpis.uptime) {
        document.getElementById('kpi_uptime_valor').innerText = kpis.uptime.valor;
        document.getElementById('kpi_uptime_variacao').innerText = kpis.uptime.variacao;
        document.getElementById('kpi_uptime_variacao').className = `kpi-variation ${kpis.uptime.classeVariacao}`;
        document.getElementById('kpi_uptime_passado').innerHTML = `${periodoLabel}: ${kpis.uptime.periodoAnterior}`;
    }
    
    if (kpis && kpis.alertasTotais) {
        document.getElementById('kpi_alertas_totais_valor').innerText = kpis.alertasTotais.valor;
        document.getElementById('kpi_alertas_totais_variacao').innerText = kpis.alertasTotais.variacao;
        document.getElementById('kpi_alertas_totais_variacao').className = `kpi-variation ${kpis.alertasTotais.classeVariacao}`;
        document.getElementById('kpi_alertas_totais_passado').innerHTML = `${periodoLabel}: ${kpis.alertasTotais.periodoAnterior}`;
    }

    if (kpis && kpis.alertasCriticos) {
        document.getElementById('kpi_criticos_valor').innerText = kpis.alertasCriticos.valor;
        document.getElementById('kpi_criticos_variacao').innerText = kpis.alertasCriticos.variacao;
        document.getElementById('kpi_criticos_variacao').className = `kpi-variation ${kpis.alertasCriticos.classeVariacao}`;
        document.getElementById('kpi_criticos_passado').innerHTML = `${periodoLabel}: ${kpis.alertasCriticos.periodoAnterior}`;
    }

    if (kpis && kpis.metricaFrequente) {
        document.getElementById('kpi_frequente_nome').innerText = kpis.metricaFrequente.nome;
        document.getElementById('kpi_frequente_detalhe').innerHTML = kpis.metricaFrequente.detalhe;
    }
    
    renderizarInterpretacoes(iaMetricas);
    
    const modelInfoEl = document.getElementById('modelInfoDisplay');
    if (modelInfoEl && tipo_de_modelo) {
        if (data.analise_tipo === 'previsao') {
            modelInfoEl.innerHTML = `<strong>Modelo:</strong> ${tipo_de_modelo.melhorModelo} | <strong>Fórmula:</strong> ${tipo_de_modelo.equacao}`;
        } else if (data.analise_tipo === 'comparacao' || data.analise_tipo === 'correlacao') {
             modelInfoEl.innerHTML = `<strong>Método:</strong> ${tipo_de_modelo.metodo} | <strong>Tipo:</strong> ${tipo_de_modelo.tipo}`;
        } else {
             modelInfoEl.innerHTML = '';
        }
    }
    
    renderizarTabela(topMaquinas);
    
    const selectTipoGrafico = document.getElementById('selectTipoGrafico');
    const tipoGraficoAtual = selectTipoGrafico ? selectTipoGrafico.value : data.analise_tipo; 
    renderizarGraficoMock(tipoGraficoAtual, data);
}

function renderizarTabela(maquinas) {
    const tableBody = document.querySelector('.table-responsive tbody');
    if (!tableBody || !maquinas) return;
    tableBody.innerHTML = ''; 

    maquinas.forEach(maq => {
        const row = `
            <tr>
                <td>${maq.nome}</td>
                <td>${maq.uptime}</td>
                <td class="${maq.downtimeClasse}">${maq.downtime}</td>
                <td class="${maq.difMesPassadoClasse}">${maq.difMesPassado}</td>
                <td>${maq.top1}</td>
                <td>${maq.top2}</td>
                <td>${maq.top3}</td>
                <td>
                    <button class="btn btn-info btn-sm me-1" onclick="analisarMaquina('${maq.nome}')">Analisar</button>
                    <button class="btn btn-primary btn-sm" onclick="verHistorico('${maq.nome}')">Histórico</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}