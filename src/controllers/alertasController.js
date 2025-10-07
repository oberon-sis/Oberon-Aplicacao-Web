var alertasModel = require("../models/alertasModel"); 
// Biblioteca para conversão de JSON para CSV
const { parse } = require('json2csv'); 

const limitePagina = alertasModel.limitePagina;

function processarFiltros(req) {
    // 1. Parâmetros de Filtro de Listagem (Baseado na URL)
    const idUsuario = req.params.idUsuario;
    const pagina = parseInt(req.params.pagina) || 1; 

    // 2. Parâmetros de Filtro de Pesquisa e Data
    let tipoFiltro = req.params.tipoFiltro || 'descricao'; 
    let termoPesquisaParam = req.params.termoPesquisa || 'vazio';
    let termoPesquisaDecoded = decodeURIComponent(termoPesquisaParam);
    let termoPesquisa = termoPesquisaDecoded === 'vazio' ? '' : termoPesquisaDecoded;
    let dataInicio = req.params.dataInicio === 'vazio' ? null : req.params.dataInicio;
    let dataFim = req.params.dataFim === 'vazio' ? null : req.params.dataFim;

    // 3. Validações e Ajustes
    if (isNaN(idUsuario) || idUsuario <= 0) {
        throw new Error("ID do usuário inválido ou ausente.");
    }
    if (!['descricao', 'maquina', 'componente'].includes(tipoFiltro)) {
         tipoFiltro = 'descricao'; 
    }
    
    // Adiciona 23:59:59 ao dataFim para incluir todo o último dia
    if (dataFim) {
        dataFim = dataFim + ' 23:59:59';
    }

    return { idUsuario, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim };
}

function listarAlertas(req, res) {
    try {
        const { idUsuario, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim } = processarFiltros(req);

        alertasModel.getFkEmpresa(idUsuario)
            .then(function (resultadoEmpresa) {
                if (resultadoEmpresa.length === 0 || !resultadoEmpresa[0].fkEmpresa) {
                    return res.status(404).send("Empresa do usuário não encontrada. Verifique se o Funcionario está vinculado a uma Empresa.");
                }
            
                const fkEmpresa = resultadoEmpresa[0].fkEmpresa;
                
                Promise.all([
                    alertasModel.contarTotalAlertas(fkEmpresa, tipoFiltro, termoPesquisa, dataInicio, dataFim),
                    alertasModel.verAlertas(fkEmpresa, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim)
                ])
                .then(function ([resultadoContagem, resultadoAlertas]) {
                    const totalAlertas = resultadoContagem[0].totalAlertas;
                    const totalPaginas = Math.ceil(totalAlertas / limitePagina);
                    
                    if (resultadoAlertas.length > 0 || totalAlertas > 0) {
                        res.status(200).json({
                            alertas: resultadoAlertas,
                            totalAlertas: totalAlertas,
                            totalPaginas: totalPaginas,
                            paginaAtual: pagina
                        });
                    } else {
                        res.status(204).send("Nenhum alerta encontrado para esta empresa ou página solicitada está vazia.");
                    }
                })
                .catch(function (erro) {
                    console.error("\nHouve um erro ao buscar os alertas! Erro: ", erro.sqlMessage || erro.message);
                    res.status(500).json({ erro: "Erro interno do servidor ao buscar alertas", detalhes: erro.sqlMessage || erro.message });
                });

            })
            .catch(function (erro) {
                console.error("\nHouve um erro ao buscar a fkEmpresa! Erro: ", erro.sqlMessage || erro.message);
                res.status(500).json({ erro: "Erro interno do servidor ao buscar empresa", detalhes: erro.sqlMessage || erro.message });
            });
    } catch (e) {
        return res.status(400).send(e.message);
    }
}

function exportarAlertas(req, res) {
    try {
        // Usa a mesma função de processamento, ignorando a página
        const { idUsuario, tipoFiltro, termoPesquisa, dataInicio, dataFim } = processarFiltros(req);

        alertasModel.getFkEmpresa(idUsuario)
            .then(function (resultadoEmpresa) {
                if (resultadoEmpresa.length === 0 || !resultadoEmpresa[0].fkEmpresa) {
                    return res.status(404).send("Empresa do usuário não encontrada.");
                }
                const fkEmpresa = resultadoEmpresa[0].fkEmpresa;

                // Chama uma função no Model para retornar TODOS os alertas, sem paginação
                return alertasModel.obterTodosAlertasParaExportacao(fkEmpresa, tipoFiltro, termoPesquisa, dataInicio, dataFim);
            })
            .then(function (alertas) {
                if (alertas.length === 0) {
                    return res.status(204).send("Nenhum alerta encontrado para exportação com os filtros aplicados.");
                }

                // 1. Define os campos do CSV
                const fields = [
                    { label: 'ID Alerta', value: 'idAlerta' },
                    { label: 'Máquina', value: 'nomeMaquina' },
                    { label: 'Componente', value: 'tipoComponente' },
                    { label: 'Função Monitorada', value: 'funcaoMonitorar' },
                    { label: 'Descrição', value: 'descricao' },
                    { label: 'Nível', value: 'nivel' },
                    { label: 'Início', value: 'horarioInicio' },
                    { label: 'Final', value: 'horarioFinal' },
                    { label: 'Duração (Segundos)', value: 'duracaoSegundos' },
                ];
                
                // 2. Converte o JSON em CSV
                const csv = parse(alertas, { fields });

                // 3. Envia a resposta como arquivo CSV
                res.header('Content-Type', 'text/csv');
                res.attachment(`relatorio_alertas_${new Date().toISOString().slice(0, 10)}.csv`);
                res.status(200).send(csv);

            })
            .catch(function (erro) {
                console.error("\nHouve um erro ao exportar os alertas! Erro: ", erro.sqlMessage || erro.message);
                res.status(500).json({ erro: "Erro interno do servidor ao exportar alertas", detalhes: erro.sqlMessage || erro.message });
            });
    } catch (e) {
        return res.status(400).send(e.message);
    }
}


module.exports = {
    listarAlertas,
    exportarAlertas // Exporta a nova função
};