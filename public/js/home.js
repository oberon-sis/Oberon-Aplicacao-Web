document.addEventListener('DOMContentLoaded', () => {
    
    
    const usuarioString = sessionStorage.getItem('usuario'); 
    const elementoNome = document.getElementById('nome-exibicao');

    if (usuarioString && elementoNome) {
        try {
            
            const usuarioObj = JSON.parse(usuarioString);
            
            
            const nomeUsuario = usuarioObj.nome;

            if (nomeUsuario) {
                
                elementoNome.textContent = 'Olá, ' + nomeUsuario + '!';
            } else {
                
                elementoNome.textContent = 'Olá!';
            }
        } catch (error) {
            
            console.error("Erro ao analisar dados do usuário na sessão:", error);
            elementoNome.textContent = 'Olá!'; 
        }
    } else if (elementoNome) {
    
        elementoNome.textContent = 'Olá!'; 
    }
});