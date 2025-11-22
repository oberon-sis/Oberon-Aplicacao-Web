const parametrosTourSteps = [
  {
    id: 'dropdownComponente',
    title: 'Passo 1/6: Seleção de Componente',
    content:
      'Use este dropdown para alternar entre CPU, RAM, Disco e Rede. Todos os gráficos e estatísticas serão atualizados automaticamente para o componente selecionado.',
    position: 'bottom',
  },
  {
    id: 'row-kpis',
    title: 'Passo 2/6: Estatísticas Principais',
    content:
      'Estes cards mostram as principais métricas estatísticas: Média de Uso, Desvio Padrão, Mediana, Total de Alertas no mês e percentual de Máquinas Críticas/Ociosas. Use os ícones de informação para entender melhor cada métrica.',
    position: 'bottom',
  },
  {
    id: 'containerBoxPlot',
    title: 'Passo 3/6: Box Plot - Distribuição de Uso',
    content:
      'O Box Plot mostra a distribuição estatística do uso do componente. Ele exibe quartis, mediana e outliers, permitindo identificar padrões e anomalias de forma visual.',
    position: 'top',
  },
  {
    id: 'containerDistribution',
    title: 'Passo 4/6: Histórico de Alertas',
    content:
      'Este gráfico de barras empilhadas mostra a evolução dos alertas por severidade nos últimos 6 meses. Identifique tendências e padrões sazonais no comportamento do sistema.',
    position: 'top',
  },
  {
    id: 'containerSidebar',
    title: 'Passo 5/6: Quartis e Percentis',
    content:
      'Estes valores dividem o conjunto de dados em partes iguais. Q1 (25%), Q3 (75%) e P90 (90%) são fundamentais para definir limites de alerta baseados em dados reais.',
    position: 'left',
  },
  {
    id: 'containerDefinicaoParametros',
    title: 'Passo 6/6: Definição de Parâmetros',
    content:
      'Visualize os parâmetros atuais de alerta (Crítico, Atenção, Normal e Ocioso) e clique neste botão para definir novos limites personalizados baseados nas estatísticas apresentadas.',
    position: 'top',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  if (typeof TourGuide !== 'undefined') {
    const parametrosTour = new TourGuide(parametrosTourSteps, {
      tourName: 'parametrosAnalysisTour',
    });

    const startTourBtn = document.getElementById('start-tour-btn');

    if (startTourBtn) {
      startTourBtn.addEventListener('click', () => {
        parametrosTour.startTour();
      });
    }
  } else {
    console.warn('A classe TourGuide não foi encontrada. O tour não será inicializado.');
  }
});
