document.addEventListener('DOMContentLoaded', function () {
  function ocultarElementoSeNaoPermitido(id, isPermitido) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.style.display = isPermitido ? '' : 'none';
    }
  }

  function renderizarMenuPorPermissao(permissoesStringLimpa) {
    const permissoes = permissoesStringLimpa ? permissoesStringLimpa.split(';') : [];

    if (permissoes.length === 0) {
      console.log('Nenhuma permissão válida encontrada para o usuário. Menu restrito.');
    }

    const podeVerPaineis = permissoes.includes('ver_paineis');
    const podeVerAlertas = permissoes.includes('ver_alertas');
    const podeVerSuporte = permissoes.includes('ver_suporte');

    const podeGerirUsuarios = permissoes.includes('gerir_usuarios');
    const podeGerirMaquinas = permissoes.includes('gerir_maquinas');
    const podeVerAuditoria =
      podeGerirUsuarios || podeGerirMaquinas || permissoes.includes('ver_auditoria');

    const podeGerirEmpresa = permissoes.includes('gerir_empresa');

    ocultarElementoSeNaoPermitido('menu_paineis_container', podeVerPaineis);
    ocultarElementoSeNaoPermitido('menu_alertas', podeVerAlertas);
    ocultarElementoSeNaoPermitido('menu_suporte_desktop', podeVerSuporte);

    ocultarElementoSeNaoPermitido('menu_usuarios', podeGerirUsuarios);
    ocultarElementoSeNaoPermitido('menu_maquinas', podeGerirMaquinas);
    ocultarElementoSeNaoPermitido('nmenu_auditoria', podeVerAuditoria);
    const podeVerSecaoGestao = podeGerirUsuarios || podeGerirMaquinas || podeVerAuditoria;
    ocultarElementoSeNaoPermitido('menu_gestao', podeVerSecaoGestao);

    ocultarElementoSeNaoPermitido('menu_empresa', podeGerirEmpresa);
    ocultarElementoSeNaoPermitido('menu_admin', podeGerirEmpresa);

    ocultarElementoSeNaoPermitido('menu_paineis_container_mobile', podeVerPaineis);
    ocultarElementoSeNaoPermitido('menu_alertas_mobile', podeVerAlertas);
    ocultarElementoSeNaoPermitido('menu_suporte_mobile', podeVerSuporte);

    ocultarElementoSeNaoPermitido('menu_usuarios_mobile', podeGerirUsuarios);
    ocultarElementoSeNaoPermitido('menu_maquinas_mobile', podeGerirMaquinas);
    ocultarElementoSeNaoPermitido('nmenu_auditoria_mobile', podeVerAuditoria);
    ocultarElementoSeNaoPermitido('menu_empresa_mobile', podeGerirEmpresa);

    const gestaoMobile = document.getElementById('gestaoAreaMobile');
    if (gestaoMobile) {
      gestaoMobile.style.display = podeVerSecaoGestao ? '' : 'none';
    }

    const adminMobile = document.getElementById('adminAreaMobile');
    if (adminMobile) {
      adminMobile.style.display = podeGerirEmpresa ? '' : 'none';
    }
  }

  fetch('../component/menu/MenuEsqueleto.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o esqueleto do menu.');
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById('menu-container').innerHTML = html;

      const usuarioString = sessionStorage.getItem('usuario');
      let permissoesUsuario = null;

      if (usuarioString) {
        const usuarioObjeto = JSON.parse(usuarioString);

        document.getElementById('nome_de_usuario').innerHTML = usuarioObjeto.nome || 'Usuário';
        document.getElementById('email_de_usaurio').innerHTML =
          usuarioObjeto.email || '(Sem e-mail)';

          const tipo = usuarioObjeto.fkTipoUsuario;

          switch (tipo) {
            case 1004:
              permissoesUsuario =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;gerir_usuarios;gerir_maquinas;ver_auditoria;gerir_empresa;ver_incidentes;ver_solicitacoes';
              break;
            case 1001:
              permissoesUsuario =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;gerir_usuarios;gerir_maquinas';
              break;
            case 1002:
              permissoesUsuario =
                'editar_info;ver_paineis;ver_alertas;ver_suporte;gerir_usuarios;gerir_maquinas;gerir_empresa';
              break;
            case 1003:
              permissoesUsuario =
                'ver_paineis;ver_alertas;ver_suporte;ver_incidentes;ver_solicitacoes';
              break;
            case 1000:
              permissoesUsuario = 'editar_info;ver_paineis;ver_alertas;ver_suporte';
              break;
            default:
              console.error(`fkTipoUsuario ${tipo} não reconhecido. Atribuindo NENHUMA permissão.`);
              permissoesUsuario = '';
              break;
          }
      }

      const permissoesLimpa = (permissoesUsuario || '')
        .replace(/\s/g, '')
        .replace(/;{2,}/g, ';')
        .replace(/(^;)|(;$)/g, '');

      setTimeout(() => {
        renderizarMenuPorPermissao(permissoesLimpa);
      }, 50);
    })
    .catch((error) => {
      console.error('Falha ao carregar o menu:', error);
      const menuContainer = document.getElementById('menu-container');
      if (menuContainer) {
        menuContainer.innerHTML =
          '<p class="text-danger p-4">Não foi possível carregar o menu.</p>';
      }
    });
});
