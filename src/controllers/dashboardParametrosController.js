var dashboardParametrosModel = require("../models/dashboardParametrosModel");

function getDados(req, res) {
    var { idEmpresa, componente } = req.params; 
    if (!idEmpresa || !componente) {
        return res.status(400).send("Faltam parâmetros: idEmpresa ou componente.");
    }
    var componenteUpper = componente.toUpperCase();
    var componentesValidos = ['CPU', 'RAM', 'DISCO', 'REDE'];
    if (!componentesValidos.includes(componenteUpper)) {
        return res.status(400).send("Componente inválido.");
    }
    Promise.all([
        dashboardParametrosModel.getDadosBrutos(idEmpresa, componenteUpper),
        dashboardParametrosModel.getKpisAgregados(idEmpresa, componenteUpper),
        dashboardParametrosModel.getDistribuicaoAlertas(idEmpresa, componenteUpper),
        dashboardParametrosModel.getParametros(idEmpresa, componenteUpper)
    ])
    .then(([dadosBrutos, kpisAgregados, distAlertas, parametros]) => {
        var kpis = kpisAgregados[0] || {};
        res.json({
            dadosBrutos: dadosBrutos.map(row => row.valor),
            kpisAgregados: kpis,
            distAlertas: distAlertas,
            parametros: parametros
        });
    })
    .catch((erro) => {
        console.error("Erro ao buscar dados do dashboard:", erro);
        res.status(500).json(erro.sqlMessage || erro);
    });
}

function atualizarParametros(req, res) {
    var { idEmpresa, componente, limiteAceitavel, limiteAtencao, limiteCritico, tipoAplicacao } = req.body;
    if (!idEmpresa || !componente || !limiteAceitavel || !limiteAtencao || !limiteCritico) {
        return res.status(400).json({ 
            success: false, 
            message: "Todos os campos são obrigatórios." 
        });
    }
    var componenteUpper = componente.toUpperCase();
    var componentesValidos = ['CPU', 'RAM', 'DISCO', 'REDE'];
    if (!componentesValidos.includes(componenteUpper)) {
        return res.status(400).json({ 
            success: false, 
            message: "Componente inválido." 
        });
    }
    if (parseFloat(limiteAceitavel) >= parseFloat(limiteAtencao)) {
        return res.status(400).json({ 
            success: false, 
            message: "O limite Aceitável deve ser menor que o limite de Atenção." 
        });
    }
    if (parseFloat(limiteAtencao) >= parseFloat(limiteCritico)) {
        return res.status(400).json({ 
            success: false, 
            message: "O limite de Atenção deve ser menor que o limite Crítico." 
        });
    }
    dashboardParametrosModel.atualizarParametros(
        idEmpresa,
        componenteUpper,
        limiteAceitavel,
        limiteAtencao,
        limiteCritico,
        tipoAplicacao || 'EMPRESA'
    )
    .then((resultado) => {
        res.json({
            success: true,
            message: "Parâmetros atualizados com sucesso!",
            data: resultado
        });
    })
    .catch((erro) => {
        console.error("Erro ao atualizar parâmetros:", erro);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar parâmetros.",
            error: erro.sqlMessage || erro
        });
    });
}

module.exports = {
    getDados,
    atualizarParametros
};