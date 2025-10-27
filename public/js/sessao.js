function validarSessao() {
  var usuario = sessionStorage.ID_USUARIO;
  if (usuario == null) {
    window.location = '../login.html';
  }
}

function limparSessao() {
  sessionStorage.clear();
  window.location = '../login.html';
}
