// ============================================================================
// VARIÁVEIS GLOBAIS
// ============================================================================
let maquinaAtualId = 0;
let filtroAtual = "todas";
let componenteAtual = "cpu";
let linhaChartInstance = null;

let INFO_TECNICA_COMPUTADOR = [];
let INFO_TECNICA_COMPONENTES = [];
let DADOS_KPI_ALERTAS = {};
let DADOS_PARAMETROS = {};
let DADOS_GRAFICO_24H = {};

const LINHA_CHART_ID = "utilizacaoChart";

// ============================================================================
// CORES DO GRÁFICO
// ============================================================================
const COLORS = {
  cpu: { line: "rgba(157, 206, 206, 0.8)", point: "#BADCDA" },
  ram: { line: "rgba(62, 150, 131, 0.8)", point: "#0C8186" },
  disco: { line: "rgba(230, 126, 34, 0.8)", point: "#e67e22" },
  rede: { line: "rgba(51, 51, 51, 0.8)", point: "#000000ff" },
};

const COMPONENT_LABELS = {
  cpu: "Uso de CPU",
  ram: "Uso de RAM",
  disco: "Uso de Disco",
  rede: "Conectividade de Rede",
};

// ============================================================================
// ADAPTADORES DE DADOS
// ============================================================================
function adaptarKPIs(kpis) {
  const dados = {};
  kpis.forEach((item) => {
    dados[item.tipoRecurso.toUpperCase()] = {
      totalAlertas24h: item.totalAlertas24h || 0,
      maiorPicoUso: item.maiorPicoUso || 0,
    };
  });
  return dados;
}

function adaptarParametros(params) {
  const resultado = {};
  params.forEach((p) => {
    const [tipo, nivel] = p.nomeParametro.split("_");
    const key = tipo.toLowerCase();
    if (!resultado[key]) resultado[key] = {};

    if (nivel === "CRITICO") resultado[key].limiteCritico = p.limite;
    else if (nivel === "ATENÇÃO") resultado[key].limiteAtencao = p.limite;
    else if (nivel === "ACEITÁVEL") resultado[key].limiteOcioso = p.limite;
  });
  return resultado;
}

function transformarDadosGrafico(lista) {
  const result = { cpu: [], ram: [], disco: [], rede: [] };
  lista.forEach((reg) => {
    const tipo = reg.tipoRecurso.toLowerCase();
    if (result[tipo]) {
      result[tipo].push({
        valor: reg.valor_medio,
        horario: reg.intervaloTempo,
      });
    }
  });
  return result;
}

// ============================================================================
// GERAÇÃO DOS CARDS DINÂMICOS
// ============================================================================
async function carregarMaquinas() {
  try {
    const response = await fetch("/painel/procurar_cards_painel_dinamico");
    const maquinas = await response.json();

    const container = document.getElementById("resource-cards");
    container.innerHTML = "";

    atualizarBadgesContagem(maquinas);

    maquinas.forEach((m) => container.appendChild(gerarCardMaquina(m)));
  } catch (e) {
    console.error("Erro ao carregar máquinas:", e);
  }
}

function gerarCardMaquina(m) {
  const card = document.createElement("div");
  card.classList.add("card", "card-recurso");
  card.setAttribute("data-maquina-id", m.idMaquina);
  card.setAttribute("data-status", m.status.toLowerCase());
  card.setAttribute("data-nome", m.nome);

  const icon = getIconeStatus(m.status);
  const cor = getCorStatus(m.status);

  card.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <h5 class="h6 mb-0">${m.nome}</h5>
      <i class="${icon} ${cor} fs-5"></i>
    </div>
    <p class="card-text"><small class="${cor.replace("text-", "text-")}" >${m.status.toUpperCase()}</small></p>

    <button class="btn btn-${getBtnColor(
      m.status
    )} btn-sm w-100 btn-ver-detalhes">Ver Detalhes</button>
  `;

  card.querySelector(".btn-ver-detalhes").addEventListener("click", () => {
    trocar_maquina(m.idMaquina);
  });

  return card;
}

function getIconeStatus(status) {
  switch (status.toLowerCase()) {
    case "critico": return "bi bi-exclamation-triangle-fill";
    case "atencao": return "bi bi-exclamation-circle-fill";
    case "normal": return "bi bi-check-circle-fill";
    case "ocioso": return "bi bi-dash-circle";
    case "offline": return "bi bi-dash-circle-fill";
    case "manutencao": return "bi bi-tools";
    default: return "bi bi-pc-display";
  }
}

function getCorStatus(status) {
  switch (status.toLowerCase()) {
    case "critico": return "text-danger";
    case "atencao": return "text-warning";
    case "normal": return "text-success";
    case "ocioso": return "text-info";
    case "offline": return "text-secondary";
    case "manutencao": return "text-secondary";
    default: return "text-muted";
  }
}

function getBtnColor(status) {
  switch (status.toLowerCase()) {
    case "critico": return "danger";
    case "atencao": return "warning";
    case "normal": return "success";
    case "ocioso": return "info";
    case "offline": return "secondary";
    case "manutencao": return "secondary";
    default: return "primary";
  }
}

function atualizarBadgesContagem(lista) {
  const grupos = {
    todas: lista.length,
    critico: 0,
    atencao: 0,
    normal: 0,
    ocioso: 0,
    offline: 0,
    manutencao: 0,
  };

  lista.forEach((m) => {
    const st = m.status.toLowerCase();
    if (grupos[st] !== undefined) grupos[st]++;
  });

  Object.keys(grupos).forEach((g) => {
    const badge = document.getElementById(`badge_${g}`);
    if (badge) badge.textContent = grupos[g];
  });
}

// ============================================================================
// TROCAR MÁQUINA
// ============================================================================
function trocar_maquina(id) {
  maquinaAtualId = id;
  sessionStorage.ID_MAQUINA_PAINEL = id;
  procurar_detalhes_maquina(id);
}

// ============================================================================
// BUSCAR DETALHES DA MÁQUINA
// ============================================================================
async function procurar_detalhes_maquina(id) {
  try {
    const response = await fetch(`/painel/procurar_informacoes_maquina/${id}`);
    const dados = await response.json();

    INFO_TECNICA_COMPUTADOR = dados.info_tecnica_computador;
    INFO_TECNICA_COMPONENTES = dados.info_tecnica_componentes;
    DADOS_KPI_ALERTAS = adaptarKPIs(dados.dados_kpi_alertas);
    DADOS_PARAMETROS = adaptarParametros(dados.dados_parametros_por_componente);
    DADOS_GRAFICO_24H = transformarDadosGrafico(dados.dados_coleta_24_horas);

    atualizarDetalhes();
    initLinhaChart(id);
  } catch (e) {
    console.error("Erro ao carregar detalhes:", e);
  }
}

// ============================================================================
// ATUALIZAR DETALHES NA SIDEBAR
// ============================================================================
function atualizarDetalhes() {
  const m = INFO_TECNICA_COMPUTADOR[0];
  if (!m) return;

  document.getElementById("tituloDetalhes").textContent =
    `${m.nome} | Tendência (24h)`;

  document.getElementById("infoModelo").textContent = m.modelo || "N/A";
  document.getElementById("infoIp").textContent = m.ip || "N/A";
  document.getElementById("infoSo").textContent = m.sistemaOperacional || "N/A";

  document.getElementById("infoCpuCapacidade").textContent =
    getCapacidade("CPU") || "N/A";
  document.getElementById("infoRamCapacidade").textContent =
    getCapacidade("RAM") || "N/A";
  document.getElementById("infoDiscoCapacidade").textContent =
    getCapacidade("DISCO") || "N/A";

  atualizarKPIs();
}

function getCapacidade(tipo) {
  const c = INFO_TECNICA_COMPONENTES.find(
    (x) => x.tipoComponente.toUpperCase() === tipo
  );
  return c ? c.valor : "N/A";
}

function atualizarKPIs() {
  const comps = ["cpu", "ram", "rede", "disco"];
  comps.forEach((c) => {
    document.getElementById(`${c}24h`).textContent =
      DADOS_KPI_ALERTAS[c.toUpperCase()]?.totalAlertas24h || 0;

    document.getElementById(`${c}Pico`).textContent =
      DADOS_KPI_ALERTAS[c.toUpperCase()]?.maiorPicoUso || 0;
  });
}

// ============================================================================
// GRÁFICO
// ============================================================================
function createGradient(ctx, chartArea, color) {
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, color.replace("0.8", "0.4"));
  g.addColorStop(1, color.replace("0.8", "0.0"));
  return g;
}

function initLinhaChart() {
  const canvas = document.getElementById(LINHA_CHART_ID);
  if (!canvas) return;

  if (linhaChartInstance) linhaChartInstance.destroy();
  const ctx = canvas.getContext("2d");

  const dados = DADOS_GRAFICO_24H[componenteAtual] || [];
  if (dados.length === 0) return;

  linhaChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dados.map((x) => x.horario),
      datasets: [
        {
          label: COMPONENT_LABELS[componenteAtual],
          data: dados.map((x) => x.valor),
          borderColor: COLORS[componenteAtual].line,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS[componenteAtual].point,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
    },
  });
}

// ============================================================================
// FILTRAGEM E BUSCA
// ============================================================================
function filtrarMaquinas(filtro) {
  filtroAtual = filtro;
  aplicarFiltros();
}

function buscarMaquina(texto) {
  aplicarFiltros(texto);
}

function aplicarFiltros(texto = "") {
  const cards = document.querySelectorAll(".card-recurso");
  const termo = texto.toLowerCase().trim();

  cards.forEach((card) => {
    const nome = card.getAttribute("data-nome").toLowerCase();
    const status = card.getAttribute("data-status").toLowerCase();

    const passaStatus = filtroAtual === "todas" || status === filtroAtual;
    const passaBusca = nome.includes(termo);

    card.style.display = passaStatus && passaBusca ? "block" : "none";
  });
}

// ============================================================================
// EVENTOS
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  carregarMaquinas();

  document
    .getElementById("inputBusca")
    .addEventListener("input", (e) => buscarMaquina(e.target.value));

  document.querySelectorAll(".btn-custom-status").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".btn-custom-status")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      filtrarMaquinas(this.getAttribute("data-filtro"));
    });
  });

  document.querySelectorAll("[data-componente]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      componenteAtual = el.getAttribute("data-componente");
      document.getElementById("dropdownComponente").textContent =
        el.textContent;
      initLinhaChart();
    });
  });
});
