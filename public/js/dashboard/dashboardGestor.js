
let chartEvolucao = null;
let chartMatriz = null;
let bimestreAtual = 6; 

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa os popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) { 
        return new bootstrap.Popover(popoverTriggerEl); 
    });

    // 1. Renderiza os gráficos vazios inicialmente
    initGraficosVazios();

    // 2. Define o texto inicial do botão de período
    document.getElementById('valor_pesquisa_periodo').innerText = `Bimestre ${bimestreAtual}`;
    document.querySelector(".header-top h2.fs-5").innerText = `2025 - Bimestre ${bimestreAtual}`;

    // 3. Busca os dados reais do backend
    carregarDadosDashboard(bimestreAtual);
});

/**
 * Função principal que orquestra a busca de dados
 * Agora recebe o bimestre como parâmetro
 */
function carregarDadosDashboard(bimestre) {
    const usuarioString = sessionStorage.getItem('usuario');
    const usuarioObjeto = JSON.parse(usuarioString);

    const idEmpresa = usuarioObjeto.fkEmpresa

    console.log(`Buscando dados da empresa ${idEmpresa} para o Bimestre ${bimestre}...`);


    fetch(`/dashboard/geral/${idEmpresa}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bimestre: bimestre
        })
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error("Erro na resposta do servidor");
    })
    .then(data => {
        console.log("Dados recebidos:", data);
        atualizarKPIs(data.kpis);
        atualizarListas(data.listas);
        atualizarGraficos(data.graficos);
    })
    .catch(error => {
        console.error("Erro ao carregar dashboard:", error);
    });
}

/**
 * Funções Auxiliares da UI
 */
function filtrarPeriodo(bimestreSelecionado) {
    // 1. Atualiza a variável global
    bimestreAtual = bimestreSelecionado;

    // 2. Feedback Visual: Atualiza os textos da tela
    document.getElementById('valor_pesquisa_periodo').innerText = `Bimestre ${bimestreSelecionado}`;
    document.querySelector(".header-top h2.fs-5").innerText = `2025 - Bimestre ${bimestreSelecionado}`;

    console.log(`Trocando filtro para Bimestre ${bimestreSelecionado}...`);

    // 3. Chama a função de busca novamente com o novo valor
    carregarDadosDashboard(bimestreSelecionado);
}

function atualizarKPIs(kpis) {
    document.getElementById('txt_total_maquinas').innerText = kpis.totalMaquinas;
    document.getElementById('txt_maquinas_sobrecarga').innerText = kpis.maquinasSobrecarga;
    document.getElementById('txt_risco_disco').innerText = kpis.maquinasRiscoDisco;
    document.getElementById('txt_maquinas_ociosas').innerText = kpis.maquinasOciosas;
    document.getElementById('txt_total_incidentes').innerText = kpis.totalIncidentes;
}

function atualizarListas(listas) {
    preencherTabela('tbody-sobrecarga', listas.topSobrecarga, true);
    preencherTabela('tbody-ociosas', listas.topOciosas, false);
}

function preencherTabela(elementId, dados, isCritico) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = ""; 
    
    // Verifica se veio nulo ou vazio para evitar erro de .forEach
    if (!dados || dados.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' class='text-center'>Sem dados neste período</td></tr>";
        return;
    }

    dados.forEach(item => {
        const cpuVal = item.media_cpu ? Number(item.media_cpu).toFixed(1) : "0.0";
        const ramVal = item.media_ram ? Number(item.media_ram).toFixed(1) : "0.0";
        const classeCor = isCritico ? "text-danger" : "text-success";

        tbody.innerHTML += `
            <tr>
                <td>${item.nomeMaquina}</td>
                <td><span class="${classeCor}">${cpuVal}%</span></td>
                <td><span class="${classeCor}">${ramVal}%</span></td>
            </tr>
        `;
    });
}

function atualizarGraficos(dadosGraficos) {
    // --- 1. Atualiza Matriz de Otimização ---
   
    chartMatriz.data.datasets[0].data = [];
    
    const dadosPontos = dadosGraficos.matriz.map(m => ({
        x: m.media_cpu || 0,
        y: m.media_ram || 0,
        maquina: m.nomeMaquina
    }));
    
    chartMatriz.data.datasets[0].data = dadosPontos;
    chartMatriz.update();

    // --- 2. Atualiza Evolução (Line Chart) ---
    const alertas = dadosGraficos.evolucao;
    
    const labels = [...new Set(alertas.map(a => a.dia))];
    
    const dadosCPU = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'CPU');
        return found ? found.qtd_alertas : 0;
    });
    const dadosRAM = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'RAM');
        return found ? found.qtd_alertas : 0;
    });
    const dadosDisco = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'DISCO');
        return found ? found.qtd_alertas : 0;
    });

    chartEvolucao.data.labels = labels;
    chartEvolucao.data.datasets[0].data = dadosCPU;
    chartEvolucao.data.datasets[1].data = dadosRAM;
    chartEvolucao.data.datasets[2].data = dadosDisco;
    chartEvolucao.update();
}

function initGraficosVazios() {
    // --- Configuração Gráfico Evolução (Linha) ---
    const ctx1 = document.getElementById('evolucaoComponentesChart').getContext('2d');
    chartEvolucao = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Alertas CPU', data: [], borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', tension: 0.3, pointRadius: 3 },
                { label: 'Alertas RAM', data: [], borderColor: '#ffc107', backgroundColor: 'rgba(255, 193, 7, 0.1)', tension: 0.3, pointRadius: 3 },
                { label: 'Alertas Disco', data: [], borderColor: '#0dcaf0', backgroundColor: 'rgba(13, 202, 240, 0.1)', tension: 0.3, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'bottom' } 
            },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Qtd. Alertas Críticos' },
                    ticks: { stepSize: 1 }
                } 
            }
        }
    });

    // --- Configuração Gráfico Matriz (Scatter) ---
    const ctx2 = document.getElementById('matrizOtimizacaoChart').getContext('2d');
    chartMatriz = new Chart(ctx2, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Máquinas',
                data: [],
                backgroundColor: ctx => {
                    const v = ctx.raw;
                    if(!v) return '#999';
                    if(v.x > 80 || v.y > 80) return '#dc3545'; // Crítico
                    if(v.x < 20 && v.y < 20) return '#198754'; // Ocioso
                    return '#0dcaf0'; // Normal
                },
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const nome = ctx.raw.maquina || 'Máquina';
                            return `${nome}: CPU ${ctx.raw.x.toFixed(1)}% / RAM ${ctx.raw.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Média Uso CPU (%)' }, min: 0, max: 100 },
                y: { title: { display: true, text: 'Média Uso RAM (%)' }, min: 0, max: 100 }
            }
        }
    });
}

function iniciarTourGestor() {
    console.log("Iniciando o Tour do Painel de Gestão...");
}