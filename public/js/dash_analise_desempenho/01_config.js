let maquinaSelecionada = { nome: 'Todas as Máquinas', id: null };
let listaDeMaquinas = [];
let componenteSelecionado = null;

const usuarioString = sessionStorage.getItem('usuario');
const usuarioObjeto = usuarioString ? JSON.parse(usuarioString) : null;
let ID_EMPRESA = usuarioObjeto ? usuarioObjeto.fkEmpresa : 6; 

const HOJE = new Date();
const DATA_CRIACAO_EMPRESA = usuarioObjeto
  ? new Date(usuarioObjeto.DataCriacaoEmpresa)
  : new Date('2024-01-01');

const TEMPO_OPCOES_ORIGINAL = {
    comparar: [
        { value: 'HOJE', label: 'Hoje vs Ontem' },
        { value: 'SEMANA', label: 'Última semana vs Semana atual' },
        { value: 'MES', label: 'Último mês vs Mês atual' },
        { value: 'TRIMESTRE', label: 'Último trimestre vs Trimestre atual' },
        { value: 'SEMESTRE', label: 'Últimos Semestre vs Semestre atual' },
        { value: 'ANO', label: 'Último Ano vs Ano atual' },
    ],
    previsao: [
        { value: 'SEMANA_PROX', label: 'Próxima semana' },
        { value: 'MES_PROX', label: 'Último mês real vs Próximo mês previsto' },
        { value: 'TRIMESTRE_PROX', label: 'Próximos 3 meses' },
        { value: 'SEMESTRE_PROX', label: 'Próximos 6 meses' },
        { value: 'ANO_PROX', label: 'Próximo ano' },
    ],
    correlacao: [
        { value: '24H', label: 'Últimas 24 horas' },
        { value: 'SEMANA', label: 'Última semana' },
        { value: 'MES', label: 'Último mês' },
        { value: '3MESES', label: 'Últimos 3 meses' },
        { value: '6MESES', label: 'Últimos 6 meses' },
    ],
};

const getCompanyAgeInDays = (creationDate) => {
    const MS_POR_DIA = 1000 * 60 * 60 * 24;
    const diffTime = HOJE.getTime() - creationDate.getTime();
    return Math.ceil(diffTime / MS_POR_DIA);
};

const idadeEmpresaEmDays = getCompanyAgeInDays(DATA_CRIACAO_EMPRESA);

const MIN_IDADE_REQUERIDA_DIAS = {
    'HOJE': 2, 'SEMANA': 14, 'MES': 61, 'TRIMESTRE': 183, 'SEMESTRE': 365, 'ANO': 730,
    'SEMANA_PROX': 30, 'MES_PROX': 30, 'TRIMESTRE_PROX': 90, 'SEMESTRE_PROX': 183, 'ANO_PROX': 365,
    '24H': 1, 'SEMANA': 7, 'MES': 30, '3MESES': 90, '6MESES': 183
};

const formatToDateOnly = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); 
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getOptionValue = (periodValue, category) => {
    const dataFimPrevisao = new Date(HOJE); 
    const dataInicio = new Date(HOJE); 
    
    if (category === 'previsao' || category === "correlacao") {
        const dataInicioHistorico = new Date(HOJE);
        const periodoPrevisao = periodValue.split('_')[0]; 
        switch (periodoPrevisao) {
            case 'SEMANA':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 1);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
            case 'MES':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 1);
                dataFimPrevisao.setMonth(HOJE.getMonth() + 1);
                break;
            case 'TRIMESTRE':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 3);
                dataFimPrevisao.setMonth(HOJE.getMonth() + 3);
                break;
            case 'SEMESTRE':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 6);
                dataFimPrevisao.setMonth(HOJE.getMonth() + 6);
                break;
            case 'ANO':
                dataInicioHistorico.setFullYear(HOJE.getFullYear() - 1);
                dataFimPrevisao.setFullYear(HOJE.getFullYear() + 1);
                break;
        }

        const dadosPrevisao = {
            data_inicio_historico: formatToDateOnly(dataInicioHistorico),
            data_fim_previsao: formatToDateOnly(dataFimPrevisao)
        };
        return JSON.stringify(dadosPrevisao);
    }
    
    switch (periodValue) {
        case '24H':
        case 'HOJE':
            dataInicio.setDate(HOJE.getDate() - 1);
            return formatToDateOnly(dataInicio);
        case 'SEMANA':
            dataInicio.setDate(HOJE.getDate() - 7);
            return formatToDateOnly(dataInicio);
        case 'MES':
            dataInicio.setMonth(HOJE.getMonth() - 1);
            return formatToDateOnly(dataInicio);
        case '3MESES':
        case 'TRIMESTRE':
            dataInicio.setMonth(HOJE.getMonth() - 3);
            return formatToDateOnly(dataInicio);
        case '6MESES':
        case 'SEMESTRE':
            dataInicio.setMonth(HOJE.getMonth() - 6);
            return formatToDateOnly(dataInicio);
        case 'ANO':
            dataInicio.setFullYear(HOJE.getFullYear() - 1);
            return formatToDateOnly(dataInicio);
        default:
            return '';
    }
};

const shouldBeVisible = (optionValue) => { 
    const requiredDays = MIN_IDADE_REQUERIDA_DIAS[optionValue];
    return requiredDays === undefined || idadeEmpresaEmDays >= requiredDays;
};

const TEMPO_OPCOES = {};

for (const categoria in TEMPO_OPCOES_ORIGINAL) {
    if (Object.hasOwnProperty.call(TEMPO_OPCOES_ORIGINAL, categoria)) {
        TEMPO_OPCOES[categoria] = TEMPO_OPCOES_ORIGINAL[categoria]
            .filter(opcao => shouldBeVisible(opcao.value)) 
            .map(opcao => { 
                const optionValue = getOptionValue(opcao.value, categoria);
                return { label: opcao.label, value: optionValue };
            });
    }
}

const METRICAS = [
  { value: 'Uptime', label: 'Uptime', isAlert: false },
  { value: 'DownTime', label: 'DownTime', isAlert: false },
  { value: 'Total de Alertas', label: 'Todos os alertas', isAlert: true },
  { value: 'Alertas Criticos', label: 'Alertas Críticos', isAlert: true },
  { value: 'Alertas Atenção', label: 'Alertas Atenção', isAlert: true },
  { value: 'Alertas Osciosos', label: 'Alertas Ocioso', isAlert: true },
];

const COMPONENTES = [
  { value: 'RAM', label: 'RAM' },
  { value: 'CPU', label: 'CPU' },
  { value: 'DISCO', label: 'DISCO' },
  { value: 'REDE', label: 'REDE' },
];

const CORRELACAO_VARS = [
  { value: 'Total de Alertas', label: 'Todos os alertas', isAlert: true },
  { value: 'Alertas Criticos', label: 'Alertas Críticos', isAlert: true },
  { value: 'Alertas Atenção', label: 'Alertas Atenção', isAlert: true },
  { value: 'Alertas Osciosos', label: 'Alertas Ocioso', isAlert: true },
];

const mockData = {
  kpis: {},
  topMaquinas: [],
  agrupamento: null,
  analise_tipo: null,
  graficoData: {
    dataAnterior: [],
    dataAtual: [],
    dataFutura: [],
    labels_Data: [],
    labels_Data_Antiga: [],
  },
  iaMetricas: {
    interpretacao: [],
    chave_metricas: [],
  },
  tipo_de_modelo: null
};


    document.addEventListener("DOMContentLoaded", async () => {
        iniciarDashboard();

        try {
            /*
            const payloadGraficoInicial = {
                tipoAnalise: "comparar",
                dataInicio: "2025-10-23",
                dataPrevisao: "2025-11-23", 
                metricaAnalisar: "Total de Alertas",
                variavelRelacionada: null,
                fkEmpresa: ID_EMPRESA, 
                fkMaquina: null,
                componente: null,
            };*/
                const payloadGraficoInicial = {
                tipoAnalise: "comparar",
                dataInicio: "2025-10-23",
                dataPrevisao: "2025-11-23", 
                metricaAnalisar: "DownTime",
                variavelRelacionada: null,
                fkEmpresa: 1, 
                fkMaquina: null,
                componente: null,
            };

            const [dadosKpi, dadosGrafico] = await Promise.all([
                buscar_dados_kpi_tabela(ID_EMPRESA, '2025-10-23', null),
                buscar_dados_grafico(payloadGraficoInicial)
            ]);
            renderizarDados(mockData);

        } catch (erro) {
            console.error('Erro na inicialização do Dashboard:', erro);
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl, { trigger: 'focus', html: true });
        });
    });


    
function toggleInfoPanel(clickedButton) {
  const target = clickedButton.getAttribute('data-target');
  const contentContainers = ['interpretacoes-content', 'metricas-content'];
  const buttons = document.querySelectorAll('#info-tabs .toggle-button');
  contentContainers.forEach(id => {
    document.getElementById(id).classList.add('d-none');
  });

  buttons.forEach(button => {
    button.classList.remove('active');
    button.style.borderBottom = '2px solid transparent';
    button.style.color = '#6c757d';
  });

  document.getElementById(target + '-content').classList.remove('d-none');

  clickedButton.classList.add('active');
  clickedButton.style.borderBottom = '2px solid #000';
  clickedButton.style.color = '#000';
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    ID_EMPRESA = usuarioObjeto? usuarioObjeto.fkEmpresa: 6;
    const dados = await buscar_dados_kpi_tabela(ID_EMPRESA, '2025-10-01', null);
    mockData.kpis = dados.dados_kpis.kpis;
    mockData.topMaquinas = dados.dados_ranking;

    iniciarDashboard();
    renderizarDados(mockData); 

  } catch (erro) {
    console.error('Erro fatal ao iniciar dashboard (Falha no Fetch):', erro);
    iniciarDashboard();
  }
});


document.addEventListener('DOMContentLoaded', function () {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus',
      html: true,
    });
  });
});