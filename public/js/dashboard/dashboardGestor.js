// =========================================================
// 1. VARIÁVEIS GLOBAIS
// =========================================================
let chartEvolucao = null;
let chartSaudeAgregada = null;
let bimestreAtual = 1; 

// Controle das Tabelas
let listaSobrecargaAtual = [];
let listaOciosaAtual = [];
let ordemSobrecargaDesc = true; 
let ordemOciosaAsc = true;      

// =========================================================
// 2. INICIALIZAÇÃO
// =========================================================
document.addEventListener("DOMContentLoaded", function() {
    // Inicializa Popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) { 
        return new bootstrap.Popover(popoverTriggerEl); 
    });

    // Inicializa gráficos vazios para não quebrar o layout
    initGraficosVazios();

    // Define textos iniciais do Header
    document.getElementById('valor_pesquisa_periodo').innerText = `Bimestre ${bimestreAtual}`;
    document.querySelector(".header-top h2.fs-5").innerText = `2025 - Bimestre ${bimestreAtual}`;

    // Busca dados iniciais
    carregarDadosDashboard(bimestreAtual);
    
    // Inicializa o Tour (Lógica no final do arquivo)
    initTourGestor();
});

// =========================================================
// 3. LÓGICA DE DADOS (FETCH)
// =========================================================
function carregarDadosDashboard(bimestre) {
    let idEmpresa = 1;
    const usuarioString = sessionStorage.getItem('usuario');
    if (usuarioString) {
        const usuarioObjeto = JSON.parse(usuarioString);
        idEmpresa = usuarioObjeto.fkEmpresa;
    }

    console.log(`Buscando dados da empresa ${idEmpresa} para o Bimestre ${bimestre}...`);

    fetch(`/dashboard/geral/${idEmpresa}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bimestre: bimestre })
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error("Erro na resposta do servidor");
    })
    .then(data => {
        atualizarKPIs(data.kpis);
        atualizarListas(data.listas);
        atualizarGraficos(data.graficos);
    })
    .catch(error => {
        console.error("Erro ao carregar dashboard:", error);
    });
}

function filtrarPeriodo(bimestreSelecionado) {
    bimestreAtual = bimestreSelecionado;
    document.getElementById('valor_pesquisa_periodo').innerText = `Bimestre ${bimestreSelecionado}`;
    document.querySelector(".header-top h2.fs-5").innerText = `2025 - Bimestre ${bimestreSelecionado}`;
    carregarDadosDashboard(bimestreSelecionado);
}

function atualizarKPIs(kpis) {
    document.getElementById('txt_total_maquinas').innerText = kpis.totalMaquinas;
    document.getElementById('txt_maquinas_sobrecarga').innerText = kpis.maquinasSobrecarga;
    document.getElementById('txt_risco_disco').innerText = kpis.maquinasRiscoDisco;
    document.getElementById('txt_maquinas_ociosas').innerText = kpis.maquinasOciosas;
    document.getElementById('txt_total_incidentes').innerText = kpis.totalIncidentes;
}

// =========================================================
// 4. LÓGICA DAS LISTAS (COM ORDENAÇÃO)
// =========================================================
function atualizarListas(listas) {
    listaSobrecargaAtual = listas.topSobrecarga;
    listaOciosaAtual = listas.topOciosas;
    // Reseta ordenação padrão ao carregar novos dados
    ordemSobrecargaDesc = true; 
    ordemOciosaAsc = true;
    renderizarTabelaSobrecarga(listaSobrecargaAtual);
    renderizarTabelaOciosa(listaOciosaAtual);
}

function ordenarLista(tipo) {
    if (tipo === 'sobrecarga') {
        ordemSobrecargaDesc = !ordemSobrecargaDesc;
        listaSobrecargaAtual.sort((a, b) => {
            const maxA = Math.max(Number(a.media_cpu)||0, Number(a.media_ram)||0);
            const maxB = Math.max(Number(b.media_cpu)||0, Number(b.media_ram)||0);
            return ordemSobrecargaDesc ? maxB - maxA : maxA - maxB;
        });
        renderizarTabelaSobrecarga(listaSobrecargaAtual);
    } else if (tipo === 'ociosa') {
        ordemOciosaAsc = !ordemOciosaAsc;
        listaOciosaAtual.sort((a, b) => {
            const maxA = Math.max(Number(a.media_cpu)||0, Number(a.media_ram)||0);
            const maxB = Math.max(Number(b.media_cpu)||0, Number(b.media_ram)||0);
            return ordemOciosaAsc ? maxA - maxB : maxB - maxA;
        });
        renderizarTabelaOciosa(listaOciosaAtual);
    }
}

function renderizarTabelaSobrecarga(dados) {
    const tbody = document.getElementById('tbody-sobrecarga');
    tbody.innerHTML = ""; 
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' class='text-center'>Sem dados</td></tr>";
        return;
    }

    dados.forEach(item => {
        const cpuVal = item.media_cpu ? Number(item.media_cpu).toFixed(1) : "0.0";
        const ramVal = item.media_ram ? Number(item.media_ram).toFixed(1) : "0.0";
        const alertas = item.alertas_criticos || 0;
        
        const badgeAlerta = alertas > 0 
            ? `<span class="badge rounded-pill text-bg-danger" style="font-size: 0.85rem; padding: 0.4em 0.8em;">${alertas}</span>`
            : `<span class="text-muted" style="font-size: 1.2rem; font-weight: bold;">-</span>`;

        tbody.innerHTML += `
            <tr>
                <td class="align-middle ps-3 text-truncate" style="max-width: 150px;" title="${item.nomeMaquina}">
                    ${item.nomeMaquina}
                </td>
                <td class="align-middle text-center">
                    <span class="text-danger fw-bold">${cpuVal}%</span> 
                    <small class="text-muted mx-1">|</small> 
                    <span class="text-danger fw-bold">${ramVal}%</span>
                </td>
                <td class="align-middle text-center">
                    ${badgeAlerta}
                </td>
            </tr>
        `;
    });
}

function renderizarTabelaOciosa(dados) {
    const tbody = document.getElementById('tbody-ociosas');
    tbody.innerHTML = ""; 
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3' class='text-center'>Sem dados</td></tr>";
        return;
    }

    dados.forEach(item => {
        const cpuVal = item.media_cpu ? Number(item.media_cpu).toFixed(1) : "0.0";
        const ramVal = item.media_ram ? Number(item.media_ram).toFixed(1) : "0.0";
        const alertas = item.alertas_ociosos || 0;

        const badgeAlerta = alertas > 0 
            ? `<span class="badge rounded-pill text-bg-primary" style="font-size: 0.85rem; padding: 0.4em 0.8em;">${alertas}</span>`
            : `<span class="text-muted" style="font-size: 1.2rem; font-weight: bold;">-</span>`;

        tbody.innerHTML += `
            <tr>
                <td class="align-middle ps-3 text-truncate" style="max-width: 150px;" title="${item.nomeMaquina}">
                    ${item.nomeMaquina}
                </td>
                <td class="align-middle text-center">
                    <span class="text-success fw-bold">${cpuVal}%</span> 
                    <small class="text-muted mx-1">|</small> 
                    <span class="text-success fw-bold">${ramVal}%</span>
                </td>
                <td class="align-middle text-center">
                    ${badgeAlerta}
                </td>
            </tr>
        `;
    });
}

// =========================================================
// 5. GRÁFICOS
// =========================================================
function atualizarGraficos(dadosGraficos) {
    plotarSaudeAgregada(dadosGraficos.saudeAgregada); 
    
    if (!dadosGraficos.saudeAgregada && dadosGraficos.matriz) {
        processarDadosDonut(dadosGraficos.matriz);
    }

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

function processarDadosDonut(listaMaquinas) {
    let qtdCritico = 0;
    let qtdOcioso = 0;
    let qtdSaudavel = 0;

    listaMaquinas.forEach(m => {
        const cpu = Number(m.media_cpu) || 0;
        const ram = Number(m.media_ram) || 0;
        const maxVal = Math.max(cpu, ram);

        if (maxVal > 85) {
            qtdCritico++;
        } else if (maxVal < 20) {
            qtdOcioso++;
        } else {
            qtdSaudavel++;
        }
    });

    if(chartSaudeAgregada) {
        chartSaudeAgregada.data.datasets[0].data = [qtdCritico, qtdOcioso, qtdSaudavel];
        chartSaudeAgregada.update();
    }
}

function plotarSaudeAgregada(dados) {
    if(!dados) return;
    if (chartSaudeAgregada) {
        chartSaudeAgregada.data.datasets[0].data = [dados.critica, dados.ociosa, dados.normal];
        chartSaudeAgregada.update();
    }
}

function initGraficosVazios() {
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
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Qtd. Alertas Críticos' }, ticks: { stepSize: 1 } } }
        }
    });

    const ctx2 = document.getElementById('matrizOtimizacaoChart').getContext('2d');
    chartSaudeAgregada = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Crítico (Risco)', 'Ocioso (Economia)', 'Saudável'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#dc3545', '#007bff', '#28a745'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 20 } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const val = context.parsed;
                                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                                label += val + ' (' + pct + '%)';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// =========================================================
// 6. TOUR GUIADO - ESPECÍFICO PARA GESTÃO DE ATIVOS
// =========================================================

// Definição dos Passos (Configurados pelos IDs do HTML fornecido)
// =========================================================
// 6. TOUR GUIADO - TEXTOS APRIMORADOS (Foco em Negócio)
// =========================================================

const gestorTourSteps = [
    { 
        id: 'kpi-section', 
        title: 'Passo 1/6: O Pulso da Operação', 
        content: 'Aqui você tem o diagnóstico imediato da sua infraestrutura. Monitore desde gargalos de performance (Sobrecarga) até riscos físicos de perda de dados (Disco), tudo em uma única linha de visão.', 
        position: 'bottom' 
    },
    { 
        id: 'valor_pesquisa_periodo', 
        title: 'Passo 2/6: Análise Histórica', 
        content: 'Não olhe apenas para o hoje. Alterne entre os bimestres para identificar tendências sazonais, justificar orçamentos passados ou projetar investimentos futuros.', 
        position: 'bottom' 
    },
    { 
        id: 'chart-tendencia-estabilidade', 
        title: 'Passo 3/6: Evolução de Incidentes', 
        content: 'Sua infraestrutura está melhorando ou degradando? Acompanhe a curva de alertas para identificar qual componente (CPU, RAM ou Disco) é o maior ofensor da estabilidade atual.', 
        position: 'right' 
    },
    { 
        id: 'chart-saude-ativos', 
        title: 'Passo 4/6: Raio-X da Frota', 
        content: 'Entenda a eficiência do seu parque tecnológico:\n🔴 <b>Crítico:</b> Exige upgrade urgente.\n🔵 <b>Ocioso:</b> Equipamento subutilizado (desperdício).\n🟢 <b>Saudável:</b> Operação ideal.', 
        position: 'left' 
    },
    { 
        id: 'list-sobrecarga', 
        title: 'Passo 5/6: Prioridade de Investimento', 
        content: 'Estas máquinas estão limitando a produtividade da sua equipe. Use esta lista para direcionar upgrades de hardware para quem realmente precisa.', 
        position: 'top' 
    },
    { 
        id: 'list-ociosas', 
        title: 'Passo 6/6: Oportunidade de Economia', 
        content: 'Evite compras desnecessárias! Estas máquinas estão "sobrando". Considere realizar um remanejamento (downgrade) para otimizar seus custos.', 
        position: 'top' 
    }
];

// Função de Inicialização do Tour
function initTourGestor() {
    // Verificação de segurança: Só roda se a biblioteca TourGuide estiver carregada
    if (typeof TourGuide === 'undefined') {
        console.warn('TourGuide library not found.');
        return;
    }

    // Cria a instância do Tour
    const gestorTour = new TourGuide(gestorTourSteps, {
        tourName: 'gestorPageTour', // Nome único para salvar no localStorage se já foi visto
        autoStart: false,           // Não inicia sozinho (controlado pelo botão)
        createStartButton: false    // Evita criação de botões automáticos indesejados
    });

    // Vincula ao botão "Primeiros Passos" do HTML
    const startTourBtn = document.getElementById('start-tour-btn');
    if (startTourBtn) {
        startTourBtn.addEventListener('click', () => {
            gestorTour.startTour();
        });
    }
}