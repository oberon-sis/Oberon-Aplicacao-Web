var usuarioModel = require("../models/usuarioModel");
const { modulos } = require('../utils/menuData');
function autenticar(req, res) {
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;

  if (email == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está indefinida!");
  } else {
    usuarioModel
      .autenticar(email, senha)
      .then(function (resultadoAutenticar) {
        console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
        console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`);

        if (resultadoAutenticar.length == 1) {
          console.log(resultadoAutenticar);

          aquarioModel
            .buscarAquariosPorEmpresa(resultadoAutenticar[0].empresaId)
            .then((resultadoAquarios) => {
              if (resultadoAquarios.length > 0) {
                res.json({
                  id: resultadoAutenticar[0].id,
                  email: resultadoAutenticar[0].email,
                  nome: resultadoAutenticar[0].nome,
                  senha: resultadoAutenticar[0].senha,
                  aquarios: resultadoAquarios,
                });
              } else {
                res.status(204).json({ aquarios: [] });
              }
            });
        } else if (resultadoAutenticar.length == 0) {
          res.status(403).send("Email e/ou senha inválido(s)");
        } else {
          res.status(403).send("Mais de um usuário com o mesmo login e senha!");
        }
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o login! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });
  }
}

function cadastrar(req, res) {
  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;
  var fkEmpresa = req.body.idEmpresaVincularServer;

  if (nome == undefined) {
    res.status(400).send("Seu nome está undefined!");
  } else if (email == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está undefined!");
  } else if (fkEmpresa == undefined) {
    res.status(400).send("Sua empresa a vincular está undefined!");
  } else {
    usuarioModel
      .cadastrar(nome, email, senha, fkEmpresa)
      .then(function (resultado) {
        res.json(resultado);
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o cadastro! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });
  }
}

function getMenu(req, res) {
  const idUsuario = req.params.idUsuario;
  if (idUsuario == undefined) {
    return res.status(400).send("Seu idUsuario está undefined!");
  }

  usuarioModel.getMenu(idUsuario)
    .then(function (resultado) {
      if (resultado.length === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }
      const permissoesDoBanco = resultado[0].permissoes;
      const permissoesArray = permissoesDoBanco.split(';');

      const menu = {
        alertaSuportePC: gerarLinkHTML(modulos.home) +
          (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
          (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),

        painelPC: permissoesArray.includes('ver_paineis') ? gerarDropdownHTML(modulos.paineis, false) : '',
        gestaoAreaPC: gerarSecaoGestaoHTML(permissoesArray, false),

        alertaSuporteMobile: gerarLinkHTML(modulos.home) +
          (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
          (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),

        painelMobile: permissoesArray.includes('ver_paineis') ? gerarDropdownHTML(modulos.paineis, true) : '',
        gestaoAreaMobile: gerarSecaoGestaoHTML(permissoesArray, true),
      };

      res.status(200).json(menu);

    }).catch(function (erro) {
      console.error("Houve um erro ao realizar a procura de permissões! Erro:", erro.sqlMessage || erro);
      res.status(500).json(erro.sqlMessage || "Erro interno do servidor.");
    });
}
function gerarLinkHTML(item) {
  return `<a class="nav-link rounded py-2 mb-1 d-flex align-items-center linha" href="${item.link}">
                <img src="../assets/svg/${item.icone}" alt="" class="icone_nav">
                ${item.titulo}
            </a>`;
}

function gerarDropdownHTML(item, isMobile) {
  const idDropdown = isMobile ? 'dropdownMenuLinkOffcanvas' : 'dropdownMenuLink';
  const dropdownHtml = item.dropdownItens.map(dItem => `<li><a class="dropdown-item" href="#">${dItem}</a></li>`).join('');
  return `
        <div class="dropdown">
            <a class="nav-link rounded py-2 mb-1 d-flex align-items-center dropdown-toggle linha" href="#"
                role="button" id="${idDropdown}" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="../assets/svg/${item.icone}" alt="" class="icone_nav">
                ${item.titulo}
            </a>
            <ul class="dropdown-menu dropdown-menu-dark w-100" aria-labelledby="${idDropdown}">
                ${dropdownHtml}
            </ul>
        </div>`;
}

function gerarSecaoGestaoHTML(permissoesArray) {
  let htmlGestao = '';
  const linksGestao = ['usuarios', 'maquinas', 'empresa'];

  const temPermissaoGestao = linksGestao.some(linkId => permissoesArray.includes(modulos[linkId].permissao));

  if (temPermissaoGestao) {
    linksGestao.forEach(linkId => {
      if (permissoesArray.includes(modulos[linkId].permissao)) {
        htmlGestao += gerarLinkHTML(modulos[linkId]);
      }
    });

    return `
            <div class="mt-4">
                <h6 class="text-uppercase text-secondary mb-3 small">Gestão</h6>
                <div class="nav flex-column">
                    ${htmlGestao}
                </div>
            </div>`;
  }
  return ''; 
}
module.exports = {
  autenticar,
  cadastrar,
  getMenu,
};
