let idMaquina = new URL(window.location.href).searchParams.get("id");


const CORES_SISTEMA = {
    CPU:   '#36a2eb', 
    RAM:   '#ff6384', 
    DISCO: '#ff9f40', 
    REDE:  '#4bc0c0', 
    DEFAULT: '#9966ff'
};

const CORES_STATUS = {
    'CRÍTICO': 'bg-danger',
    'ATENÇÃO': 'bg-warning text-dark',
    'OCIOSO':  'bg-info text-dark',
    'NORMAL':  'bg-success' 
};

var tituloDoPainel = document.getElementById("tituloDoPainel");
var txtDisponibilidade = document.getElementById("txt_disponibilidade");
var txtTotalAlertas = document.getElementById("txt_total_alertas");
var txtPercentualCritico = document.getElementById("txt_percentual_critico");
var txtComponenteCritico = document.getElementById("txt_componente_critico");
var tabelaAlertas = document.getElementById("tabela-alertas");

var graficoCanvasPrincipal = document.getElementById("mainChart");
var graficoCanvasAlertas = document.getElementById("componentAlertsChart");

var graficoPrincipal;
var graficoAlertas;
var uptimeInterval;


// Esse Bloco de codigo faz o tratamento de tempo e hora, fazendo com que fique dinamico os valores

function corrigirDataHora(valor) {
    if (typeof valor === "string") return valor;
    if (valor instanceof Date) return valor.toISOString();
    try { return new Date(valor).toISOString(); } catch { return new Date().toISOString(); }
}

function formatarDataHoraLegivel(isoString) {
    try {
        const data = new Date(isoString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    } catch (e) {
        return "--/--/-- --:--";
    }
}

function normalizarAlerta(a) {
    const horaISO = corrigirDataHora(a.hora);
    return {
        hora: formatarDataHoraLegivel(horaISO),
        componente: a.componente || "—",
        nivel: a.nivel ? a.nivel.toUpperCase() : "NORMAL",
        valor: a.valor || "—"
    };
}

function tempoParaSegundos(tempoString) {
    if (!tempoString || typeof tempoString !== 'string') return 0;

    const partesString = tempoString.split(':');
    const partes = [];

    for (let i = 0; i < partesString.length; i++) {
        partes.push(Number(partesString[i]));
    }

    return partes.length === 3
        ? partes[0] * 3600 + partes[1] * 60 + partes[2]
        : 0;
}


function segundosParaTempo(segundos) {
    const h = Math.floor(segundos / 3600).toString().padStart(2, '0');
    const m = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function iniciarContadorUptime(tempoInicialString) {
    let segundosAtuais = tempoParaSegundos(tempoInicialString);
    const elemento = document.getElementById("txt_disponibilidade");
    if (uptimeInterval) clearInterval(uptimeInterval);

    uptimeInterval = setInterval(() => {
        segundosAtuais++;
        const iconeHTML = elemento.querySelector('i') ? elemento.querySelector('i').outerHTML : '';
        elemento.innerHTML = `${segundosParaTempo(segundosAtuais)} ${iconeHTML}`;
    }, 1000);
}

function formatarKpiTempo(valorAtual, valorPassado) {
    const atualSegundos = tempoParaSegundos(valorAtual);
    const passadoSegundos = tempoParaSegundos(valorPassado);
    let iconClass = 'bi-dash', colorClass = 'text-secondary';
   
    if (atualSegundos > passadoSegundos) {
        iconClass = 'bi-arrow-up'; colorClass = 'text-success';
    } else if (atualSegundos < passadoSegundos) {
        iconClass = 'bi-arrow-down'; colorClass = 'text-danger';
    }
    return { html: `${valorAtual} <i class="bi ${iconClass}" style="scale: 1.2"></i>`, class: colorClass, valorPassadoFormatado: valorPassado };
}

function formatarKpiMenorMelhor(valorAtual, valorPassado, sufixo = "") {
    const atual = parseFloat(valorAtual);
    const passado = parseFloat(valorPassado);
    let iconClass = 'bi-dash', colorClass = 'text-secondary';

    if (!isNaN(atual) && !isNaN(passado)) {
        if (atual > passado) { iconClass = 'bi-arrow-up'; colorClass = 'text-danger'; }
        else if (atual < passado) { iconClass = 'bi-arrow-down'; colorClass = 'text-success'; }
    }
    return { html: `${atual}${sufixo} <i class="bi ${iconClass}" style="scale: 1.2"></i>`, class: colorClass };
}

// ------------------------------------------------

function preencherTabelaAlertas(alertas) {
    tabelaAlertas.innerHTML = "";
   
   
    alertas.forEach((alerta) => {
        const linha = document.createElement("tr");
       
        const badgeClass = CORES_STATUS[alerta.nivel] || 'bg-secondary';
       
        linha.innerHTML = `
            <td class="align-middle">${alerta.hora}</td>
            <td class="align-middle fw-bold">${alerta.componente}</td>
            <td class="align-middle">
                <span class="badge ${badgeClass} rounded-pill" style="font-size: 0.85rem;">
                    ${alerta.nivel}
                </span>
            </td>
            <td class="align-middle">${alerta.valor}</td>
        `;
        tabelaAlertas.appendChild(linha);
    });
}

async function carregarInformacoesMaquina(idMaquina) {
   try {
    const resposta = await fetch(`/dashboardEspecifica/procurar_informacoes_maquina/${idMaquina}`);
    if (!resposta.ok) throw new Error("Erro API");

    const json = await resposta.json();
    const dados = json.data;
    if (!dados) throw new Error("Sem dados");

    const info = dados.info_tecnica_computador?.[0];
    const kpiAlertas = dados.dados_kpi_alertas_30d?.[0];
    const kpiDisp = dados.dados_kpi_disponibilidade?.[0];
    const ultimosEventos = dados.dados_ultimos_eventos ?? [];
    const graficoLinha = dados.dados_coleta_24_horas ?? [];
    const graficoBarra = dados.dados_kpi_pico_24h ?? [];
    const dadosComponenteCritico = dados.dados_kpi_componente_critico ?? 0;

    const eventosNormalizados = [];
    for (let i = 0; i < ultimosEventos.length; i++) {
        eventosNormalizados.push(normalizarAlerta(ultimosEventos[i]));
    }

    atualizarHeader(info);
    atualizarKpis(kpiAlertas, kpiDisp, dadosComponenteCritico);
    preencherTabelaAlertas(eventosNormalizados);

    atualizarGraficoPrincipal(montarDadosGraficoLinha(graficoLinha));
    atualizarGraficoAlertas(montarDadosGraficoBarra(graficoBarra));

    console.log(kpiAlertas);
    console.log(dadosComponenteCritico);

} catch (erro) {
    console.error("Erro:", erro);
}

}

window.onload = () => carregarInformacoesMaquina(idMaquina || 1);



function atualizarHeader(info) {
    if (tituloDoPainel) tituloDoPainel.innerText = info?.nome || `Máquina ${idMaquina}`;
}



function atualizarKpis(dadosAlerta, dadosDisp, dataComponenteCritico) {
    if (!dadosAlerta || !dadosDisp || !dataComponenteCritico) return;

    const kpiTempo = formatarKpiTempo(dadosDisp.tempoLigadoUltimaSemana);
    txtDisponibilidade.innerHTML = kpiTempo.html;
    txtDisponibilidade.className = kpiTempo.class;
    iniciarContadorUptime(dadosDisp.tempoLigadoUltimaSemana);
    

    const totalAtual = dadosAlerta.totalAlertas30dias || 0;


    const kpiAlertas = formatarKpiMenorMelhor(totalAtual, 380);
    txtTotalAlertas.innerHTML = kpiAlertas.html;
    txtTotalAlertas.className = kpiAlertas.class;

    const total = totalAtual || 1;
    const criticos = dadosAlerta.totalCriticos30dias || 0;
    const percAtual = ((criticos / total) * 100).toFixed(0);
    const kpiPerc = formatarKpiMenorMelhor(percAtual, 8, "%");
    txtPercentualCritico.innerHTML = kpiPerc.html;
    txtPercentualCritico.className = kpiPerc.class;

    const componenteMaisCritico = dataComponenteCritico[0].tipoComponente;
    txtComponenteCritico.innerHTML = componenteMaisCritico;
    console.log(dataComponenteCritico[0].tipoComponente);
}


function montarDadosGraficoLinha(dados) {
 
    const labelsSet = new Set();
    for (let i = 0; i < dados.length; i++) {
        labelsSet.add(dados[i].intervaloTempo);
    }

    const labels = Array.from(labelsSet).sort();

    const recursos = ['CPU', 'RAM', 'DISCO', 'REDE'];

    const datasets = [];

    for (let r = 0; r < recursos.length; r++) {
        const recurso = recursos[r];
        const dataset = {
            label: `${recurso} (%)`,
            data: [],
            borderColor: CORES_SISTEMA[recurso] || CORES_SISTEMA.DEFAULT,
            backgroundColor: (CORES_SISTEMA[recurso] || CORES_SISTEMA.DEFAULT) + '20',
            tension: 0.4,
            fill: false,
            pointRadius: 3,
            borderWidth: 2
        };

        for (let l = 0; l < labels.length; l++) {
            const labelAtual = labels[l];
            let valor = null;

            for (let d = 0; d < dados.length; d++) {
                if (dados[d].intervaloTempo === labelAtual && dados[d].tipoRecurso === recurso) {
                    valor = dados[d].valor_medio;
                    break;
                }
            }

            dataset.data.push(valor);
        }

        datasets.push(dataset);
    }

    return { labels, datasets };
}


function montarDadosGraficoBarra(dados) {
    const labels = [];
    const data = [];

    for (let i = 0; i < dados.length; i++) {
        labels.push(dados[i].tipoRecurso);
        data.push(dados[i].totalAlertas24h);
    }

    return { labels, data };
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
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 20,
                        font: { size: 12, family: "'Inter', sans-serif" }
                    }
                },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1a1f2c',
                    bodyColor: '#4a5568',
                    borderColor: '#e9ecef',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    boxPadding: 4
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: '#f1f3f5', 
                        borderDash: [5, 5] 
                    },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 11 }, color: '#8392ab' }
                }
            },
            elements: {
                point: { radius: 0, hoverRadius: 6 },
                line: { borderWidth: 3 }
            }
        }
    });
}

function atualizarGraficoAlertas(dadosGrafico) {
    const ctx = graficoCanvasAlertas.getContext("2d");
    if (graficoAlertas) graficoAlertas.destroy();

    const backgroundColors = [];
    for (let i = 0; i < dadosGrafico.labels.length; i++) {
        const label = dadosGrafico.labels[i];
        backgroundColors.push(CORES_SISTEMA[label] || CORES_SISTEMA.DEFAULT);
    }

    graficoAlertas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosGrafico.labels,
            datasets: [{
                label: 'Total de Alertas',
                data: dadosGrafico.data,
                backgroundColor: backgroundColors,
                borderWidth: 0,
                borderRadius: 4,
                barThickness: 30,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#1a1f2c',
                    bodyColor: '#4a5568',
                    borderColor: '#e9ecef',
                    borderWidth: 1,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f3f5',
                        borderDash: [5, 5]
                    },
                    border: { display: false },
                    ticks: { font: { size: 11 }, color: '#8392ab' }
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: { size: 12, weight: '600' },
                        color: '#495057'
                    }
                }
            }
        }
    });
}
