let linhaChartInstance = null;
let linhaIntervalId = null;
let maquinaAtualId = 1;
const LINHA_CHART_ID = "utilizacaoChart";
const COLORS = {
    alpha: { line: "rgba(157, 206, 206, 0.8)", point: "#BADCDA" },
    beta: { line: "rgba(62, 150, 131, 0.8)", point: "#0C8186" },
    gamma: { line: "rgba(230, 126, 34, 0.8)", point: "#e67e22" },
    delta: { line: "rgba(51, 51, 51, 0.8)", point: "#000000ff" },
};
const LINHA_DATA_DEFAULT = {
    labels: ["21h", "23h", "01h", "03h", "05h", "07h", "09h", "11h", "13h"],
    datasets: [
        { label: "Uso de CPU  ", data: [80, 75, 90, 85, 100, 95, 110, 105, 120], borderColor: COLORS.alpha.line, tension: 0.4, fill: true, order: 4, pointBackgroundColor: COLORS.alpha.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Uso de RAM  ", data: [60, 65, 70, 75, 85, 80, 95, 90, 105], borderColor: COLORS.beta.line, tension: 0.4, fill: true, order: 3, pointBackgroundColor: COLORS.beta.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Uso do Disco Duro  ", data: [70, 60, 55, 65, 70, 60, 75, 80, 90], borderColor: COLORS.gamma.line, tension: 0.4, fill: true, order: 2, pointBackgroundColor: COLORS.gamma.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Taxa de utilização de rede  ", data: [50, 55, 50, 45, 60, 70, 65, 75, 85], borderColor: COLORS.delta.line, tension: 0.4, fill: true, order: 1, pointBackgroundColor: COLORS.delta.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
    ]
};

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
                    if (label) { label += ": "; }
                    if (context.parsed.y !== null) {
                        label += `${context.parsed.y / 2}%`;
                    }
                    return label;
                },
            },
        },
    },
    scales: {
        y: {
            beginAtZero: false,
            grid: { color: "rgba(0, 0, 0, 0.08)", drawBorder: false },
            ticks: { font: { family: "Segoe UI", size: 12 }, color: "#666", callback: (value) => ` ${value / 2}%` },
            title: { display: true, text: "Porcentagem(%)", font: { family: "Segoe UI", size: 14, weight: "bold" }, color: "#555" },
        },
        x: {
            grid: { display: false },
            ticks: { font: { family: "Segoe UI", size: 12 }, color: "#666" },
            title: { display: true, text: "Horário (horas)", font: { family: "Segoe UI", size: 14, weight: "bold" }, color: "#555" },
        },
    },
    animation: {
        duration: 2000,
        easing: "easeInOutQuart",
    },
};

function createGradient(ctx, chartArea, color, isTopPerformer = false) {
    if (!ctx || !chartArea || chartArea.top === undefined) return;

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
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

    const colorKeys = ['alpha', 'beta', 'gamma', 'delta'];

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
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return {
        label: newTime,
        cpu: getNewValue(12.4, 85),
        ram: getNewValue(74.3, 95),
        disco: getNewValue(87.5, 90),
        rede: getNewValue(1, 4)
    };
}

async function updateChartData(chart) {
    const newPoint = await fetchData(maquinaAtualId);

    chart.data.datasets.forEach((dataset, index) => {
        let newValue;
        switch (index) {
            case 0: newValue = newPoint.cpu; break;
            case 1: newValue = newPoint.ram; break;
            case 2: newValue = newPoint.disco; break;
            case 3: newValue = newPoint.rede; break;
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
    const dataCopy = JSON.parse(JSON.stringify(LINHA_DATA_DEFAULT));
    linhaChartInstance = new Chart(ctx, {
        type: "line",
        data: dataCopy,
        options: opcoes,
    });
    setTimeout(() => {
        applyGradients(linhaChartInstance);
        linhaChartInstance.update();
    }, 50);
    linhaChartInstance.options.onResize = () => applyGradients(linhaChartInstance);
    linhaIntervalId = setInterval(() => {
        updateChartData(linhaChartInstance);
    }, 5000);
}

const Maquinas = {
    1: 'Estacao-001',
    2: 'Estacao-002',
    3: 'Estacao-003',
    4: 'Estacao-004',
    5: 'Estacao-005',
}

function trocar_maquina(idMaquina) {
    maquinaAtualId = idMaquina;
    const txt_nome_display = document.getElementById("valor_pesquisa");
    const txt_nome_header = document.getElementById("nome_maquina");
    const nomeMaquina = Maquinas[idMaquina];
    if (txt_nome_display) txt_nome_display.innerHTML = nomeMaquina;
    if (txt_nome_header) txt_nome_header.innerHTML = nomeMaquina;
    initLinhaChart(idMaquina);
}

document.addEventListener('DOMContentLoaded', () => {
    initLinhaChart(maquinaAtualId);
});