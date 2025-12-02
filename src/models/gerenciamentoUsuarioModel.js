var database = require('../database/config'); 


function getFkEmpresa(idFuncionario) {
    console.log("ACESSEI O USUARIO MODEL PARA BUSCAR FKEMPRESA");
    var instrucaoSql = `
        SELECT fkEmpresa
        FROM Funcionario
        WHERE idFuncionario = ${idFuncionario};
    `;
    console.log("Executando a instrução SQL:\n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function cadastrar(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha, fkCriadoPor) {
    console.log("ACESSEI O USUARIO MODEL PARA CADASTRAR");
    var instrucaoSql = `
        INSERT INTO Funcionario (nome, cpf, email, fkEmpresa, fkTipoUsuario, senha, fkCriadoPor) 
        VALUES ('${nome}', '${cpf}', '${email}', ${fkEmpresa}, ${fkTipoUsuario},'${senha}', ${fkCriadoPor});
    `;
    console.log("Executando a instrução SQL:\n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function salvarEdicao(nome, email, fkTipoUsuario, senha, idFuncionario, fkFuncionarioEditor) {
    console.log(
        "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function salvarEdicao(): ",
        nome,
        email,
        fkTipoUsuario,
        senha,
        idFuncionario,
        fkFuncionarioEditor 
    );
    

    let setClauses = [];

  
    if (fkFuncionarioEditor === undefined || fkFuncionarioEditor === null || isNaN(Number(fkFuncionarioEditor))) {
         console.error("ERRO DE AUDITORIA: ID do editor (fkFuncionarioEditor) é obrigatório e não foi fornecido/é inválido.");
         return Promise.reject(new Error("ID do editor é obrigatório para realizar a edição e auditoria."));
    }

   
    if (nome) {
        setClauses.push(`nome = '${nome}'`);
    }

 
    if (email) {
        setClauses.push(`email = '${email}'`);
    }

 
    if (fkTipoUsuario !== undefined && fkTipoUsuario !== null) {
        setClauses.push(`fkTipoUsuario = ${fkTipoUsuario}`);
    }

    if (senha) {
        setClauses.push(`senha = '${senha}'`);
    }


    setClauses.push(`fkEditadoPor = ${fkFuncionarioEditor}`);


  
    if (setClauses.length === 1 && setClauses[0].includes('fkEditadoPor')) {
        console.log("Apenas o campo de auditoria (fkEditadoPor) foi enviado. Continuando a operação...");
    } else if (setClauses.length === 0) {
        
        console.log("Nenhum campo fornecido para atualização. Retornando...");
        return Promise.resolve({ affectedRows: 0, message: "Nenhum dado alterado." });
    }

  
    var instrucaoSql = `
        UPDATE Funcionario
        SET 
            ${setClauses.join(', \n\t\t\t')}
        WHERE idFuncionario = ${idFuncionario};
    `;

    console.log("Executando a instrução SQL de UPDATE Dinâmico:\n" + instrucaoSql);
    return database.executar(instrucaoSql);
}



function getUsuariobyID(idFuncionario) {
    var instrucao = `
        SELECT 
            f.idFuncionario,
            f.nome,
            f.cpf,
            f.email,
            f.senha,
            f.fkTipoUsuario,
            f.fkEmpresa,  -- <--- O CULPADO! ADICIONE ESTA LINHA AQUI
            t.tipoUsuario AS nomeTipoUsuario
        FROM Funcionario AS f
        JOIN TipoUsuario AS t
            ON f.fkTipoUsuario = t.idTipoUsuario
        WHERE f.idFuncionario = ${idFuncionario};
    `;
    
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getTipoUsuario() {
    console.log(
        "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
      );
    
      var instrucaoSql = `
              SELECT 
                idTipoUsuario, 
                tipoUsuario AS nomeTipo
            FROM TipoUsuario
            ORDER BY idTipoUsuario; 
        `;
      console.log('Executando a instrução SQL: \n' + instrucaoSql);
      return database.executar(instrucaoSql);
}

function ExcluirUsuario(idFuncionario, idGerente) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function ExcluirUsuario():", idFuncionario);
    
   
    var instrucao1 = `DELETE FROM LogAuditoria WHERE fkFuncionario = ${idFuncionario};`;
    
    
        var instrucao2 = `
    SET @USUARIO_LOGADO = ${idGerente};
    DELETE FROM Funcionario WHERE idFuncionario = ${idFuncionario};`;

    console.log("Executando exclusão de logs...");
    
    return database.executar(instrucao2)
}

function listarFuncionarios(limit, offset) {
    console.log(`Executando listarFuncionarios(limit=${limit}, offset=${offset})`);

    var instrucao = `
            SELECT 
                f.idFuncionario AS id, 
                f.nome, 
                f.cpf, 
                f.email, 
                t.tipoUsuario AS funcao
            FROM Funcionario AS f
            JOIN TipoUsuario AS t ON f.fkTipoUsuario = t.idTipoUsuario
            WHERE f.fkEmpresa = 2
            ORDER BY f.nome ASC
            LIMIT ${limit} OFFSET ${offset};
        `;

    console.log('SQL executado:\n' + instrucao);
    return database.executar(instrucao);
}

function contarTotalUsuarios() {
    console.log(
        "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
      );
      var instrucaoSql = `
            SELECT COUNT(idFuncionario) AS totalItems 
            FROM Funcionario Where fkFuncionario = 2;
        `;
      console.log('Executando a instrução SQL: \n' + instrucaoSql);
      return database.executar(instrucaoSql);
}

function PesquisarUsuario(campo, valor) {
    console.log(`
        ACESSEI O USUARIO MODEL
        >> Função: PesquisarUsuario()
        >> Campo: ${campo}
        >> Valor: ${valor}
    `);

    if (campo !== 'nome' && campo !== 'email') {
        console.error("Campo inválido! Use 'nome' ou 'email'.");
        return 'Campo inválido para pesquisa.';
    }

    var instrucaoSql = `
        SELECT 
             f.idFuncionario AS id, 
             f.nome, 
             f.cpf, 
             f.email, 
             t.tipoUsuario AS funcao
            FROM Funcionario AS f
            JOIN TipoUsuario AS t ON f.fkTipoUsuario = t.idTipoUsuario
          WHERE ${campo}  LIKE '${valor}%' and fkEmpresa = 2;
    `;

    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}

function autenticar(email, senha) {
    console.log(
      "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
      email,
      senha,
    );
    var instrucaoSql = `
          SELECT id, nome, email, fk_empresa as empresaId FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
      `;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
  }


function cadastrar(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha, fkFuncionarioCriador) {
    console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    cpf,
    email,
    fkEmpresa,
    fkTipoUsuario,
    senha,
        fkFuncionarioCriador 
    );

    var instrucaoSql = `
          INSERT INTO Funcionario (nome, cpf, email, fkEmpresa, fkTipoUsuario, senha, fkCriadoPor) 
          VALUES ('${nome}', '${cpf}', '${email}', ${fkEmpresa}, ${fkTipoUsuario},'${senha}', ${fkFuncionarioCriador});
        `;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
        return database.executar(instrucaoSql);
    }

module.exports = {
    autenticar,
    cadastrar,
    getFkEmpresa,
    getUsuariobyID,
    getTipoUsuario,
    salvarEdicao,
    ExcluirUsuario,
    listarFuncionarios,
    contarTotalUsuarios,
    PesquisarUsuario,
};