var database = require("../database/config");


function gerarFiltroData(bimestre, colunaData = 'r.horario') {
    
    if (!bimestre) bimestre = 6;

    const mesInicio = (bimestre * 2) - 1;
    const mesFim = bimestre * 2;          

    
    return `AND YEAR(${colunaData}) = 2025 AND MONTH(${colunaData}) BETWEEN ${mesInicio} AND ${mesFim}`;
}

function buscarKpis(idEmpresa, bimestre) {
    
    const filtroRegistro = gerarFiltroData(bimestre, 'r.horario');
    const filtroIncidente = gerarFiltroData(bimestre, 'i.dataCriacao');

    const instrucaoSql = `
        SELECT 
            (SELECT COUNT(idMaquina) FROM Maquina WHERE fkEmpresa = ${idEmpresa}) as totalMaquinas,
            
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             ${filtroRegistro} -- Filtro Dinâmico Inserido Aqui
             AND r.valor > 85 
             AND tc.tipoComponete IN ('CPU', 'RAM')) as maquinasSobrecarga,
             
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             ${filtroRegistro}
             AND r.valor > 90 
             AND tc.tipoComponete = 'DISCO') as maquinasRiscoDisco,
             
            (SELECT COUNT(DISTINCT m.idMaquina) 
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa} 
             ${filtroRegistro}
             AND r.valor < 20 
             AND tc.tipoComponete IN ('CPU', 'RAM')) as maquinasOciosas,

            (SELECT COUNT(i.idIncidente) 
             FROM Incidente i
             JOIN LogDetalheEvento lde ON i.fkLogDetalheEvento = lde.idLogDetalheEvento
             JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
             JOIN Maquina m ON ls.fkMaquina = m.idMaquina
             WHERE m.fkEmpresa = ${idEmpresa}
             ${filtroIncidente}) as totalIncidentes; -- Note que aqui usa a data de criação do incidente
    `;
    return database.executar(instrucaoSql);
}


function buscarListas(idEmpresa, bimestre) {
   
    const filtroRegistro = gerarFiltroData(bimestre, 'r.horario');
    
    const filtroAlerta = gerarFiltroData(bimestre, 'r2.horario'); 

    const instrucaoSql = `
        SELECT 
            m.nome as nomeMaquina,
            ROUND(AVG(CASE WHEN tc.tipoComponete LIKE 'CPU%' THEN r.valor END), 1) as media_cpu,
            ROUND(AVG(CASE WHEN tc.tipoComponete LIKE 'RAM%' THEN r.valor END), 1) as media_ram,
            
            -- Subquery para contar alertas CRÍTICOS desta máquina neste período
            (SELECT COUNT(a.idAlerta) 
             FROM Alerta a 
             JOIN Registro r2 ON a.fkRegistro = r2.idRegistro 
             JOIN Componente c2 ON r2.fkComponente = c2.idComponente 
             WHERE c2.fkMaquina = m.idMaquina 
             AND a.nivel = 'CRÍTICO' 
             ${filtroAlerta}) as alertas_criticos,

            -- Subquery para contar alertas OCIOSOS desta máquina neste período
            (SELECT COUNT(a.idAlerta) 
             FROM Alerta a 
             JOIN Registro r2 ON a.fkRegistro = r2.idRegistro 
             JOIN Componente c2 ON r2.fkComponente = c2.idComponente 
             WHERE c2.fkMaquina = m.idMaquina 
             AND a.nivel = 'OCIOSO' 
             ${filtroAlerta}) as alertas_ociosos

        FROM Maquina m
        JOIN Componente c ON c.fkMaquina = m.idMaquina
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        JOIN Registro r ON r.fkComponente = c.idComponente
        WHERE m.fkEmpresa = ${idEmpresa}
        ${filtroRegistro}
        GROUP BY m.idMaquina, m.nome
        HAVING media_cpu IS NOT NULL OR media_ram IS NOT NULL;
    `;
    return database.executar(instrucaoSql);
}

function buscarEvolucaoAlertas(idEmpresa, bimestre) {
    const filtroRegistro = gerarFiltroData(bimestre, 'r.horario');

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
        ${filtroRegistro}
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