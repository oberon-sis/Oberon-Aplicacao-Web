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
        COUNT(DISTINCT A.idAlerta) AS total_alertas,
        MAX(CASE WHEN TC.tipoComponete = 'CPU' THEN R.valor END) AS cpu_pico,
        MAX(CASE WHEN TC.tipoComponete = 'RAM' THEN R.valor END) AS ram_pico
    FROM
        Maquina AS M
    LEFT JOIN 
        Componente AS C ON M.idMaquina = C.fkMaquina
    LEFT JOIN 
        TipoComponente AS TC ON C.fkTipoComponente = TC.idTipoComponente
    LEFT JOIN
        Registro AS R ON C.idComponente = R.fkComponente 
        AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    LEFT JOIN
        Alerta AS A ON R.idRegistro = A.fkRegistro
    WHERE 
        M.fkEmpresa = ${idEmpresa}
        AND M.status = 'Online'
    GROUP BY
        M.idMaquina, M.nome
    HAVING
        total_alertas > 0
    ORDER BY 
        total_alertas DESC, 
        cpu_pico DESC,
        ram_pico DESC
    LIMIT 3;
  `;

  try {
    const rows = await database.executar(query);

    if (!rows || rows.length === 0) {
      return [];
    }

    return rows.map((row) => {
      const cpuPico = parseFloat(row.cpu_pico) || 0;
      const ramPico = parseFloat(row.ram_pico) || 0;
      const piorPico = Math.max(cpuPico, ramPico);
      const piorMetrica = cpuPico >= ramPico ? 'CPU' : 'RAM';

      return {
        id: row.id,
        nome: row.nome,
        total_alertas: parseInt(row.total_alertas) || 0,
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
        M.idMaquina,
        M.nome AS id,
        ROUND(AVG(CASE WHEN TC.tipoComponete = 'RAM' THEN R.valor END), 1) AS x,
        ROUND(AVG(CASE WHEN TC.tipoComponete = 'CPU' THEN R.valor END), 1) AS y
    FROM 
        Maquina AS M
    INNER JOIN 
        Componente AS C ON M.idMaquina = C.fkMaquina
    INNER JOIN 
        TipoComponente AS TC ON C.fkTipoComponente = TC.idTipoComponente
    INNER JOIN 
        Registro AS R ON C.idComponente = R.fkComponente
    WHERE 
        M.fkEmpresa = ${idEmpresa}
        AND M.status = 'Online'
        AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND TC.tipoComponete IN ('RAM', 'CPU')
    GROUP BY 
        M.idMaquina, M.nome
    HAVING 
        x IS NOT NULL AND y IS NOT NULL
    ORDER BY
        M.nome;
  `;

  try {
    console.log(`[ScatterPlot] Executando query para fkEmpresa=${idEmpresa}`);

    const rows = await database.executar(query);

    console.log(`[ScatterPlot] Retornadas ${rows ? rows.length : 0} máquinas`);

    if (!rows || rows.length === 0) {
      console.warn('[ScatterPlot] Nenhum dado encontrado para o gráfico');
      return [];
    }

    const result = rows.map((row) => {
      const cpuAvg = parseFloat(row.y) || 0;
      const ramAvg = parseFloat(row.x) || 0;
      const piorAvg = Math.max(cpuAvg, ramAvg);

      let statusGrafico;
      if (piorAvg >= 90) {
        statusGrafico = 'Máquina - Em crítico';
      } else if (piorAvg >= 70) {
        statusGrafico = 'Máquina - Em Atenção';
      } else if (piorAvg <= 28) {
        statusGrafico = 'Máquina - Em Ocioso';
      } else {
        statusGrafico = 'Máquina - Dentro do aceitável';
      }

      return {
        id: row.id,
        x: Number(ramAvg.toFixed(1)),
        y: Number(cpuAvg.toFixed(1)),
        status: statusGrafico,
      };
    });

    console.log('[ScatterPlot] Dados processados:', result);
    return result;
  } catch (err) {
    console.error('[ScatterPlot] Erro na consulta getScatterPlotData:', err.message);
    console.error('[ScatterPlot] Stack:', err.stack);
    throw err;
  }
};
