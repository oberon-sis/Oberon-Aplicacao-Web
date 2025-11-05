// alertTrendChart.js - Finalizado e Otimizado para Dropdown de Botões

let alertTrendChartInstance = null;

// ATENÇÃO: A declaração de 'weeklyLabels' foi removida deste arquivo
// para corrigir o "SyntaxError: has already been declared".
// Ela deve existir em um script carregado ANTES deste.

// Mock de dados para simular a mudança de contexto
const MOCK_ALERT_DATA = {
'Total De Alertas': {
    labels: [35, 80, 135, 195, 260, 330, 400, 450, null, null, null, null],
    trendLine: [40, 109, 178, 247, 316, 385, 454, 520, 520+68.5, 520+68.5*2, 520+68.5*3, 520+68.5*4],
    prevBimestre: 520,   // KPI - Previsão Acumulada no final da tendência.
    metaBimestre: 450,   // KPI - Real Acumulado no último ponto.
    variacao: 15.6,      // Variação (520 vs 450).
    cor: '#0069afff',
},
  Crítico: {
    labels: [10, 12, 15, 16, 17, 18, 18, 19, null, null, null, null],
    trendLine: [9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
    prevBimestre: 31,
    metaBimestre: 50,
    variacao: 5.2,
    cor: '#e74c3c',
  },
  Atenção: {
    labels: [30, 32, 35, 38, 39, 40, 42, 45, null, null, null, null],
    trendLine: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52],
    prevBimestre: 52,
    metaBimestre: 120,
    variacao: 2.1,
    cor: '#f39c12',
  },
  Ocioso: {
    labels: [25, 24, 23, 18, 19, 18, 17, 16, null, null, null, null],
    trendLine: [21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
    prevBimestre: 10,
    metaBimestre: 80,
    variacao: -4.5, // Negativo = bom, está diminuindo
    cor: '#2ecc71',
  },
};

/**
 * Cria a função de callback do tooltip customizada.
 */
function createTooltipCallback(viewType) {
  return {
    label: function (context) {
      let label = context.dataset.label || '';
      let value = context.parsed.y.toFixed(0);

      if (label === 'Linha de previsão' || label === 'Previsão de Alertas') {
        label = `Previsão (${viewType}): `;
      } else {
        label += ': ';
      }
      return label + value;
    },
  };
}

/**
 * Atualiza o gráfico de tendência e os KPIs de previsão.
 * @param {string} viewType - A chave do MOCK_ALERT_DATA a ser usada (ex: 'Total De Alertas').
 */
function updateAlertTrendChart(viewType) {
  if (typeof weeklyLabels === 'undefined') {
    console.error('weeklyLabels não está definido. O gráfico pode falhar.');
    return;
  }

  const data = MOCK_ALERT_DATA[viewType];
  if (!data) return;

  // 1. ATUALIZAÇÃO DOS KPIS
  const txtPrevisaoAlertas = document.getElementById('txt_previsao_alertas');
  if (txtPrevisaoAlertas) txtPrevisaoAlertas.textContent = data.prevBimestre;

  const kpiPrevisaoValor = document.getElementById('kpi-previsao-valor');
  if (kpiPrevisaoValor && kpiPrevisaoValor.querySelector('p')) {
    kpiPrevisaoValor.querySelector('p').textContent =
      `Previsão Feita Para Este Bimestre: ${data.metaBimestre - 16}`;
  }

  const txtVariacaoLinear = document.getElementById('txt_variacao_linear');
  if (txtVariacaoLinear) {
    txtVariacaoLinear.textContent = `${data.variacao > 0 ? '+' : ''}${data.variacao}%`;
    txtVariacaoLinear.style.color =
      data.variacao < 0 ? '#2ecc71' : data.variacao > 0 ? '#e74c3c' : 'gray';
  }

  // 2. CONFIGURAÇÃO DOS DATASETS DO GRÁFICO
  const labels = weeklyLabels;

  const lineDataset = {
    label: 'Linha de previsão',
    data: data.trendLine,
    borderColor: data.cor,
    backgroundColor: data.cor.replace('1)', '0.2)'),
    type: 'line',
    borderDash: [4, 4],
    fill: false,
    tension: 0,
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 0,
  };

  const interactivePredictionPoints = {
    label: 'Previsão de Alertas',
    data: data.trendLine.map((value, index) => (index >= 8 ? value : null)),
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    type: 'scatter',
    pointRadius: 0,
    pointHitRadius: 10,
    showLine: true,
  };

  const actualAlertsDataset = {
    label: 'Alertas (Acumulado)',
    data: data.labels,
    borderColor: data.cor.replace('1)', '0.7)'),
    backgroundColor: data.cor,
    type: 'scatter',
    pointRadius: 5,
    pointHoverRadius: 7,
  };

  const datasets = [lineDataset, actualAlertsDataset, interactivePredictionPoints];

  // 3. ATUALIZAÇÃO OU CRIAÇÃO DO GRÁFICO
  if (alertTrendChartInstance) {
    alertTrendChartInstance.data.labels = labels;
    alertTrendChartInstance.data.datasets = datasets;
    alertTrendChartInstance.options.plugins.tooltip.callbacks.label =
      createTooltipCallback(viewType).label;
    alertTrendChartInstance.update();
  } else {
    const ctx = document.getElementById('alertTrendChart').getContext('2d');
    const config = {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            title: { display: true, text: 'Período Semanal (Bimestral)', font: { weight: 'bold' } },
          },
          y: {
            title: { display: true, text: 'Número de Alertas', font: { weight: 'bold' } },
            suggestedMin: 0,
          },
        },
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: createTooltipCallback(viewType),
            mode: 'nearest',
            intersect: false,
          },
          datalabels: {
            formatter: (value, context) =>
              context.dataset.label === 'Total de Alertas' ? value.toFixed(0) : null,
            color: 'black',
            anchor: 'end',
            align: 'top',
            offset: 8,
            font: { weight: 'bold', size: 10 },
          },
        },
      },
    };
    alertTrendChartInstance = new Chart(ctx, config);
  }
}

/**
 * Função de callback chamada pelos cliques nos itens do dropdown.
 * @param {string} valor - O data-value do item clicado (ex: 'Crítico').
 * @param {string} texto - O texto do item clicado (ex: 'Crítico').
 */
function atualizar_alerta_selecionado(valor, texto) {
  // 1. Atualiza o texto do botão
  const displaySpan = document.getElementById('valor_pesquisa_alerta');
  if (displaySpan) {
    displaySpan.textContent = texto;
  }

  // 2. Atualiza o gráfico
  updateAlertTrendChart(valor);
}

// --- INICIALIZAÇÃO E LISTENER DE EVENTOS (FINALIZADO) ---

window.onload = function () {
  // 1. Mapeamento dos Eventos de Clique no Dropdown de Alerta
  // Usa a classe 'dropdown-alerta-item' definida no HTML
  const itensAlerta = document.querySelectorAll('.dropdown-alerta-item');

  itensAlerta.forEach((item) => {
    item.addEventListener('click', function (event) {
      event.preventDefault();

      const valor = this.getAttribute('data-value');
      const texto = this.textContent.trim();

      // Chama a função central de atualização
      atualizar_alerta_selecionado(valor, texto);
    });
  });

  // 2. Inicialização do gráfico com o valor padrão: 'Total De Alertas'
  updateAlertTrendChart('Total De Alertas');
};
