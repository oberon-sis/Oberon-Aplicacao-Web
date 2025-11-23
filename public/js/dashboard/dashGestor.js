// Variáveis globais para gráficos
let chartTendencia = null;
let chartProgressao = null;
let chartMapaRisco = null;

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(el => new bootstrap.Popover(el));

    // Inicializa gráficos vazios
    initGraficosVazios();

    // Carrega dados da dashboard
    carregarDadosDashboard();
});

/**
 * Busca dados consolidados do back-end
 */
async function carregarDadosDashboard() {
    try {
        const response = await fetch('http://localhost:3333/api/dashboard-estrategica/kpis');
        const kpis = await response.json();
        atualizarKPIs(kpis);

        const responseRanking = await fetch('http://localhost:3333/api/dashboard-estrategica/ranking-intervencao');
        const ranking = await responseRanking.json();
        atualizarRanking(ranking);

        const responseTendencia = await fetch('http://localhost:3333/api/dashboard-estrategica/tendencia-desgaste');
        const tendencia = await responseTendencia.json();
        atualizarTendencia(tendencia);

        const responseProgressao = await fetch('http://localhost:3333/api/dashboard-estrategica/progressao-alertas');
        const progressao = await responseProgressao.json();
        atualizarProgressao(progressao);

        const responseMapa = await fetch('http://localhost:3333/api/dashboard-estrategica/mapa-risco');
        const mapa = await responseMapa.json();
        atualizarMapaRisco(mapa);

    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
}

/**
 * Atualiza os KPIs
 */
function atualizarKPIs(kpis) {
    document.getElementById('txt_crescimento_alertas').innerText = kpis.crescimentoAlertas + "%";
    document.getElementById('txt_tempo_alertas').innerText = kpis.tempoEntreAlertas + " min";
    document.getElementById('txt_componente_critico').innerText = kpis.componenteCritico;
    document.getElementById('txt_previsao_alertas').innerText = kpis.previsaoAlertas;
    document.getElementById('txt_maquinas_suspeitas').innerText = kpis.maquinasSuspeitas;
}

/**
 * Atualiza ranking de máquinas
 */
function atualizarRanking(ranking) {
    const tbody = document.getElementById('tbody-ranking-intervencao');
    tbody.innerHTML = "";
    ranking.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.maquina}</td>
                <td>${item.severidade}</td>
                <td>${item.alertas}</td>
            </tr>
        `;
    });
}

/**
 * Atualiza gráfico de tendência
 */
function atualizarTendencia(dados) {
    chartTendencia.data.labels = [...new Set(dados.map(d => d.mes))];
    chartTendencia.data.datasets[0].data = dados.filter(d => d.tipoComponente === 'CPU').map(d => d.mediaUso);
    chartTendencia.data.datasets[1].data = dados.filter(d => d.tipoComponente === 'RAM').map(d => d.mediaUso);
    chartTendencia.data.datasets[2].data = dados.filter(d => d.tipoComponente === 'Disco').map(d => d.mediaUso);
    chartTendencia.update();
}

/**
 * Atualiza gráfico de progressão
 */
function atualizarProgressao(dados) {
    chartProgressao.data.labels = dados.map(d => "Semana " + d.semana);
    chartProgressao.data.datasets[0].data = dados.map(d => d.acumulado);
    chartProgressao.update();
}

/**
 * Atualiza mapa de risco
 */
function atualizarMapaRisco(dados) {
    chartMapaRisco.data.labels = dados.map(d => d.maquina);
    chartMapaRisco.data.datasets[0].data = dados.map(d => d.risco === 'Alto' ? 3 : d.risco === 'Moderado' ? 2 : 1);
    chartMapaRisco.data.datasets[0].backgroundColor = dados.map(d => d.risco === 'Alto' ? 'red' : d.risco === 'Moderado' ? 'yellow' : 'green');
    chartMapaRisco.update();
}

/**
 * Inicializa gráficos vazios
 */
function initGraficosVazios() {
    chartTendencia = new Chart(document.getElementById('tendenciaDesgasteChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'CPU', data: [], borderColor: 'blue', fill: false },
            { label: 'RAM', data: [], borderColor: 'orange', fill: false },
            { label: 'Disco', data: [], borderColor: 'green', fill: false }
        ] }
    });

    chartProgressao = new Chart(document.getElementById('progressaoAlertasChart').getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Alertas Acumulados', data: [], borderColor: 'red', fill: false }
        ] }
    });

    chartMapaRisco = new Chart(document.getElementById('mapaRiscoChart').getContext('2d'), {
        type: 'bar',
        data: { labels: [], datasets: [
            { label: 'Nível de Risco', data: [], backgroundColor: [] }
        ] },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: val => val === 3 ? 'Alto' : val === 2 ? 'Moderado' : 'Baixo'
                    }
                }
            }
        }
    });
}
