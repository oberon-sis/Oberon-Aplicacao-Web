const painelTourSteps = [
  {
    id: 'header-top',
    title: 'Passo 1/6: Monitoramento em Tempo Real',
    content:
      'Esta é a visão geral do seu ambiente. Use-a para monitorar o status atual e detalhado de todos os seus ativos.',
    position: 'bottom',
  },
  {
    id: 'filter-group-row',
    title: 'Passo 2/6: Filtros Rápidos de Status',
    content:
      'Use estes botões para filtrar rapidamente a lista de máquinas por status. O número ao lado do rótulo indica a quantidade de ativos naquela categoria.',
    position: 'bottom',
  },
  {
    id: 'resource-cards',
    title: 'Passo 3/6: Visão dos Ativos e Alertas',
    content:
      "Cada card representa um ativo. A cor e o ícone indicam a condição atual. Máquinas em 'Crítico' ou 'Atenção' requerem ação imediata.",
    position: 'right',
  },
  {
    id: 'chart-container',
    title: 'Passo 4/6: Histórico e Análise de Tendências',
    content:
      'Este gráfico exibe o histórico de utilização dos recursos (CPU, RAM, Disco e Rede) da máquina selecionada. Use o dropdown acima para alternar entre os componentes. A rede é medida em Mbps, os demais em porcentagem.',
    position: 'left',
  },
  {
    id: 'indicators-grid',
    title: 'Passo 5/6: Indicadores de Alertas e Pico de Uso',
    content:
      "Aqui você vê o resumo de alertas por componente nas últimas 24h. 'Pico de Uso' mostra o valor máximo atingido, essencial para dimensionamento e identificação de gargalos.",
    position: 'top',
  },
  {
    id: 'details-info',
    title: 'Passo 6/6: Informações do Hardware',
    content:
      'Nesta seção, você encontra informações detalhadas do equipamento: à esquerda, dados gerais (Modelo, IP, Sistema Operacional); à direita, capacidades dos componentes (CPU, RAM e Disco).',
    position: 'top',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  // Verifica se a classe TourGuide existe antes de instanciar
  if (typeof TourGuide !== 'undefined') {
    const painelTour = new TourGuide(painelTourSteps, {
      tourName: 'painelMonitoramentoTour', // Nome único para controle de localStorage
      // autoStart: true, // Descomente se quiser que inicie automaticamente
    });

    // Se você tiver um botão manual para iniciar o tour:
    // O botão é injetado pelo TourGuide.js, então pegamos ele por ID.
    const startTourBtn = document.getElementById('start-tour-btn');

    if (startTourBtn) {
      startTourBtn.addEventListener('click', () => {
        painelTour.startTour();
      });
    }
  } else {
    console.warn('A classe TourGuide não foi encontrada. O tour não será inicializado.');
  }
});
