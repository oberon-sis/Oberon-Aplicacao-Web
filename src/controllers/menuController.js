var menuModel = require('../models/menuModel');
const { modulos } = require('../utils/menuData');
function getMenu(req, res) {
  const idUsuario = req.params.idUsuario;
  if (idUsuario == undefined) {
    return res.status(400).send('Seu idUsuario está undefined!');
  }

  menuModel
    .getMenu(idUsuario)
    .then(function (resultado) {
      if (resultado.length === 0) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
      }
      const permissoesDoBanco = resultado[0].permissoes;
      const permissoesArray = permissoesDoBanco.split(';');

      const menu = {
        alertaSuportePC:
          (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
          (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),

        painelPC: permissoesArray.includes('ver_paineis')
          ? gerarDropdownHTML(modulos.paineis, false)
          : '',
        gestaoAreaPC: gerarSecaoGestaoHTML(permissoesArray, false),

        alertaSuporteMobile:
          (permissoesArray.includes('ver_alertas') ? gerarLinkHTML(modulos.alertas) : '') +
          (permissoesArray.includes('ver_suporte') ? gerarLinkHTML(modulos.suporte) : ''),

        painelMobile: permissoesArray.includes('ver_paineis')
          ? gerarDropdownHTML(modulos.paineis, true)
          : '',
        gestaoAreaMobile: gerarSecaoGestaoHTML(permissoesArray, true),
      };

      res.status(200).json(menu);
    })
    .catch(function (erro) {
      console.error(
        'Houve um erro ao realizar a procura de permissões! Erro:',
        erro.sqlMessage || erro,
      );
      res.status(500).json(erro.sqlMessage || 'Erro interno do servidor.');
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
  const dropdownHtml = item.dropdownItens
    .map((dItem) => `<li><a class="dropdown-item" href="${dItem.link}">${dItem.titulo}</a></li>`)
    .join('');
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

  const temPermissaoGestao = linksGestao.some((linkId) =>
    permissoesArray.includes(modulos[linkId].permissao),
  );

  if (temPermissaoGestao) {
    linksGestao.forEach((linkId) => {
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
  getMenu,
};
