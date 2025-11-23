// dashboard.js

// 1. Definição das Informações do Tour (Configuração)
const dashboardTourSteps = [
  {
    id: 'kpi-section', 
    title: 'Passo 1/11: Resumo Executivo (KPIs)',
    content:
      'Esta primeira linha fornece um resumo instantâneo da saúde da Máquina-002 no bimestre. Os valores atuais (em negrito) são sempre comparados com o desempenho do período anterior.',
    position: 'bottom',
  },

  {
    id: 'kpi-disponibilidade',
    title: 'Passo 2/11: Taxa de Disponibilidade (SLA)',
    content:
      'Mede a porcentagem de tempo que a máquina esteve operacional. Uma queda em relação ao bimestre passado indica inatividade que precisa ser investigada.',
    position: 'right',
  },
  {
    id: 'kpi-total-alertas',
    title: 'Passo 3/11: Quantidade Total de Eventos',
    content:
      'O número absoluto de alertas registrados no período. O objetivo é manter este valor o mais baixo possível. Um aumento contínuo sugere instabilidade crônica.',
    position: 'right',
  },
  {
    id: 'kpi-percentual-critico',
    title: 'Passo 4/11: Proporção de Críticos',
    content: 'Esta é a métrica mais crítica: a proporção de alertas que são graves (Nível 1).',
    position: 'bottom',
  },
  {
    id: 'kpi-componente-critico',
    title: 'Passo 5/11: Foco do Problema',
    content:
      'Indica o recurso que mais contribuiu para os alertas críticos (neste caso, a RAM). Use esta informação para direcionar a equipe técnica no diagnóstico.',
    position: 'bottom',
  },
  {
    id: 'mainChart',
    title: 'Passo 6/11: Comparativo Detalhado de Recurso',
    content:
      'O gráfico de barras mostra a distribuição dos alertas por recurso (CPU, RAM, DISCO, REDE), comparando a situação atual (cor) com o bimestre anterior (cinza).',
    position: 'left',
  },
  {
    id: 'tabela-estatistica',
    title: 'Passo 8/11: Histórico de Uptime/Downtime',
    content:
      'Gráfico semanal que visualiza o tempo exato de inatividade (Downtime). O objetivo é que as barras vermelhas sejam inexistentes e o Uptime seja sempre 100%.',
    position: 'top',
  },
  {
    id: 'componentAlertsChart',
    title: 'Passo 9/11: Filtro de Visualização',
    content:
      'Use este menu para refinar a análise. Você pode mudar o foco dos dados, visualizando apenas Alertas Críticos, de Manutenção ou Informativos.',
    position: 'bottom',
  },
  {
    id: 'tabela-alertas',
    title: 'Passo 10/11: Previsão e Tendência',
    content:
      'O painel preditivo estima a quantidade de alertas esperados para o Próximo Bimestre (27), comparado com a meta. Use esta informação para planejamento.',
    position: 'top',
  }
];
document.addEventListener('DOMContentLoaded', () => {
  const dashboardTour = new TourGuide(dashboardTourSteps);

  const startTourBtn = document.getElementById('start-tour-btn');

  if (startTourBtn) {
    startTourBtn.addEventListener('click', () => {
      dashboardTour.startTour();
    });
  }
});
