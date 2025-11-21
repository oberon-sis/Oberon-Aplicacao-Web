var mysql = require("mysql2");

// --- DEBUG DE AMBIENTE (Pode remover depois que funcionar) ---
console.log("--- DEBUG DE AMBIENTE ---");
console.log("Usuário:", process.env.DB_USER);
console.log("Senha:", process.env.DB_PASS); 
console.log("Banco:", process.env.DB_NAME);
console.log("Host:", process.env.DB_HOST);
console.log("-----------------------");
// -----------------------------------------------------------

var mySqlConfig = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,  // Usa DB_NAME (do seu .env)
    user: process.env.DB_USER,
    password: process.env.DB_PASS,  // Usa DB_PASS (do seu .env)
    port: process.env.DB_PORT
};

function executar(instrucao) {

    if (process.env.AMBIENTE_PROCESSO !== "producao" && process.env.AMBIENTE_PROCESSO !== "desenvolvimento") {
        console.log("\nO AMBIENTE (producao OU desenvolvimento) NÃO FOI DEFINIDO EM .env OU dev.env OU app.js\n");
        return Promise.reject("AMBIENTE NÃO CONFIGURADO EM .env");
    }

    return new Promise(function (resolve, reject) {
        var conexao = mysql.createConnection(mySqlConfig);
        conexao.connect();
        conexao.query(instrucao, function (erro, resultados) {
            conexao.end();
            if (erro) {
                reject(erro);
            }
            console.log(resultados);
            resolve(resultados);
        });
        conexao.on('error', function (erro) {
            return("ERRO NO MySQL SERVER: ", erro.sqlMessage);
        });
    });
}

module.exports = {
    executar
};