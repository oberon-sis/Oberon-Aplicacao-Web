
function cadastrar() {
    var nome = document.getElementById('nome_input').value;
    var email = document.getElementById('email_input').value;
    var cpf = document.getElementById('cpf_input').value; 
    var senha = document.getElementById('senha_input').value;
    var fkTipoUsuario = document.getElementById('tipo_usuario_select').value;
    var idFuncionario = 5; // administrador logado

    if (!nome || !email || !cpf || !senha || !fkTipoUsuario) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    fetch("/gerenciamentoUsuario/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nomeServer: nome,
            cpfServer: cpf,
            emailServer: email,
            fkTipoUsuarioServer: fkTipoUsuario,
            senhaServer: senha,
            idFuncionarioServer: idFuncionario
        }),
    })
    .then(res => {
        if (res.ok) alert("Cadastro realizado com sucesso!");
        else res.json().then(json => alert(`Erro: ${json}`));
    })
    .catch(err => alert("Erro de rede: " + err));
}




document.addEventListener("DOMContentLoaded", function() {
    getTipoUsuario(); 
});




function getTipoUsuario() {
    const select = document.getElementById('tipo_usuario_select');
    
    fetch("/gerenciamentoUsuario/getTipoUsuario")
        .then(res => {
            if (res.status === 204) {
                select.innerHTML = '<option value="" disabled selected>Nenhum tipo cadastrado</option>';
                throw new Error("Nenhum tipo de usuário encontrado.");
            }
            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
            return res.json();
        })
        .then(tipos => {
            select.innerHTML = '<option value="" disabled selected>Selecione o tipo de usuário</option>'; 
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipoUsuario;
                option.text = tipo.nomeTipo;       
                select.appendChild(option);
            });
        })
        .catch(erro => {
            console.error("Falha ao carregar tipos de usuário:", erro);
            select.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
        });
}


function getTipoUsuario() {
    const select = document.getElementById('tipo_usuario_select');
    
    fetch("/gerenciamentoUsuario/getTipoUsuario") 
        .then(res => {
            if (res.status === 204) {
        
                select.innerHTML = '<option value="" disabled selected>Nenhum tipo cadastrado (204)</option>';
                throw new Error("Nenhum tipo de usuário encontrado.");
            }
            if (!res.ok) {
                throw new Error(`Erro HTTP ao buscar tipos: ${res.status}`);
            }
            return res.json();
        })
        .then(tipos => {
            select.innerHTML = '<option value="" disabled selected>Selecione o tipo de usuário</option>'; 
            
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipoUsuario;      
                option.text = tipo.nomeTipo;            
                select.appendChild(option);
            });
        })
        .catch(erro => {
            console.error("Falha ao carregar tipos de usuário:", erro);
            select.innerHTML = '<option value="" disabled selected>Erro ao carregar (Verifique o servidor)</option>';
        });
}



