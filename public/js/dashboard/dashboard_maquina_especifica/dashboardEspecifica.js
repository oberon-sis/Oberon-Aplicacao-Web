// ============================
// CONFIGURAÇÕES INICIAIS
// ============================

let idMaquina = new URL(window.location.href).searchParams.get("id");

// Elementos da página - KPIs
const tituloDoPainel = document.getElementById("tituloDoPainel");
const txtDisponibilidade = document.getElementById("txt_disponibilidade");

const txt_disponibilidade_passado = document.getElementById("txt_disponibilidade_passado");
const txtTotalAlertas = document.getElementById("txt_total_alertas");
const txtPercentualCritico = document.getElementById("txt_percentual_critico");
const txtComponenteCritico = document.getElementById("txt_componente_critico");
const tabelaAlertas = document.getElementById("tabela-alertas");

// Elementos da página - Gráficos
const graficoCanvasPrincipal = document.getElementById("mainChart");
const graficoCanvasAlertas = document.getElementById("componentAlertsChart");


// Variáveis de instância dos gráficos (para destruição e atualização)
let graficoPrincipal;
let graficoAlertas;


// ============================
// FUNÇÃO PRINCIPAL
// ============================

async function carregarInformacoesMaquina() {
    idMaquina = 1
    try {
        if (!idMaquina) {
            console.warn("Nenhum ID encontrado — usando ID mockado (1) e nome padrão.");
            idMaquina = 1;
        }

        const resposta = await fetch(`/dashboardEspecifica/procurar_informacoes_maquina/${idMaquina}`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar as informações da máquina.");
        }

        // CORREÇÃO CRÍTICA: Desaninhando o objeto 'data' do Controller
        const respostaJSON = await resposta.json();
        const dados = respostaJSON.data; // Acessa o objeto "data"

        if (!dados) {
            throw new Error("Resposta da API está vazia ou mal formatada.");
        }
        console.log(dados)
        // 1. DADOS DOS KPIs


        const infoMaquina = dados?.info_tecnica_computador?.[0];
        const dadosAlertaKPI = dados?.dados_kpi_alertas_30d?.[0];
        const dadosDisp = dados?.dados_kpi_disponibilidade?.[0];

        // 2. DADOS DOS GRÁFICOS E TABELAS
        const alertas = dados?.dados_ultimos_eventos ?? [];
        const dadosGrafico24h = dados?.dados_coleta_24_horas ?? [];
        const dadosComponenteAlerta = dados?.dados_kpi_pico_24h ??[]; // Usaremos este para o gráfico de barras


        // CHAMADAS DE ATUALIZAÇÃO
        atualizarHeader(infoMaquina);
        atualizarKpis(dadosAlertaKPI, dadosDisp);
        preencherTabelaAlertas(alertas);
        
        // Processamento avançado do gráfico de linha (CPU, RAM, DISCO separados)
        const dadosProntosGraficoPrincipal = montarGrafico24h(dadosGrafico24h);
        console.log("-----dados------")
        console.log(dadosProntosGraficoPrincipal)
        atualizarGraficoPrincipal(dadosProntosGraficoPrincipal);
        // Processamento para o gráfico de barras (alertas por componente)
        const dadosProntosGraficoAlertas = montarGrafGraficoAlertas(dadosComponenteAlerta);
        console.log(dadosProntosGraficoAlertas)
        atualizarGraficoAlertas(dadosProntosGraficoAlertas);


    } catch (erro) {
        console.error("Erro ao carregar dashboard:", erro.message);
        // Exibir mensagem de erro amigável ao usuário
        // if(tituloDoPainel) tituloDoPainel.innerText = `ERRO: Não foi possível carregar o painel (ID: ${idMaquina})`;
    }
}

// Função de inicialização no carregamento da página
window.onload = carregarInformacoesMaquina;


// ============================
// HEADER E TÍTULO
// ============================

function atualizarHeader(infoMaquina) {
    if (tituloDoPainel && infoMaquina?.nome) {
        tituloDoPainel.innerText = infoMaquina.nome;
    } else if (tituloDoPainel) {
        tituloDoPainel.innerText = `Máquina ID: ${idMaquina}`; // Fallback
    }
}

// ============================
// KPIs
// ============================

function atualizarKpis(dadosAlertaKPI, dadosDisp) {
    if (!dadosAlertaKPI || !dadosDisp) return;

    // KPI 1: Disponibilidade
    if (txtDisponibilidade) {

        
        txtDisponibilidade.innerHTML = `${dadosDisp.tempoLigadoUltimaSemana}`;
        txt_disponibilidade_passado.innerHTML = `${dadosDisp.tempoLigadoSemanaPassada}`;
    }

    // KPI 2 e 3: Total de Alertas e Percentual Crítico
    if (txtTotalAlertas && dadosAlertaKPI.totalAlertas30dias !== undefined) {
        txtTotalAlertas.innerHTML = `${dadosAlertaKPI.totalAlertas30dias}`;
        
        if (txtPercentualCritico && dadosAlertaKPI.totalCriticos30dias !== undefined) {
            const total = dadosAlertaKPI.totalAlertas30dias || 1;
            const criticos = dadosAlertaKPI.totalCriticos30dias || 0;
            const percentual = (criticos / total) * 100;
            txtPercentualCritico.innerHTML = `${percentual.toFixed(0)}%`;
        }
    }

    // KPI 4: Componente Crítico - Não há um dado direto no model atual para isto, 
    // mas seria o componente com o maior totalAlertas24h de dadosComponenteAlerta
    // if (txtComponenteCritico && dadosComponenteAlerta.length > 0) {
    //     const critico = dadosComponenteAlerta.reduce((max, item) => 
    //         (item.totalAlertas24h > max.totalAlertas24h ? item : max), 
    //         { totalAlertas24h: -1 }
    //     );
    //     txtComponenteCritico.innerText = critico.tipoRecurso;
    // }
}


// ============================
// TABELA DE ALERTAS
// ============================
// Nomes de campos agora estão corretos graças aos aliases no Model.
function preencherTabelaAlertas(alertas) {
    console.log(alertas)
    console.log(tabelaAlertas)
    if (!tabelaAlertas) {
        console.warn("ID tabela-alertas não encontrado no HTML.");
        return;
    }

    tabelaAlertas.innerHTML = ""; 

    if (!alertas || alertas.length === 0) {
        tabelaAlertas.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">Nenhum evento encontrado</td>
            </tr>
        `;
        return;
    }

    alertas.forEach(a => {
        // Campos 'hora', 'componente', 'nivel', 'valor' chegam corrigidos pelo Model.
        const nivel = a.nivel.toUpperCase(); 
        const classe = 
            nivel === "CRITICO" ? "alert-critical" :
            nivel === "AVISO"   ? "alert-warning" :
                                  "alert-info";

        tabelaAlertas.innerHTML += `
            <tr class="${classe}">
                <td>${a.hora ?? "--:--:--"}</td>
                <td>${a.componente ?? "—"}</td>
                <td>${a.nivel ?? "—"}</td>
                <td>${a.valor ?? "—"}</td>
            </tr>
        `;
    });
}


// ============================
// GRÁFICO PRINCIPAL (Dados 24h)
// CORREÇÃO CRÍTICA: Processamento de array para separar datasets.
// ============================

function montarGrafico24h(dados) {
    console.log(dados)
    // 1. Agrupar dados por intervalo de tempo (labels)
    const labels = [...new Set(dados.map(d => d.intervaloTempo))].sort();

    // 2. Definir os recursos esperados
    const recursos = ['CPU', 'RAM', 'DISCO', 'REDE']; 
    const datasetsMap = {};

    // Inicializar datasets
    recursos.forEach(rec => datasetsMap[rec] = {
        label: `${rec} (%)`,
        data: [],
        borderColor: (rec === 'CPU') ? '#dc3545' : (rec === 'RAM' ? '#007bff' : '#28a745'),
        tension: 0.4,
        fill: false
    });

    // 3. Popular datasets
    labels.forEach(intervalo => {
        recursos.forEach(rec => {
            const dadoNoIntervalo = dados.find(d => d.intervaloTempo === intervalo && d.tipoRecurso === rec);
            // Adiciona o valor se existir, ou 0 se o registro estiver faltando (para manter a linha)
            datasetsMap[rec].data.push(dadoNoIntervalo ? dadoNoIntervalo.valor_medio : null);
        });
    });
    return { labels: labels, datasets: Object.values(datasetsMap) };
}


// ============================
// CHART.JS - GRÁFICO PRINCIPAL
// ============================

function atualizarGraficoPrincipal(dadosGrafico) {
    if (!graficoCanvasPrincipal) {
        console.warn("ID mainChart não encontrado no HTML.");
        return;
    }

    const ctx = graficoCanvasPrincipal.getContext("2d");

    if (graficoPrincipal) {
        graficoPrincipal.destroy();
        console.log("passou  no if")
    }

    graficoPrincipal = new Chart(ctx, {
        type: "line",
        data: dadosGrafico, // Usa a estrutura de dados separada
        options: {
            responsive: true,
            maintainAspectRatio: false,
             scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: { display: true, text: 'Utilização Média (%)' }
                }
            }
        }
    });
}


// ============================
// GRÁFICO DE ALERTAS (Barras)
// ============================

// Prepara os dados para o gráfico de barras (Componentes x Total de Alertas)
function montarGrafGraficoAlertas(dados) {
    // A estrutura do Model 'buscar_dados_kpi' retorna o total de alertas por tipoRecurso
    const labels = dados.map(d => d.tipoRecurso);
    const data = dados.map(d => d.totalAlertas24h);

    return { labels, data };
}

function atualizarGraficoAlertas(dadosGrafico) {
    if (!graficoCanvasAlertas) {
        console.warn("ID componentAlertsChart não encontrado no HTML.");
        return;
    }

    const ctx2 = graficoCanvasAlertas.getContext("2d");

    if (graficoAlertas) {
        graficoAlertas.destroy();
    }

    // Cores (para manter o padrão do mock, mas dinâmico)
    const backgroundColors = dadosGrafico.labels.map(label => {
        if (label === 'RAM') return 'rgba(0, 123, 255, 0.7)';
        if (label === 'CPU') return 'rgba(220, 53, 69, 0.7)';
        return 'rgba(40, 167, 69, 0.7)'; // DISCO
    });
    
    graficoAlertas = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Total de Alertas',
                data: dadosGrafico.data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}