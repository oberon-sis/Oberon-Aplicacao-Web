const dashboardespecifica = require('../models/dashboardEspecificaModel');

async function procurar_informacoes_maquina(req, res) {
  const idMaquina = req.params.idMaquina;

  // 🔒 Validação reforçada
  if (!idMaquina || isNaN(Number(idMaquina))) {
    return res.status(400).json({
      success: false,
      mensagem: 'ID da máquina inválido ou não fornecido.'
    });
  }

  try {
    const [
      info_tecnica_computador,
      info_tecnica_componentes,
      dados_kpi_pico_24h,
      dados_parametros_por_componente,
      dados_coleta_24_horas,
      dados_ultimos_eventos,
      dados_kpi_disponibilidade,
      dados_kpi_alertas_30d
    ] = await Promise.all([
      dashboardespecifica.buscar_info_maquina(idMaquina),
      dashboardespecifica.buscar_info_componentes(idMaquina),
      dashboardespecifica.buscar_dados_kpi(idMaquina),
      dashboardespecifica.buscar_parametros(idMaquina),
      dashboardespecifica.buscar_info_24_horas_coleta(idMaquina),
      dashboardespecifica.ultimo_eventos_maquina_especifica(idMaquina),
      dashboardespecifica.calcular_taxa_disponibilidade(idMaquina),
      dashboardespecifica.buscar_kpi_alertas_30_dias(idMaquina)
    ]);

    // 📦 Resposta padronizada
    return res.status(200).json({
      success: true,
      data: {
        info_tecnica_computador,
        info_tecnica_componentes,
        dados_kpi_pico_24h,
        dados_parametros_por_componente,
        dados_coleta_24_horas,
        dados_ultimos_eventos,
        dados_kpi_disponibilidade,
        dados_kpi_alertas_30d
      }
    });

  } catch (erro) {
    console.error('[ERRO - Dashboard Específica]:', erro);

    return res.status(500).json({
      success: false,
      mensagem: 'Erro interno ao buscar dados da máquina.',
      detalhe: erro.message
    });
  }
}

module.exports = {
  procurar_informacoes_maquina,
};
