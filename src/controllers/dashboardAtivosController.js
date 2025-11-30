var dashboardModel = require("../models/dashboardAtivosModel");

function getDadosGerais(req, res) {
    var idEmpresa = req.params.idEmpresa;
    
    var bimestre = req.body.bimestre || req.query.bimestre;

    if (idEmpresa == undefined) {
        return res.status(400).send("idEmpresa está undefined!");
    }

    Promise.all([
        dashboardModel.buscarKpis(idEmpresa, bimestre),         
        dashboardModel.buscarListas(idEmpresa, bimestre),       
        dashboardModel.buscarEvolucaoAlertas(idEmpresa, bimestre) 
    ])
    .then(function (resultados) {

        const kpis = resultados[0][0][0]; 
        
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
        
        // ------------------------------------------------------------------
        // CÁLCULO NECESSÁRIO PARA O GRÁFICO DE STATUS DE SAÚDE AGREGADO
        // ------------------------------------------------------------------
        
        // 1. FATIA CRÍTICA: Combina Sobrecarga e Risco de Disco (problemas)
        const maquinasEmRisco = kpis.maquinasSobrecarga + kpis.maquinasRiscoDisco;
        
        // 2. FATIA OCIOSA: Máquinas Subutilizadas (oportunidade)
        const maquinasOciosas = kpis.maquinasOciosas;

        // 3. FATIA NORMAL: O que sobrou (total - problemas - oportunidade)
        let maquinasNormais = kpis.totalMaquinas - maquinasEmRisco - maquinasOciosas;
        
        // Garante que o número de máquinas normais seja no mínimo 0
        if (maquinasNormais < 0) {
            maquinasNormais = 0;
        }

        const dadosSaudeAgregada = {
            critica: maquinasEmRisco,
            ociosa: maquinasOciosas,
            normal: maquinasNormais
        };
        
        // ------------------------------------------------------------------
        // ATUALIZAÇÃO DA RESPOSTA JSON
        // ------------------------------------------------------------------
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
                evolucao: alertasBrutos,
                // NOVO DADO ENVIADO PARA O FRONT-END:
                saudeAgregada: dadosSaudeAgregada 
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