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

module.exports = {
    getDados
};