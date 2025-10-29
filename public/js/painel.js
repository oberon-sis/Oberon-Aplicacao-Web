let linhaChartInstance = null;
let linhaIntervalId = null;
let maquinaAtualId = 1;
let filtroAtual = 'todas';
let componenteAtual = 'cpu';
const LINHA_CHART_ID = 'utilizacaoChart';

const COLORS = {
  cpu: { line: 'rgba(157, 206, 206, 0.8)', point: '#BADCDA' },
  ram: { line: 'rgba(62, 150, 131, 0.8)', point: '#0C8186' },
  disco: { line: 'rgba(230, 126, 34, 0.8)', point: '#e67e22' },
  rede: { line: 'rgba(51, 51, 51, 0.8)', point: '#000000ff' },
};

const MAQUINAS_DATA = {
  1: {
    nome: 'ESTACAO-0021',
    criticidade: 'normal',
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
    redeLimite: 80,
    modelo: 'Dell OptiPlex 3050 SFF',
    ip: '192.168.1.101',
    nucleos: 8,
    so: 'Windows 10 Pro',
  },
  2: {
    nome: 'ESTACAO-0022',
    criticidade: 'ocioso',
    cpu24h: 4,
    cpuAtivos: 2,
    ram24h: 2,
    ramAtivos: 1,
    rede24h: 1,
    redeAtivos: 0,
    disco24h: 3,
    discoAtivos: 1,
    cpuLimite: 90,
    ramLimite: 85,
    discoLimite: 88.8,
    redeLimite: 80,
    modelo: 'Dell OptiPlex 5060',
    ip: '192.168.1.102',
    nucleos: 8,
    so: 'Windows 10 Pro',
  },
  3: {
    nome: 'ESTACAO-0001',
    criticidade: 'critico',
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
    redeLimite: 60,
    modelo: 'Dell OptiPlex 3050 SFF',
    ip: '192.168.1.103',
    nucleos: 8,
    so: 'Windows 10 Pro',
  },
  4: {
    nome: 'ESTACAO-0002',
    criticidade: 'offline',
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
    redeLimite: 80,
    modelo: 'Dell OptiPlex 7060',
    ip: '192.168.1.104',
    nucleos: 8,
    so: 'Windows 10 Pro',
  },
  5: {
    nome: 'ESTACAO-0015',
    criticidade: 'atencao',
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
    redeLimite: 70,
    modelo: 'Dell OptiPlex 3050 SFF',
    ip: '192.168.1.105',
    nucleos: 8,
    so: 'Windows 10 Pro',
  },
  6: {
    nome: 'ESTACAO-0030',
    criticidade: 'manutencao',
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
    redeLimite: 80,
    modelo: 'Dell OptiPlex 3060',
    ip: '192.168.1.106',
    nucleos: 8,
    so: 'Windows 11 Pro',
  },
};

const COMPONENT_LABELS = {
  cpu: 'Uso de CPU',
  ram: 'Uso de RAM',
  disco: 'Uso do Disco Duro',
  rede: 'Taxa de utilização de rede',
};

function getLimiteMaximo() {
  const maquina = MAQUINAS_DATA[maquinaAtualId];
  const limites = {
    cpu: maquina.cpuLimite,
    ram: maquina.ramLimite,
    disco: maquina.discoLimite,
    rede: maquina.redeLimite,
  };
  return limites[componenteAtual] || 90;
}

function getLimiteMinimo() {
  return getLimiteMaximo() * 0.7;
}

function getOpcoesChart() {
  const limiteMax = getLimiteMaximo();
  const limiteMin = getLimiteMinimo();
  const isRede = componenteAtual === 'rede';

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Segoe UI', size: 14 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 14 },
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += isRede
                ? `${context.parsed.y.toFixed(2)} Mbps`
                : `${context.parsed.y.toFixed(1)}%`;
            }
            return label;
          },
        },
      },
      annotation: {
        annotations: {
          limiteMax: {
            type: 'line',
            yMin: limiteMax,
            yMax: limiteMax,
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: isRede ? `Limite Máximo: ${limiteMax} Mbps` : `Limite Máximo: ${limiteMax}%`,
              position: 'end',
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              color: 'white',
              font: { size: 11 },
            },
          },
          limiteMin: {
            type: 'line',
            yMin: limiteMin,
            yMax: limiteMin,
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: isRede
                ? `Limite Mínimo: ${limiteMin.toFixed(2)} Mbps`
                : `Limite Mínimo: ${limiteMin.toFixed(1)}%`,
              position: 'start',
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              color: 'white',
              font: { size: 11 },
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.08)', drawBorder: false },
        ticks: {
          font: { family: 'Segoe UI', size: 12 },
          color: '#666',
          callback: (value) => (isRede ? `${value.toFixed(1)} Mbps` : `${value.toFixed(0)}%`),
        },
        title: {
          display: true,
          text: isRede ? 'Conectividade (Mbps)' : 'Porcentagem (%)',
          font: { family: 'Segoe UI', size: 14, weight: 'bold' },
          color: '#555',
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Segoe UI', size: 12 }, color: '#666' },
        title: {
          display: true,
          text: 'Horário (horas)',
          font: { family: 'Segoe UI', size: 14, weight: 'bold' },
          color: '#555',
        },
      },
    },
    animation: { duration: 2000, easing: 'easeInOutQuart' },
  };
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
}

function getNewValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function getValoresIniciais(maquina) {
  if (maquina.criticidade === 'ocioso') {
    return {
      cpu: { min: maquina.cpuLimite * 0.2, max: maquina.cpuLimite * 0.4 },
      ram: { min: maquina.ramLimite * 0.2, max: maquina.ramLimite * 0.4 },
      disco: { min: maquina.discoLimite * 0.2, max: maquina.discoLimite * 0.4 },
      rede: { min: maquina.redeLimite * 0.2, max: maquina.redeLimite * 0.4 },
    };
  }
  return {
    cpu: { min: maquina.cpuLimite * 0.7, max: maquina.cpuLimite * 1.05 },
    ram: { min: maquina.ramLimite * 0.6, max: maquina.ramLimite * 1.05 },
    disco: { min: maquina.discoLimite * 0.65, max: maquina.discoLimite * 1.02 },
    rede: { min: maquina.redeLimite * 0.7, max: maquina.redeLimite * 1.05 },
  };
}

async function fetchData(idMaquina) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const maquina = MAQUINAS_DATA[idMaquina];
  const newTime = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const valores = getValoresIniciais(maquina);

  return {
    label: newTime,
    cpu: getNewValue(valores.cpu.min, valores.cpu.max),
    ram: getNewValue(valores.ram.min, valores.ram.max),
    disco: getNewValue(valores.disco.min, valores.disco.max),
    rede: getNewValue(valores.rede.min, valores.rede.max),
  };
}

async function updateChartData(chart) {
  const newPoint = await fetchData(maquinaAtualId);

  chart.data.datasets[0].data.shift();
  chart.data.datasets[0].data.push(parseFloat(newPoint[componenteAtual]));

  chart.data.labels.shift();
  chart.data.labels.push(newPoint.label);
  applyGradients(chart);
  chart.update();
}

function initLinhaChart(idMaquina) {
  if (linhaChartInstance) linhaChartInstance.destroy();
  if (linhaIntervalId) clearInterval(linhaIntervalId);

  const canvas = document.getElementById(LINHA_CHART_ID);
  if (!canvas) {
    console.error(`Elemento canvas com ID "${LINHA_CHART_ID}" não encontrado.`);
    return;
  }

  const maquina = MAQUINAS_DATA[idMaquina];

  if (maquina.criticidade === 'offline' || maquina.criticidade === 'manutencao') {
    canvas.style.display = 'none';
    let mensagemDiv = document.getElementById('mensagemGrafico');
    if (!mensagemDiv) {
      mensagemDiv = document.createElement('div');
      mensagemDiv.id = 'mensagemGrafico';
      mensagemDiv.style.cssText =
        'display: flex; align-items: center; justify-content: center; height: 300px; background-color: #f8f9fa; border-radius: 0.375rem; font-size: 1.2rem; color: #6c757d; font-weight: 500;';
      canvas.parentElement.appendChild(mensagemDiv);
    }
    mensagemDiv.style.display = 'flex';
    mensagemDiv.textContent =
      maquina.criticidade === 'offline' ? 'Máquina OFF-LINE' : 'Máquina em Manutenção';
    return;
  }

  const mensagemDiv = document.getElementById('mensagemGrafico');
  if (mensagemDiv) mensagemDiv.style.display = 'none';
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Não foi possível obter o contexto 2D do canvas.');
    return;
  }

  const valores = getValoresIniciais(maquina);
  const componenteValor = valores[componenteAtual];

  const dataChart = {
    labels: ['21h', '23h', '01h', '03h', '05h', '07h', '09h', '11h', '13h'],
    datasets: [
      {
        label: COMPONENT_LABELS[componenteAtual],
        data: Array(9)
          .fill(0)
          .map(() => parseFloat(getNewValue(componenteValor.min, componenteValor.max))),
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
  }, 50);

  linhaChartInstance.options.onResize = () => applyGradients(linhaChartInstance);
  linhaIntervalId = setInterval(() => updateChartData(linhaChartInstance), 5000);
}

function trocar_maquina(idMaquina) {
  maquinaAtualId = idMaquina;
  atualizarDetalhes();
  initLinhaChart(idMaquina);
}

function atualizarDetalhes() {
  const maquina = MAQUINAS_DATA[maquinaAtualId];

  document.getElementById('tituloDetalhes').textContent =
    `${maquina.nome} | Histórico de Utilização de Recursos`;

  const metricas = [
    { id: 'cpu', valor: maquina.cpuAtivos },
    { id: 'ram', valor: maquina.ramAtivos },
    { id: 'rede', valor: maquina.redeAtivos },
    { id: 'disco', valor: maquina.discoAtivos },
  ];

  metricas.forEach((m) => {
    document.getElementById(`${m.id}24h`).textContent = maquina[`${m.id}24h`];
    document.getElementById(`${m.id}Ativos`).textContent = m.valor;
    const limite = m.id === 'rede' ? 3 : 5;
    const classe = m.valor > limite ? 'text-danger' : m.valor > 2 ? 'text-warning' : 'text-success';
    document.getElementById(`${m.id}Ativos`).className = `fw-bold fs-5 ${classe}`;
  });

  document.getElementById('infoModelo').textContent = maquina.modelo;
  document.getElementById('infoIp').textContent = maquina.ip;
  document.getElementById('infoNucleos').textContent = maquina.nucleos;
  document.getElementById('infoSo').textContent = maquina.so;
}

function filtrarMaquinas(filtro) {
  filtroAtual = filtro;
  document.querySelectorAll('.card-recurso').forEach((card) => {
    const idMaquina = parseInt(card.getAttribute('data-maquina-id'));
    const maquina = MAQUINAS_DATA[idMaquina];
    card.style.display = filtro === 'todas' || maquina.criticidade === filtro ? 'block' : 'none';
  });
}

function trocarComponente(componente) {
  componenteAtual = componente;
  initLinhaChart(maquinaAtualId);
}

function buscarMaquina(termo) {
  termo = termo.toLowerCase();
  document.querySelectorAll('.card-recurso').forEach((card) => {
    const nome = card.querySelector('.card-title').textContent.toLowerCase();
    card.style.display = nome.includes(termo) || termo === '' ? 'block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLinhaChart(maquinaAtualId);
  atualizarDetalhes();

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
  });
});
