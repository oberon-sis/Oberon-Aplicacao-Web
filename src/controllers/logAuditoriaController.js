var logAuditoriaModel = require('../models/logAuditoriaModel');
const { parse } = require('json2csv');

function buscarLogs(req, res) {
  const idEmpresa = req.params.idEmpresa;
  const pagina = parseInt(req.query.pagina) || 1;
  const itensPorPagina = parseInt(req.query.itensPorPagina) || 20;

  const filtros = {
    funcionarioId: req.query.funcionarioId || 'todos',
    tipoMudanca: req.query.tipoMudanca || 'todos',
    dataInicio: req.query.dataInicio || null,
    dataFim: req.query.dataFim || null,
  };

  logAuditoriaModel
    .buscarLogs(idEmpresa, filtros, pagina, itensPorPagina)
    .then((resultadoLogs) => {
      logAuditoriaModel
        .contarLogs(idEmpresa, filtros)
        .then((resultadoTotal) => {
          const totalRegistros = resultadoTotal[0].total;
          const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);

          res.status(200).json({
            logs: resultadoLogs,
            paginacao: {
              paginaAtual: pagina,
              itensPorPagina: itensPorPagina,
              totalRegistros: totalRegistros,
              totalPaginas: totalPaginas,
            },
          });
        })
        .catch((erro) => {
          console.error('Erro ao contar logs:', erro);
          res.status(500).json({ message: 'Erro ao contar registros de auditoria.' });
        });
    })
    .catch((erro) => {
      console.error('Erro ao buscar logs:', erro);
      res.status(500).json({ message: 'Erro ao buscar logs de auditoria.' });
    });
}

function buscarFuncionarios(req, res) {
  const idEmpresa = req.params.idEmpresa;

  logAuditoriaModel
    .buscarFuncionarios(idEmpresa)
    .then((resultado) => {
      res.status(200).json({ funcionarios: resultado });
    })
    .catch((erro) => {
      console.error('Erro ao buscar funcionários:', erro);
      res.status(500).json({ message: 'Erro ao buscar lista de funcionários.' });
    });
}

function buscarDetalhesLog(req, res) {
  const idLog = req.params.idLog;

  logAuditoriaModel
    .buscarLogPorId(idLog)
    .then((resultado) => {
      if (resultado.length > 0) {
        res.status(200).json({ log: resultado[0] });
      } else {
        res.status(404).json({ message: 'Log não encontrado.' });
      }
    })
    .catch((erro) => {
      console.error('Erro ao buscar detalhes do log:', erro);
      res.status(500).json({ message: 'Erro ao buscar detalhes do log.' });
    });
}

function exportarCSV(req, res) {
  const idEmpresa = req.params.idEmpresa;
  const filtros = {
    funcionarioId: req.query.funcionarioId || 'todos',
    tipoMudanca: req.query.tipoMudanca || 'todos',
    dataInicio: req.query.dataInicio || null,
    dataFim: req.query.dataFim || null,
  };

  logAuditoriaModel
    .exportarLogsCSV(idEmpresa, filtros)
    .then((resultado) => {
      if (resultado.length === 0) {
        return res.status(404).json({ message: 'Nenhum registro encontrado para exportar.' });
      }
      try {
        const fields = [
          { label: 'Horário', value: 'Horario' },
          { label: 'Ação', value: 'Acao' },
          { label: 'Descrição', value: 'Descricao' },
          { label: 'Tabela Afetada', value: 'TabelaAfetada' },
          { label: 'ID Afetado', value: 'IDAfetado' },
          { label: 'Usuário Responsável', value: 'UsuarioResponsavel' },
        ];
        const dadosFormatados = resultado.map((row) => ({
          ...row,
          Acao: traduzirAcao(row.Acao),
        }));
        const csv = parse(dadosFormatados, { fields, withBOM: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=log_auditoria_${timestamp}.csv`);
        res.status(200).send(csv);
      } catch (error) {
        console.error('Erro ao gerar CSV:', error);
        res.status(500).json({ message: 'Erro ao processar dados para CSV.' });
      }
    })
    .catch((erro) => {
      console.error('Erro ao exportar CSV:', erro);
      res.status(500).json({ message: 'Erro ao exportar logs para CSV.' });
    });
}

function traduzirAcao(acao) {
  const traducoes = {
    INSERT: 'INCLUSÃO',
    UPDATE: 'ALTERAÇÃO',
    DELETE: 'EXCLUSÃO',
    CONFIG: 'CONFIGURAÇÃO',
  };
  return traducoes[acao] || acao;
}

module.exports = {
  buscarLogs,
  buscarFuncionarios,
  buscarDetalhesLog,
  exportarCSV,
};
