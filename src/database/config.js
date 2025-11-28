// Este arquivo configura a conexão com o MySQL para o ambiente Node.js,
// utilizando as variáveis de ambiente carregadas pelo dotenv.

const mysql = require('mysql2');

// Configurações lendo diretamente do process.env
// Atenção: O dotenv deve ser carregado no app.js antes de importar este módulo!
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    connectionLimit: 10,
    waitForConnections: true
};

// Log de Debug para confirmar que as variáveis foram lidas
console.log("--- Configuração MySQL Carregada ---");
console.log(`Host: ${config.host} | Usuário: ${config.user} | Banco: ${config.database}`);
console.log("------------------------------------");


const pool = mysql.createPool(config);

/**
 * Função responsável por executar instruções SQL.
 * @param {string} instrucaoSql - A instrução SQL a ser executada.
 * @returns {Promise<any>}
 */
function executar(instrucaoSql) {
    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error("❌ Erro ao obter conexão do pool: " + err.stack);
                return reject({ message: "Erro de conexão com o Banco de Dados. Verifique as variáveis de ambiente.", error: err });
            }

            connection.query(instrucaoSql, (error, results) => {
                connection.release(); 

                if (error) {
                    console.error("❌ ERRO AO EXECUTAR A QUERY: " + error.sqlMessage);
                    return reject({ message: "Erro ao executar a query SQL.", sqlMessage: error.sqlMessage, error: error });
                }
                console.log(results)
                resolve(results);
            });
        });
    });
}

module.exports = {
    executar
};