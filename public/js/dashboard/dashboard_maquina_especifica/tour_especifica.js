// dashboard.js

// 1. Definição das Informações do Tour (Configuração)
const dashboardTourSteps = [
  {
    id: 'kpi-section', 
    title: 'Passo 1/8: Resumo Executivo (KPIs)',
    content:
      'Esta primeira linha fornece um resumo instantâneo da saúde da Máquina-002 no bimestre. Os valores atuais (em negrito) são sempre comparados com o desempenho do período anterior.',
    position: 'bottom',
  },

  {
    id: 'kpi-disponibilidade',
    title: 'Passo 2/8: Taxa de Disponibilidade (SLA)',
    content:
      'Mede a porcentagem de tempo que a máquina esteve operacional. Uma queda em relação ao bimestre passado indica inatividade que precisa ser investigada.',
    position: 'right',
  },
  {
    id: 'kpi-total-alertas',
    title: 'Passo 3/8: Quantidade Total de Eventos',
    content:
      'O número absoluto de alertas registrados no período. O objetivo é manter este valor o mais baixo possível. Um aumento contínuo sugere instabilidade crônica.',
    position: 'right',
  },
  {
    id: 'kpi-percentual-critico',
    title: 'Passo 4/8: Proporção de Críticos',
    content: 'Esta é a métrica mais crítica: a proporção de alertas que são graves (Nível 1).',
    position: 'bottom',
  },
  {
    id: 'kpi-componente-critico',
    title: 'Passo 5/8: Foco do Problema',
    content:
      'Indica o recurso que mais contribuiu para os alertas críticos (neste caso, a RAM). Use esta informação para direcionar a equipe técnica no diagnóstico.',
    position: 'bottom',
  },
  {
    id: 'garfico-linhas',
    title: 'Passo 6/8: Comparativo Detalhado de Recurso',
    content:
      'O gráfico de barras mostra a distribuição dos alertas por recurso (CPU, RAM, DISCO, REDE), comparando a situação atual (cor) com o bimestre anterior (cinza).',
    position: 'left',
  },
  {
    id: 'grafico-barras',
    title: 'Passo 7/8: Histórico de Uptime/Downtime',
    content:
      'Gráfico semanal que visualiza o tempo exato de inatividade (Downtime). O objetivo é que as barras vermelhas sejam inexistentes e o Uptime seja sempre 100%.',
    position: 'top',
  },
  {
    id: 'tabela-eventos',
    title: 'Passo 8/8: Filtro de Visualização',
    content:
      'Use este menu para refinar a análise. Você pode mudar o foco dos dados, visualizando apenas Alertas Críticos, de Manutenção ou Informativos.',
    position: 'bottom',
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
