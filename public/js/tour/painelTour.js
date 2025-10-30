const painelTourSteps = [
  {
    id: 'main-title-monitoramento',
    title: 'Passo 1/6: Monitoramento em Tempo Real',
    content:
      'Esta é a visão geral do seu ambiente. Use-a para monitorar o status atual e detalhado de todos os seus ativos.',
    position: 'bottom',
  },
  {
    id: 'tour-filtros-status',
    title: 'Passo 2/6: Filtros Rápidos de Status',
    content:
      'Use estes botões para filtrar rapidamente a lista de máquinas por status. O número ao lado do rótulo indica a quantidade de ativos naquela categoria.',
    position: 'bottom',
  },
  {
    id: 'tour-cards-container',
    title: 'Passo 3/6: Visão dos Ativos e Alertas',
    content:
      "Cada card representa um ativo. A cor e o ícone indicam a condição atual. Máquinas em 'Crítico' ou 'Atenção' requerem ação imediata.",
    position: 'right',
  },
  {
    id: 'tour-grafico-utilizacao',
    title: 'Passo 4/6: Histórico e Análise de Tendências',
    content:
      'Este gráfico exibe o histórico de utilização dos recursos (CPU, RAM, etc.) da máquina selecionada nas últimas 24 horas. Use o dropdown para alternar as métricas.',
    position: 'left',
  },
  {
    id: 'tour-indicadores-alertas',
    title: 'Passo 5/6: Indicadores de Alertas por Componente',
    content:
      "Aqui você vê o resumo de alertas por recurso. 'Pico de Uso' mostra o valor máximo atingido nas últimas 24h, essencial para dimensionamento.",
    position: 'top', 
  },
  {
    id: 'tour-info-maquina',
    title: 'Passo 6/6: Detalhes do Hardware e Capacidade',
    content:
      'Nesta seção, você encontra informações cruciais para a resolução de incidentes, incluindo o Modelo, IP de rede, a Quantidade de Núcleos do processador e o Total de Memória RAM do equipamento.',
    position: 'top',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  // A função configurar_parametro não existe nesta página, então não a incluímos.

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
