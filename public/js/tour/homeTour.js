// 1. Definição das Informações do Tour
const homeTourSteps = [
  {
    id: 'tour-card-desempenho-geral',
    title: 'Passo 2/5: Visão Geral de Alertas',
    content:
      "Este card mostra as máquinas que estão em estado de Crítico ou Alerta. Clique em 'Ver Detalhes' em qualquer card para inspecionar uma máquina específica.",
    position: 'bottom',
  },
  {
    id: 'tour-grafico-dispersao',
    title: 'Passo 3/5: Distribuição de Recursos',
    content:
      'O gráfico principal compara o uso de duas métricas (ex: CPU vs. RAM) de todas as máquinas. Clique em um ponto para abrir o modal de detalhes e ver os limites ativos.',
    position: 'top',
  },
  {
    id: 'valor_pesquisa', // ID do SPAN dentro do dropdown
    title: 'Passo 4/5: Mudar o Contexto do Gráfico',
    content:
      "Use este menu para alternar entre as métricas, como 'Uso de CPU e RAM' ou 'Rede: Pacotes Enviados e Recebidos'.",
    position: 'left',
  },
  {
    id: 'acessos-rapidos-section',
    title: 'Passo 5/5: Acessos Rápidos',
    content:
      'Aqui estão os links e botões essenciais: baixe o Agente de Monitoramento, configure parâmetros e acesse guias rápidos.',
    position: 'left',
  },
];

document.addEventListener('DOMContentLoaded', () => {
  // Verifica se a classe TourGuide existe antes de instanciar
  if (typeof TourGuide !== 'undefined') {
    const homeTour = new TourGuide(homeTourSteps, {
      tourName: 'homePageTour', // Nome único para controle de localStorage
      // Exemplo de como iniciar o tour automaticamente se nunca foi visto:
      // autoStart: true,
    });

    // Se você tiver um botão manual para iniciar o tour:
    const startTourBtn = document.getElementById('start-tour-btn');
    if (startTourBtn) {
      startTourBtn.addEventListener('click', () => {
        homeTour.startTour();
      });
    }
  } else {
    console.warn('A classe TourGuide não foi encontrada. O tour não será inicializado.');
  }
});
