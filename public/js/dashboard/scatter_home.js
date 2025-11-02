// VARIÁVEIS GLOBAIS
const STATUS_COLORS = {
    // Cores alinhadas ao seu painel (VERDE = OCIOSO, CIANO = ACEITÁVEL)
    'Máquina - Dentro do aceitável':'rgb(60, 179, 113)', // CIANO (máquina-0021 no gráfico)
    'Máquina - Em Oscioso':  'rgb(0, 191, 255)', // VERDE (máquina-0022)
    'Máquina - Em Atenção': 'rgb(255, 165, 0)', // LARANJA (máquina-0015)
    'Máquina - Em crítico': 'rgb(220, 20, 60)', // VERMELHO (máquina-0001)
    
    // Status inativos (não plotados)
    'Máquina - OFF-LINE': 'rgb(108, 117, 125)', 
    'Máquina - MANUTENÇÃO': 'rgb(108, 117, 125)',
};

const LIMITS_CONFIG = [
    { label: 'Crítico', threshold: 90, color: 'text-danger' },
    { label: 'Atenção', threshold: 70, color: 'text-warning' },
    { label: 'Oscioso', threshold: 28, color: 'text-success' },
];

// VARIÁVEIS DE CONFIGURAÇÃO DO GRÁFICO (FIXAS)
const xAxisLabel = 'Média de Uso da RAM (%)';
const yAxisLabel = 'Média de Uso da CPU (%)';
const xMetricShortName = 'RAM';
const yMetricShortName = 'CPU';


// ***************************************************************
// DADOS FIXOS PARA AS 6 MÁQUINAS (4 ATIVAS)
// ***************************************************************

const cpuRamData = [
    // CRÍTICO: Maquina-0001 (CPU 95% - acima do limite)
    { id: 'Maquina-0001', x: 80, y: 95, status: 'Máquina - Em crítico' }, 
    
    // ATENÇÃO: Maquina-0015 (RAM 88% - perto do limite)
    { id: 'Maquina-0015', x: 88, y: 55, status: 'Máquina - Em Atenção' }, 
    
    // DENTRO DO ACEITÁVEL: Maquina-0021 (CPU 65% - Normal/Aceitável)
    { id: 'Maquina-0021', x: 60, y: 65, status: 'Máquina - Dentro do aceitável' }, 
    
    // OCIOSO: Maquina-0022 (CPU 28% - abaixo do limite 30/28)
    { id: 'Maquina-0022', x: 15, y: 28, status: 'Máquina - Em Oscioso' }, 

    // MÁQUINAS INATIVAS (MANTIDAS para coerência no Data Context)
    { id: 'Maquina-0002', x: 0, y: 0, status: 'Máquina - OFF-LINE' }, 
    { id: 'Maquina-0030', x: 0, y: 0, status: 'Máquina - MANUTENÇÃO' }, 
];

let scatterChart = null;

// --- FUNÇÕES DE PROCESSAMENTO E UTILIDADE ---

function processDataForChart(rawData) {
    const groupedData = {};
    for (const key in STATUS_COLORS) {
        // Exclui OFF-LINE e MANUTENÇÃO do agrupamento para que não sejam plotados
        if (key !== 'Máquina - OFF-LINE' && key !== 'Máquina - MANUTENÇÃO') {
             groupedData[key] = [];
        }
    }

    rawData.forEach((item) => {
        const status = item.status;
        if (groupedData[status]) {
            groupedData[status].push({ x: item.x, y: item.y, ...item });
        }
    });

    return Object.keys(groupedData)
        .map((status) => ({
            label: status,
            data: groupedData[status],
            backgroundColor: STATUS_COLORS[status],
            pointRadius: 6,
            pointHoverRadius: 8,
            parsing: false,
        }))
        .filter((dataset) => dataset.data.length > 0);
}

function generateLimitsHtml(usageValue, metricName) {
    // Lógica mantida inalterada
    let html = `<h6 class="mt-3">Limites de ${metricName}:</h6>`;
    html += `<ul class="list-group list-group-flush small">`;

    LIMITS_CONFIG.forEach((limit) => {
        const isActive = usageValue >= limit.threshold;
        const statusText = isActive ? 'ATIVO' : 'INATIVO';
        const colorClass = isActive ? limit.color : 'text-secondary';

        html += `
                <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                    ${limit.label} (Acima de ${limit.threshold}%):
                    <span class="${colorClass} fw-bold">${statusText}</span>
                </li>
            `;
    });

    html += `</ul>`;
    return html;
}

function setChartCursor(event, elements) {
    // Lógica mantida inalterada
    if (elements.length > 0) {
        event.native.target.style.cursor = 'pointer';
    } else {
        event.native.target.style.cursor = 'default';
    }
}

function handleChartClick(evt, elements, chart) {
    // Lógica mantida inalterada
    if (elements.length === 0) {
        return;
    }

    const clickedElement = elements[0];
    const datasetIndex = clickedElement.datasetIndex;

    const clickedDataPoint = chart.data.datasets[datasetIndex].data[clickedElement.index];

    // Labels fixos
    const xAxisLabel = chart.options.scales.x.title.text;
    const yAxisLabel = chart.options.scales.y.title.text;

    const machineId = clickedDataPoint.id || 'N/A'; // O ID da máquina clicada

    const getMetricNameFromLabel = (label) => {
        return label.replace(/\s\(%\)/g, '').split(' ').pop().toUpperCase(); 
    };

    const yMetricName = getMetricNameFromLabel(yAxisLabel);
    const xMetricName = getMetricNameFromLabel(xAxisLabel);

    const yLimitsHtml = generateLimitsHtml(clickedDataPoint.y, yMetricName);
    const xLimitsHtml = generateLimitsHtml(clickedDataPoint.x, xMetricName);

    // --- Montagem do Modal ---
    const content = `
        <p class="fs-4 fw-bold mb-0">${machineId}</p> 
        <p><strong>Status Atual:</strong> <span class="badge" style="background-color: ${chart.data.datasets[datasetIndex].backgroundColor}">${clickedDataPoint.status}</span></p>
        <hr>
        
        <div class="row mb-4">
            <div class="col-6"><strong>${yAxisLabel}:</strong> <span class="fw-bold">${clickedDataPoint.y}%</span></div>
            <div class="col-6"><strong>${xAxisLabel}:</strong> <span class="fw-bold">${clickedDataPoint.x}%</span></div>
        </div>

        <div class="row">
            <div class="col-md-6 border-end">
                ${yLimitsHtml}
            </div>
            <div class="col-md-6">
                ${xLimitsHtml}
            </div>
        </div>
    `;

    document.getElementById('modal-body-content').innerHTML = content;

    const historicoButton = document.getElementById('btn-analise-historica');
    if (historicoButton) {
        historicoButton.setAttribute('data-machine-id', machineId);
    }

    const modalElement = document.getElementById('machineDetailModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

/**
 * Função principal para atualizar o gráfico.
 * SIMPLIFICADA para usar apenas os dados de CPU x RAM.
 */
function updateChart() {
    
    const rawData = cpuRamData; // Dados fixos
    const datasets = processDataForChart(rawData);
    const ctx = document.getElementById('scatterChart').getContext('2d');
    
    const chartConfig = {
        type: 'scatter',
        data: {
            datasets: datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: handleChartClick,

            hover: { mode: 'point', intersect: true },
            onHover: setChartCursor,
            
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (context) => context[0].raw.id, // Nome da Máquina
                        label: (context) => {
                            const xLabel = `${context.chart.options.scales.x.title.text}: ${context.raw.x}%`;
                            const yLabel = `${context.chart.options.scales.y.title.text}: ${context.raw.y}%`;
                            return [yLabel, xLabel];
                        },
                        afterLabel: (context) => `Status: ${context.raw.status}`, // Adiciona o status
                    }
                },
                title: { display: false },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        generateLabels: (chart) => {
                            const customLabel = {
                                text: 'USO 50%',
                                fillStyle: 'black', strokeStyle: 'black', lineWidth: 0,
                                pointStyle: 'circle', hidden: false, index: -1,
                            };
                            const datasetLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            return [customLabel, ...datasetLabels];
                        },
                    },
                },
                annotation: {
                    annotations: {
                        vLine: { type: 'line', scaleID: 'x', value: 50, borderColor: 'black', borderWidth: 1, borderDash: [5, 5] },
                        hLine: { type: 'line', scaleID: 'y', value: 50, borderColor: 'black', borderWidth: 1, borderDash: [5, 5] },
                        // Labels dos quadrantes (Usa os nomes curtos FIXOS)
                        labelQ1_Y: { type: 'label', content: `${yMetricShortName} >50`, xValue: 52, yValue: 98, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ1_X: { type: 'label', content: `${xMetricShortName} >50`, xValue: 52, yValue: 94, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ2_Y: { type: 'label', content: `${yMetricShortName} >50`, xValue: 2, yValue: 98, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ2_X: { type: 'label', content: `${xMetricShortName} <=50`, xValue: 2, yValue: 94, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ3_Y: { type: 'label', content: `${yMetricShortName} <=50`, xValue: 2, yValue: 48, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ3_X: { type: 'label', content: `${xMetricShortName} <=50`, xValue: 2, yValue: 44, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ4_Y: { type: 'label', content: `${yMetricShortName} <=50`, xValue: 52, yValue: 48, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                        labelQ4_X: { type: 'label', content: `${xMetricShortName} >50`, xValue: 52, yValue: 44, color: 'black', font: { size: 10 }, position: 'start', xAdjust: 5, yAdjust: 0, },
                    },
                },
            },
            scales: {
                x: {
                    type: 'linear', position: 'bottom',
                    title: { display: true, text: xAxisLabel, font: { weight: 'bold' } },
                    min: 0, max: 100,
                    ticks: { callback: function (value) { return value + '%'; }, stepSize: 10, },
                    grid: { drawOnChartArea: false },
                },
                y: {
                    type: 'linear', position: 'left',
                    title: { display: true, text: yAxisLabel, font: { weight: 'bold' } },
                    min: 0, max: 100,
                    ticks: { callback: function (value) { return value + '%'; }, stepSize: 10, },
                    grid: { drawOnChartArea: false },
                },
            },
        },
    };

    if (scatterChart) {
        scatterChart.destroy();
    }

    if (typeof ChartAnnotation !== 'undefined') {
        Chart.register(ChartAnnotation);
    }

    scatterChart = new Chart(ctx, chartConfig);
}

// REMOVIDA: function atualizar_parametro_lista(newContextValue, newContextText) { ... }


// --- FUNÇÕES DE NAVEGAÇÃO E LOCALSTORAGE ---
// (Mantidas inalteradas, mas sem a dependência do dropdown)
function navigateToMonitoramento() {
    localStorage.removeItem('selectedMachineId');
    // SUBSTITUA PELO SEU URL REAL:
    window.location.href = 'painel.html';
    console.log('Navegando para: Monitoramento Ativo (Visão Geral)');
    const modalElement = document.getElementById('machineDetailModal');
    bootstrap.Modal.getInstance(modalElement)?.hide();
}

function navigateToHistorico() {
    const historicoButton = document.getElementById('btn-analise-historica');
    const machineId = historicoButton ? historicoButton.getAttribute('data-machine-id') : null;

    if (machineId) {
        localStorage.setItem('selectedMachineId', machineId);
        // SUBSTITUA PELO SEU URL REAL:
        window.location.href = 'painelEspecifico.html';
        console.log(`Navegando para: Análise Histórica Bimestral da Máquina: ${machineId}. ID salvo no localStorage.`);
    } else {
        console.warn('Não foi possível encontrar o ID da máquina para navegação histórica.');
    }

    const modalElement = document.getElementById('machineDetailModal');
    bootstrap.Modal.getInstance(modalElement)?.hide();
}

// --- INICIALIZAÇÃO ---

window.onload = function () {
    // A função é chamada diretamente, sem necessidade de event listeners de dropdown.
    updateChart();
};