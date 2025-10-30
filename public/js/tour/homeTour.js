const homeTourSteps = [
    {
        id: 'boas-vindas-card', 
        title: 'Passo 1/6: Bem-Vindo(a)!',
        content:
          'Este é o seu painel inicial. Ele foca em alertas imediatos. Vamos conhecer os principais pontos.',
        position: 'bottom',
    },
    {
        id: 'tour-card-desempenho-geral', 
        title: 'Passo 2/6: Visão Geral de Alertas (Top-Alerts)',
        content:
          "Os cards exibem as máquinas mais críticas ou em manutenção. O rótulo '+X' indica que mais de um recurso (CPU, RAM, Disco) está em alerta. Clique em 'Ver Detalhes' para diagnóstico.",
        position: 'bottom',
    },
    {
        id: 'acessar-painel-geral-button', // Se este for o ID do botão "Acessar painel geral"
        title: 'Passo 3/6: Painel Completo',
        content:
          'Use este botão verde para acessar o painel completo de monitoramento, onde você pode ver a lista de todas as máquinas e aplicar filtros.',
        position: 'bottom',
    },
    {
        id: 'tour-grafico-dispersao', 
        title: 'Passo 4/6: Distribuição de Recursos',
        content:
          'O gráfico compara o uso de CPU x RAM em relação aos limites de 50%. Máquinas no quadrante superior-direito estão em maior risco.',
        position: 'top',
    },
    {
        id: 'slack-card', 
        title: 'Passo 5/6: Alertas em Tempo Real',
        content:
          'Configure rapidamente sua integração com o Slack para receber notificações de status Crítico imediatamente.',
        position: 'left',
    },
    {
        id: 'acessos-rapidos-section', 
        title: 'Passo 6/6: Acessos Essenciais',
        content:
          'Nesta seção, você encontra o manual de instalação e o programa de monitoramento para garantir a cobertura de todas as suas máquinas.',
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
