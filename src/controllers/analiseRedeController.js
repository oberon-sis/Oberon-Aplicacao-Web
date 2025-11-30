var redeModel = require('../models/analiseRedeModel');

function getMediaLatencia(req, res) {
  var fkMaquina = req.params.fkMaquina;
   console.log(`Controller: getMediaLatencia() -> Máquina: ${fkMaquina}`);

    redeModel.getMediaLatencia(fkMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({
                    mensagem: "Nenhum dado de latência encontrado para essa máquina."
                });
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar média de latência.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function getSomaAlertas(req, res) {
  var fkMaquina = req.params.fkMaquina;

    redeModel.getSomaAlertas(fkMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({ mensagem: "Nenhum alerta encontrado." });
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar alertas:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function getPerdaPacote(req, res) {
  var fkMaquina = req.params.fkMaquina;

    redeModel.getPerdaPacote(fkMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
               res.status(200).json({ perdaPacotes: resultado[0].perdaPacotes });
            } else {
               res.status(404).json({ perdaPacotes: 0 });
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar pacotes perdidos:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function getDisponibilidade(req, res) {
  var fkMaquina = req.params.fkMaquina;

    redeModel.getDisponibilidade(fkMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
               res.status(200).json({ disponibilidadePercent: resultado[0].disponibilidadePercent });
            } else {
               res.status(404).json({ disponibilidadePercent: 0 });
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar pacotes perdidos:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function getLatenciaUltimas24h(req, res) {
    const fkMaquina = req.params.fkMaquina;

    redeModel.getLatenciaUltimas24h(fkMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(404).json([]);
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar latência:", erro.sqlMessage);
            res.status(500).json({ erro: erro.sqlMessage });
        });
}

function getJitter(req, res) {
    const fkMaquina = req.params.fkMaquina;

    redeModel.getJitter(fkMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(404).json([]);
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar jitter:", erro.sqlMessage);
            res.status(500).json({ erro: erro.sqlMessage });
        });
}

function getPacotesEnviados(req, res) {
    const fk = req.params.fkMaquina;

    redeModel.getPacotesEnviados(fk)
        .then(resultado => res.json(resultado))
        .catch(err => res.status(500).json(err.sqlMessage));
}

function getPacotesRecebidos(req, res) {
    const fk = req.params.fkMaquina;

    redeModel.getPacotesRecebidos(fk)
        .then(resultado => res.json(resultado))
        .catch(err => res.status(500).json(err.sqlMessage));
}

function autenticar(req, res) {
    const email = req.body.emailServer;
    const senha = req.body.senhaServer;

    redeModel.autenticar(email, senha)
        .then(resultado => {
            if (resultado.length === 1) {
                const usuario = resultado[0];
                res.json({
                    idUsuario: usuario.idUsuario,
                    nome: usuario.nome,
                    email: usuario.email,
                    fkEmpresa: usuario.fkEmpresa
                });
            } else {
                res.status(403).json({ mensagem: "Credenciais inválidas" });
            }
        })
        .catch(erro => {
            console.error(erro);
            res.status(500).json(erro);
        });
}




function buscarRanking(req, res) {
 const fkEmpresa = req.params.fkEmpresa;

 redeModel.buscarRanking(fkEmpresa)
  .then(resultado => {
   if (resultado.length > 0) {
    res.status(200).json(resultado);
   } else {
    res.status(200).json([]); 
   }
  })
  .catch(erro => {
   console.error("Erro ao buscar ranking:", erro);
  
   res.status(500).json({ 
                mensagem: "Erro interno no servidor ao executar a consulta.",
                detalhe: erro.sqlMessage || erro 
            });
 });
}




  


module.exports = { getMediaLatencia, getSomaAlertas, getPerdaPacote, getDisponibilidade, getLatenciaUltimas24h, 
    getPacotesEnviados, getPacotesRecebidos, getJitter, buscarRanking,autenticar };
