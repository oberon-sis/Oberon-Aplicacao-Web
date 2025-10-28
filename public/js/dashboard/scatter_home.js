// Variável global para armazenar o contexto de dados atual
// Inicializa com o valor padrão do dropdown
let currentDataContext = 'cpu-ram';

// --- PARTE DE CONFIGURAÇÃO DE DADOS E LIMITES ---
const STATUS_COLORS = {
  'Máquina - Dentro do aceitável': 'rgb(0, 191, 255)', // Azul
  'Máquina - Em Oscioso': 'rgb(60, 179, 113)', // Verde
  'Máquina - Em Atenção': 'rgb(255, 165, 0)', // Laranja
  'Máquina - Em crítico': 'rgb(220, 20, 60)', // Vermelho
};

// Limites configurados por percentual
const LIMITS_CONFIG = [
  { label: 'Crítico', threshold: 90, color: 'text-danger' },
  { label: 'Atenção', threshold: 70, color: 'text-warning' },
  { label: 'Oscioso', threshold: 20, color: 'text-success' },
];

// Dados CPU-RAM (Corrigidos para ter os 4 status e fazer sentido lógico)
const cpuRamData = [
  // 1. CRÍTICO (CPU e RAM ALTAS)
  { id: 'Maquina-001', x: 95, y: 92, status: 'Máquina - Em crítico' },
  { id: 'Maquina-002', x: 88, y: 95, status: 'Máquina - Em crítico' },

  // 2. EM ATENÇÃO (Uma métrica alta, outra média/baixa)
  { id: 'Maquina-003', x: 75, y: 50, status: 'Máquina - Em Atenção' },
  { id: 'Maquina-004', x: 40, y: 85, status: 'Máquina - Em Atenção' },

  // 3. DENTRO DO ACEITÁVEL (Uso normal/moderado)
  { id: 'Maquina-005', x: 60, y: 55, status: 'Máquina - Dentro do aceitável' },
  { id: 'Maquina-006', x: 50, y: 65, status: 'Máquina - Dentro do aceitável' },
  { id: 'Maquina-007', x: 35, y: 45, status: 'Máquina - Dentro do aceitável' },

  // 4. EM OCIOSO (CPU e RAM BAIXAS)
  { id: 'Maquina-008', x: 15, y: 10, status: 'Máquina - Em Oscioso' },
  { id: 'Maquina-009', x: 5, y: 25, status: 'Máquina - Em Oscioso' },
];

// Dados REDE
const enviadosRecebidosData = [
  { id: 'Maquina-009', x: 60, y: 70, status: 'Máquina - Dentro do aceitável' },
  { id: 'Maquina-001', x: 88, y: 65, status: 'Máquina - Em Atenção' },
  { id: 'Maquina-003', x: 95, y: 95, status: 'Máquina - Em crítico' },
  { id: 'Maquina-004', x: 10, y: 80, status: 'Máquina - Em Atenção' },
  { id: 'Maquina-008', x: 5, y: 5, status: 'Máquina - Em Oscioso' },
  { id: 'Maquina-010', x: 45, y: 55, status: 'Máquina - Dentro do aceitável' },
];

let scatterChart = null;

// --- FUNÇÕES DE PROCESSAMENTO E UTILIDADE ---

function processDataForChart(rawData) {
  const groupedData = {};
  for (const key in STATUS_COLORS) {
    groupedData[key] = [];
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

/**
 * Função para configurar o cursor pointer no hover do ponto.
 * A função é incluída em chartConfig.options.onHover.
 */
function setChartCursor(event, elements) {
  // A propriedade native.target é o elemento <canvas>
  if (elements.length > 0) {
    event.native.target.style.cursor = 'pointer';
  } else {
    event.native.target.style.cursor = 'default';
  }
}

/**
 * Função chamada PELO CHART.JS ao clicar em um ponto.
 * Adicionada a lógica para preparar o botão de Análise Histórica.
 */
function handleChartClick(evt, elements, chart) {
  if (elements.length === 0) {
    return;
  }

  const clickedElement = elements[0];
  const datasetIndex = clickedElement.datasetIndex;

  const clickedDataPoint = chart.data.datasets[datasetIndex].data[clickedElement.index];

  const xAxisLabel = chart.options.scales.x.title.text;
  const yAxisLabel = chart.options.scales.y.title.text;

  const machineId = clickedDataPoint.id || 'N/A'; // O ID da máquina clicada

  const getMetricNameFromLabel = (label) => {
    return label.split(' ').pop().toUpperCase();
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

  // NOVO: Configurar o atributo data-machine-id no botão de Histórico
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
 */
function updateChart() {
  const context = currentDataContext;

  let rawData, xAxisLabel, yAxisLabel;

  if (context === 'cpu-ram') {
    rawData = cpuRamData;
    xAxisLabel = 'Média de Uso da RAM';
    yAxisLabel = 'Média de Uso da CPU';
  } else {
    rawData = enviadosRecebidosData;
    xAxisLabel = 'Média pacotes recebidos';
    yAxisLabel = 'Média pacotes enviados';
  }

  const datasets = processDataForChart(rawData);
  const ctx = document.getElementById('scatterChart').getContext('2d');

  const getMetricNameFromLabel = (label) => {
    return label.split(' ').pop().toUpperCase();
  };

  const yMetricName = getMetricNameFromLabel(yAxisLabel);
  const xMetricName = getMetricNameFromLabel(xAxisLabel);

  const chartConfig = {
    type: 'scatter',
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: handleChartClick,

      // CONFIGURAÇÃO DO CURSOR POINTER
      hover: {
        mode: 'point',
        intersect: true,
      },
      onHover: setChartCursor,

      plugins: {
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
                fillStyle: 'black',
                strokeStyle: 'black',
                lineWidth: 0,
                pointStyle: 'circle',
                hidden: false,
                index: -1,
              };
              const datasetLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              return [customLabel, ...datasetLabels];
            },
          },
        },
        annotation: {
          annotations: {
            vLine: {
              type: 'line',
              scaleID: 'x',
              value: 50,
              borderColor: 'black',
              borderWidth: 1,
              borderDash: [5, 5],
            },
            hLine: {
              type: 'line',
              scaleID: 'y',
              value: 50,
              borderColor: 'black',
              borderWidth: 1,
              borderDash: [5, 5],
            },
            labelQ1_Y: {
              type: 'label',
              content: `${yMetricName} >50`,
              xValue: 52,
              yValue: 98,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ1_X: {
              type: 'label',
              content: `${xMetricName} >50`,
              xValue: 52,
              yValue: 94,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ2_Y: {
              type: 'label',
              content: `${yMetricName} >50`,
              xValue: 2,
              yValue: 98,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ2_X: {
              type: 'label',
              content: `${xMetricName} <=50`,
              xValue: 2,
              yValue: 94,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ3_Y: {
              type: 'label',
              content: `${yMetricName} <=50`,
              xValue: 2,
              yValue: 48,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ3_X: {
              type: 'label',
              content: `${xMetricName} <=50`,
              xValue: 2,
              yValue: 44,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ4_Y: {
              type: 'label',
              content: `${yMetricName} <=50`,
              xValue: 52,
              yValue: 48,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
            labelQ4_X: {
              type: 'label',
              content: `${xMetricName} >50`,
              xValue: 52,
              yValue: 44,
              color: 'black',
              font: { size: 10 },
              position: 'start',
              xAdjust: 5,
              yAdjust: 0,
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: { display: true, text: xAxisLabel, font: { weight: 'bold' } },
          min: 0,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%';
            },
            stepSize: 10,
          },
          grid: { drawOnChartArea: false },
        },
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: yAxisLabel, font: { weight: 'bold' } },
          min: 0,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + '%';
            },
            stepSize: 10,
          },
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

/**
 * Função para tratar o clique no dropdown (Atualiza contexto e gráfico).
 */
function atualizar_parametro_lista(newContextValue, newContextText) {
  currentDataContext = newContextValue;

  const displaySpan = document.getElementById('valor_pesquisa');
  if (displaySpan) {
    displaySpan.textContent = newContextText;
  }

  updateChart();
}

// --- FUNÇÕES DE NAVEGAÇÃO E LOCALSTORAGE ---

function navigateToMonitoramento() {
  // Visão Geral - Não precisa de ID específico da máquina
  localStorage.removeItem('selectedMachineId');

  // SUBSTITUA PELO SEU URL REAL:
  window.location.href = 'painel.html';
  console.log('Navegando para: Monitoramento Ativo (Visão Geral)');

  // Fechar modal (opcional)
  const modalElement = document.getElementById('machineDetailModal');
  bootstrap.Modal.getInstance(modalElement)?.hide();
}

function navigateToHistorico() {
  // Obtém o ID da máquina a partir do botão que foi configurado no handleChartClick
  const historicoButton = document.getElementById('btn-analise-historica');
  const machineId = historicoButton ? historicoButton.getAttribute('data-machine-id') : null;

  if (machineId) {
    // Salva o nome da máquina no localStorage
    localStorage.setItem('selectedMachineId', machineId);

    // SUBSTITUA PELO SEU URL REAL:
    window.location.href = 'painelEspecifico.html';
    console.log(
      `Navegando para: Análise Histórica Bimestral da Máquina: ${machineId}. ID salvo no localStorage.`,
    );
  } else {
    console.warn('Não foi possível encontrar o ID da máquina para navegação histórica.');
  }

  // Fechar modal (opcional)
  const modalElement = document.getElementById('machineDetailModal');
  bootstrap.Modal.getInstance(modalElement)?.hide();
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', function () {
  // Mapeia o onclick do HTML para o EventListener (melhor prática)
  const items = document.querySelectorAll('.dropdown-menu a');

  items.forEach((item) => {
    if (item.hasAttribute('onclick')) {
      const originalOnClick = item.getAttribute('onclick');
      item.removeAttribute('onclick');

      item.addEventListener('click', function (event) {
        event.preventDefault();

        // Regex para extrair os dois argumentos
        const match = originalOnClick.match(
          /atualizar_parametro_lista\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
        );

        if (match && match.length === 3) {
          const value = match[1];
          const text = match[2];

          atualizar_parametro_lista(value, text);
        }
      });
    }
  });
});

window.onload = function () {
  // Chamamos a função de inicialização do gráfico após o carregamento total
  updateChart();
};
