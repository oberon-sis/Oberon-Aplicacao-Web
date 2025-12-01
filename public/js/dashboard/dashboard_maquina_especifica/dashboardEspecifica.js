
let idMaquina = new URL(window.location.href).searchParams.get("id");

const tituloDoPainel = document.getElementById("tituloDoPainel");
const txtDisponibilidade = document.getElementById("txt_disponibilidade");

const txt_disponibilidade_passado = document.getElementById("txt_disponibilidade_passado");
const txtTotalAlertas = document.getElementById("txt_total_alertas");
const txtPercentualCritico = document.getElementById("txt_percentual_critico");
const txtComponenteCritico = document.getElementById("txt_componente_critico");
const tabelaAlertas = document.getElementById("tabela-alertas");

const graficoCanvasPrincipal = document.getElementById("mainChart");
const graficoCanvasAlertas = document.getElementById("componentAlertsChart");

let graficoPrincipal;
let graficoAlertas;

function corrigirDataHora(valor) {
    if (typeof valor === "string") return valor;
    if (valor instanceof Date) return valor.toISOString();

    try {
        return new Date(valor).toISOString();
    } catch {
        return "2000-01-01T00:00:00.000Z";
    }
}


function formatarDataHoraLegivel(isoString) {
    try {
        const data = new Date(isoString);

        const opcoes = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: undefined 
        };

        const dataHoraCompleta = data.toLocaleString('pt-BR', opcoes);
        
        return dataHoraCompleta.replace(', ', ' ');

    } catch (e) {
        console.error("Erro ao formatar data:", e);
        return "--/--/---- --:--:--"; 
    }
}

function normalizarAlerta(a) {
    const horaISO = corrigirDataHora(a.hora);
    const horaLegivel = formatarDataHoraLegivel(horaISO); 
    
    return {
        hora: horaLegivel,
        componente: a.componente || "—",
        nivel: a.nivel ? a.nivel.toUpperCase() : "—",
        valor: a.valor || "—"
    };
}


// ============================
// TABELA DE ALERTAS
// ============================

function preencherTabelaAlertas(alertas) {
    const tabela = document.getElementById("tabela-alertas");
    tabela.innerHTML = "";

    alertas.forEach((alerta) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${alerta.hora}</td>
            <td>${alerta.componente}</td>
            <td>${alerta.nivel}</td>
            <td>${alerta.valor}</td>
        `;

        tabela.appendChild(linha);
    });
}



// ============================
// FUNÇÃO PRINCIPAL
// ============================

async function carregarInformacoesMaquina(idMaquina) {
    

    try {
        const resposta = await fetch(`/dashboardEspecifica/procurar_informacoes_maquina/${idMaquina}`);
        if (!resposta.ok) throw new Error("Erro ao carregar informações da máquina.");

        const respostaJSON = await resposta.json();
        const dados = respostaJSON.data;
        if (!dados) throw new Error("Resposta vazia da API.");

        const infoMaquina = dados?.info_tecnica_computador?.[0];
        const dadosAlertaKPI = dados?.dados_kpi_alertas_30d?.[0];
        const dadosDisp = dados?.dados_kpi_disponibilidade?.[0];

        const alertas = dados?.dados_ultimos_eventos ?? [];
        const dadosGrafico24h = dados?.dados_coleta_24_horas ?? [];
        const dadosComponenteAlerta = dados?.dados_kpi_pico_24h ?? [];

        atualizarHeader(infoMaquina);
        atualizarKpis(dadosAlertaKPI, dadosDisp);

        preencherTabelaAlertas(alertas.map(normalizarAlerta));

        const dadosProntosGrafico = montarGrafico24h(dadosGrafico24h);
        atualizarGraficoPrincipal(dadosProntosGrafico);

        const dadosProntosBarras = montarGrafGraficoAlertas(dadosComponenteAlerta);
        atualizarGraficoAlertas(dadosProntosBarras);

    } catch (erro) {
        console.error("Erro:", erro.message);
    }
}

window.onload = carregarInformacoesMaquina(1);



// ============================
// HEADER
// ============================

function atualizarHeader(infoMaquina) {
    if (tituloDoPainel && infoMaquina?.nome) {
        tituloDoPainel.innerText = infoMaquina.nome;
    } else if (tituloDoPainel) {
        tituloDoPainel.innerText = `Máquina ID: ${idMaquina}`;
    }
}



// ============================
// KPIs
// ============================

function atualizarKpis(dadosAlertaKPI, dadosDisp) {
    if (!dadosAlertaKPI || !dadosDisp) return;

    txtDisponibilidade.innerHTML = `${dadosDisp.tempoLigadoUltimaSemana}`;
    txt_disponibilidade_passado.innerHTML = `${dadosDisp.tempoLigadoSemanaPassada}`;

    txtTotalAlertas.innerHTML = dadosAlertaKPI.totalAlertas30dias;

    const total = dadosAlertaKPI.totalAlertas30dias || 1;
    const criticos = dadosAlertaKPI.totalCriticos30dias || 0;
    txtPercentualCritico.innerHTML = `${((criticos / total) * 100).toFixed(0)}%`;
}



// ============================
// GRÁFICO PRINCIPAL
// ============================

function montarGrafico24h(dados) {
   
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    const recursos = ['CPU', 'RAM', 'DISCO', 'REDE'];

    const datasetsMap = {};

    for (let i = 0; i < recursos.length; i++) {
        const r = recursos[i];
        datasetsMap[r] = {
            label: `${r} (%)`,
            data: [],
            tension: 0.4,
            fill: false
        };
    }

    datasetsMap["CRITICO"] = {
        label: "Crítico (%)",
        data: [],
        borderDash: [6, 6],
        tension: 0.1,
        fill: false
    };

    datasetsMap["OCIOSO"] = {
        label: "Ocioso (%)",
        data: [],
        borderDash: [6, 6],
        tension: 0.1,
        fill: false
    };

 
    for (let i = 0; i < diasSemana.length; i++) {
        const dia = diasSemana[i];

        for (let j = 0; j < recursos.length; j++) {
            const recurso = recursos[j];

            let valorEncontrado = null;

            for (let k = 0; k < dados.length; k++) {
                const d = dados[k];
                if (d.intervaloTempo === dia && d.tipoRecurso === recurso) {
                    valorEncontrado = d.valor_medio;
                    break;
                }
            }

            datasetsMap[recurso].data.push(valorEncontrado);
        }

        datasetsMap["CRITICO"].data.push(90);
        datasetsMap["OCIOSO"].data.push(20);
    }

    return { 
        labels: diasSemana,
        datasets: Object.values(datasetsMap)
    };
}


function atualizarGraficoPrincipal(dadosGrafico) {
    const ctx = graficoCanvasPrincipal.getContext("2d");

    if (graficoPrincipal) graficoPrincipal.destroy();

    graficoPrincipal = new Chart(ctx, {
        type: "line",
        data: dadosGrafico,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 0, max: 100 } }
        }
    });
}



// ============================
// GRÁFICO DE ALERTAS (BARRAS)
// ============================

function montarGrafGraficoAlertas(dados) {
    const labels = [];
    const data = [];

    for (let i = 0; i < dados.length; i++) {
        labels.push(dados[i].tipoRecurso);
        data.push(dados[i].totalAlertas24h);
    }

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

    const backgroundColors = dadosGrafico.labels.map(label => {
        if (label === 'RAM') return '#046d8b';
        if (label === 'CPU') return '#309292';
        if (label === 'REDE') return '#2fb8ac'
        return '#2f576eff'; // DISCO
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
