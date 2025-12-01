// dashboard.js

// 1. Definição das Informações do Tour (Configuração)
const dashboardTourSteps = [
  {
    id: 'kpi-section',
    title: 'Passo 1/8: Resumo Executivo (KPIs)',
    content:
      'Esta primeira linha (KPIs) fornece um resumo instantâneo da saúde da máquina. Os valores em destaque são comparados com o desempenho do período anterior para avaliar tendências.',
    position: 'bottom',
  },

  {
    id: 'kpi-disponibilidade',
    title: 'Passo 2/8: Taxa de Disponibilidade (SLA)',
    content:
      'Mostra o tempo total em que o sistema esteve operacional e acessível neste período. É crucial para medir a confiabilidade e evitar paralisações.',
    position: 'right',
  },
  {
    id: 'kpi-total-alertas',
    title: 'Passo 3/8: Quantidade Total de Eventos',
    content:
      'Indica o número total de eventos de alerta (Crítico, Alto, Médio, Baixo) gerados no período. Use para monitorar o nível de ruído e a frequência de problemas.',
    position: 'right',
  },
  {
    id: 'kpi-percentual-critico',
    title: 'Passo 4/8: Proporção de Críticos',
    content:
      'Apresenta a porcentagem de todos os alertas que foram classificados como Críticos. Essencial para priorizar a atenção nos problemas de maior impacto.',
    position: 'bottom',
  },
  {
    id: 'kpi-componente-critico',
    title: 'Passo 5/8: Foco do Problema',
    content:
      'Identifica o recurso (RAM, CPU, Disco, Rede) que gerou o maior número de alertas Críticos. Ajuda a direcionar rapidamente as ações de correção de causa raiz.',
    position: 'bottom',
  },
  {
    id: 'garfico-linhas',
    title: 'Passo 6/8: Utilização Média de Recursos (Tendência)',
    content:
      'Exibe a variação da utilização dos principais recursos (CPU, RAM, DISCO) ao longo do tempo. Permite visualizar tendências e identificar picos de consumo.',
    position: 'left',
  },
  {
    id: 'grafico-barras',
    title: 'Passo 7/8: Total de Alertas por Componente (30 Dias)',
    content:
      'Gráfico de barras que mostra qual componente gerou mais alertas nos últimos 30 dias. Excelente para entender a distribuição de falhas e planejar melhorias de capacidade.',
    position: 'top',
  },
  {
    id: 'tabela-eventos',
    title: 'Passo 8/8: Últimos Eventos de Alerta (24h)',
    content:
      'Tabela com os alertas mais recentes, incluindo Hora, Componente, Tipo e Valor exato do recurso. Essencial para a análise imediata e confirmação dos alertas mais urgentes.',
    position: 'top',
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
