// =========================================================================
// 1. ESTADO GLOBAL DO PAINEL (Controle de Filtros e Paginação)
// =========================================================================
const estadoPainel = {
    paginaAtual: 1,
    itensPorPagina: 6,
    filtroStatus: '', // Vazio traz todos
    termoBusca: '',
    idEmpresa: sessionStorage.ID_EMPRESA || 2 // Pega da sessão ou usa default
};

// Mapeamento de Status do Banco para Classes do Bootstrap (Visual)
// Atualizado com 'PENDENTE' conforme solicitado
const mapaStatusVisual = {
    'CRITICO':    { cor: 'danger',  texto: 'CRÍTICO' },
    'ATENCAO':    { cor: 'warning', texto: 'ATENÇÃO' },
    'NORMAL':     { cor: 'success', texto: 'ONLINE' },
    'OCIOSO':     { cor: 'info',    texto: 'OCIOSO' },
    'OFFLINE':    { cor: 'secondary', texto: 'OFF-LINE' },
    'MANUTENCAO': { cor: 'dark',    texto: 'MANUTENÇÃO' },
    'PENDENTE':   { cor: 'secondary', texto: 'PENDENTE' }
};

// =========================================================================
// 2. CONSUMO DE DADOS DINÂMICOS
// =========================================================================

// Atualiza os números nos botões de filtro (Todas: 6, Crítico: 1...)
async function atualizarContadoresFiltros() {
    try {
        const response = await fetch('/painel/procurar_dados_iniciais_painel', {
            method: 'GET',
            headers: {
                'id-empresa': estadoPainel.idEmpresa
            }
        });

        if (!response.ok) return;
       
        const data = await response.json();
        const contagem = data.dados_filtros[0];

        if(contagem) {
            // Atualiza os badges dos botões
            const updateBadge = (filtro, valor) => {
                const el = document.querySelector(`[data-filtro="${filtro}"] .badge`);
                if(el) el.textContent = valor || 0;
            };

            updateBadge('todas', contagem.Todas);
            updateBadge('critico', contagem.Critico);
            updateBadge('atencao', contagem.Atencao);
            updateBadge('normal', contagem.Normal);
            updateBadge('ocioso', contagem.Ocioso);
            updateBadge('offline', contagem.Offline);
            updateBadge('manutencao', contagem.Manutencao);
            // Caso sua view retorne 'Pendente', adicione aqui. Se não, ficará 0.
            updateBadge('pendente', contagem.Pendente);
        }
    } catch (error) {
        console.error("Erro ao atualizar contadores:", error);
    }
}

// Busca os Cards Dinâmicos (Procedure sp_listar_maquinas_filtradas)
async function carregarCards() {
    const loader = document.getElementById('loading-spinner');
    const container = document.getElementById('cards-container');
   
    if(loader) loader.classList.remove('d-none');
    if(container) container.innerHTML = '';

    try {
        // Configuração dos Headers conforme seu Postman
        const myHeaders = new Headers();
        myHeaders.append("id-empresa", estadoPainel.idEmpresa);
        myHeaders.append("pagina-atual", estadoPainel.paginaAtual);
        myHeaders.append("tamanho-pagina", estadoPainel.itensPorPagina);
       
        // Só adiciona se tiver valor
        if (estadoPainel.filtroStatus) myHeaders.append("status-filtro", estadoPainel.filtroStatus);
        if (estadoPainel.termoBusca) myHeaders.append("nome-busqueda", estadoPainel.termoBusca);

        const response = await fetch('/painel/procurar_cards_painel_dinamico', {
            method: 'GET',
            headers: myHeaders
        });

        if (!response.ok) throw new Error("Erro na API de Cards");

        const data = await response.json();
        renderizarCards(data.dados_card); // Array de máquinas vindo do Back
        atualizarPaginacao(data.dados_card ? data.dados_card.length : 0);

    } catch (error) {
        console.error("Erro ao carregar cards:", error);
        if(container) container.innerHTML = `<p class="text-center text-muted mt-4">Nenhuma máquina encontrada ou erro de conexão.</p>`;
    } finally {
        if(loader) loader.classList.add('d-none');
    }
}

// =========================================================================
// 3. RENDERIZAÇÃO
// =========================================================================

function renderizarCards(listaMaquinas) {
    const container = document.getElementById('cards-container');
   
    if (!listaMaquinas || listaMaquinas.length === 0) {
        container.innerHTML = `<div class="alert alert-light text-center m-4">Nenhum resultado encontrado.</div>`;
        return;
    }

    let html = '';
   
    listaMaquinas.forEach(maq => {
        // Usa as cores vindas do banco ou fallback
        const cor = maq.cor_classe || 'secondary';
        const icone = maq.icone_classe || 'bi-hdd';

        html += `
        <div class="card card-recurso mb-3 shadow-sm" data-maquina-id="${maq.idMaquina}" style="border-left: 5px solid var(--bs-${cor});">
            <div class="card-body p-3 d-flex flex-column h-100">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title h6 mb-0 fw-bold text-dark text-truncate" title="${maq.NomeMaquina}">${maq.NomeMaquina}</h5>
                    <i class="bi ${icone} text-${cor} fs-5"></i>
                </div>

                <p class="card-text mb-1">
                    <small class="text-${cor} fw-bold text-uppercase">${maq.StatusMaquinaRaw}</small>
                </p>
               
                <p class="card-text mb-2 text-truncate" title="${maq.StatusAlerta}">
                    <small class="text-${cor}">${maq.StatusAlerta}</small>
                </p>

                <div class="bg-light p-2 rounded mb-3 border-start border-3 border-${cor} flex-grow-1">
                    <p class="mb-0 small text-secondary fw-semibold">
                        ${maq.MetricaUso}
                    </p>
                    <p class="mb-0 small text-muted fst-italic" style="font-size: 0.75rem;">
                        ${maq.DetalheStatus}
                    </p>
                </div>

                <button type="button" class="btn btn-${cor} btn-sm w-100 fw-bold mt-auto"
                    onclick="trocar_maquina(${maq.idMaquina})">
                    <i class="bi bi-activity me-1"></i> Ver Detalhes
                </button>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

// =========================================================================
// 4. CONTROLES (Paginação e Filtros)
// =========================================================================

function atualizarPaginacao(qtdItensRetornados) {
    const spanPagina = document.getElementById('span-pagina-atual');
    if(spanPagina) spanPagina.innerText = estadoPainel.paginaAtual;
   
    const btnAnt = document.getElementById('btn-pag-anterior');
    if(btnAnt) {
        if (estadoPainel.paginaAtual <= 1) btnAnt.classList.add('disabled');
        else btnAnt.classList.remove('disabled');
    }

    const btnProx = document.getElementById('btn-pag-proximo');
    if(btnProx) {
        // Se retornou menos itens que o limite, significa que é a última página
        if (qtdItensRetornados < estadoPainel.itensPorPagina) btnProx.classList.add('disabled');
        else btnProx.classList.remove('disabled');
    }
}

function mudarPagina(direcao) {
    const novaPagina = estadoPainel.paginaAtual + direcao;
    if (novaPagina < 1) return;
   
    // Impede avançar se o botão estiver desabilitado
    if (direcao > 0 && document.getElementById('btn-pag-proximo').classList.contains('disabled')) return;

    estadoPainel.paginaAtual = novaPagina;
    carregarCards();
}

function filtrarStatusManual(novoStatus, btnElement) {
    // Atualiza Visual dos Botões
    document.querySelectorAll('.btn-custom-status').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    // Atualiza Estado (se for 'todas', manda string vazia para a API não filtrar)
    estadoPainel.filtroStatus = (novoStatus === 'todas') ? '' : novoStatus.toUpperCase();
    estadoPainel.paginaAtual = 1; // Reseta paginação ao filtrar
   
    carregarCards();
}

// Debounce para a pesquisa
let timeoutPesquisa;
function buscarMaquinaDinamica(valor) {
    clearTimeout(timeoutPesquisa);
    timeoutPesquisa = setTimeout(() => {
        estadoPainel.termoBusca = valor;
        estadoPainel.paginaAtual = 1;
        carregarCards();
    }, 500);
}

// =========================================================================
// 5. INICIALIZAÇÃO GERAL
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega os contadores (badges)
    atualizarContadoresFiltros();

    // 2. Carrega a primeira página de cards
    carregarCards();

    // 3. Configura Listener da Pesquisa
    const inputBusca = document.getElementById('inputBusca');
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => buscarMaquinaDinamica(e.target.value));
    }

    // 4. Configura Listeners dos Botões de Filtro
    document.querySelectorAll('.btn-custom-status').forEach(btn => {
        btn.addEventListener('click', function() {
            filtrarStatusManual(this.getAttribute('data-filtro'), this);
        });
    });

    // 5. Atualização Automática (A cada 60s)
    setInterval(() => {
        // Só atualiza se o usuário não estiver digitando na busca
        if (!estadoPainel.termoBusca) {
            atualizarContadoresFiltros();
            carregarCards();
        }
    }, 60000);

    // 6. Carregamento da Lateral (Lógica Legada)
    if (sessionStorage.ID_MAQUINA_PAINEL) {
        trocar_maquina(parseInt(sessionStorage.ID_MAQUINA_PAINEL));
    } else {
        procurar_detalhes_maquina(0);
    }
   
    // Listeners legados (checkboxes de limites, etc)
    document.querySelectorAll('.form-check-input[id^="toggleLimite"]').forEach((checkbox) => {
        checkbox.addEventListener('change', function () {
            if(maquinaAtualId > 0) initLinhaChart(maquinaAtualId);
        });
    });
   
    // Dropdown de componentes
    document.querySelectorAll('[data-componente]').forEach((item) => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const componente = this.getAttribute('data-componente');
            const dropdownComponente = document.getElementById('dropdownComponente');
            if (dropdownComponente) dropdownComponente.textContent = this.textContent;
            trocarComponente(componente);
        });
    });
});


// =========================================================================
// PARTE 2: LÓGICA DE GRÁFICOS E DETALHES (LEGADO FUNCIONAL)
// =========================================================================

let linhaChartInstance = null;
let linhaIntervalId = null;
let maquinaAtualId = 0;
let componenteAtual = 'cpu';
const LINHA_CHART_ID = 'utilizacaoChart';

let INFO_TECNICA_COMPUTADOR = [];
let INFO_TECNICA_COMPONENTES = [];
let DADOS_KPI_ALERTAS = {};
let DADOS_PARAMETROS = {};
let DADOS_GRAFICO_24H = {};

const COLORS = {
  cpu: { line: 'rgba(157, 206, 206, 0.8)', point: '#BADCDA' },
  ram: { line: 'rgba(62, 150, 131, 0.8)', point: '#0C8186' },
  disco: { line: 'rgba(230, 126, 34, 0.8)', point: '#e67e22' },
  rede: { line: 'rgba(51, 51, 51, 0.8)', point: '#000000ff' },
};

const COMPONENT_LABELS = {
  cpu: 'Uso de CPU',
  ram: 'Uso de RAM',
  disco: 'Uso do Disco Duro',
  rede: 'Taxa de utilização de rede',
};

function adaptarKPIs(dados_kpi_alertas_json) {
  const kpis = {};
  dados_kpi_alertas_json.forEach((item) => {
    kpis[item.tipoRecurso.toUpperCase()] = {
      totalAlertas24h: item.totalAlertas24h || 0,
      maiorPicoUso: item.maiorPicoUso || 0,
    };
  });
  return kpis;
}

function adaptarParametros(dados_parametros_json) {
  const parametros = {};
  dados_parametros_json.forEach((param) => {
    const [tipo, identificador] = param.nomeParametro.split('_');
    const tipoLower = tipo.toLowerCase();
    if (!parametros[tipoLower]) {
      parametros[tipoLower] = {};
    }

    if (identificador === 'CRITICO') {
      parametros[tipoLower].limiteCritico = param.limite;
    } else if (identificador === 'ATENÇÃO') {
      parametros[tipoLower].limiteAtencao = param.limite;
    } else if (identificador === 'ACEITÁVEL') {
      parametros[tipoLower].limiteOcioso = param.limite;
    }
  });
  return parametros;
}

function transformarDadosGrafico(dados_coleta_24_horas_json) {
  const dados = { cpu: [], ram: [], disco: [], rede: [] };
  dados_coleta_24_horas_json.forEach((item) => {
    const tipo = item.tipoRecurso.toLowerCase();
    if (dados[tipo]) {
      dados[tipo].push({
        valor: item.valor_medio,
        horario: item.intervaloTempo,
      });
    }
  });
  return dados;
}

function limiteEstaVisivel(id) {
  const checkbox = document.getElementById(id);
  return checkbox && checkbox.checked;
}

function getLimiteMaximo() {
  return DADOS_PARAMETROS[componenteAtual]?.limiteCritico || 90;
}

function getLimiteMinimo() {
  return DADOS_PARAMETROS[componenteAtual]?.limiteOcioso || 10;
}

function getLimiteAtencao() {
  return DADOS_PARAMETROS[componenteAtual]?.limiteAtencao || 70;
}

function getCapacidade(tipo, infoComp) {
  const comp = infoComp.find((i) => i.tipoComponente.toUpperCase() === tipo);
  return comp ? comp.valor : 'N/A';
}

function createGradient(ctx, chartArea, color) {
  if (!ctx || !chartArea || chartArea.top === undefined) return;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, color.replace('0.8', '0.6'));
  gradient.addColorStop(0.5, color.replace('0.8', '0.3'));
  gradient.addColorStop(1, color.replace('0.8', '0.0'));
  return gradient;
}

function applyGradients(chart) {
  const ctx = chart.ctx;
  const chartArea = chart.chartArea;
  if (!chartArea || !chart.data.datasets.length) return;

  chart.data.datasets.forEach((dataset) => {
    let colorLine = COLORS[componenteAtual].line;
    dataset.backgroundColor = createGradient(ctx, chartArea, colorLine);
  });
  chart.update();
}

function getOpcoesChart() {
  const limiteMax = getLimiteMaximo();
  const limiteMin = getLimiteMinimo();
  const limiteAtencao = getLimiteAtencao();
  const isRede = componenteAtual === 'rede';

  const annotations = {};

  if (limiteEstaVisivel('toggleLimiteCritico')) {
    annotations.limiteCritico = {
      type: 'line',
      yMin: limiteMax,
      yMax: limiteMax,
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        display: true,
        content: `Crítico: ${limiteMax}%`,
        position: 'end',
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        color: 'white',
        font: { size: 11 },
      },
    };
  }

  if (limiteEstaVisivel('toggleLimiteAtencao')) {
    annotations.limiteAtencao = {
      type: 'line',
      yMin: limiteAtencao,
      yMax: limiteAtencao,
      borderColor: 'rgb(255, 159, 64)',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        display: true,
        content: `Atenção: ${limiteAtencao}%`,
        position: 'end',
        backgroundColor: 'rgba(255, 159, 64, 0.8)',
        color: 'white',
        font: { size: 11 },
      },
    };
  }

  if (limiteEstaVisivel('toggleLimiteOcioso')) {
    annotations.limiteOcioso = {
      type: 'line',
      yMin: limiteMin,
      yMax: limiteMin,
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        display: true,
        content: `Ocioso: ${limiteMin.toFixed(1)}%`,
        position: 'start',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        color: 'white',
        font: { size: 11 },
      },
    };
  }

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(isRede ? 2 : 1)}%`;
            }
            return label;
          },
        },
      },
      annotation: {
        annotations: annotations,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.08)', drawBorder: false },
        ticks: {
          callback: (value) => (isRede ? `${value.toFixed(1)} %` : `${value.toFixed(0)}%`),
        },
        title: {
          display: true,
          text: isRede ? 'Conectividade (%)' : 'Porcentagem (%)',
          font: { size: 14, weight: 'bold' },
        },
      },
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Horário (horas)',
          font: { size: 14, weight: 'bold' },
        },
      },
    },
    animation: { duration: 2000, easing: 'easeInOutQuart' },
  };
}

// Elementos da Lateral
const error_message = document.getElementById('error-message');
const mensagem_incial = document.getElementById('initial-message');
const card_dash_body = document.getElementById('card_dash_body');
const titulo_erro = error_message ? error_message.getElementsByTagName('h5')[0] : null;
const conteudo_erro = error_message ? error_message.getElementsByTagName('p')[0] : null;

function initLinhaChart(idMaquina) {
  if (error_message) error_message.classList.add('d-none');
  if (linhaChartInstance) linhaChartInstance.destroy();
  if (linhaIntervalId) clearInterval(linhaIntervalId);

  const canvas = document.getElementById(LINHA_CHART_ID);
  const chartContainer = document.getElementById('chart-contianer');
  const messageContainer = document.getElementById('initial-message');

  if (!canvas || !chartContainer || !messageContainer) {
    return; // Elementos não encontrados (pode ser carregamento inicial)
  }

  const statusMaquina = INFO_TECNICA_COMPUTADOR[0]?.status || 'Online';

  if (statusMaquina === 'Offline' || statusMaquina === 'Manutenção') {
    if (card_dash_body) card_dash_body.style.display = 'none';
    if (error_message) {
      error_message.classList.remove('d-none');
      error_message.classList.add('d-block');
      if (titulo_erro) titulo_erro.textContent = `Máquina - ${statusMaquina}`;
      let descricao =
        statusMaquina == 'Offline'
          ? 'Verifique se os agentes se encontram ligados'
          : 'Em breve a máquina estará disponível';
      if (conteudo_erro) conteudo_erro.textContent = descricao;
    }
    return;
  }

  if (card_dash_body) card_dash_body.style.display = 'block';
  messageContainer.style.display = 'none';
  messageContainer.innerHTML = '';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dadosComponente = DADOS_GRAFICO_24H[componenteAtual] || [];

  if (dadosComponente.length === 0) {
    if (card_dash_body) card_dash_body.style.display = 'none';
    if (error_message) {
      error_message.classList.remove('d-none');
      error_message.classList.add('d-block');
      if (titulo_erro) titulo_erro.textContent = `Máquina - Sem dados`;
      let descricao =
        `Não há dados de utilização para ${COMPONENT_LABELS[componenteAtual]} nas últimas 24 horas`;
      if (conteudo_erro) conteudo_erro.textContent = descricao;
    }
    return;
  }
  const labelsReais = dadosComponente.map((ponto) => ponto.horario);
  const dadosReais = dadosComponente.map((ponto) => ponto.valor);

  const dataChart = {
    labels: labelsReais,
    datasets: [
      {
        label: COMPONENT_LABELS[componenteAtual],
        data: dadosReais,
        borderColor: COLORS[componenteAtual].line,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: COLORS[componenteAtual].point,
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  linhaChartInstance = new Chart(ctx, {
    type: 'line',
    data: dataChart,
    options: getOpcoesChart(),
  });

  setTimeout(() => {
    applyGradients(linhaChartInstance);
    linhaChartInstance.update();
  }, 500);

  linhaChartInstance.options.onResize = () => applyGradients(linhaChartInstance);
}

function atualizarDetalhes() {
  const maquina = INFO_TECNICA_COMPUTADOR[0] || {};
  const getKpi = (comp, key) => DADOS_KPI_ALERTAS[comp.toUpperCase()]?.[key] || 'N/A';

  const tituloDetalhes = document.getElementById('tituloDetalhes');
  if (tituloDetalhes) {
    tituloDetalhes.textContent =
      `${maquina.nome || 'Máquina'} | Tendência de Utilização de Recursos (24 Horas)`;
  }

  const metricas = [
    { id: 'cpu', limite: getLimiteMaximo(), isRede: false },
    { id: 'ram', limite: getLimiteMaximo(), isRede: false },
    { id: 'rede', limite: getLimiteMaximo(), isRede: true },
    { id: 'disco', limite: getLimiteMaximo(), isRede: false },
  ];

  metricas.forEach((m) => {
    const totalAlertas = getKpi(m.id, 'totalAlertas24h');
    const picoUso = getKpi(m.id, 'maiorPicoUso');

    const elem24h = document.getElementById(`${m.id}24h`);
    if (elem24h) elem24h.textContent = totalAlertas;

    const picoElement = document.getElementById(`${m.id}Pico`);
    if (picoElement) {
      picoElement.textContent = picoUso;
     
      if (picoUso !== 'N/A') {
        // Lógica de cores baseada nos limites globais atuais
        const critico = DADOS_PARAMETROS[m.id]?.limiteCritico || 90;
        const atencao = DADOS_PARAMETROS[m.id]?.limiteAtencao || 70;
        let classe = 'text-black';
        if (picoUso >= critico) classe = 'text-danger';
        else if (picoUso >= atencao) classe = 'text-warning';
       
        picoElement.className = `fw-bold fs-5 ${classe}`;
      } else {
        picoElement.className = 'fw-bold fs-5 text-secondary';
      }
    }
  });

  const infoModelo = document.getElementById('infoModelo');
  if (infoModelo) infoModelo.textContent = maquina.modelo || 'N/A';

  const infoIp = document.getElementById('infoIp');
  if (infoIp) infoIp.textContent = maquina.ip || 'N/A';

  const infoSo = document.getElementById('infoSo');
  if (infoSo) infoSo.textContent = maquina.sistemaOperacional || 'N/A';

  const infoCpuCapacidade = document.getElementById('infoCpuCapacidade');
  if (infoCpuCapacidade) infoCpuCapacidade.textContent = getCapacidade('CPU', INFO_TECNICA_COMPONENTES);

  const infoRamCapacidade = document.getElementById('infoRamCapacidade');
  if (infoRamCapacidade) infoRamCapacidade.textContent = getCapacidade('RAM', INFO_TECNICA_COMPONENTES);

  const infoDiscoCapacidade = document.getElementById('infoDiscoCapacidade');
  if (infoDiscoCapacidade) infoDiscoCapacidade.textContent = getCapacidade('DISCO', INFO_TECNICA_COMPONENTES);
}

function trocar_maquina(idMaquina) {
  maquinaAtualId = idMaquina;
  sessionStorage.ID_MAQUINA_PAINEL = idMaquina;
  procurar_detalhes_maquina(idMaquina);
}

function trocarComponente(componente) {
  componenteAtual = componente;
  initLinhaChart(maquinaAtualId);
}

async function procurar_detalhes_maquina(idMaquina) {
  if (!idMaquina || idMaquina == 0) {
    if (card_dash_body) card_dash_body.style.display = 'none';
    if (mensagem_incial) mensagem_incial.style.display = 'block';
    if (error_message) error_message.classList.add('d-none');
    return;
  }

  if (card_dash_body) card_dash_body.style.display = 'block';
  if (mensagem_incial) mensagem_incial.style.display = 'none';
  if (error_message) error_message.classList.add('d-none');

  try {
    const response = await fetch(`/painel/procurar_informacoes_maquina/${idMaquina}`);
    if (!response.ok) {
      throw new Error(`Erro de rede: ${response.status} ${response.statusText}`);
    }

    const dadosCompletos = await response.json();
    const {
      info_tecnica_computador,
      info_tecnica_componentes,
      dados_kpi_alertas,
      dados_parametros_por_componente,
      dados_coleta_24_horas,
    } = dadosCompletos;

    INFO_TECNICA_COMPUTADOR = info_tecnica_computador;
    INFO_TECNICA_COMPONENTES = info_tecnica_componentes;
    DADOS_KPI_ALERTAS = adaptarKPIs(dados_kpi_alertas);
    DADOS_PARAMETROS = adaptarParametros(dados_parametros_por_componente);
    DADOS_GRAFICO_24H = transformarDadosGrafico(dados_coleta_24_horas);
    atualizarDetalhes();
    initLinhaChart(idMaquina);
  } catch (e) {
    console.error('procurar_detalhes_maquina - Erro ao processar dados:', e);
  }
}