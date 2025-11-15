let linhaChartInstance = null;
let linhaIntervalId = null;
let maquinaAtualId = 0;
let filtroAtual = 'todas';
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
  // Mais opaco no topo
  gradient.addColorStop(0, color.replace('0.8', '0.6'));
  // Meio termo
  gradient.addColorStop(0.5, color.replace('0.8', '0.3'));
  // Totalmente transparente no fundo
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
      borderColor: 'rgb(255, 99, 132)', // Vermelho
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
      borderColor: 'rgb(255, 159, 64)', // Laranja
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

  // 3. LIMITE MÍNIMO (OCIOSO)
  if (limiteEstaVisivel('toggleLimiteOcioso')) {
    annotations.limiteOcioso = {
      type: 'line',
      yMin: limiteMin,
      yMax: limiteMin,
      borderColor: 'rgb(54, 162, 235)', // Azul
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
const error_message = document.getElementById('error-message');
const mensagem_incial = document.getElementById('initial-message');
const card_dash_body = document.getElementById('card_dash_body');
const titulo_erro = error_message.getElementsByTagName('h5');
const conteudo_erro = error_message.getElementsByTagName('p');

function initLinhaChart(idMaquina) {
  error_message.classList.add('d-none');
  if (linhaChartInstance) linhaChartInstance.destroy();
  if (linhaIntervalId) clearInterval(linhaIntervalId);

  const canvas = document.getElementById(LINHA_CHART_ID);
  const chartContainer = document.getElementById('chart-contianer');
  const messageContainer = document.getElementById('initial-message');

  if (!canvas || !chartContainer || !messageContainer) {
    console.error('Um ou mais elementos do DOM para o gráfico não foram encontrados.');
    return;
  }

  const statusMaquina = INFO_TECNICA_COMPUTADOR[0]?.status || 'Online';

  if (statusMaquina === 'Offline' || statusMaquina === 'Manutenção') {
    card_dash_body.style.display = 'none';
    error_message.classList.remove('d-none');
    error_message.classList.add('d-block');
    titulo_erro.innerHTML = `Máquina - ${statusMaquina}`;
    let descricao =
      statusMaquina == 'Offline'
        ? 'Verique se os agentes se encontram ligados'
        : 'Em breve a máquina estará disponivél';
    conteudo_erro.innerHTML = descricao;
    return;
  }

  card_dash_body.style.display = 'block';
  messageContainer.style.display = 'none';
  messageContainer.innerHTML = '';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dadosComponente = DADOS_GRAFICO_24H[componenteAtual] || [];

  if (dadosComponente.length === 0) {
    card_dash_body.style.display = 'none';
    error_message.classList.remove('d-none');
    error_message.classList.add('d-block');
    titulo_erro.innerHTML = `Máquina - Sem dados`;
    let descricao =
      statusMaquina ==
      'Não há dados de utilização para ${COMPONENT_LABELS[componenteAtual]} nas últimas 24 horas';
    conteudo_erro.innerHTML = descricao;
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

  document.getElementById('tituloDetalhes').textContent =
    `${maquina.nome || 'Máquina'} | Tendência de Utilização de Recursos (24 Horas)`;

  const metricas = [
    { id: 'cpu', limite: getLimiteMaximo(), isRede: false },
    { id: 'ram', limite: getLimiteMaximo(), isRede: false },
    { id: 'rede', limite: getLimiteMaximo(), isRede: true },
    { id: 'disco', limite: getLimiteMaximo(), isRede: false },
  ];

  metricas.forEach((m) => {
    const totalAlertas = getKpi(m.id, 'totalAlertas24h');
    const picoUso = getKpi(m.id, 'maiorPicoUso');
    document.getElementById(`${m.id}24h`).textContent = totalAlertas;
    const picoElement = document.getElementById(`${m.id}Pico`);
    picoElement.textContent = picoUso;

    if (picoUso !== 'N/A' && m.limite !== 90) {
      const limiteAtencao = getLimiteAtencao();
      let classe = 'text-black';
      if (picoUso >= m.limite) {
        classe = 'text-black';
      } else if (picoUso >= limiteAtencao) {
        classe = 'text-black';
      }
      picoElement.className = `fw-bold fs-5 ${classe}`;
    } else {
      picoElement.className = 'fw-bold fs-5 text-secondary';
    }
  });
  document.getElementById('infoModelo').textContent = maquina.modelo || 'N/A';
  document.getElementById('infoIp').textContent = maquina.ip || 'N/A';
  document.getElementById('infoSo').textContent = maquina.sistemaOperacional || 'N/A';
  document.getElementById('infoCpuCapacidade').textContent = getCapacidade(
    'CPU',
    INFO_TECNICA_COMPONENTES,
  );
  document.getElementById('infoRamCapacidade').textContent = getCapacidade(
    'RAM',
    INFO_TECNICA_COMPONENTES,
  );
  document.getElementById('infoDiscoCapacidade').textContent = getCapacidade(
    'DISCO',
    INFO_TECNICA_COMPONENTES,
  );
}
function trocar_maquina(idMaquina) {
  maquinaAtualId = idMaquina;
  procurar_detalhes_maquina(idMaquina);
}

function trocarComponente(componente) {
  componenteAtual = componente;
  initLinhaChart(maquinaAtualId);
}
async function procurar_detalhes_maquina(idMaquina) {
  if (!idMaquina) return;

  if (idMaquina > 0) {
    card_dash_body.style.display = 1;
    mensagem_incial.style.display = 'none';
    error_message.classList.add('d-none');
  } else {
    card_dash_body.style.display = 'none';
    mensagem_incial.style.display = 1;
    error_message.classList.add('d-none');
    return;
  }
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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-custom-status').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.btn-custom-status').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');
      filtrarMaquinas(this.getAttribute('data-filtro'));
    });
  });

  document.querySelectorAll('.card-recurso button').forEach((btn) => {
    btn.addEventListener('click', function () {
      const card = this.closest('.card-recurso');
      trocar_maquina(parseInt(card.getAttribute('data-maquina-id')));
    });
  });

  document
    .getElementById('inputBusca')
    .addEventListener('input', (e) => buscarMaquina(e.target.value));

  document.querySelectorAll('[data-componente]').forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const componente = this.getAttribute('data-componente');
      if (componente === 'todos') return;
      document.getElementById('dropdownComponente').textContent = this.textContent;
      trocarComponente(componente);
    });
  }); // NOVO: Listener para os checkboxes de limites (Ocultar/Mostrar individual)
  document.querySelectorAll('.form-check-input[id^="toggleLimite"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      // Recria o gráfico com as opções de anotação atualizadas
      initLinhaChart(maquinaAtualId);
    });
  });

  maquinaAtualId = sessionStorage.ID_MAQUINA_PAINEL ? sessionStorage.ID_MAQUINA_PAINEL : 0;
  procurar_detalhes_maquina(maquinaAtualId);
});
