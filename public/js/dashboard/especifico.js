// A data de referência para o início do nosso bimestre simulado (8 semanas atrás)
const START_DATE_REFERENCE = new Date(2025, 8, 7); // 7 de Setembro de 2025 (mês 8 é Setembro)

/**
 * Gera um array de 12 labels de data (Dia/Mês - Dia/Mês)
 * usando o formato conciso solicitado (DD/MÊS).
 */
function generateWeeklyLabels() {
  const labels = [];
  let currentDate = new Date(START_DATE_REFERENCE);

  // Array de nomes curtos dos meses em português
  const meses = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ];

  for (let i = 0; i < 12; i++) {
    let startDate = new Date(currentDate);
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Função auxiliar para formatar a data como DD/MÊS
    const formatDayMonth = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = meses[date.getMonth()];
      return `${day}/${month}`;
    };

    const startStr = formatDayMonth(startDate);
    const endStr = formatDayMonth(endDate);

    // Criamos o rótulo: DD/MÊS - DD/MÊS
    labels.push(`${startStr} - ${endStr}`);

    // Avança para a próxima semana
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return labels;
}

// O NOVO ARRAY DE LABELS DE DATAS
const weeklyLabels = generateWeeklyLabels();

// --- REGISTRO GLOBAL DE PLUGINS (Mantido) ---
if (typeof ChartDataLabels !== 'undefined') {
  Chart.register(ChartDataLabels);
}

// --- FUNÇÃO PARA INICIALIZAR GRÁFICO RADAR (Mantida) ---
function initIncidentRadarChart() {
  const ctx = document.getElementById('incidentRadarChart').getContext('2d');
  // ... (o conteúdo da função permanece o mesmo)
  const labels = ['REDE', 'RAM', 'CPU', 'DISCO'];

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Ocioso',
        data: [1, 1, 3, 0],
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderColor: 'rgba(0, 0, 0, 1)',
        pointBackgroundColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Crítico',
        data: [2, 10, 12, 1],
        backgroundColor: 'rgba(220, 20, 60, 0.23)',
        borderColor: 'rgb(220, 20, 60)',
        pointBackgroundColor: 'rgb(220, 20, 60)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Atenção',
        data: [3, 7, 10, 4],
        backgroundColor: 'rgba(255, 166, 0, 0.23)',
        borderColor: 'rgb(255, 165, 0)',
        pointBackgroundColor: 'rgba(255, 166, 0, 0.66)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const config = {
    type: 'radar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
          grid: { color: 'rgba(0,0,0,0.1)' },
          suggestedMin: 0,
          suggestedMax: 14,
          ticks: { backdropColor: 'transparent' },
        },
      },
      plugins: {
        legend: { position: 'left' },
        datalabels: {
          font: { weight: 'bold', size: 16 },
        },
      },
    },
  };

  new Chart(ctx, config);
}

// --- FUNÇÃO DE BARRAS (Uptime e Downtime Semanal) ---
function initUptimeDowntimeChart() {
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
        x: { stacked: true },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: false },
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
            return `\n  ${percentage}%\n (${hours}h)`;
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
function initAlertTrendChart() {
  const ctx = document.getElementById('alertTrendChart').getContext('2d');

  const labels = weeklyLabels;

  // Dados reais (scatter dots - 8 semanas passadas)
  const actualAlerts = [65, 68, 70, 72, 75, 76, 78, 80, null, null, null, null];
  // Linha de Previsão: Contínua e linear (12 pontos)
  const trendLineData = [60, 64, 68, 72, 76, 80, 84, 88, 92, 96, 98, 100];

  // Dataset que desenha a linha de previsão
  const lineDataset = {
    label: 'Linha de previsão',
    data: trendLineData,
    borderColor: '#007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    type: 'line',
    borderDash: [4, 4],
    fill: false,
    tension: 0,
    borderWidth: 2,
    pointRadius: 0, // Pontos invisíveis por padrão
    pointHoverRadius: 0,
  };

  // Dataset que desenha a camada de interatividade para a previsão
  // Este é o truque para fazer o tooltip funcionar sobre a linha futura.
  const interactivePredictionPoints = {
    label: 'Previsão de Alertas',
    data: trendLineData.map((value, index) => {
      // Só queremos interatividade para as semanas futuras (index 8 em diante)
      if (index >= 8) {
        // Para habilitar o tooltip, o ponto precisa existir
        return value;
      }
      return null; // Pontos do passado são ignorados
    }),
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    type: 'scatter',
    pointRadius: 0, // O ponto é invisível
    pointHitRadius: 10, // A área de clique é grande (10px)
    // ESSENCIAL: Permite que o tooltip interaja com pontos null/indefinidos
    showLine: true, // Garante que a área de acerto da linha seja considerada
  };

  const data = {
    labels: labels,
    datasets: [
      lineDataset, // 1. Linha de Previsão (visual)
      {
        label: 'Total de Alertas', // 2. Pontos Scatter do Passado
        data: actualAlerts,
        borderColor: '#0C8186',
        backgroundColor: '#0C8186',
        type: 'scatter',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      interactivePredictionPoints, // 3. Pontos Scatter Invisíveis (interatividade futura)
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Habilita a interação com múltiplos datasets ao mesmo tempo
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            // Customiza o rótulo do tooltip para garantir que o valor seja exibido corretamente
            label: function (context) {
              let label = context.dataset.label || '';
              let value = context.parsed.y.toFixed(0); // Arredonda para inteiro

              // Garante que a linha de previsão mostre a label correta
              if (label === 'Linha de previsão') {
                label = 'Previsão: ';
              } else if (label === 'Previsão de Alertas') {
                label = 'Previsão: ';
              } else {
                label += ': ';
              }

              return label + value;
            },
          },
          // ESSENCIAL: Mantém o tooltip ativo ao passar o mouse sobre a área de acerto
          mode: 'nearest',
          intersect: false,
        },
        datalabels: {
          // Mantendo o datalabels para os pontos scatter do passado
          formatter: (value, context) => {
            if (context.dataset.label === 'Total de Alertas') {
              return value.toFixed(0);
            }
            return null;
          },
          color: 'black',
          anchor: 'end',
          align: 'top',
          offset: 8,
          font: {
            weight: 'bold',
            size: 10,
          },
        },
      },
    },
  };

  new Chart(ctx, config);
}

// --- CHAMADA DE INICIALIZAÇÃO GERAL (Mantida) ---
document.addEventListener('DOMContentLoaded', function () {
  // initIncidentRadarChart();
  initUptimeDowntimeChart();
  initAlertTrendChart();

  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus',
      html: true,
    });
  });
});
