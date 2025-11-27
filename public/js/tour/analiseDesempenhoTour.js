// 1. Definição das Informações do Tour
const desempenhoTourSteps = [
    {
        id: 'kpi-row',
        title: 'Passo 1/12: Resumo Executivo (KPIs)',
        content:
            'Esta seção oferece um resumo das quatro métricas mais importantes para a saúde e desempenho das máquinas no período analisado.',
        position: 'bottom',
    },
    {
        id: 'kpi-uptime-card',
        title: 'Passo 2/12: Taxa de Disponibilidade (Uptime)',
        content:
            'Mede a porcentagem de tempo operacional. A variação (verde/vermelho) compara o valor atual com o período anterior, indicando melhoria ou queda.',
        position: 'right',
    },
    {
        id: 'kpi-alertas-card',
        title: 'Passo 3/12: Total de Alertas',
        content:
            'O número absoluto de eventos de alerta registrados. Um aumento contínuo na variação (em vermelho) sugere uma instabilidade crônica no sistema.',
        position: 'right',
    },
    {
        id: 'kpi-criticos-card',
        title: 'Passo 4/12: Alertas Críticos',
        content:
            'Foca apenas nos alertas de maior severidade(Crítico > Atenção > Ocioso). O objetivo é reduzir este número ao máximo, pois eles representam risco imediato de inatividade.',
        position: 'bottom',
    },
    {
        id: 'kpi-frequente-card',
        title: 'Passo 5/12: Métrica Mais Frequente',
        content:
            'Identifica o recurso (CPU, RAM, DISCO e REDE) que mais gerou alertas críticos. Use-o para direcionar a equipe técnica no diagnóstico.',
        position: 'bottom',
    },
    {
        id: 'filtro-toggler',
        title: 'Passo 6/12: Abrir/Fechar Filtros',
        content:
            'Clique aqui para visualizar ou esconder o painel completo de filtros. O filtro atual é exibido abaixo do título.',
        position: 'bottom',
    },
    {
        id: 'filtro-area-detalhe',
        title: 'Passo 7/12: Área de Filtragem',
        content:
            'Esta seção permite customizar completamente o gráfico principal (Tendência, Previsão, Correlação) e definir o período de análise.',
        position: 'bottom',
    },
    {
        id: 'selectTipoGrafico',
        title: 'Passo 8/12: Tipo de Análise',
        content:
            'Escolha entre  Tendência  (evolução no tempo),  Previsão  (projeção futura de dados) ou  Correlação  (relação entre duas variáveis).',
        position: 'bottom',
    },
    {
        id: 'selectMetricaPrincipal',
        title: 'Passo 9/12: Métrica Principal',
        content:
            'Defina qual variável será o foco do gráfico (ex: Taxa de Uptime, Total de Alertas, Taxa de downtime ...).',
        position: 'bottom',
    },
    {
        id: 'chart-area',
        title: 'Passo 10/12: Gráfico Principal de Análise',
        content:
            'Visualização detalhada da métrica selecionada. Pode ser uma linha do tempo (Tendência/Previsão) ou um gráfico de dispersão (Correlação).',
        position: 'top',
    },
    {
        id: 'interpretacoes-panel',
        title: 'Passo 11/12: Interpretações (Análise Preditiva)',
        content:
            'Para cada tipo de analise é gerado uma interpretação com IA, para uma boa análise são encaminhadas os dados do gráfico e das metricas',
        position: 'left',
    },
    {
        id: 'ranking-table',
        title: 'Passo 12/12: Ranking de Indisponibilidade',
        content:
            'Tabela que lista as máquinas com maior percentual de Downtime e as compara com o período anterior, indicando os principais alertas de cada uma.',
        position: 'top',
    },
];

document.addEventListener('DOMContentLoaded', () => {
    const desempenhoTour = new TourGuide(desempenhoTourSteps);

    const startTourBtn = document.getElementById('start-tour-btn');

    if (startTourBtn) {
        startTourBtn.addEventListener('click', () => {
            desempenhoTour.startTour();
        });
    }

});