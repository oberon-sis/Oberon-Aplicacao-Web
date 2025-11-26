var database = require("../database/config");

function buscarKpis(idEmpresa) {
    // Busca os totais para os cards do topo
    // Como o idEmpresa vem do login, filtramos por ele.
    
    // Observação: No seu DER, "Alerta" está ligado a "Registro", "Incidente" a "LogDetalheEvento".
    // Vou assumir que você quer contar Incidentes do mês atual para a empresa.
    
    const instrucaoSql = `
        SELECT 
            (SELECT COUNT(idMaquina) FROM Maquina WHERE fkEmpresa = ${idEmpresa}) as totalMaquinas,
            
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND r.valor > 85 
             AND tc.tipoComponete IN ('CPU', 'RAM')) as maquinasSobrecarga,
             
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND r.valor > 90 
             AND tc.tipoComponete = 'DISCO') as maquinasRiscoDisco,
             
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
             AND r.valor < 20 
             AND tc.tipoComponete IN ('CPU', 'RAM')) as maquinasOciosas,

            (SELECT COUNT(i.idIncidente) 
             FROM Incidente i
             JOIN LogDetalheEvento lde ON i.fkLogDetalheEvento = lde.idLogDetalheEvento
             JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
             JOIN Maquina m ON ls.fkMaquina = m.idMaquina
             WHERE m.fkEmpresa = ${idEmpresa}
             AND i.dataCriacao >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalIncidentes;
    `;
    return database.executar(instrucaoSql);
}

function buscarListas(idEmpresa) {
    
    const instrucaoSql = `
        SELECT 
            m.nome as nomeMaquina,
            AVG(CASE WHEN tc.tipoComponete = 'CPU' THEN r.valor END) as media_cpu,
            AVG(CASE WHEN tc.tipoComponete = 'RAM' THEN r.valor END) as media_ram
        FROM Maquina m
        JOIN Componente c ON c.fkMaquina = m.idMaquina
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        JOIN Registro r ON r.fkComponente = c.idComponente
        WHERE m.fkEmpresa = ${idEmpresa}
        AND r.horario >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY m.idMaquina, m.nome;
    `;
    return database.executar(instrucaoSql);
}

function buscarEvolucaoAlertas(idEmpresa) {
    const instrucaoSql = `
        SELECT 
            DATE_FORMAT(r.horario, '%d/%m') as dia,
            tc.tipoComponete,
            COUNT(a.idAlerta) as qtd_alertas
        FROM Alerta a
        JOIN Registro r ON a.fkRegistro = r.idRegistro
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
        AND a.nivel = 'CRITICO'
        -- AQUI ESTÁ A MUDANÇA: DE 7 DIAS PARA 3 MESES PARA PEGAR O HISTÓRICO COMPLETO
        AND r.horario >= DATE_SUB(NOW(), INTERVAL 3 MONTH) 
        GROUP BY dia, tc.tipoComponete
        ORDER BY MIN(r.horario);
    `;
    return database.executar(instrucaoSql);
}
module.exports = {
    buscarKpis,
    buscarListas,
    buscarEvolucaoAlertas
};