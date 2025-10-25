let linhaChartInstance = null;
let linhaIntervalId = null;
let maquinaAtualId = 1;
let filtroAtual = "todas";
let componenteAtual = "todos";
const LINHA_CHART_ID = "utilizacaoChart";

const COLORS = {
  alpha: { line: "rgba(157, 206, 206, 0.8)", point: "#BADCDA" },
  beta: { line: "rgba(62, 150, 131, 0.8)", point: "#0C8186" },
  gamma: { line: "rgba(230, 126, 34, 0.8)", point: "#e67e22" },
  delta: { line: "rgba(51, 51, 51, 0.8)", point: "#000000ff" },
};

const MAQUINAS_DATA = {
  1: {
    nome: "ESTACAO-0021",
    criticidade: "ocioso",
    cpu24h: 5,
    cpuAtivos: 0,
    ram24h: 3,
    ramAtivos: 0,
    rede24h: 2,
    redeAtivos: 0,
    disco24h: 4,
    discoAtivos: 0,
    cpuLimite: 90,
    ramLimite: 85,
    discoLimite: 88.8,
    redeLimite: 3.5,
    modelo: "Dell OptiPlex 3050 SFF",
    ip: "192.168.1.101",
    nucleos: 8,
    so: "Windows 10 Pro",
  },
  2: {
    nome: "ESTACAO-0022",
    criticidade: "ocioso",
    cpu24h: 4,
    cpuAtivos: 0,
    ram24h: 2,
    ramAtivos: 0,
    rede24h: 1,
    redeAtivos: 0,
    disco24h: 3,
    discoAtivos: 0,
    cpuLimite: 90,
    ramLimite: 85,
    discoLimite: 88.8,
    redeLimite: 3.5,
    modelo: "Dell OptiPlex 5060",
    ip: "192.168.1.102",
    nucleos: 8,
    so: "Windows 10 Pro",
  },
  3: {
    nome: "ESTACAO-0001",
    criticidade: "critico",
    cpu24h: 15,
    cpuAtivos: 8,
    ram24h: 10,
    ramAtivos: 5,
    rede24h: 5,
    redeAtivos: 2,
    disco24h: 12,
    discoAtivos: 6,
    cpuLimite: 70,
    ramLimite: 80,
    discoLimite: 85,
    redeLimite: 3,
    modelo: "Dell OptiPlex 3050 SFF",
    ip: "192.168.1.103",
    nucleos: 8,
    so: "Windows 10 Pro",
  },
  4: {
    nome: "ESTACAO-0002",
    criticidade: "offline",
    cpu24h: 0,
    cpuAtivos: 0,
    ram24h: 0,
    ramAtivos: 0,
    rede24h: 0,
    redeAtivos: 0,
    disco24h: 0,
    discoAtivos: 0,
    cpuLimite: 90,
    ramLimite: 85,
    discoLimite: 88.8,
    redeLimite: 3.5,
    modelo: "Dell OptiPlex 7060",
    ip: "192.168.1.104",
    nucleos: 8,
    so: "Windows 10 Pro",
  },
  5: {
    nome: "ESTACAO-0015",
    criticidade: "atencao",
    cpu24h: 8,
    cpuAtivos: 3,
    ram24h: 12,
    ramAtivos: 6,
    rede24h: 4,
    redeAtivos: 1,
    disco24h: 9,
    discoAtivos: 4,
    cpuLimite: 80,
    ramLimite: 85,
    discoLimite: 88,
    redeLimite: 3.2,
    modelo: "Dell OptiPlex 3050 SFF",
    ip: "192.168.1.105",
    nucleos: 8,
    so: "Windows 10 Pro",
  },
  6: {
    nome: "ESTACAO-0030",
    criticidade: "manutencao",
    cpu24h: 0,
    cpuAtivos: 0,
    ram24h: 0,
    ramAtivos: 0,
    rede24h: 0,
    redeAtivos: 0,
    disco24h: 0,
    discoAtivos: 0,
    cpuLimite: 90,
    ramLimite: 85,
    discoLimite: 88.8,
    redeLimite: 3.5,
    modelo: "Dell OptiPlex 3060",
    ip: "192.168.1.106",
    nucleos: 8,
    so: "Windows 11 Pro",
  },
};

const LINHA_DATA_DEFAULT = {
  labels: ["21h", "23h", "01h", "03h", "05h", "07h", "09h", "11h", "13h"],
  datasets: [
    {
      label: "Uso de CPU",
      data: [80, 75, 90, 85, 100, 95, 110, 105, 120],
      borderColor: COLORS.alpha.line,
      tension: 0.4,
      fill: true,
      order: 4,
      pointBackgroundColor: COLORS.alpha.point,
      pointBorderColor: "#fff",
      pointRadius: 5,
      pointHoverRadius: 8,
    },
    {
      label: "Uso de RAM",
      data: [60, 65, 70, 75, 85, 80, 95, 90, 105],
      borderColor: COLORS.beta.line,
      tension: 0.4,
      fill: true,
      order: 3,
      pointBackgroundColor: COLORS.beta.point,
      pointBorderColor: "#fff",
      pointRadius: 5,
      pointHoverRadius: 8,
    },
    {
      label: "Uso do Disco",
      data: [70, 60, 55, 65, 70, 60, 75, 80, 90],
      borderColor: COLORS.gamma.line,
      tension: 0.4,
      fill: true,
      order: 2,
      pointBackgroundColor: COLORS.gamma.point,
      pointBorderColor: "#fff",
      pointRadius: 5,
      pointHoverRadius: 8,
    },
    {
      label: "Taxa de utilização de rede",
      data: [50, 55, 50, 45, 60, 70, 65, 75, 85],
      borderColor: COLORS.delta.line,
      tension: 0.4,
      fill: true,
      order: 1,
      pointBackgroundColor: COLORS.delta.point,
      pointBorderColor: "#fff",
      pointRadius: 5,
      pointHoverRadius: 8,
    },
  ],
};

function getOpcoesChart() {
  const maquina = MAQUINAS_DATA[maquinaAtualId];
  const limiteMax = getLimiteMaximo();
  const limiteMin = getLimiteMinimo();

  const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "Segoe UI", size: 14 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        titleFont: { size: 16, weight: "bold" },
        bodyFont: { size: 14 },
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += `${(context.parsed.y / 2).toFixed(1)}%`;
            }
            return label;
          },
        },
      },
      annotation:
        componenteAtual !== "todos"
          ? {
              annotations: {
                limiteMax: {
                  type: "line",
                  yMin: limiteMax * 2,
                  yMax: limiteMax * 2,
                  borderColor: "rgb(255, 99, 132)",
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    display: true,
                    content: `Limite Máximo: ${limiteMax}%`,
                    position: "end",
                    backgroundColor: "rgba(255, 99, 132, 0.8)",
                    color: "white",
                    font: { size: 11 },
                  },
                },
                limiteMin: {
                  type: "line",
                  yMin: limiteMin * 2,
                  yMax: limiteMin * 2,
                  borderColor: "rgb(54, 162, 235)",
                  borderWidth: 2,
                  borderDash: [5, 5],
                  label: {
                    display: true,
                    content: `Limite Mínimo: ${limiteMin.toFixed(1)}%`,
                    position: "start",
                    backgroundColor: "rgba(54, 162, 235, 0.8)",
                    color: "white",
                    font: { size: 11 },
                  },
                },
              },
            }
          : {},
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(0, 0, 0, 0.08)", drawBorder: false },
        ticks: {
          font: { family: "Segoe UI", size: 12 },
          color: "#666",
          callback: (value) => ` ${(value / 2).toFixed(0)}%`,
        },
        title: {
          display: true,
          text: "Porcentagem(%)",
          font: { family: "Segoe UI", size: 14, weight: "bold" },
          color: "#555",
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "Segoe UI", size: 12 }, color: "#666" },
        title: {
          display: true,
          text: "Horário (horas)",
          font: { family: "Segoe UI", size: 14, weight: "bold" },
          color: "#555",
        },
      },
    },
    animation: { duration: 2000, easing: "easeInOutQuart" },
  };
  return opcoes;
}

function getLimiteMaximo() {
  const maquina = MAQUINAS_DATA[maquinaAtualId];
  switch (componenteAtual) {
    case "cpu":
      return maquina.cpuLimite;
    case "ram":
      return maquina.ramLimite;
    case "disco":
      return maquina.discoLimite;
    case "rede":
      return maquina.redeLimite;
    default:
      return 90;
  }
}

function getLimiteMinimo() {
  return getLimiteMaximo() * 0.7;
}

function createGradient(ctx, chartArea, color, isTopPerformer = false) {
  if (!ctx || !chartArea || chartArea.top === undefined) return;
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.top,
    0,
    chartArea.bottom
  );
  if (isTopPerformer) {
    gradient.addColorStop(0, color.replace("0.8", "0.6"));
    gradient.addColorStop(0.5, color.replace("0.8", "0.3"));
    gradient.addColorStop(1, color.replace("0.8", "0.0"));
  } else {
    gradient.addColorStop(0, color.replace("0.8", "0.4"));
    gradient.addColorStop(0.5, color.replace("0.8", "0.15"));
    gradient.addColorStop(1, color.replace("0.8", "0.0"));
  }
  return gradient;
}

function applyGradients(chart) {
  const ctx = chart.ctx;
  const chartArea = chart.chartArea;
  if (!chartArea || !chart.data.datasets.length) return;
  const colorKeys = ["alpha", "beta", "gamma", "delta"];
  chart.data.datasets.forEach((dataset, index) => {
    let isTop = index === 0;
    let colorLine = COLORS[colorKeys[index]].line;
    dataset.backgroundColor = createGradient(ctx, chartArea, colorLine, isTop);
  });
}

function getNewValue(min, max) {
  const value = Math.random() * (max - min) + min;
  return value.toFixed(1);
}

async function fetchData(idMaquina) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTime = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    label: newTime,
    cpu: getNewValue(12, 78),
    ram: getNewValue(75, 89),
    disco: getNewValue(87, 95),
    rede: getNewValue(1, 4),
  };
}

async function updateChartData(chart) {
  const newPoint = await fetchData(maquinaAtualId);
  chart.data.datasets.forEach((dataset, index) => {
    let newValue;
    switch (index) {
      case 0:
        newValue = newPoint.cpu;
        break;
      case 1:
        newValue = newPoint.ram;
        break;
      case 2:
        newValue = newPoint.disco;
        break;
      case 3:
        newValue = newPoint.rede;
        break;
    }
    dataset.data.shift();
    dataset.data.push(newValue);
  });
  chart.data.labels.shift();
  chart.data.labels.push(newPoint.label);
  applyGradients(chart);
  chart.update();
}

function initLinhaChart(idMaquina) {
  if (linhaChartInstance) {
    linhaChartInstance.destroy();
  }
  if (linhaIntervalId) {
    clearInterval(linhaIntervalId);
  }
  const canvas = document.getElementById(LINHA_CHART_ID);
  if (!canvas) {
    console.error(`Elemento canvas com ID "${LINHA_CHART_ID}" não encontrado.`);
    return;
  }
  let ctx;
  try {
    ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Não foi possível obter o contexto 2D do canvas.");
      return;
    }
  } catch (e) {
    console.error("Erro ao obter o contexto do canvas:", e);
    return;
  }

  let dataCopy = JSON.parse(JSON.stringify(LINHA_DATA_DEFAULT));

  if (componenteAtual !== "todos") {
    let datasetIndex;
    switch (componenteAtual) {
      case "cpu":
        datasetIndex = 0;
        break;
      case "ram":
        datasetIndex = 1;
        break;
      case "disco":
        datasetIndex = 2;
        break;
      case "rede":
        datasetIndex = 3;
        break;
    }
    dataCopy.datasets = [dataCopy.datasets[datasetIndex]];
  }

  linhaChartInstance = new Chart(ctx, {
    type: "line",
    data: dataCopy,
    options: getOpcoesChart(),
  });

  setTimeout(() => {
    applyGradients(linhaChartInstance);
    linhaChartInstance.update();
  }, 50);

  linhaChartInstance.options.onResize = () =>
    applyGradients(linhaChartInstance);
  linhaIntervalId = setInterval(() => {
    updateChartData(linhaChartInstance);
  }, 5000);
}

function trocar_maquina(idMaquina) {
  maquinaAtualId = idMaquina;
  atualizarDetalhes();
  initLinhaChart(idMaquina);
}

function atualizarDetalhes() {
  const maquina = MAQUINAS_DATA[maquinaAtualId];

  document.getElementById("tituloDetalhes").textContent =
    `${maquina.nome} | Histórico de Utilização de Recursos`;

  document.getElementById("cpu24h").textContent = maquina.cpu24h;
  document.getElementById("cpuAtivos").textContent = maquina.cpuAtivos;
  document.getElementById("cpuAtivos").className =
    `fw-bold fs-5 ${maquina.cpuAtivos > 5 ? "text-danger" : maquina.cpuAtivos > 2 ? "text-warning" : "text-success"}`;

  document.getElementById("ram24h").textContent = maquina.ram24h;
  document.getElementById("ramAtivos").textContent = maquina.ramAtivos;
  document.getElementById("ramAtivos").className =
    `fw-bold fs-5 ${maquina.ramAtivos > 5 ? "text-danger" : maquina.ramAtivos > 2 ? "text-warning" : "text-success"}`;

  document.getElementById("rede24h").textContent = maquina.rede24h;
  document.getElementById("redeAtivos").textContent = maquina.redeAtivos;
  document.getElementById("redeAtivos").className =
    `fw-bold fs-5 ${maquina.redeAtivos > 3 ? "text-danger" : maquina.redeAtivos > 1 ? "text-warning" : "text-success"}`;

  document.getElementById("disco24h").textContent = maquina.disco24h;
  document.getElementById("discoAtivos").textContent = maquina.discoAtivos;
  document.getElementById("discoAtivos").className =
    `fw-bold fs-5 ${maquina.discoAtivos > 5 ? "text-danger" : maquina.discoAtivos > 2 ? "text-warning" : "text-success"}`;

  document.getElementById("infoModelo").textContent = maquina.modelo;
  document.getElementById("infoIp").textContent = maquina.ip;
  document.getElementById("infoNucleos").textContent = maquina.nucleos;
  document.getElementById("infoSo").textContent = maquina.so;
}

function filtrarMaquinas(filtro) {
  filtroAtual = filtro;
  const cards = document.querySelectorAll(".card-recurso");

  cards.forEach((card) => {
    const idMaquina = parseInt(card.getAttribute("data-maquina-id"));
    const maquina = MAQUINAS_DATA[idMaquina];

    if (filtro === "todas") {
      card.style.display = "block";
    } else if (maquina.criticidade === filtro) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function trocarComponente(componente) {
  componenteAtual = componente;
  initLinhaChart(maquinaAtualId);
}

function buscarMaquina(termo) {
  const cards = document.querySelectorAll(".card-recurso");
  termo = termo.toLowerCase();

  cards.forEach((card) => {
    const nome = card.querySelector(".card-title").textContent.toLowerCase();
    if (nome.includes(termo) || termo === "") {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLinhaChart(maquinaAtualId);
  atualizarDetalhes();

  document.querySelectorAll(".btn-custom-status").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".btn-custom-status")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const filtro = this.getAttribute("data-filtro");
      filtrarMaquinas(filtro);
    });
  });

  document.querySelectorAll(".card-recurso button").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".card-recurso");
      const idMaquina = parseInt(card.getAttribute("data-maquina-id"));
      trocar_maquina(idMaquina);
    });
  });

  document.getElementById("inputBusca").addEventListener("input", (e) => {
    buscarMaquina(e.target.value);
  });

  document.querySelectorAll("[data-componente]").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const componente = this.getAttribute("data-componente");
      const btnText = this.textContent;
      document.getElementById("dropdownComponente").textContent =
        componente === "todos" ? "Todos" : btnText;
      trocarComponente(componente);
    });
  });
});
