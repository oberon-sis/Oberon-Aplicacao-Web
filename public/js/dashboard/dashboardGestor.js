// Variáveis globais para armazenar as instâncias dos gráficos e permitir atualização
let chartEvolucao = null;
let chartMatriz = null;

document.addEventListener("DOMContentLoaded", function() {
    // Inicializa os popovers do Bootstrap (ferramentas de dica visual)
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) { 
        return new bootstrap.Popover(popoverTriggerEl); 
    });

    // 1. Renderiza os gráficos vazios inicialmente para garantir que o canvas exista
    initGraficosVazios();

    // 2. Busca os dados reais do backend
    carregarDadosDashboard();
});

/**
 * Função principal que orquestra a busca de dados
 */
function carregarDadosDashboard() {
    // Tenta pegar ID da empresa do sessionStorage. Se não tiver, usa 1 como fallback (teste).
    const idEmpresa = sessionStorage.getItem("ID_EMPRESA") || 1; 

    console.log("Buscando dados para empresa:", idEmpresa);

    fetch(`/dashboard/geral/${idEmpresa}`)
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
            // Aqui você pode adicionar uma chamada para seu SweetAlert de erro, se desejar
        });
}

/**
 * Atualiza os números dos Cards (KPIs)
 */
function atualizarKPIs(kpis) {
    document.getElementById('txt_total_maquinas').innerText = kpis.totalMaquinas;
    document.getElementById('txt_maquinas_sobrecarga').innerText = kpis.maquinasSobrecarga;
    document.getElementById('txt_risco_disco').innerText = kpis.maquinasRiscoDisco;
    document.getElementById('txt_maquinas_ociosas').innerText = kpis.maquinasOciosas;
    document.getElementById('txt_total_incidentes').innerText = kpis.totalIncidentes;
}

/**
 * Gerencia a atualização das tabelas Top 5
 */
function atualizarListas(listas) {
    preencherTabela('tbody-sobrecarga', listas.topSobrecarga, true);
    preencherTabela('tbody-ociosas', listas.topOciosas, false);
}

/**
 * Preenche o HTML de uma tabela específica
 * @param {string} elementId - ID do tbody
 * @param {Array} dados - Array de objetos com os dados
 * @param {boolean} isCritico - Se true, usa cor vermelha; se false, verde.
 */
function preencherTabela(elementId, dados, isCritico) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = ""; // Limpa o conteúdo atual
    
    dados.forEach(item => {
        const cpuVal = item.media_cpu ? item.media_cpu.toFixed(1) : "0.0";
        const ramVal = item.media_ram ? item.media_ram.toFixed(1) : "0.0";
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

/**
 * Atualiza os dados dentro dos gráficos Chart.js já existentes
 */
function atualizarGraficos(dadosGraficos) {
    // --- 1. Atualiza Matriz de Otimização ---
    const dadosPontos = dadosGraficos.matriz.map(m => ({
        x: m.media_cpu || 0,
        y: m.media_ram || 0,
        maquina: m.nomeMaquina
    }));
    
    chartMatriz.data.datasets[0].data = dadosPontos;
    chartMatriz.update();

    // --- 2. Atualiza Evolução (Line Chart) ---
    const alertas = dadosGraficos.evolucao;
    
    // Extrai labels unicos (dias/semanas)
    const labels = [...new Set(alertas.map(a => a.dia))];
    
    // Mapeia valores para cada dataset (CPU, RAM, DISCO)
    // Nota: Isso assume que o backend retorna [{dia, tipoComponete, qtd_alertas}, ...]
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

/**
 * Inicializa os gráficos com dados vazios e configurações visuais
 */
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
                    // Lógica de Cores Dinâmica (Quadrantes)
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

/**
 * Funções Auxiliares da UI
 */
function filtrarPeriodo(bimestre) {
    console.log(`Recarregando dados para o Bimestre ${bimestre}...`);
    document.getElementById('valor_pesquisa_periodo').innerText = `2025 - Bimestre ${bimestre}`;
    // Futuramente: carregarDadosDashboard(bimestre);
}

function iniciarTourGestor() {
    console.log("Iniciando o Tour do Painel de Gestão...");
    // Lógica do TourGuide.js iria aqui
}