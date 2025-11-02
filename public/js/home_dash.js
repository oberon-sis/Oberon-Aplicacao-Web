let linhaChartInstance = null;
let barraChartInstance = null;
let linhaIntervalId = null;
let barraIntervalId = null;
let maquinaAtualId = 1;
const BARRA_CHART_ID = 'graficoBarrasComparativo';

function getNewValue(oldValue) {
  const randomChange = Math.random() * 2 - 1;
  let newValue = oldValue + randomChange;
  return Math.max(50, Math.min(130, newValue)).toFixed();
}

const UPDATE_INTERVAL_MS = 3000;
const MAX_VALUE_X = 9;

const labels = [
  'Maquina 005',
  'Maquina 004',
  'Maquina 001',
  'Maquina 002',
  'Maquina 006',
  'Maquina 007',
];

const semanaPassadaTotalFixa = [9, 6, 8, 7, 7, 6];
const BARRA_DATA_DEFAULT = [6, 4, 5, 5, 4, 4];
let nestaSemanaData = [...BARRA_DATA_DEFAULT];

function getNewRandomValue(currentValue) {
  const randomChange = Math.random() * 0.3;
  let newValue = currentValue + randomChange;
  const maxAllowed = Math.min(...semanaPassadaTotalFixa) - 0.1;
  return Math.min(newValue, maxAllowed);
}

function calculateSemanaPassadaComplement(currentNestaSemanaData) {
  return semanaPassadaTotalFixa.map((total, index) => {
    return Math.max(0, total - currentNestaSemanaData[index]);
  });
}

function fetchNewDataBarra(idMaquina) {
  return new Promise((resolve) => {
    setTimeout(() => {
      nestaSemanaData = nestaSemanaData.map(getNewRandomValue);
      resolve(nestaSemanaData);
    }, 500);
  });
}

const initialData = {
  labels: labels,
  datasets: [
    {
      label: 'Semana Passada',
      data: calculateSemanaPassadaComplement(nestaSemanaData),
      backgroundColor: '#ecf0f1',
      borderColor: '#ecf0f1',
      order: 2,
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    },
    {
      label: 'Nesta Semana',
      data: nestaSemanaData,
      backgroundColor: '#0C8186',
      borderColor: '#0C8186',
      order: 1,
      categoryPercentage: 0.8,
      barPercentage: 0.9,
    },
  ],
};

const configBarra = {
  type: 'bar',
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuart' },
    scales: {
      x: {
        stacked: true,
        grid: { display: true, color: 'rgba(0, 0, 0, 0.08)' },
        ticks: {
          font: { family: 'Segoe UI', size: 12 },
          color: '#666',
          callback: (value) => ` ${value}`,
        },
        title: {
          display: true,
          text: 'Total de Ocorrências',
          font: { family: 'Segoe UI', size: 14, weight: 'bold' },
          color: '#555',
        },
        max: MAX_VALUE_X,
        min: 0,
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 13, weight: 'bold' } },
      },
    },
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        cornerRadius: 6,
        callbacks: {
          filter: function (item) {
            return item.datasetIndex === 1;
          },
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x.toFixed(2) + ' Ocorrências';
            }
            return label;
          },
        },
      },
    },
  },
};

function initBarraChart(idMaquina) {
  if (barraChartInstance) {
    barraChartInstance.destroy();
  }
  if (barraIntervalId) {
    clearInterval(barraIntervalId);
  }
  nestaSemanaData = [...BARRA_DATA_DEFAULT];
  const currentInitialData = {
    labels: labels,
    datasets: [
      {
        label: 'Semana Passada',
        data: calculateSemanaPassadaComplement(nestaSemanaData),
        backgroundColor: '#ecf0f1',
        borderColor: '#ecf0f1',
        order: 2,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
      {
        label: 'Nesta Semana',
        data: nestaSemanaData,
        backgroundColor: '#0C8186',
        borderColor: '#0C8186',
        order: 1,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    ],
  };
  const ctx = document.getElementById(BARRA_CHART_ID).getContext('2d');
  if (!ctx) return;
  barraChartInstance = new Chart(ctx, { ...configBarra, data: currentInitialData });
  barraIntervalId = setInterval(async () => {
    await fetchNewDataBarra(idMaquina);
    const novoComplemento = calculateSemanaPassadaComplement(nestaSemanaData);
    if (barraChartInstance) {
      barraChartInstance.data.datasets[1].data = nestaSemanaData;
      barraChartInstance.data.datasets[0].data = novoComplemento;
      barraChartInstance.update();
    }
  }, UPDATE_INTERVAL_MS);
}
document.addEventListener('DOMContentLoaded', () => {
  initBarraChart(maquinaAtualId);
});

let historicoChartInstance = null;

const Maquinas = {
  1: 'Estacao-001',
  2: 'Estacao-002',
  3: 'Estacao-003',
  4: 'Estacao-004',
  5: 'Estacao-005',
};
