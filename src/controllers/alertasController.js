var alertasModel = require("../models/alertasModel"); // Importação corrigida (singular)

const limitePagina = alertasModel.limitePagina;

function listarAlertas(req, res) {
    var idUsuario = req.params.idUsuario;
    var pagina = parseInt(req.params.pagina); 
    if (idUsuario == undefined || isNaN(idUsuario) || idUsuario <= 0) {
        return res.status(400).send("ID do usuário inválido ou ausente.");
    }
    if (isNaN(pagina) || pagina <= 0) {
        pagina = 1; 
    }
    alertasModel.getFkEmpresa(idUsuario)
        .then(function (resultadoEmpresa) {
            if (resultadoEmpresa.length === 0 || !resultadoEmpresa[0].fkEmpresa) {
                return res.status(404).send("Empresa do usuário não encontrada. Verifique se o Funcionario está vinculado a uma Empresa.");
            }
        
            const fkEmpresa = resultadoEmpresa[0].fkEmpresa;
            Promise.all([
                alertasModel.contarTotalAlertas(fkEmpresa),
                alertasModel.verAlertas(fkEmpresa, pagina)
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
}

module.exports = {
    listarAlertas
};