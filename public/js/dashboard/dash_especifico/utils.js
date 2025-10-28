// utils.js

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

// O NOVO ARRAY DE LABELS DE DATAS (Exportado)
const weeklyLabels = generateWeeklyLabels();

// --- REGISTRO GLOBAL DE PLUGINS (Se o plugin estiver sendo usado) ---
// É importante registrar o plugin uma vez, onde o código Chart.js é carregado.
// Se o ChartDataLabels é carregado separadamente, mantenha-o em um script de inicialização.
// Caso contrário, você pode movê-lo para cá, garantindo que o Chart.js já esteja carregado.
if (typeof ChartDataLabels !== 'undefined' && typeof Chart !== 'undefined') {
  Chart.register(ChartDataLabels);
}

// Inicializa a funcionalidade de Popovers do Bootstrap (se necessário)
function initializeBootstrap() {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus',
      html: true,
    });
  });
}
