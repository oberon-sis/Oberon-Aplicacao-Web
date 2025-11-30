// dash_analise_desemPENHO/03_render.js

let chartInstance = null; 

function renderizarGraficoMock(tipoGrafico, data = mockData, onPlotComplete) {
    const chartPlaceholder = document.querySelector('.chart-skeleton');
    const chartCanvas = document.getElementById('alertTrendChart');
    
    if (chartPlaceholder) {
        chartPlaceholder.classList.replace('d-flex', 'd-none');
        chartCanvas.classList.replace('d-none', 'd-flex')
    }
    if (!chartCanvas) {
        if(onPlotComplete) onPlotComplete();
        return;
    }
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
        const datasetsCorrelacao = [{
            label: `Relação (${metrica} vs ${variavelRelacionada})`,
            data: scatterData,
            backgroundColor: '#dc3545', 
        }];
        if (data.linha_regressao && data.linha_regressao.length === 2) {
            datasetsCorrelacao.push({
                type: 'line', 
                label: 'Linha de Regressão',
                data: data.linha_regressao, 
                borderColor: '#176864ff', 
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0 
            });
        }
        config = {
            type: 'scatter',
            data: {
                datasets: datasetsCorrelacao 
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
    config.options = {
        ...config.options, 
        animation: {
            onComplete: () => {
                if (onPlotComplete) {
                    onPlotComplete(); 
                }
            }
        }
    };

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
                <div class="info-metric-card d-flex align-items-center justify-content-between p-3 mb-3 border rounded position-relative">
                    <div class="d-flex column-gap-4">
                        <h6 class="mb-1 w-50">${metric.titulo}: </h6>
                        <p class="mb-0">${metric.valor}</p>
                    </div>
                    <i class="bi bi-graph-up-arrow text-primary" style="font-size: 1.2rem;"></i>
                </div>
            `;
        });
        console.log(htmlContent)
        metricasContent.innerHTML = htmlContent;
    }
}

function renderizarDados(data, onRenderComplete) {
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
    
    renderizarGraficoMock(tipoGraficoAtual, data, onRenderComplete);
}

function renderizarTabela(maquinas) {
    console.log(maquinas)
    const tableBody = document.querySelector('.table-responsive tbody');
    if (!tableBody || !maquinas) return;
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
                    <button class="btn btn-info btn-sm me-1" onclick="analise_tabela('${maq.nome}', ${maq.idMaquina})">Analisar</button>
                    <button class="btn btn-primary btn-sm" onclick="analise_tabela('${maq.nome}', ${maq.idMaquina})">Histórico</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}
function renderizarTabela2(elemento, numero) {
    const tableBody = document.querySelector('.table-responsive tbody');
    if (!tableBody || !numero) return;
    tableBody.innerHTML = ''; 

    elemento.checked

    let maquinas = mockData.topMaquinas

    for (let i = 0; i < numero; i++) {
        let maq = maquinas[i]
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
                    <button class="btn btn-info btn-sm me-1" onclick="analise_tabela('${maq.nome}', ${maq.idMaquina})">Analisar</button>
                    <button class="btn btn-primary btn-sm" onclick="analise_tabela('${maq.nome}', ${maq.idMaquina})">Histórico</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    }
}

function analise_tabela(nome, idMaquina) {
    selecionarFiltroMaquina('Máquina Específica')
    filtrar_maquina(nome, idMaquina)
}


const elementsToLoad = [
    "kpi_uptime_valor", "kpi_uptime_variacao",
    "kpi_alertas_totais_valor", "kpi_alertas_totais_variacao",
    "kpi_criticos_valor", "kpi_criticos_variacao",
    "kpi_frequente_nome", "kpi_frequente_detalhe", 
];

function getGeminiSkeletonHTML() {
    return `
        <div class="ai-loading-container fade-in">
            <div class="ai-loading-header">
                <i class="bi bi-stars gemini-sparkle"></i>
                <span>Oberon AI está analisando...</span>
            </div>
            <div class="ai-line w-100"></div>
            <div class="ai-line w-100"></div>
            <div class="ai-line w-80"></div>
            <div class="ai-line w-60"></div>
        </div>
    `;
}

function toggleSkeleton(isLoading) {
    elementsToLoad.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isLoading) {
                el.classList.add('skeleton');
                if (!el.innerText.trim()) el.innerHTML = "&nbsp;"; 
            } else {
                el.classList.remove('skeleton');
            }
        }
    });

    const chartCanvas = document.getElementById('alertTrendChart');
    const chartSkeleton = document.querySelector('.chart-skeleton');
    
    if (chartCanvas && chartSkeleton) {
        if (isLoading) {
            chartCanvas.classList.add('d-none');     
            chartSkeleton.classList.remove('d-none');
            chartSkeleton.innerHTML = '<div class="text-center text-muted opacity-25"><i class="bi bi-graph-up" style="font-size: 3rem;"></i></div>';
            chartSkeleton.classList.add('d-flex', 'align-items-center', 'justify-content-center', 'skeleton');
        } else {
            chartCanvas.classList.remove('d-none');
            chartSkeleton.classList.add('d-none');
            chartSkeleton.classList.remove('skeleton');
        }
    }

    const interpretacoesDiv = document.getElementById('interpretacoes-content');
    const metricasDiv = document.getElementById('metricas-content');

    if (isLoading) {
        if (interpretacoesDiv) interpretacoesDiv.innerHTML = getGeminiSkeletonHTML();
        
        if (!metricasDiv.classList.contains('d-none')) {
            metricasDiv.classList.add('d-flex') 
            metricasDiv.classList.add('flex-column') 
            metricasDiv.innerHTML = `
            <div id="skeleton_ia" class="d-flex flex-column">
                <div class="p-3 mb-2 border rounded skeleton" style="height: 60px;"></div>
                <div class="p-3 mb-2 border rounded skeleton" style="height: 60px;"></div>
                <div class="p-3 mb-2 border rounded skeleton" style="height: 60px;"></div>
            </div>
            `;
        }
    } else {
        const skeleton_ia = document.getElementById('skeleton_ia')
        if (metricasDiv) skeleton_ia.innerHTML = ''; 
    }

    toggleTableSkeleton(isLoading);
}

function toggleTableSkeleton(isLoading) {
    const tbody = document.querySelector("table tbody");
    if (!tbody) return;

    if (isLoading) {
        const skeletonRow = `
            <tr>
                <td><div class="skeleton rounded" style="height:20px; width: 80%;"></div></td>
                <td><div class="skeleton rounded" style="height:20px; width: 60%;"></div></td>
                <td><div class="skeleton rounded" style="height:20px; width: 60%;"></div></td>
                <td><div class="skeleton rounded" style="height:20px; width: 40%;"></div></td>
                <td><div class="skeleton rounded" style="height:20px; width: 50%;"></div></td>
                <td><div class="skeleton rounded" style="height:20px; width: 90%;"></div></td>
                <td><div class="skeleton rounded" style="height:30px; width: 100%;"></div></td>
            </tr>
        `;
        tbody.innerHTML = skeletonRow.repeat(5);
    }
}