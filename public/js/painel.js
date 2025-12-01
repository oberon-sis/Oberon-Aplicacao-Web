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
  (kpis || []).forEach((item) => {
    dados[(item.tipoRecurso || "").toUpperCase()] = {
      totalAlertas24h: item.totalAlertas24h || 0,
      maiorPicoUso: item.maiorPicoUso || 0,
    };
  });
  return dados;
}

function adaptarParametros(params) {
  const resultado = {};
  (params || []).forEach((p) => {
    const [tipo, nivel] = String(p.nomeParametro || "").split("_");
    const key = (tipo || "").toLowerCase();
    if (!key) return;

    if (!resultado[key]) resultado[key] = {};
    if (nivel === "CRITICO") resultado[key].limiteCritico = p.limite;
    else if (nivel === "ATENÇÃO" || nivel === "ATENCAO") resultado[key].limiteAtencao = p.limite;
    else if (nivel === "ACEITÁVEL" || nivel === "ACEITAVEL") resultado[key].limiteOcioso = p.limite;
  });
  return resultado;
}

function transformarDadosGrafico(lista) {
  const result = { cpu: [], ram: [], disco: [], rede: [] };
  (lista || []).forEach((reg) => {
    const tipo = String(reg.tipoRecurso || "").toLowerCase();
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
// REDE: CHAMADAS AO BACKEND
// ============================================================================
async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Resposta não JSON: ${text}`);
  }
  if (!res.ok) {
    const msg = data?.erro || data?.mensagem || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// Carregar lista de máquinas para os cards (usa headers, conforme seu controller)
async function carregarMaquinas(filtro = "todas", busca = "") {
  try {
    const headers = {
      "id-empresa": "1",         // ajuste conforme sua sessão
      "pagina-atual": "1",
      "tamanho-pagina": "20",
      "status-filtro": filtro !== "todas" ? filtro : "",
      "nome-busqueda": busca || ""
    };

    const data = await fetchJson("/painel/procurar_cards_painel_dinamico", { headers });
    const maquinas = data?.dados_card || [];

    const container = document.getElementById("resource-cards");
    container.innerHTML = "";

    atualizarBadgesContagem(maquinas);
    maquinas.forEach((m) => container.appendChild(gerarCardMaquina(m)));
  } catch (e) {
    console.error("Erro ao carregar máquinas:", e);
  }
}

// Buscar detalhes da máquina selecionada
async function procurar_detalhes_maquina(id) {
  try {
    const dados = await fetchJson(`/painel/procurar_informacoes_maquina/${id}`);

    INFO_TECNICA_COMPUTADOR = dados.info_tecnica_computador || [];
    INFO_TECNICA_COMPONENTES = dados.info_tecnica_componentes || [];
    DADOS_KPI_ALERTAS = adaptarKPIs(dados.dados_kpi_alertas || []);
    DADOS_PARAMETROS = adaptarParametros(dados.dados_parametros_por_componente || []);
    DADOS_GRAFICO_24H = transformarDadosGrafico(dados.dados_coleta_24_horas || []);

    atualizarDetalhes();
    initLinhaChart();
  } catch (e) {
    console.error("Erro ao carregar detalhes:", e);
  }
}

// ============================================================================
// CARDS
// ============================================================================
// Observação: seu controller mapeia status para: status_normalizado, cor_classe, icone_classe
function gerarCardMaquina(m) {
  const status = (m.status_normalizado || "normal").toLowerCase(); // vindo do controller
  const corClasse = m.cor_classe || "success";
  const iconeClasse = m.icone_classe || "bi-check-circle-fill";

  const card = document.createElement("div");
  card.classList.add("card", "card-recurso");
  card.setAttribute("data-maquina-id", m.idMaquina || m.id || "");
  card.setAttribute("data-status", status);
  card.setAttribute("data-nome", m.nome || m.NomeMaquina || "Máquina");

  card.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <h5 class="h6 mb-0">${m.nome || m.NomeMaquina || "Máquina"}</h5>
      <i class="bi ${iconeClasse} text-${corClasse} fs-5"></i>
    </div>
    <p class="card-text">
      <small class="text-${corClasse}">${(status || "normal").toUpperCase()}</small>
    </p>
    <button class="btn btn-${getBtnColor(status)} btn-sm w-100 btn-ver-detalhes">Ver Detalhes</button>
  `;

  card.querySelector(".btn-ver-detalhes").addEventListener("click", () => {
    const id = m.idMaquina || m.id;
    if (!id) return;
    trocar_maquina(id);
  });

  return card;
}

function getBtnColor(status) {
  switch (String(status).toLowerCase()) {
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

  (lista || []).forEach((m) => {
    const st = String(m.status_normalizado || m.status || "normal").toLowerCase();
    if (grupos.hasOwnProperty(st)) grupos[st]++;
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
// SIDEBAR DE DETALHES
// ============================================================================
function atualizarDetalhes() {
  const m = INFO_TECNICA_COMPUTADOR[0];
  if (!m) {
    // Alterna mensagens (opcional): esconder card e mostrar aviso
    document.getElementById("card_dash_body").style.display = "none";
    document.getElementById("initial-message").classList.remove("d-none");
    return;
  }

  document.getElementById("initial-message").classList.add("d-none");
  document.getElementById("card_dash_body").style.display = "block";

  document.getElementById("tituloDetalhes").textContent =
    `${m.nome || "Máquina"} | Tendência (24h)`;

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
  const c = (INFO_TECNICA_COMPONENTES || []).find(
    (x) => String(x.tipoComponente || "").toUpperCase() === tipo
  );
  return c ? c.valor : "N/A";
}

function atualizarKPIs() {
  const comps = ["cpu", "ram", "rede", "disco"];
  comps.forEach((c) => {
    const kpi = DADOS_KPI_ALERTAS[c.toUpperCase()] || {};
    document.getElementById(`${c}24h`).textContent = kpi.totalAlertas24h || 0;
    document.getElementById(`${c}Pico`).textContent = kpi.maiorPicoUso || 0;
  });
}

// ============================================================================
// GRÁFICO
// ============================================================================
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
  carregarMaquinas(filtroAtual);
}

function buscarMaquina(texto) {
  carregarMaquinas(filtroAtual, texto);
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
