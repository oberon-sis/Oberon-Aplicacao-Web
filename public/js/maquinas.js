function mudar_icone_on(id_da_img) {
    const icone = document.getElementById(id_da_img);
    if (!icone) return;
    if (!icone.dataset.srcNormal) {
        icone.dataset.srcNormal = icone.src;
    }
    const srcHover = icone.dataset.hoverSrc;
    icone.src = srcHover;
}
function mudar_icone_lv(id_da_img) {
    const icone = document.getElementById(id_da_img);
    if (!icone) return;
    const srcNormal = icone.dataset.srcNormal;
    icone.src = srcNormal;
}
function excluir_maquina() {
    Swal.fire({
        title: 'Excluir Máquina',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme abaixo</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
    `,
        icon: 'warning',
        iconColor: '#ffc107',

        showCancelButton: true,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',

        focusConfirm: false,

        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-danger btn-lg mx-2',
            cancelButton: 'btn btn-secondary btn-lg mx-2',
            popup: 'shadow-lg',
            input: 'form-control'
        },
        preConfirm: () => {
            const senha = Swal.getPopup().querySelector('#swal-input-senha').value;
            const confirmarSenha = Swal.getPopup().querySelector('#swal-input-confirmar-senha').value;

            if (!senha || !confirmarSenha) {
                Swal.showValidationMessage('Por favor, preencha ambos os campos de senha.');
                return false;
            }

            if (senha !== confirmarSenha) {
                Swal.showValidationMessage('As senhas digitadas não são iguais.');
                return false;
            }

            return { senha: senha };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Máquina Excluída!',
                text: 'A máquina foi excluída com sucesso.',
                icon: 'success',
                confirmButtonColor: '#0C8186',
                confirmButtonText: 'OK'
            });
            Swal.fire({
                title: 'Exclusão Cancelada',
                text: 'A exclusão da máquina foi cancelada.',
                icon: 'error',
                confirmButtonColor: '#0C8186',
                confirmButtonText: 'OK'
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Exclusão Cancelada',
                text: 'A exclusão da máquina foi cancelada.',
                icon: 'error',
                confirmButtonColor: '#0C8186',
                confirmButtonText: 'OK'
            });
        }
    });
}



document.addEventListener('DOMContentLoaded', function () {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const btnAvancar = document.getElementById('btnAvancar');
    const btnVoltar = document.getElementById('btnVoltar');
    const btnCadastrar = document.getElementById('btnCadastrar');

    const checkboxEmpresa = document.getElementById('alertaEmpresa');
    const checkboxOberon = document.getElementById('alertaOberon');
    const paramsContainer = document.getElementById('parametrizacaoIndividual');
    const paramInputs = paramsContainer.querySelectorAll('input');
    function toggleParametros() {
        const isDisabled = checkboxEmpresa.checked || checkboxOberon.checked;

        paramInputs.forEach(input => {
            input.disabled = isDisabled;
            input.classList.toggle('text-muted', isDisabled);
        });
        paramsContainer.classList.toggle('text-muted', isDisabled);
    }

    function handleCheckboxChange(event) {
        const clickedCheckbox = event.target;

        if (clickedCheckbox.checked) {
            if (clickedCheckbox.id === 'alertaEmpresa') {
                checkboxOberon.checked = false;
            } else if (clickedCheckbox.id === 'alertaOberon') {
                checkboxEmpresa.checked = false;
            }
        }

        toggleParametros();
    }

    function navigateSteps(direction) {
        if (direction === 'next') {
            step1.style.display = 'none';
            btnAvancar.style.display = 'none';

            step2.style.display = 'block';
            btnVoltar.style.display = 'inline-block';
            btnCadastrar.style.display = 'inline-block';
        } else if (direction === 'prev') {
            step2.style.display = 'none';
            btnVoltar.style.display = 'none';
            btnCadastrar.style.display = 'none';

            step1.style.display = 'block';
            btnAvancar.style.display = 'inline-block';
        }
    }

    checkboxEmpresa.addEventListener('change', handleCheckboxChange);
    checkboxOberon.addEventListener('change', handleCheckboxChange);
    btnAvancar.addEventListener('click', () => navigateSteps('next'));
    btnVoltar.addEventListener('click', () => navigateSteps('prev'));
    toggleParametros();
});