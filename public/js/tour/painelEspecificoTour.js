// dashboard.js

// 1. Definição das Informações do Tour (Configuração)
const dashboardTourSteps = [
  {
    id: 'kpi-section',
    title: 'Passo 1/11: Visão Geral (KPIs)',
    content:
      'Esta primeira linha fornece um resumo instantâneo da saúde da máquina. Os valores atuais (em negrito) são sempre comparados com o desempenho do **Bimestre Passado**.',
    position: 'bottom',
  },

  {
    id: 'kpi-disponibilidade',
    title: 'Passo 2/11: Taxa de Disponibilidade',
    content:
      '**97% significa que a máquina esteve operacional quase todo o tempo.** Uma queda (seta vermelha) indica períodos de inatividade que precisam ser investigados.',
    position: 'right',
  },
  {
    id: 'kpi-total-alertas',
    title: 'Passo 3/11: Quantidade Total de Alertas',
    content:
      'O número absoluto de eventos registrados no período. **Se este número estiver crescendo, a máquina está gerando mais problemas.** O alvo é manter este valor o mais baixo possível.',
    position: 'right',
  },
  {
    id: 'kpi-percentual-critico',
    title: 'Passo 4/11: Porcentagem de Críticos',
    content:
      '**Esta é a métrica mais importante para a manutenção imediata.** Indica a proporção de alertas graves que exigem ação urgente (incidentes de Nível 1).',
    position: 'bottom',
  },
  {
    id: 'kpi-componente-critico',
    title: 'Passo 5/11: Componente Crítico',
    content:
      'Mostra o recurso que mais contribuiu para os alertas críticos neste bimestre (no momento, é a **RAM**). Use esta informação para direcionar a equipe técnica.',
    position: 'bottom',
  },
  {
    id: 'kpi-tempo-alertas',
    title: 'Passo 6/11: Tempo Médio Entre Alertas',
    content:
      'Mede a frequência com que os problemas ocorrem. **Um tempo menor (ex: 10min) significa que os alertas estão vindo muito rápido**, indicando instabilidade no sistema.',
    position: 'bottom',
  },
  {
    id: 'chart-comparativo-recurso',
    title: 'Passo 7/11: Comparativo de Alertas',
    content:
      'Este gráfico de barras detalha **onde os problemas estão ocorrendo (CPU, RAM, DISCO, REDE)** e se a situação está melhorando ou piorando (barras verde vs. cinza).',
    position: 'left',
  },
  {
    id: 'chart-uptime-downtime',
    title: 'Passo 8/11: Uptime / Downtime Semanal',
    content:
      '**Visualize o tempo exato de inatividade (Downtime) ao longo das semanas.** O objetivo é que as barras vermelhas sejam inexistentes e o valor de Uptime seja sempre 100%.',
    position: 'top',
  },
  {
    id: 'kpi-previsao-valor',
    title: 'Passo 9/11: Previsão de Alertas',
    content:
      '**KPI Preditivo:** Estima quantos alertas são esperados para o Próximo Bimestre (27). O valor de 100 é a meta que foi definida para o sistema.',
    position: 'top',
  },
  {
    id: 'kpi-variacao',
    title: 'Passo 10/11: Taxa de Variação (Tendência)',
    content:
      'Mostra a inclinação geral da linha de tendência de alertas. **Um valor positivo (ex: 3%) indica que o volume de alertas está crescendo ao longo do tempo.**',
    position: 'top',
  },
  {
    id: 'chart-tendencia',
    title: 'Passo 11/11: Tendência de Alertas',
    content:
      'Acompanhe a trajetória histórica dos problemas. **A linha tracejada azul (Previsão) mostra para onde os alertas estão caminhando** — se estiver subindo, prepare-se para mais trabalho.',
    position: 'top',
  },
  {
    id: 'select-variacao-alertas',
    title: 'Passo Opcional: Filtros',
    content:
      'Use o menu "Visualizar por Alerta" para mudar o foco dos dados, visualizando apenas Críticos, de Manutenção ou Informativos, para refinar sua análise.',
    position: 'bottom',
  },
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
