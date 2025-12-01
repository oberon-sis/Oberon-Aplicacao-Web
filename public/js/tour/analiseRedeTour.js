const analiseRedeTourSteps = [
    {
       
        id: 'valor_pesquisa_maquina', 
        title: 'Passo 1/9: Seleção da Máquina',
        content:
            'Use este menu suspenso para escolher a máquina específica que deseja monitorar. Todos os dados (KPIs e gráficos) abaixo serão atualizados com as métricas de rede dessa máquina.',
        position: 'bottom',
    },
    {
     
        id: 'kpi-disponibilidade', 
        title: 'Passo 2/9: Disponibilidade de Rede (Uptime)',
        content:
            'Indica a porcentagem de tempo que a rede esteve operacional e acessível no período monitorado. É o indicador primário da saúde da conexão.',
        position: 'bottom',
    },
    {
    
        id: 'kpi-total-alertas', 
        title: 'Passo 3/9: Total de Alertas',
        content:
            'Mostra a quantidade total de notificações geradas por desvios nos limites configurados de uso de recursos ou falhas críticas na rede.',
        position: 'bottom',
    },
    {
        
        id: 'kpi-percentual-critico', 
        title: 'Passo 4/9: Jitter (Variação)',
        content:
            'O Jitter é a variação no tempo de chegada dos pacotes. Valores altos sugerem instabilidade e são prejudiciais para aplicações sensíveis como streaming e VoIP'
    },
    {
  
        id: 'kpi-Throughput', 
        title: 'Passo 5/9: Throughput',
        content:
            'Mede a quantidade real de dados transmitidos por segundo (MBps). Indica a capacidade útil da sua conexão de rede.',
        position: 'bottom',
    },
    {
       
        id: 'kpi-tempo-alertas', 
        title: 'Passo 6/9: Perda de Pacote',
        content:
            'Indica a porcentagem de pacotes de dados que não chegaram ao seu destino. A perda de pacotes causa interrupções e degradação na qualidade dos dados.',
        position: 'bottom',
    },
    {
        
        id: 'severityBarChart', 
        title: 'Passo 7/9: Análise da Média de Pacotes',
        content:
            'Este gráfico de barras exibe o volume médio de pacotes enviados e recebidos pela máquina. Use-o para diagnosticar o fluxo de tráfego e identificar gargalos.',
        position: 'top',
    },
    {
       
        id: 'throughput_24', 
        title: 'Passo 8/9: Histórico de Throughput (24h)',
        content:
            'Acompanhe a variação do Throughput ao longo das últimas 24 horas. Essencial para identificar padrões de uso e horários de queda ou sobrecarga da rede.',
        position: 'bottom',
    },
     {

      

        id: 'chart-ranking-rede',

        title: 'Passo 8/9: Ranking de Máquinas por Alertas',

        content:

            'Visualize rapidamente as Top 5 máquinas da empresa com o maior número de alertas de rede. Use esta visão para priorizar ações de manutenção.',

        position: 'top',

    },
    {
       
        id: 'acoes-recomendadas', 
        title: 'Passo 9/9: Ações Recomendadas',
        content:
            'Nesta seção, você encontrará sugestões práticas para corrigir problemas de rede com base nos alertas e métricas exibidos no dashboard, como reduzir latência e estabilizar jitter.',
        position: 'top',
    },
    
];



document.addEventListener('DOMContentLoaded', () => {
  if (typeof TourGuide !== 'undefined') {
    const analiseRedeTour = new TourGuide(analiseRedeTourSteps, {
      tourName: 'analiseRedeTour',
    });

    const startTourBtn = document.getElementById('start-tour-btn');

    if (startTourBtn) {
      startTourBtn.addEventListener('click', () => {
        analiseRedeTour.startTour();
      });
    }
  } else {
    console.warn('A classe TourGuide não foi encontrada. O tour não será inicializado.');
  }
});