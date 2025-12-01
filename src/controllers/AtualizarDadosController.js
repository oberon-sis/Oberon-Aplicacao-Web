var empresaModel = require("../models/AtualizarDadosModel");

function buscarPorId(req, res) {
    var idEmpresa = req.params.idEmpresa;

    empresaModel.buscarPorId(idEmpresa)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhuma empresa encontrada!");
            }
        }).catch((erro) => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function editar(req, res) {
    var idEmpresa = req.body.idEmpresaServer;
    var razaoSocial = req.body.razaoSocialServer;
    var cnpj = req.body.cnpjServer;

    empresaModel.editar(idEmpresa, razaoSocial, cnpj)
        .then((resultado) => {
            res.status(200).json(resultado);
        }).catch((erro) => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function excluir(req, res) {
    var idEmpresa = req.params.idEmpresa;

    empresaModel.excluir(idEmpresa)
        .then((resultado) => {
            res.status(200).json(resultado);
        }).catch((erro) => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarPorId,
    editar,
    excluir
};