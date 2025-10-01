document.addEventListener('DOMContentLoaded', function () {
    const idUsuario = 5;// mocado 
    // const idUsuario = sessionStorage.ID_USUARIO

    fetch('/component/menu/Menu.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o esqueleto do menu.');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('menu-container').innerHTML = html;

            return fetch(`/menu/getMenu/${idUsuario}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os dados do menu do backend.');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.painelPC)
            console.log(document.getElementById('painelPC'))
            document.getElementById('painelPC').innerHTML += data.painelPC;
            document.getElementById('alertaSuportePC').innerHTML += data.alertaSuportePC;
            document.getElementById('gestaoAreaPC').innerHTML += data.gestaoAreaPC;

            document.getElementById('painelMobile').innerHTML += data.painelMobile;
            document.getElementById('gestaoAreaMobile').innerHTML += data.gestaoAreaMobile;
            document.getElementById('alertaSuporteMobile').innerHTML += data.alertaSuporteMobile;
        })
        .catch(error => {
            console.error('Falha ao carregar o menu:', error);
            const menuContainer = document.getElementById('menu-container');
            if (menuContainer) {
                menuContainer.innerHTML = '<p class="text-danger p-4">Não foi possível carregar o menu.</p>';
            }
        });
});