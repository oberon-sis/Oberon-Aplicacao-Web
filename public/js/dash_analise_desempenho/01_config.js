let maquinaSelecionada = { nome: 'Todas as Máquinas', id: null };
let listaDeMaquinas = [];
let componenteSelecionado = null;

const usuarioString = sessionStorage.getItem('usuario');
const usuarioObjeto = usuarioString ? JSON.parse(usuarioString) : null;
let ID_EMPRESA = usuarioObjeto ? usuarioObjeto.fkEmpresa : 6; 

const HOJE = new Date;
const DATA_CRIACAO_EMPRESA = usuarioObjeto
  ? new Date(usuarioObjeto.DataCriacaoEmpresa)
  : new Date('2024-01-01');

console.log("empresa data: ",DATA_CRIACAO_EMPRESA)

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
        { value: '24HCor', label: 'Últimas 24 horas' },
        { value: 'SEMANACor', label: 'Última semana' },
        { value: 'MESCor', label: 'Último mês' },
        { value: '3MESESCor', label: 'Últimos 3 meses' },
        { value: '6MESESCor', label: 'Últimos 6 meses' },
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
        console.log(category)
        console.log(periodoPrevisao)
        switch (periodoPrevisao) {
           case '24HCor':
                dataInicioHistorico.setDate(HOJE.getDate() - 1);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
            case '3MESESCor':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 3);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
            case 'MESCor':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 1);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
           case '6MESESCor':
                dataInicioHistorico.setMonth(HOJE.getMonth() - 6);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
            case 'SEMANACor':
                dataInicioHistorico.setDate(HOJE.getDate() - 7);
                dataFimPrevisao.setDate(HOJE.getDate() + 7);
                break;
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
    
    console.log(category)
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

const METRICAS_USO = [
  { value: 'Uso RAM', label: 'Uso Médio RAM (%)', isAlert: false },
  { value: 'Uso CPU', label: 'Uso Médio CPU (%)', isAlert: false },
  { value: 'Uso DISCO', label: 'Uso Médio Disco (%)', isAlert: false },
  { value: 'Uso REDE', label: 'Uso Médio Rede (%)', isAlert: false },
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
  tipo_de_modelo: null,
  linha_regressao:[]
};


    document.addEventListener("DOMContentLoaded", async () => {
        iniciarDashboard();

            /*
            const payloadGraficoInicial = {
                tipoAnalise: "comparar",
                dataInicio: "2025-09-23",
                dataPrevisao: "2025-11-25", 
                metricaAnalisar: "Total de Alertas",
                variavelRelacionada: null,
                fkEmpresa: 2, 
                fkMaquina: null,
                componente: null,
            };
            };*/
        toggleSkeleton(true); 
        const dataInicioObjeto = new Date(HOJE);
        const dataFinalObjeto = new Date(HOJE);

        dataInicioObjeto.setMonth(HOJE.getMonth() - 1);
        dataFinalObjeto.setMonth(HOJE.getMonth() + 1);

        const data_inicio = formatToDateOnly(dataInicioObjeto);
        const data_final = formatToDateOnly(dataFinalObjeto);

        try {
            const payloadGraficoInicial = {
                tipoAnalise: "comparar",
                dataInicio: data_inicio,
                dataPrevisao: data_final, 
                metricaAnalisar: "Total de Alertas",
                variavelRelacionada: null,
                fkEmpresa: ID_EMPRESA, 
                fkMaquina: null,
                componente: null,
            };
            document.getElementById('selectTipoGrafico').value = "comparar";
            document.getElementById('selectMetricaPrincipal').value = "Total de Alertas";
            document.getElementById('selectTempo').value = data_inicio;

            console.log(payloadGraficoInicial)

            const [dadosKpi, dadosGrafico] = await Promise.all([
                buscar_dados_kpi_tabela(ID_EMPRESA, data_inicio, null),
                buscar_dados_grafico(payloadGraficoInicial)
            ]);
            
            renderizarDados(mockData);

        } catch (erro) {
            console.error('Erro na inicialização do Dashboard:', erro);
        } finally {
            toggleSkeleton(false);
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
    
    const contentIds = ['interpretacoes-content', 'metricas-content'];
    contentIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('d-none');
    });

    const targetContent = document.getElementById(target + '-content');
    if (targetContent) targetContent.classList.remove('d-none');

    const buttons = document.querySelectorAll('#info-tabs .nav-link-custom'); 
    
    buttons.forEach(btn => {
        btn.classList.remove('active'); 
        btn.style.borderBottom = ''; 
        btn.style.color = '';
    });

    clickedButton.classList.add('active');
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    ID_EMPRESA = usuarioObjeto? usuarioObjeto.fkEmpresa: 6;
    const dados = await buscar_dados_kpi_tabela(ID_EMPRESA, '2025-10-01', null);
    mockData.kpis = dados.dados_kpis.kpis;
    mockData.topMaquinas = dados.dados_ranking;

    iniciarDashboard();
    renderizarDados(mockData, () => {
            setTimeout(() => {
                toggleSkeleton(false);
            }, 100);
        });

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
function openSubModal(modalToOpenId, modalToCloseId) {
    const modalToCloseEl = document.querySelector(modalToCloseId);
    const modalToClose = bootstrap.Modal.getInstance(modalToCloseEl);

    if (modalToClose) {
        modalToClose.hide();
        modalToCloseEl.addEventListener('hidden.bs.modal', function tempHandler() {
        const modalToOpen = new bootstrap.Modal(document.querySelector(modalToOpenId));
        modalToOpen.show();
        modalToCloseEl.removeEventListener('hidden.bs.modal', tempHandler);
    });
    } else {
        const modalToOpen = new bootstrap.Modal(document.querySelector(modalToOpenId));
        modalToOpen.show();
    }
}

function ativarModoAnalise(modo) {
    const modais = ['#mainModal', '#comparacaoModal', '#previsaoModal', '#correlacaoModal'];
    modais.forEach(id => {
        const el = document.querySelector(id);
        const instance = bootstrap.Modal.getInstance(el);
        if (instance) instance.hide();
    });
    const select = document.getElementById('selectTipoGrafico');
    if (select) {
        select.value = modo;
        select.dispatchEvent(new Event('change'));

        if(typeof toggleFilterFields === 'function') {
        aplicarFiltro()
        toggleFilterFields();
        }
    }
    const filterCollapse = document.getElementById('filterCollapse');
        if (filterCollapse && !filterCollapse.classList.contains('show')) {
            new bootstrap.Collapse(filterCollapse, { toggle: false }).show();
            const togglerIcon = document.querySelector('#filtro-toggler i');
        if(togglerIcon) {
            togglerIcon.classList.remove('bi-caret-down-fill');
            togglerIcon.classList.add('bi-caret-up-fill');
        }
    }
}

  function exibirToast(icone, texto) {
    const COR_DE_FUNDO = '#1a1a1a';
    const COR_DO_ICONE = 'white';
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: COR_DE_FUNDO,
      iconColor: COR_DO_ICONE,
      color: COR_DO_ICONE,

      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
    Toast.fire({
      icon: icone,
      title: texto,
    });
  }