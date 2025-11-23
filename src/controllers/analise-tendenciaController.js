const geralModel = require('../models/analise-tendenciaModel');

async function procurar_dados_pagina(req, res) {
    const dataInicio = req.headers["data-inicio"];
    const idEmpresa = req.headers["id-empresa"];
    const idMaquina = req.headers["id-maquina"];
    const limite_raning = 3;

    if (!idEmpresa || !dataInicio || !idMaquina) {
        return res.status(400).send('dado não fornecido.');
    }
    
    try {
        const [
            uptime_atual_e_passado,
            total_alertas_e_criticos_atual_e_passado,
            alerta_moda_e_total,
            resultado_ranking_bruto
        ] = await Promise.all([
            geralModel.buscar_uptime_atual_e_passado(dataInicio, idEmpresa, idMaquina),
            geralModel.buscar_total_alertas_e_criticos_atual_e_passado(dataInicio, idEmpresa, idMaquina),
            geralModel.buscar_alerta_moda_e_total(dataInicio, idEmpresa, idMaquina),
            geralModel.buscar_ranking_tabelas_desempenho(dataInicio, idEmpresa, limite_raning),
        ]);
        const ranking_maquinas_bruto = resultado_ranking_bruto[0];
        const top_alertas_bruto = resultado_ranking_bruto[1];

        const dados_tratados_kpis = await tratar_dados_brutos(uptime_atual_e_passado, total_alertas_e_criticos_atual_e_passado, alerta_moda_e_total);
        const ranking_tabela_tratado = await tratar_dados_tabela_ranking(ranking_maquinas_bruto, top_alertas_bruto);

        res.status(200).json({
            dados_kpis: dados_tratados_kpis,
            dados_ranking: ranking_tabela_tratado
        });
    } catch (erro) {
        console.error(`Erro ao buscar dados para a pagina Painel Analise Geral (Paralelo): ${erro.message}`);
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados da máquina.',
            detalhe: erro.message,
        });
    }
}

async function procurar_maquinas(req, res) {
    const idEmpresa = req.headers["id-empresa"];

    if (!idEmpresa) return res.status(400).send('dado não fornecido.');

    try {
        const maquinas = await geralModel.buscar_maquinas(idEmpresa)

        res.status(200).json(maquinas);
    } catch (erro) {
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados das máquinas.',
            detalhe: erro.message,
        });
    }
}

function calcularVariacao(valorAtual, valorAnterior) {
    if (valorAnterior === 0 || valorAnterior === null || valorAnterior === undefined) {
        return { variacao: 'N/A', classe: 'text-secondary' };
    }
    const variacao = valorAtual - valorAnterior;
    const variacaoRelativa = (variacao / valorAnterior) * 100;

    if (valorAtual === 'ALERTAS') {
        const classe = variacao < 0 ? 'text-success' : (variacao > 0 ? 'text-danger' : 'text-secondary');
        return { variacao: variacao > 0 ? `+${variacao}` : `${variacao}`, classe: classe };
    }
    const classe = variacao > 0 ? 'text-success' : (variacao < 0 ? 'text-danger' : 'text-secondary');

    return { variacao: variacao > 0 ? `+${variacaoRelativa.toFixed(1)}%` : `${variacaoRelativa.toFixed(1)}%`, classe: classe };
}

/**
 * Transforma os dados brutos do banco de dados no formato JSON final esperado pelo Frontend.
 * @param {Array} kpi_uptime - Dados brutos de uptime.
 * @param {Array} kpi_alertas - Dados brutos de total de alertas e críticos.
 * @param {Array} kpi_alerta_moda - Dados brutos da métrica mais frequente.
 * @returns {object} Objeto contendo o JSON final das KPIS.
 */
async function tratar_dados_brutos(kpi_uptime, kpi_alertas, kpi_alerta_moda) {
    const uptimeData = kpi_uptime[0][0];
    const alertasData = kpi_alertas[0][0];
    const modaData = kpi_alerta_moda[0][0];

    const uptimePctPrincipal = parseFloat(uptimeData.uptime_pct_principal) || 0.00;
    const uptimePctAnterior = parseFloat(uptimeData.uptime_pct_anterior) || 0.00;

    const totalAlertasPrincipal = parseInt(alertasData.total_alertas_principal) || 0;
    const totalAlertasAnterior = parseInt(alertasData.total_alertas_anterior) || 0;
    const totalCriticosPrincipal = parseInt(alertasData.total_criticos_principal) || 0;
    const totalCriticosAnterior = parseInt(alertasData.total_criticos_anterior) || 0;

    const variacaoUptime = calcularVariacao(uptimePctPrincipal, uptimePctAnterior);

    const variacaoTotalAlertas = calcularVariacao(totalAlertasPrincipal, totalAlertasAnterior, 'ALERTAS');

    const variacaoCriticos = calcularVariacao(totalCriticosPrincipal, totalCriticosAnterior, 'ALERTAS');

    const metricaFrequenteNome = modaData.metrica_moda || 'N/A';
    const metricaFrequenteTotal = modaData.total_registros || 0;

    const kpis = {
        uptime: {
            valor: `${uptimePctPrincipal.toFixed(1)}%`,
            variacao: variacaoUptime.variacao,
            classeVariacao: variacaoUptime.classe,
            periodoAnterior: `${uptimePctAnterior.toFixed(1)}%`,
        },
        alertasTotais: {
            valor: totalAlertasPrincipal.toString(),
            variacao: variacaoTotalAlertas.variacao,
            classeVariacao: variacaoTotalAlertas.classe,
            periodoAnterior: totalAlertasAnterior.toString(),
        },
        alertasCriticos: {
            valor: totalCriticosPrincipal.toString(),
            variacao: variacaoCriticos.variacao,
            classeVariacao: variacaoCriticos.classe,
            periodoAnterior: totalCriticosAnterior.toString(),
        },
        metricaFrequente: {
            nome: metricaFrequenteNome,
            detalhe: `${metricaFrequenteTotal} alertas registrados`
        },
    };

    return { kpis };
}

// Função auxiliar para formatar a diferença
const formatDiff = (valor) => {
    const num = parseFloat(valor);
    const sinal = num > 0 ? '+' : '';
    // Garante que o valor é tratado como string após otoFixed
    return `${sinal}${num.toFixed(2)}%`.replace('.', ',');
};

/**
 * Realiza o tratamento dos dados brutos do ranking, combinando-os com os Top Alertas.
 * @param {Array} ranking_bruto - O vetor de dados de ranking.
 * @param {Array} top_alertas_bruto - O vetor de dados de Top Alertas.
 * @returns {Array} O vetor de objetos de ranking tratados e combinados.
 */
async function tratar_dados_tabela_ranking(ranking_bruto, top_alertas_bruto) {
    if (!ranking_bruto || ranking_bruto.length === 0) {
        return [];
    }

    const mapTopAlertas = top_alertas_bruto.reduce((map, item) => {
        map[item.idMaquina] = item;
        return map;
    }, {});


    const getDowntimeClass = (uptimePct) => {
        const uptime = parseFloat(uptimePct);
        // Regra: Uptime < 90% (Downtime > 10%) é Crítico.
        if (uptime < 90.00) return 'text-danger';
        // Uptime < 95% (Downtime > 5%) é Atenção.
        if (uptime < 95.00) return 'text-warning';
        return 'text-success'; // Uptime >= 95% (Downtime <= 5%) é Bom.
    };

    const getDiffClass = (diffPct) => {
        const diff = parseFloat(diffPct);
        if (diff > 0.05) return 'text-danger'; // Aumento significativo
        if (diff > 0.00) return 'text-warning'; // Pequeno aumento
        return 'text-success'; // Estável ou melhorou (Negativo)
    };

    // 4. Mapear e combinar os dados
    return ranking_bruto.map(item => {
        const idMaquina = item.idMaquina;
        const topAlertas = mapTopAlertas[idMaquina] || {};

        // Valores numéricos brutos
        const uptime = parseFloat(item.downtime_principal_pct);
        const downtime = (100 - uptime).toFixed(2);
        const downtimeDiff = parseFloat(item.downtime_diff_pct);
        const alertasDiff = parseFloat(item.alertas_diff_pct);
        const totalAlertas = parseInt(item.total_alertas_principal);

        return {
            nome: item.nome,
            id: idMaquina,
            downtime: `${downtime}%`.replace('.', ','),
            downtimeClasse: getDowntimeClass(item.downtime_principal_pct),
            difMesPassado: formatDiff(downtimeDiff),
            difMesPassadoClasse: getDiffClass(downtimeDiff),
            totalAlertas: totalAlertas.toString(),
            alertaClasse: totalAlertas > 20 ? 'text-danger' : totalAlertas > 0 ? 'text-warning' : 'text-success',
            difMesPassadoAlerta: formatDiff(alertasDiff),
            difMesPassadoClasseAlerta: getDiffClass(alertasDiff),
            top1: topAlertas.Top1 || 'N/A',
            top2: topAlertas.Top2 || 'N/A',
            top3: topAlertas.Top3 || 'N/A',
        };
    });
}

module.exports = {
    procurar_dados_pagina,
    procurar_maquinas,
};