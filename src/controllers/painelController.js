const painelModel = require('../models/painelModel');

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
 

module.exports = {
  procurar_informacoes_maquina,
};
