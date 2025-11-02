const comparativoLabels = ['CPU', 'RAM', 'DISCO', 'REDE'];
const orangeColor = 'rgba(230, 126, 34, 1)';
const greenColor = 'rgba(39, 174, 96, 1)';
const redColor = 'rgba(220, 20, 60, 1)';
const blueColor = 'rgba(0, 191, 255, 1)';
const comparativoData = {
  backgroundValues: [165,147, 54,  14],
  mainValues: [150,200, 70,  30],
};
const comparativoBarColors = [orangeColor, redColor, orangeColor, blueColor];

const especificoLabels = ['Crítico', 'Atenção', 'Ocioso'];
const statusColors = [redColor, orangeColor, greenColor];

const especificoData = {
  CPU: { bimestrePassado: [100, 55, 10], bimestreAtual: [80, 45,25 ] },
  RAM: { bimestrePassado: [60, 50, 37], bimestreAtual: [100, 60, 40] },
  DISCO: { bimestrePassado: [ 20,24, 10], bimestreAtual: [25, 30,15] },
  REDE: { bimestrePassado: [5,9,  0 ], bimestreAtual: [ 10,20, 0] },
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
    hidden: false,
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
      datasetIndex: 1, // Este dataset será filtrado na legenda se não for o modo específico
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
    // Modo Específico (CPU, RAM, DISCO, REDE)
    currentLabels = especificoLabels;
    currentTitle = `Alertas de ${viewType} por Status de Criticidade`;
    const dataToUse = especificoData[viewType];

    const colorsReversed = statusColors.slice().reverse();

    // CORREÇÃO CRÍTICA AQUI: Usar os dados específicos do recurso selecionado.
    currentDatasets = [
      {
        label: 'Quantidade de alertas no bimestre passado',
        data: dataToUse.bimestrePassado.slice().reverse(), // Dados do recurso selecionado
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        order: 2,
        legendColor: 'rgba(200, 200, 200, 0.5)',
      },
      {
        label: 'Quantidade de alertas neste bimestre',
        data: dataToUse.bimestreAtual.slice().reverse(), // Dados do recurso selecionado
        backgroundColor: colorsReversed, // Cores específicas [Ocioso, Atenção, Crítico]
        order: 1,
      },
    ];

    // Usar a função customizada para exibir as cores corretas na legenda
    legendCallback = customLegendGenerator;
  }

  const config = {
    type: 'bar',
    data: {
      labels: isComparativo ? currentLabels : currentLabels.slice().reverse(),
      datasets: currentDatasets,
    },
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
              // Esta lógica só é necessária para filtrar a legenda no modo específico
              if (!isComparativo && legendItem.datasetIndex === 1) {
                return false;
              }
              return true;
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
          max: 200,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          title: {
            display: true,
            text: 'Nº de Alertas',
            font: { size: 14 },
          },
          ticks: { stepSize: 50 },
        },
        y: {
          type: 'category',
          labels: isComparativo ? currentLabels : currentLabels.slice().reverse(), // Garante a ordem correta
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
  currentResourceView = valor;

  const displaySpan = document.getElementById('valor_pesquisa_recurso');
  if (displaySpan) {
    displaySpan.textContent = texto;
  }

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
    : []; // 2. Mapeamento dos Eventos de Clique

  itensRecurso.forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      const valor = this.getAttribute('data-value');
      const texto = this.textContent.trim();

      atualizar_recurso_selecionado(valor, texto);
    });
  }); // 3. Inicia o gráfico com o valor padrão ('comparativo')

  updateChart(currentResourceView);
});
