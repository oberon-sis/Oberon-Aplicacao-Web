const modulos = {
    'paineis': { 
        titulo: 'Paineis', 
        icone: 'painel_white.svg', 
        permissao: 'ver_paineis', 
        isDropdown: true, 
        dropdownItens: [ 
            { titulo: 'Visão Geral', link: 'painelGeral.html' },
            { titulo: 'Específico', link: 'painelEspecifico.html' },
            // { titulo: 'Painel 3', link: 'painel3.html' },
            // { titulo: 'Painel 4', link: 'painel4.html' },
            // { titulo: 'Painel 5', link: 'painel5.html' },
            // { titulo: 'Painel 6', link: 'painel6.html' }
        ]
    },
    'alertas': { titulo: 'Alertas', icone: 'alertas_white.svg', link: 'alertas.html', permissao: 'ver_alertas' },
    'suporte': { titulo: 'Suporte', icone: 'suport_white.svg', link: 'https://oberon-sis.atlassian.net/servicedesk/customer/portal/34/user/login?destination=portal%2F34', permissao: 'ver_suporte' },
    'usuarios': { titulo: 'Usuários', icone: 'users_white.svg', link: 'gerenciamentoUsuarios.html', permissao: 'gerir_usuarios' },
    'maquinas': { titulo: 'Máquinas', icone: 'maquinas_white.svg', link: 'gerenciamentoMaquinas.html', permissao: 'gerir_maquinas' },
    'empresa': { titulo: 'Empresa', icone: 'empresa_white.svg', link: 'empresa.html', permissao: 'gerir_empresa' }
};

const linksPrincipais = ['home', 'paineis', 'alertas', 'suporte'];
const linksGestao = ['usuarios', 'maquinas', 'empresa'];

module.exports = {
    modulos,
    linksPrincipais,
    linksGestao
};