// uptimeDowntimeChart.js

// Certifique-se de que 'weeklyLabels' está disponível (assumindo que utils.js foi carregado)

// --- FUNÇÃO DE BARRAS (Uptime e Downtime Semanal) ---
function initUptimeDowntimeChart() {
  // Verifica se a variável weeklyLabels existe (do utils.js)
  if (typeof weeklyLabels === 'undefined') {
    console.error('weeklyLabels não está definido. Certifique-se de que utils.js foi carregado.');
    return;
  }

  const ctx = document.getElementById('uptimeDowntimeChart').getContext('2d');

  const labels = weeklyLabels.slice(0, 8); // Usando as labels de data concisas

  const totalTime = 168;
  const downtimeData = [2, 1, 0.5, 1, 0.5, 1, 2, 0.5];
  const corUptime = '#0C8186';
  const corDowntime = '#ff1e1eff';

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'UPTIME',
        data: downtimeData.map((dt) => totalTime - dt),
        backgroundColor: corUptime,
        stack: 'Stack 0',
        order: 1,
      },
      {
        label: 'DOWNTIME',
        data: downtimeData,
        backgroundColor: corDowntime,
        stack: 'Stack 0',
        order: 2,
      },
    ],
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Intervalo de tempo (semana)',
            font: {
              size: 14, // Opcional: define o tamanho da fonte
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Tempo  (horas)',
            font: {
              size: 14, // Opcional: define o tamanho da fonte
            },
          },
          max: totalTime,
          ticks: { callback: (value) => value + 'h' },
        },
      },
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          formatter: (value) => {
            const hours = value.toFixed(1);
            const percentage = ((hours / totalTime) * 100).toFixed(1);
            if (hours < 0.1) return '';
            // Corrigido para remover os \n e espaços extras, mantendo o formato
            return `\n${percentage}%\n(${hours}h)`;
          },
          color: (context) => (context.dataset.label === 'DOWNTIME' ? 'black' : 'white'),
          font: { weight: 'bold', size: 14 },
          align: 'center',
          anchor: 'center',
          display: (context) => context.dataset.data[context.dataIndex] > 0.1,
        },
      },
    },
  };

  new Chart(ctx, config);
}
