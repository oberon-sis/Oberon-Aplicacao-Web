const db = require('../database/config');

module.exports = {
    async buscarCrescimentoAlertas() {
        const [[result]] = await db.query(`
      SELECT ROUND(((SELECT COUNT(*) FROM Alerta WHERE nivel = 'Crítico' AND MONTH(horario) = MONTH(NOW())) -
                    (SELECT COUNT(*) FROM Alerta WHERE nivel = 'Crítico' AND MONTH(horario) = MONTH(NOW()) - 2)) 
                    / (SELECT COUNT(*) FROM Alerta WHERE nivel = 'Crítico' AND MONTH(horario) = MONTH(NOW()) - 2) * 100, 1) AS crescimento
    `);
        return result.crescimento || 0;
    },

    async buscarTempoEntreAlertas() {
        const [[result]] = await db.query(`
      SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, LAG(horario) OVER (ORDER BY horario), horario)), 0) AS tempoMedio
      FROM Registro
      WHERE horario >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
    `);
        return result.tempoMedio || 0;
    },

    async buscarComponenteCritico() {
        const [[result]] = await db.query(`
      SELECT tipoComponente
      FROM Alerta
      JOIN Parametro ON Alerta.fkParametro = Parametro.idParametro
      JOIN TipoComponente ON Parametro.fkTipoComponente = TipoComponente.idTipoComponente
      WHERE Alerta.nivel = 'Crítico'
      GROUP BY tipoComponente
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `);
        return result?.tipoComponente || 'N/A';
    },

    async buscarPrevisaoAlertas() {
        const [[result]] = await db.query(`
      SELECT ROUND(COUNT(*) * 1.15) AS previsao
      FROM Alerta
      WHERE MONTH(horario) = MONTH(NOW())
    `);
        return result.previsao || 0;
    },

    async buscarMaquinasSuspeitas() {
        const [[result]] = await db.query(`
      SELECT COUNT(DISTINCT fkMaquina) AS suspeitas
      FROM LogSistema
      WHERE tipoAcesso = 'Desligamento Inesperado'
        AND horarioInicio BETWEEN DATE_SUB(NOW(), INTERVAL 2 MONTH) AND NOW()
    `);
        return result.suspeitas || 0;
    },

    async buscarTendenciaDesgaste() {
        const [result] = await db.query(`
      SELECT MONTH(horario) AS mes, tipoComponente, ROUND(AVG(valor), 1) AS mediaUso
      FROM Registro
      JOIN Componente ON Registro.fkComponente = Componente.idComponente
      JOIN TipoComponente ON Componente.fkTipoComponente = TipoComponente.idTipoComponente
      WHERE horario >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY mes, tipoComponente
      ORDER BY mes ASC
    `);
        return result;
    },

    async buscarProgressaoAlertas() {
        const [result] = await db.query(`
      SELECT WEEK(horario) AS semana, COUNT(*) AS acumulado
      FROM Alerta
      WHERE horario >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
      GROUP BY semana
      ORDER BY semana ASC
    `);
        return result;
    },

    async buscarRankingIntervencao() {
        const [result] = await db.query(`
      SELECT Maquina.nome AS maquina, COUNT(*) AS alertas, MAX(Alerta.nivel) AS severidade
      FROM Alerta
      JOIN Parametro ON Alerta.fkParametro = Parametro.idParametro
      JOIN Componente ON Parametro.fkComponente = Componente.idComponente
      JOIN Maquina ON Componente.fkMaquina = Maquina.idMaquina
      WHERE Alerta.nivel IN ('Crítico', 'Alto')
      GROUP BY maquina
      ORDER BY alertas DESC
      LIMIT 5
    `);
        return result;
    },

    async buscarMapaRisco() {
        const [result] = await db.query(`
      SELECT Maquina.nome AS maquina,
        CASE 
          WHEN COUNT(*) >= 10 THEN 'Alto'
          WHEN COUNT(*) BETWEEN 5 AND 9 THEN 'Moderado'
          ELSE 'Baixo'
        END AS risco
      FROM Alerta
      JOIN Parametro ON Alerta.fkParametro = Parametro.idParametro
      JOIN Componente ON Parametro.fkComponente = Componente.idComponente
      JOIN Maquina ON Componente.fkMaquina = Maquina.idMaquina
      WHERE Alerta.nivel = 'Crítico'
      GROUP BY maquina
    `);
        return result;
    }
};
