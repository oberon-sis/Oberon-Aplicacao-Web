// GRAFICO DE LINHA --------------------------
const COLORS = {
    alpha: { line: "rgba(157, 206, 206, 0.8)", point: "#BADCDA" },
    beta: { line: "rgba(62, 150, 131, 0.8)", point: "#0C8186" },
    gamma: { line: "rgba(230, 126, 34, 0.8)", point: "#e67e22" },
    delta: { line: "rgba(51, 51, 51, 0.8)", point: "#000000ff" },
};
const dadosIniciais = {
    labels: ["21h", "23h", "01h", "03h", "05h", "07h", "09h", "11h", "13h"],
    datasets: [
        { label: "Uso de CPU  ", data: [80, 75, 90, 85, 100, 95, 110, 105, 120], borderColor: COLORS.alpha.line, tension: 0.4, fill: true, order: 4, pointBackgroundColor: COLORS.alpha.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Uso de RAM  ", data: [60, 65, 70, 75, 85, 80, 95, 90, 105], borderColor: COLORS.beta.line, tension: 0.4, fill: true, order: 3, pointBackgroundColor: COLORS.beta.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Uso do Disco Duro  ", data: [70, 60, 55, 65, 70, 60, 75, 80, 90], borderColor: COLORS.gamma.line, tension: 0.4, fill: true, order: 2, pointBackgroundColor: COLORS.gamma.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
        { label: "Taxa de utilização de rede  ", data: [50, 55, 50, 45, 60, 70, 65, 75, 85], borderColor: COLORS.delta.line, tension: 0.4, fill: true, order: 1, pointBackgroundColor: COLORS.delta.point, pointBorderColor: "#fff", pointRadius: 5, pointHoverRadius: 8, },
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
    if (!chartArea) return;
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

function getNewValue(oldValue) {
    const randomChange = Math.random() * 2 - 1;
    let newValue = oldValue + randomChange;
    return (Math.max(50, Math.min(130, newValue))).toFixed()
}

async function fetchData() {
    // simulnbado o featch para fazer a requisição fazer aqui-----------
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // const newTime = '15h'
    return {
        label: newTime,
        cpu: getNewValue(120),
        ram: getNewValue(110),
        disco: getNewValue(105),
        rede: getNewValue(100)
    };
}

async function updateChartData(chart) {
    const newPoint = await fetchData();

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

document.addEventListener("DOMContentLoaded", async () => {
    const ctx = document.getElementById("utilizacaoChart").getContext("2d");
    const meuGrafico = new Chart(ctx, {
        type: "line",
        data: dadosIniciais,
        options: opcoes,
    });
    await updateChartData(meuGrafico);
    meuGrafico.options.onResize = () => applyGradients(meuGrafico);
    setInterval(() => {
        updateChartData(meuGrafico);
    }, 5000);
});



// GRAFICO DE BARRA --------------------------




const CHART_ID = 'graficoBarrasComparativo';
const UPDATE_INTERVAL_MS = 3000;
const MAX_VALUE_X = 9;

const labels = [
    'Alerta de CPU',
    'Alerta de RAM',
    'Alerta de Disco Duro',
    'Alerta de Rede',
    'Alerta de OFF-LINE',
    'Alerta de Falha na Coleta'
];

const semanaPassadaTotalFixa = [9, 6, 8, 7, 7, 6];

let nestaSemanaData = [6, 4, 5, 5, 4, 4];

function getNewRandomValue(currentValue) {
    const randomChange = Math.random() * 0.3;

    let newValue = currentValue + randomChange;
    const maxAllowed = Math.min(...semanaPassadaTotalFixa) - 0.1; 
    return Math.min(newValue, maxAllowed);
}

function calculateSemanaPassadaComplement(currentNestaSemanaData) {
    return semanaPassadaTotalFixa.map((total, index) => {
        return Math.max(0, total - currentNestaSemanaData[index]);
    });
}

function fetchNewData() {
    return new Promise(resolve => {
        setTimeout(() => {
            nestaSemanaData = nestaSemanaData.map(getNewRandomValue);
            resolve(nestaSemanaData);
        }, 500);
    });
}

const initialData = {
    labels: labels,
    datasets: [
        {
            label: 'Semana Passada',
            data: calculateSemanaPassadaComplement(nestaSemanaData),
            backgroundColor: '#ecf0f1',
            borderColor: '#ecf0f1',
            order: 2,
            categoryPercentage: 0.8,
            barPercentage: 0.9
        },
        {
            label: 'Nesta Semana',
            data: nestaSemanaData,
            backgroundColor: '#0C8186',
            borderColor: '#0C8186',
            order: 1,
            categoryPercentage: 0.8,
            barPercentage: 0.9
        }
    ]
};

const config = {
    type: 'bar',
    data: initialData,
    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeInOutQuart' },
        scales: {
            x: {
                stacked: true,
                grid: { display: true, color: 'rgba(0, 0, 0, 0.08)' },
                ticks: { font: { family: "Segoe UI", size: 12 }, color: "#666", callback: (value) => ` ${value}` },
               title: { display: true, text: "Total de Ocorrências", font: { family: "Segoe UI", size: 14, weight: "bold" }, color: "#555" },
                max: MAX_VALUE_X,
                min: 0,
            },
            y: {
                stacked: true,
                grid: { display: false },
                ticks: { font: { size: 13, weight: 'bold' } }
            }
        },
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                cornerRadius: 6,
                callbacks: {
                    filter: function (item) {
                        return item.datasetIndex === 1;
                    },
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.x !== null) {
                            label += context.parsed.x.toFixed(2) + ' Ocorrências';
                        }
                        return label;
                    }
                }
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById(CHART_ID).getContext('2d');
    const meuGrafico = new Chart(ctx, config);

    setInterval(async () => {
        await fetchNewData();

        const novoComplemento = calculateSemanaPassadaComplement(nestaSemanaData);

        meuGrafico.data.datasets[1].data = nestaSemanaData;

        meuGrafico.data.datasets[0].data = novoComplemento;

        meuGrafico.update();
    }, UPDATE_INTERVAL_MS);
});
