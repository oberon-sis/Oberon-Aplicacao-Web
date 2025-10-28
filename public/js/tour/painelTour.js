// painel_tour.js - Usando a mesma estrutura de inicialização do seu home.html

// 1. Definição das Informações do Tour (Usando os IDs que definimos no painel.html)
const painelTourSteps = [
  {
    id: 'titleh2',
    title: 'Passo 1/6: Monitoramento em Tempo Real',
    content:
      'Esta página é o coração do monitoramento. Ela mostra o status atual e detalhado de todos os seus ativos.',
    position: 'bottom',
  },
  {
    id: 'tour-filtros-status',
    title: 'Passo 2/6: Filtros de Status Rápido',
    content:
      'Use estes botões para filtrar rapidamente as máquinas por status: Crítico, Atenção, Ocioso, OFF-LINE e Manutenção.',
    position: 'bottom',
  },
  {
    id: 'tour-cards-container',
    title: 'Passo 3/6: Visão dos Ativos',
    content:
      "Cada card representa uma máquina. A cor do botão 'Ver Detalhes' e o ícone de status indicam a condição atual do ativo.",
    position: 'right',
  },
  {
    id: 'tour-grafico-utilizacao',
    title: 'Passo 4/6: Histórico e Tendências',
    content:
      'Este gráfico exibe o histórico de utilização dos recursos da máquina selecionada nas últimas 24 horas. Use o dropdown acima para filtrar por componente.',
    position: 'left',
  },
  {
    id: 'tour-indicadores-alertas',
    title: 'Passo 5/6: Indicadores de Alertas',
    content:
      "Aqui você vê o resumo de alertas por componente. 'Últimas 24h' mostra a frequência e 'Ativos' mostra os problemas atuais que precisam de investigação.",
    position: 'top',
  },
  {
    id: 'tour-info-maquina',
    title: 'Passo 6/6: Detalhes do Hardware',
    content:
      'Encontre informações cruciais sobre o hardware da máquina selecionada, como Modelo, IP e Sistema Operacional.',
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
