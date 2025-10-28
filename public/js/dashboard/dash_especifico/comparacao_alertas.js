const comparativoLabels = ['CPU', 'RAM', 'DISCO', 'REDE'];
const orangeColor = 'rgba(230, 126, 34, 1)';
const greenColor = 'rgba(39, 174, 96, 1)';
const comparativoBarColors = [orangeColor, greenColor, greenColor, greenColor];
const comparativoData = {
  backgroundValues: [140, 215, 375, 430],
  mainValues: [85, 200, 350, 410],
};

const especificoLabels = ['Crítico', 'Atenção', 'Ocioso'];
const statusColors = ['rgba(231, 76, 60, 1)', 'rgba(241, 196, 15, 1)', 'rgba(46, 204, 113, 1)'];

const especificoData = {
  CPU: { bimestrePassado: [25, 40, 150], bimestreAtual: [10, 30, 120] },
  RAM: { bimestrePassado: [30, 50, 250], bimestreAtual: [15, 40, 210] },
  DISCO: { bimestrePassado: [15, 70, 100], bimestreAtual: [10, 50, 80] },
  REDE: { bimestrePassado: [40, 60, 200], bimestreAtual: [30, 50, 180] },
};

let chartInstance = null;

// Função que gera os itens de legenda customizados para o modo específico
const customLegendGenerator = (chart) => {
  const data = chart.data;
  const items = [];
  const pastData = data.datasets[0];

  items.push({
    text: pastData.label,
    fillStyle: pastData.backgroundColor,
    strokeStyle: pastData.borderColor,
    lineWidth: pastData.borderWidth,
    hidden: chart.isDatasetVisible(0),
    datasetIndex: 0,
  });

  const reversedLabels = especificoLabels.slice().reverse();
  const reversedColors = statusColors.slice().reverse();

  reversedLabels.forEach((label, index) => {
    items.push({
      text: `${label} (deste bimestre)`,
      fillStyle: reversedColors[index],
      strokeStyle: reversedColors[index],
      lineWidth: 0,
      hidden: false,
      datasetIndex: 1,
    });
  });

  return items;
};

// Função para criar/atualizar o gráfico
function updateChart(viewType) {
  let currentLabels;
  let currentDatasets;
  let currentTitle;
  let isComparativo = viewType === 'comparativo';
  let legendCallback = null;

  if (isComparativo) {
    currentLabels = comparativoLabels;
    currentTitle = 'Comparativo de Alertas por Categoria de Recurso';
    currentDatasets = [
      {
        label: 'Quantidade de alertas no bimestre passado',
        data: comparativoData.backgroundValues,
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        order: 2,
      },
      {
        label: 'Quantidade de alertas neste bimestre',
        data: comparativoData.mainValues,
        backgroundColor: comparativoBarColors,
        order: 1,
      },
    ];
    legendCallback = Chart.defaults.plugins.legend.labels.generateLabels;
  } else {
    currentLabels = especificoLabels;
    currentTitle = `Alertas de ${viewType} por Status de Criticidade`;
    const dataToUse = especificoData[viewType];
    currentDatasets = [
      {
        label: 'Quantidade de alertas no bimestre passado',
        data: dataToUse.bimestrePassado.slice().reverse(),
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        order: 2,
        legendColor: 'rgba(200, 200, 200, 0.5)',
      },
      {
        label: 'Quantidade de alertas neste bimestre',
        data: comparativoData.mainValues,
        backgroundColor: comparativoBarColors,
        order: 1,
      },
    ];
    legendCallback = Chart.defaults.plugins.legend.labels.generateLabels;
  }

  const config = {
    type: 'bar',
    data: { labels: currentLabels, datasets: currentDatasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            generateLabels: legendCallback,
            filter: (legendItem, chartData) => {
              if (!isComparativo && legendItem.datasetIndex === 1) {
                return false;
              }
              return true;
            },
          },
          onClick: (e, legendItem, legend) => {
            const index = legendItem.datasetIndex;
            const chart = legend.chart;
            if (index === 0) {
              chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
              chart.update();
            }
          },
        },
        title: {
          display: true,
          text: currentTitle,
          font: { size: 16 },
          padding: { top: 10, bottom: 15 },
        },
        tooltip: {},
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 450,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          // Adicionar o título do eixo X aqui:
          title: {
            display: true,
            text: 'Nº de Alertas',
            font: {
              size: 14, // Opcional: define o tamanho da fonte
            },
          },
          ticks: { stepSize: 50 },
        },
        y: {
          type: 'category',
          labels: currentLabels.slice().reverse(),
          grid: { display: false },
          reverse: true,
        },
      },
    },
  };

  if (chartInstance) {
    chartInstance.destroy();
  }
  const ctx = document.getElementById('myDynamicChart').getContext('2d');
  chartInstance = new Chart(ctx, config);
}
// Variável global para armazenar o recurso atualmente selecionado
let currentResourceView = 'comparativo';

// Função que será chamada ao clicar nos itens do novo dropdown
function atualizar_recurso_selecionado(valor, texto) {
  // 1. Atualiza a variável global
  currentResourceView = valor;

  // 2. Atualiza o texto do botão (O ID do span no HTML deve ser valor_pesquisa_recurso)
  const displaySpan = document.getElementById('valor_pesquisa_recurso');
  if (displaySpan) {
    displaySpan.textContent = texto;
  }

  // 3. Atualiza o gráfico com o novo valor
  updateChart(currentResourceView);
}

// Inicializa o gráfico e anexa os event listeners
document.addEventListener('DOMContentLoaded', function () {
  // 1. Seleciona o container do dropdown de recurso
  const dropdownRecursoContainer = document
    .querySelector('#dropdownRecursoToggle')
    .closest('.d-flex');
  const itensRecurso = dropdownRecursoContainer
    ? dropdownRecursoContainer.querySelectorAll('.dropdown-item')
    : [];

  // 2. Mapeamento dos Eventos de Clique
  itensRecurso.forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      const valor = this.getAttribute('data-value');
      const texto = this.textContent.trim();

      atualizar_recurso_selecionado(valor, texto);
    });
  });

  // 3. Inicia o gráfico com o valor padrão ('comparativo')
  updateChart(currentResourceView);
});
