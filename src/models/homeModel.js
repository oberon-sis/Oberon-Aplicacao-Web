const database = require('../database/config');

const getColorByPico = (valor) => {
  if (valor >= 90) return 'CRÍTICO';
  if (valor >= 75) return 'ATENÇÃO';
  if (valor <= 20) return 'OCIOSO';
  return 'NORMAL';
};

exports.getTopCriticalMachines = async (fkEmpresa) => {
  const idEmpresa = Number(fkEmpresa);

  const query = `
        SELECT
            M.idMaquina AS id,
            M.nome,
            COUNT(A.idAlerta) AS total_alertas,
            MAX(CASE WHEN TC.tipoComponete = 'CPU' THEN R.valor END) AS cpu_pico,
            MAX(CASE WHEN TC.tipoComponete = 'RAM' THEN R.valor END) AS ram_pico
        FROM
            Maquina AS M
        LEFT JOIN 
            Componente AS C ON M.idMaquina = C.fkMaquina
        LEFT JOIN 
            TipoComponente AS TC ON C.fkTipoComponente = TC.idTipoComponente
        LEFT JOIN
            Registro AS R ON C.idComponente = R.fkComponente AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        LEFT JOIN
            Alerta AS A ON R.idRegistro = A.fkRegistro
        WHERE 
            M.fkEmpresa = ${idEmpresa}
            AND M.status = 'Online'
        GROUP BY
            M.idMaquina, M.nome
        ORDER BY 
            total_alertas DESC, 
            cpu_pico DESC,
            ram_pico DESC
        LIMIT 3;
    `;

  try {
    const rows = await database.executar(query);

    return rows.map((row) => {
      const piorPico = Math.max(row.cpu_pico || 0, row.ram_pico || 0);
      const piorMetrica = row.cpu_pico >= row.ram_pico ? 'CPU' : 'RAM';

      return {
        id: row.id,
        nome: row.nome,
        total_alertas: row.total_alertas,
        status: getColorByPico(piorPico),
        pior_caso_metric: piorMetrica,
        pior_caso_value: piorPico.toFixed(0),
      };
    });
  } catch (err) {
    console.error('Erro na consulta getTopCriticalMachines:', err.message);
    throw err;
  }
};

exports.getScatterPlotData = async (fkEmpresa) => {
  const idEmpresa = Number(fkEmpresa);

  const query = `
        SELECT 
            M.nome AS id, 
            AVG(CASE WHEN TC.tipoComponete = 'RAM' THEN R.valor END) AS x, 
            AVG(CASE WHEN TC.tipoComponete = 'CPU' THEN R.valor END) AS y
        FROM 
            Maquina AS M
        JOIN 
            Componente AS C ON M.idMaquina = C.fkMaquina
        JOIN 
            TipoComponente AS TC ON C.fkTipoComponente = TC.idTipoComponente
        JOIN 
            Registro AS R ON C.idComponente = R.fkComponente
        WHERE 
            M.fkEmpresa = ${idEmpresa}
            AND M.status = 'Online'
            AND R.horario >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
            AND (TC.tipoComponete = 'RAM' OR TC.tipoComponete = 'CPU')
        GROUP BY 
            M.nome
    `;

  try {
    const rows = await database.executar(query);

    return rows.map((row) => {
      const cpuAvg = row.y || 0;
      const ramAvg = row.x || 0;
      const piorAvg = Math.max(cpuAvg, ramAvg);

      let statusGrafico;
      if (piorAvg >= 90) statusGrafico = 'Máquina - Em crítico';
      else if (piorAvg >= 70) statusGrafico = 'Máquina - Em Atenção';
      else if (piorAvg <= 28) statusGrafico = 'Máquina - Em Ocioso';
      else statusGrafico = 'Máquina - Dentro do aceitável';

      return {
        id: row.id,
        x: Number(ramAvg.toFixed(1)),
        y: Number(cpuAvg.toFixed(1)),
        status: statusGrafico,
      };
    });
  } catch (err) {
    console.error('Erro na consulta getScatterPlotData:', err.message);
    throw err;
  }
};
