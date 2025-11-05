// uptimeDowntimeChart.js

// Certifique-se de que 'weeklyLabels' está disponível (assumindo que utils.js foi carregado)

// --- FUNÇÃO DE BARRAS (Uptime e Downtime Semanal) ---
function initUptimeDowntimeChart() {

  const ctx = document.getElementById('uptimeDowntimeChart').getContext('2d');
  const labels = weeklyLabels.slice(0, 8);
  const totalTime = 168; // 7 dias * 24 horas
  const downtimeData = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
  const corUptime = '#009ab4';
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
              size: 14,
            },
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Tempo (horas)',
            font: {
              size: 14,
            },
          },
          max: totalTime,
          ticks: { callback: (value) => value + 'h' },
        },
      },
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          // CORREÇÃO DE FORMATAÇÃO: Retorna um array para quebrar a linha corretamente
          formatter: (value, context) => {
            const hours = value.toFixed(1);
            const percentage = ((hours / totalTime) * 100).toFixed(1);

            if (hours < 0.1) return null; // Não exibe labels muito pequenos
            // Para UPTIME, mostramos % e horas

            if (context.dataset.label === 'UPTIME') {
              return [`${percentage}%`, `(${hours}h)`];
            } // Para DOWNTIME, mostramos apenas horas
            else {
              return `${hours}h`;
            }
          },
          color: (context) => (context.dataset.label === 'DOWNTIME' ? 'black' : 'white'),
          font: { weight: 'bold', size: 14 },
          align: 'center',
          anchor: (context) => (context.dataset.label === 'DOWNTIME' ? 'start' : 'center'), // Downtime aparece no topo da barra
          display: (context) => context.dataset.data[context.dataIndex] > 0.1,
        },
      },
    },
  };

  new Chart(ctx, config);
}
