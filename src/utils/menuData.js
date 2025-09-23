const modulos = {
    'home': { titulo: 'Home', icone: 'home_white.svg', link: '#', permissao: 'ver_paineis' },
    'paineis': { titulo: 'Paineis', icone: 'painel_white.svg', link: '#', permissao: 'ver_paineis', isDropdown: true, dropdownItens: ['Painel 1', 'Painel 2', 'Painel 3'] },
    'alertas': { titulo: 'Alertas', icone: 'alertas_white.svg', link: '#', permissao: 'ver_alertas' },
    'suporte': { titulo: 'Suporte', icone: 'suport_white.svg', link: '#', permissao: 'ver_suporte' },
    'usuarios': { titulo: 'Usuários', icone: 'users_white.svg', link: '#', permissao: 'gerir_usuarios' },
    'maquinas': { titulo: 'Máquinas', icone: 'maquinas_white.svg', link: '#', permissao: 'gerir_maquinas' },
    'empresa': { titulo: 'Empresa', icone: 'empresa_white.svg', link: '#', permissao: 'gerir_empresa' }
};

const linksPrincipais = ['home', 'paineis', 'alertas', 'suporte'];
const linksGestao = ['usuarios', 'maquinas', 'empresa'];

module.exports = {
    modulos,
    linksPrincipais,
    linksGestao
};