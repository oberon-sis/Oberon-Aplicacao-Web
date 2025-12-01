const painelModel = require('../models/painelModel');
const geralModel = require('../models/analise-tendenciaModel');

async function procurar_informacoes_maquina(req, res) {
    const idMaquina = req.params.idMaquina;

    if (!idMaquina) {
        return res.status(400).send('ID da máquina não fornecido.');
    }

    try {
        const [
            info_tecnica_computador, 
            info_tecnica_componentes, 
            dados_kpi_alertas, 
            dados_parametros_por_componente, 
            dados_coleta_24_horas
        ] = await Promise.all([
            painelModel.buscar_info_maquina(idMaquina),
            painelModel.buscar_info_componentes(idMaquina),
            painelModel.buscar_dados_kpi(idMaquina),
            painelModel.buscar_parametros(idMaquina),
            painelModel.buscar_info_24_horas_coleta(idMaquina)
        ]);
        

        res.status(200).json({
            info_tecnica_computador: info_tecnica_computador, 
            info_tecnica_componentes: info_tecnica_componentes, 
            dados_kpi_alertas: dados_kpi_alertas, 
            dados_parametros_por_componente: dados_parametros_por_componente, 
            dados_coleta_24_horas: dados_coleta_24_horas
        });

    } catch (erro) {
        console.error(`Erro ao buscar dados para a pagina Painel (Paralelo): ${erro.message}`);
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados da máquina.',
            detalhe: erro.message,
        });
    }
}
async function procurar_dados_iniciais_painel(req, res) {
    const id_empresa = req.headers["id-empresa"];
    if (!id_empresa) {
        return res.status(400).send('dados não fornecidos');
    }
    try {
        const dados_filtros = await painelModel.buscar_dados_filtros(id_empresa)
        const dados_maquinas = await geralModel.buscar_maquinas(id_empresa)
        
        res.status(200).json({ 
            dados_filtros: dados_filtros, 
            dados_maquinas:  dados_maquinas,
        });
    } catch (erro) {
        console.error(`Erro ao buscar dados para a pagina Painel: ${erro.message}`);
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados da máquina.',
            detalhe: erro.message,
        });
    }
}

async function procurar_cards_painel_dinamico(req, res) {
    const id_empresa = req.headers["id-empresa"];
    const pagina_atual = req.headers["pagina-atual"];
    const tamanho_da_pagina = req.headers["tamanho-pagina"];
    const status_filtro = req.headers["status-filtro"] == ''? null: req.headers["status-filtro"] ;
    const nome_busqueda = req.headers["nome-busqueda"]== ''? null: req.headers["nome-busqueda"];
    if (!id_empresa || !pagina_atual || !tamanho_da_pagina) {
        return res.status(400).send('dados não fornecidos');
    }

    try {
        const dados_brutos_card = await painelModel.buscar_dados_cards_painel(
            id_empresa, pagina_atual, tamanho_da_pagina, status_filtro,nome_busqueda )
        
        const dados_cards_processados = mapearStatusParaApresentacao(dados_brutos_card);
        
        res.status(200).json({ 
            dados_card: dados_cards_processados 
        });
    } catch (erro) {
        console.error(`Erro ao buscar dados para a pagina Painel: ${erro.message}`);
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados da máquina.',
            detalhe: erro.message,
        });
    }
}

/**
 * @param {Array<Object>} listaMaquinasBrutas Lista de objetos de máquina do banco de dados.
 * @returns {Array<Object>} Lista de objetos de máquina enriquecidos.
 */
function mapearStatusParaApresentacao(listaMaquinasBrutas) {
    if (!Array.isArray(listaMaquinasBrutas) || listaMaquinasBrutas.length === 0) {
        return [];
    }

    const maquinasParaProcessar = listaMaquinasBrutas[0];

    if (!Array.isArray(maquinasParaProcessar)) {
        return [];
    }
    
    return maquinasParaProcessar.map(maquina => {
        let status_normalizado = 'normal';
        let cor_classe = 'success';
        let icone_classe = 'bi-check-circle-fill'; 

        const statusRaw = maquina.StatusMaquina || maquina.StatusMaquinaRaw || '';
        const statusMaquina = statusRaw.toLowerCase();
        
        const statusAlertaRaw = maquina.StatusAlerta || '';
        const statusAlerta = statusAlertaRaw.toUpperCase();

        if (statusMaquina === 'manutenção' || statusMaquina === 'manutencao') {
            status_normalizado = 'manutencao';
            cor_classe = 'secondary';
            icone_classe = 'bi-tools';
        } 
        else if (statusMaquina === 'offline' || statusMaquina === 'pendente' || maquina.MetricaUso === "Sem sinal recente") {
            status_normalizado = 'offline';
            cor_classe = 'secondary';
            icone_classe = 'bi-dash-circle-fill';
        } 
        else if (statusAlerta.includes("CRÍTICO") || statusAlerta.includes("URGENTE")) {
            status_normalizado = 'critico';
            cor_classe = 'danger'; 
            icone_classe = 'bi-exclamation-triangle-fill';
        } 
        else if (statusAlerta.includes("ATENÇÃO") || statusAlerta.includes("ATENCAO")) {
            status_normalizado = 'atencao';
            cor_classe = 'warning'; 
            icone_classe = 'bi-exclamation-circle-fill';
        }
        else if (statusAlerta.includes("OCIOSO")) {
             status_normalizado = 'ocioso';
             cor_classe = 'info';
             icone_classe = 'bi-info-circle-fill';
        }

        return {
            ...maquina,
            status_normalizado,
            cor_classe,
            icone_classe
        };
    });
}
module.exports = {
  procurar_informacoes_maquina,
  procurar_cards_painel_dinamico,
  procurar_dados_iniciais_painel
};