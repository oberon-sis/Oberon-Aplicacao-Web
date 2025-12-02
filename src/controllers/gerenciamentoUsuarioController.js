var gerenciamentoUsuarioModel = require('../models/gerenciamentoUsuarioModel');
var bcrypt = require('bcryptjs'); // Necessário para criptografar e comparar senhas

// ==========================================================
// CADASTRAR USUÁRIO (COM CRIPTOGRAFIA)
// ==========================================================
function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var cpf = req.body.cpfServer;
    var fkTipoUsuario = req.body.fkTipoUsuarioServer;
    var senha = req.body.senhaServer;
    var idFuncionario = req.body.idFuncionarioServer; 

    cpf = cpf ? cpf.replace(/\D/g, '') : cpf;

    if (!nome) return res.status(400).send('O campo Nome está vazio!');
    if (!cpf || cpf.length !== 11) return res.status(400).send('O CPF é inválido!');
    if (!fkTipoUsuario) return res.status(400).send('O campo Tipo de Usuário está vazio!');
    if (!senha) return res.status(400).send('O campo Senha está vazio!');
    if (!email) return res.status(400).send('O campo E-mail está vazio!');
    if (!idFuncionario) return res.status(400).send('O ID do funcionário logado não foi informado!');

    // CRIPTOGRAFA A SENHA ANTES DE SALVAR (NOVO)
    var senhaCriptografada = bcrypt.hashSync(senha, 10);

    gerenciamentoUsuarioModel
        .getFkEmpresa(idFuncionario)
        .then(function (resultadoBuscaEmpresa) {
            if (resultadoBuscaEmpresa.length > 0) {
                const fkEmpresaEncontrada = resultadoBuscaEmpresa[0].fkEmpresa;

                gerenciamentoUsuarioModel
                    // Passa a senhaCriptografada em vez da senha normal
                    .cadastrar(nome, cpf, email, fkEmpresaEncontrada, fkTipoUsuario, senhaCriptografada, idFuncionario)
                    .then(function (resultadoCadastro) {
                        res.status(201).json(resultadoCadastro);
                    })
                    .catch(function (erro) {
                        console.log('\nHouve um erro ao realizar o cadastro! Erro: ', erro.sqlMessage);
                        res.status(500).json(erro.sqlMessage);
                    });
            } else {
                res.status(404).send('Funcionário logado não encontrado para obter o fkEmpresa.');
            }
        })
        .catch(function (erro) {
            console.log('\nHouve um erro ao buscar a fkEmpresa! Erro: ', erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

// ==========================================================
// PEGAR DADOS POR ID
// ==========================================================
function getUsuariobyID(req, res) {
    var idFuncionario = req.params.idFuncionarioServer;

    if (!idFuncionario) {
        return res.status(400).send('ID não fornecido!');
    }

    gerenciamentoUsuarioModel
        .getUsuariobyID(idFuncionario)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.json(resultado);
            } else {
                res.status(404).send('Usuário não encontrado');
            }
        })
        .catch(function (erro) {
            console.log('\nHouve um erro ao buscar o usuário! Erro: ', erro.sqlMessage || erro.message);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

// ==========================================================
// LISTAR TIPOS DE USUÁRIO
// ==========================================================
function getTipoUsuario(req, res) {
    gerenciamentoUsuarioModel
        .getTipoUsuario()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send('Nenhum tipo encontrado!');
            }
        })
        .catch(function (erro) {
            console.error('Erro ao listar tipos:', erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

// ==========================================================
// LISTAGEM COM PAGINAÇÃO
// ==========================================================
function listarFuncionarios(req, res) {
    var pagina = parseInt(req.query.page) || 1;
    var limite = 10;
    var offset = (pagina - 1) * limite;

    gerenciamentoUsuarioModel
        .listarFuncionarios(limite, offset)
        .then((resultado) => {
            res.status(200).json(resultado);
        })
        .catch((erro) => {
            console.error('Erro ao listar funcionários:', erro.sqlMessage || erro);
            res.status(500).json({ erro: 'Erro ao listar', detalhes: erro.sqlMessage });
        });
}

// ==========================================================
// PESQUISA
// ==========================================================
function PesquisarUsuario(req, res) {
    var campo = req.query.campo;
    var valor = req.query.valor;

    if (!campo || !valor) return res.status(400).send('Informe campo e valor.');

    gerenciamentoUsuarioModel
        .PesquisarUsuario(campo, valor)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send();
            }
        })
        .catch(function (erro) {
            console.log('Erro na pesquisa:', erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || erro);
        });
}

// ==========================================================
// SALVAR EDIÇÃO (COM CRIPTOGRAFIA)
// ==========================================================
function salvarEdicao(req, res) {
    var idFuncionario = req.body.idFuncionarioServer;
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkTipoUsuario = req.body.fkTipoUsuarioServer;

    var fkFuncionarioEditor = (req.session.usuario && req.session.usuario.idFuncionario)
        ? req.session.usuario.idFuncionario
        : req.session.ID_USUARIO;

    console.log("=== DEBUG SALVAR EDIÇÃO ===");
    console.log("Editando ID:", idFuncionario);

    if (!fkFuncionarioEditor) {
        return res.status(403).json({ erro: "Acesso negado", mensagem: "Faça login novamente." });
    }

    // CRIPTOGRAFA A NOVA SENHA ANTES DE ATUALIZAR (NOVO)
    var senhaCriptografada = bcrypt.hashSync(senha, 10);

    gerenciamentoUsuarioModel
        // Passa a senhaCriptografada
        .salvarEdicao(nome, email, fkTipoUsuario, senhaCriptografada, idFuncionario, fkFuncionarioEditor)
        .then(function (resultado) {
            if (resultado.affectedRows > 0) {
                res.status(200).json({ mensagem: 'Alterações salvas com sucesso!' });
            } else {
                res.status(200).json({ mensagem: 'Dados atualizados.' });
            }
        })
        .catch(function (erro) {
            console.error('Erro na edição:', erro.message || erro.sqlMessage);
            res.status(500).json({ erro: erro.message || erro.sqlMessage });
        });
}

// ==========================================================
// EXCLUIR USUÁRIO
// ==========================================================
function ExcluirUsuario(req, res) {
    var idFuncionario = req.params.idFuncionarioServer; 
    var senhaGerente = req.body.senha;
    var idGerente = req.body.idGerente;

    if (!idFuncionario) return res.status(400).send('ID do funcionário não fornecido!');
    if (!idGerente || !senhaGerente) return res.status(400).send('ID Gerente e Senha são obrigatórios!');

    gerenciamentoUsuarioModel
        .getUsuariobyID(idGerente)
        .then(function (resultadoBusca) {
            if (resultadoBusca.length === 0) return res.status(404).send('Gerente não encontrado.');

            // Compara a senha digitada com o Hash do banco
            var senhaCorreta = bcrypt.compareSync(senhaGerente, resultadoBusca[0].senha);

            if (senhaCorreta) {
                gerenciamentoUsuarioModel
                    .ExcluirUsuario(idFuncionario, idGerente)
                    .then(function (resultadoExclusao) {
                        if (resultadoExclusao[1].affectedRows > 0) {
                            res.status(200).send('Funcionário excluído com sucesso.');
                        } else {
                            res.status(404).send('Funcionário não encontrado ou já excluído.');
                        }
                    })
                    .catch(function (erro) {
                        console.log('Erro ao excluir:', erro.sqlMessage || erro.message);
                        res.status(500).json(erro.sqlMessage || erro.message);
                    });
            } else {
                return res.status(403).send('Senha incorreta.');
            }
        })
        .catch(function (erro) {
            console.log('Erro ao buscar gerente:', erro.sqlMessage || erro.message);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}

function buscarParaEdicao(req, res) {
    const idFuncionario = req.params.idFuncionario;

    gerenciamentoUsuarioModel.getUsuariobyID(idFuncionario)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).send("Usuário não encontrado!");
            }
        })
        .catch(erro => {
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    getUsuariobyID,
    cadastrar,
    getTipoUsuario,
    salvarEdicao,
    ExcluirUsuario,
    listarFuncionarios,
    PesquisarUsuario,
    buscarParaEdicao
};