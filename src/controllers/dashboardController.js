var dashboardModel = require("../models/dashboardModel");

function getDadosGerais(req, res) {
    var idEmpresa = req.params.idEmpresa;

    if (idEmpresa == undefined) {
        return res.status(400).send("idEmpresa está undefined!");
    }

   
    Promise.all([
        dashboardModel.buscarKpis(idEmpresa),
        dashboardModel.buscarListas(idEmpresa),
        dashboardModel.buscarEvolucaoAlertas(idEmpresa)
    ])
    .then(function (resultados) {
  
        const kpis = resultados[0][0]; 
        
       
        const listaCompleta = resultados[1];
        
 
        const topSobrecarga = [...listaCompleta]
            .filter(m => (m.media_cpu > 85 || m.media_ram > 85))
            .sort((a, b) => Math.max(b.media_cpu, b.media_ram) - Math.max(a.media_cpu, a.media_ram))
            .slice(0, 5);

 
        const topOciosas = [...listaCompleta]
            .filter(m => (m.media_cpu < 20 && m.media_ram < 20))
            .sort((a, b) => Math.max(a.media_cpu, a.media_ram) - Math.max(b.media_cpu, b.media_ram))
            .slice(0, 5);

   
        const alertasBrutos = resultados[2];
        
        
        res.json({
            kpis: {
                totalMaquinas: kpis.totalMaquinas,
                maquinasSobrecarga: kpis.maquinasSobrecarga,
                maquinasRiscoDisco: kpis.maquinasRiscoDisco,
                maquinasOciosas: kpis.maquinasOciosas,
                totalIncidentes: kpis.totalIncidentes
            },
            listas: {
                topSobrecarga,
                topOciosas
            },
            graficos: {
                matriz: listaCompleta, 
                evolucao: alertasBrutos 
            }
        });
    })
    .catch(function (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    getDadosGerais
};