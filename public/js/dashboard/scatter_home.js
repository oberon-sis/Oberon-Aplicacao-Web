const STATUS_COLORS = {
  'Máquina - Em crítico': 'rgb(220, 20, 60)',
  'Máquina - Em Atenção': 'rgb(255, 165, 0)',
  'Máquina - Dentro do aceitável': 'rgb(60, 179, 113)',
  'Máquina - Em Ocioso': 'rgb(0, 191, 255)',
  'Máquina - OFF-LINE': 'rgb(108, 117, 125)',
  'Máquina - MANUTENÇÃO': 'rgb(108, 117, 125)',
};

const LIMITS_CONFIG = [
  { label: 'Crítico', threshold: 90, color: 'text-danger' },
  { label: 'Atenção', threshold: 70, color: 'text-warning' },
  { label: 'Ocioso', threshold: 28, color: 'text-success' },
];

const xAxisLabel = 'Média de Uso da RAM (%)';
const yAxisLabel = 'Média de Uso da CPU (%)';
const xMetricShortName = 'RAM';
const yMetricShortName = 'CPU';

let scatterChart = null;

function processDataForChart(rawData) {
  const groupedData = {};
  for (const key in STATUS_COLORS) {
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
  if (elements.length > 0) {
    event.native.target.style.cursor = 'pointer';
  } else {
    event.native.target.style.cursor = 'default';
  }
}

function handleChartClick(evt, elements, chart) {
  if (elements.length === 0) {
    return;
  }

  const clickedElement = elements[0];
  const datasetIndex = clickedElement.datasetIndex;
  const clickedDataPoint = chart.data.datasets[datasetIndex].data[clickedElement.index];
  const xAxisLabel = chart.options.scales.x.title.text;
  const yAxisLabel = chart.options.scales.y.title.text;
  const machineId = clickedDataPoint.id || 'N/A';

  const getMetricNameFromLabel = (label) => {
    return label
      .replace(/\s\(%\)/g, '')
      .split(' ')
      .pop()
      .toUpperCase();
  };

  const yMetricName = getMetricNameFromLabel(yAxisLabel);
  const xMetricName = getMetricNameFromLabel(xAxisLabel);

  const yLimitsHtml = generateLimitsHtml(clickedDataPoint.y, yMetricName);
  const xLimitsHtml = generateLimitsHtml(clickedDataPoint.x, xMetricName);

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

async function updateChart() {
  const usuarioString = sessionStorage.getItem('usuario');
  let fkEmpresa;

  try {
    if (!usuarioString) throw new Error('Usuário não logado.');
    const usuarioObjeto = JSON.parse(usuarioString);
    fkEmpresa = usuarioObjeto.fkEmpresa;
    if (!fkEmpresa) throw new Error('ID da empresa ausente na sessão.');
  } catch (e) {
    console.warn('Não foi possível obter fkEmpresa da sessão. Gráfico não será carregado.', e);
    return;
  }

  let rawData = [];
  try {
    const url = `${API_BASE_URL}/scatter-data?fkEmpresa=${fkEmpresa}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = response.headers.get('content-type')?.includes('application/json')
        ? await response.json()
        : { message: 'Erro desconhecido da API.' };
      throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
    }

    rawData = await response.json();
  } catch (error) {
    console.error('Erro ao carregar dados para o gráfico de dispersão:', error);
    rawData = [];
  }

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
            title: (context) => context[0].raw.id,
            label: (context) => {
              const xLabel = `${context.chart.options.scales.x.title.text}: ${context.raw.x}%`;
              const yLabel = `${context.chart.options.scales.y.title.text}: ${context.raw.y}%`;
              return [yLabel, xLabel];
            },
            afterLabel: (context) => `Status: ${context.raw.status}`,
          },
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
              content: `${yMetricShortName} >50`,
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
              content: `${xMetricShortName} >50`,
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
              content: `${yMetricShortName} >50`,
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
              content: `${xMetricShortName} <=50`,
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
              content: `${yMetricShortName} <=50`,
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
              content: `${xMetricShortName} <=50`,
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
              content: `${yMetricShortName} <=50`,
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
              content: `${xMetricShortName} >50`,
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

function navigateToMonitoramento() {
  localStorage.removeItem('selectedMachineId');
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
    window.location.href = 'painelEspecifico.html';
    console.log(
      `Navegando para: Análise Histórica Bimestral da Máquina: ${machineId}. ID salvo no localStorage.`,
    );
  } else {
    console.warn('Não foi possível encontrar o ID da máquina para navegação histórica.');
  }

  const modalElement = document.getElementById('machineDetailModal');
  bootstrap.Modal.getInstance(modalElement)?.hide();
}

window.onload = function () {
  updateChart();
};
