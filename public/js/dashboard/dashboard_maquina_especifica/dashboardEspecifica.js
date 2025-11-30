
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


// ============================
// FUNÇÕES DE NORMALIZAÇÃO (DEVEM VIR PRIMEIRO!)
// ============================

function corrigirDataHora(valor) {
    if (typeof valor === "string") return valor;
    if (valor instanceof Date) return valor.toISOString();

    try {
        return new Date(valor).toISOString();
    } catch {
        return "--:--:--";
    }
}

function normalizarAlerta(a) {
    return {
        hora: corrigirDataHora(a.hora),
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

async function carregarInformacoesMaquina() {
    idMaquina = 1;

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

window.onload = carregarInformacoesMaquina;


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
    const labels = [...new Set(dados.map(d => d.intervaloTempo))].sort();
    const recursos = ['CPU', 'RAM', 'DISCO', 'REDE'];
    const datasetsMap = {};

    recursos.forEach(r => datasetsMap[r] = {
        label: `${r} (%)`,
        data: [],
        tension: 0.4,
        fill: false
    });

    labels.forEach(intervalo => {
        recursos.forEach(r => {
            const item = dados.find(d => d.intervaloTempo === intervalo && d.tipoRecurso === r);
            datasetsMap[r].data.push(item ? item.valor_medio : null);
        });
    });

    return { labels, datasets: Object.values(datasetsMap) };
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
    return {
        labels: dados.map(d => d.tipoRecurso),
        data: dados.map(d => d.totalAlertas24h)
    };
}

function atualizarGraficoAlertas(dadosGrafico) {
    const ctx2 = graficoCanvasAlertas.getContext("2d");

    if (graficoAlertas) graficoAlertas.destroy();

    graficoAlertas = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Total de Alertas',
                data: dadosGrafico.data,
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
