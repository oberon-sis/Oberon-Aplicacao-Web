const dashboardespecifica = require('../models/dashboardEspecificaModel');
const geralModel = require('../models/analise-tendenciaModel');

async function procurar_informacoes_maquina(req, res) {
  const idMaquina = req.params.idMaquina;

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
      dados_kpi_alertas_30d,
      dados_kpi_componente_critico
    ] = await Promise.all([
      dashboardespecifica.buscar_info_maquina(idMaquina),
      dashboardespecifica.buscar_info_componentes(idMaquina),
      dashboardespecifica.buscar_dados_kpi(idMaquina),
      dashboardespecifica.buscar_parametros(idMaquina),
      dashboardespecifica.buscar_info_24_horas_coleta(idMaquina),
      dashboardespecifica.ultimo_eventos_maquina_especifica(idMaquina),
      dashboardespecifica.calcular_taxa_disponibilidade(idMaquina),
      dashboardespecifica.buscar_kpi_alertas_30_dias(idMaquina),
      dashboardespecifica.buscar_kpi_componente_critico(idMaquina)

    ]);

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
        dados_kpi_alertas_30d,
        dados_kpi_componente_critico
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

async function Maquinas_listagem(req, res) {
    const idEmpresa = req.params.idEmpresa;

    if (!idEmpresa) return res.status(400).send('dado não fornecido.');

    try {
        const maquinas = await geralModel.buscar_maquinas(idEmpresa)

        res.status(200).json(maquinas);
    } catch (erro) {
        res.status(500).json({
            mensagem: 'Erro interno ao buscar dados das máquinas.',
            detalhe: erro.message,
        });
    }
}

module.exports = {
  procurar_informacoes_maquina,
  Maquinas_listagem
};
