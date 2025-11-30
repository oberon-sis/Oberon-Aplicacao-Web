/**
 * Classe TourGuide: Motor de Tour Guiado (CSS Puro)
 * Esta classe gera e anexa a estrutura do overlay ao final do <body>. ele foi feito em base a um componente encontrado no
 */
class TourGuide {
  static TOUR_ID = 'tour-explanation-box';
  static OVERLAY_ID = 'tour-overlay-backdrop';

  constructor(steps) {
    this.tourSteps = steps;
    this.currentStepIndex = -1;

    this._injectIconeHTML();

    // 1. Cria e anexa a estrutura do overlay ao final do <body>
    this._injectOverlayHTML();

    // 2. Inicializa os elementos DO NOVO HTML INJETADO
    this._initializeElements();

    // 3. Anexa os listeners de navegação
    this._attachEventListeners();
  }

  _injectIconeHTML() {
    const headerEl = document.querySelector('header');

    if (!headerEl) {
      console.warn('Elemento <header> não encontrado no DOM. O botão do Tour não será injetado.');
      return;
    }
    const iconeHTML = `
                <button id="start-tour-btn" class="btn btn-primary btn-sm ms-auto  verde_obscuro " type="button" 
                    style="justify-self: flex-end">
                    <i class="bi bi-question-circle me-1"></i> Primeiros Passos
                </button>
        `;
    headerEl.insertAdjacentHTML('beforeend', iconeHTML);
  }

  _injectOverlayHTML() {
    const overlayHTML = `
            <div id="tour-overlay-backdrop" class="tour-overlay">
                <div id="tour-explanation-box" class="tour-box tour-box-initial-hide"> 
                    <h4 id="tour-title"></h4>
                    <p id="tour-content"></p>
                    <div class="d-flex justify-content-between mt-3">
                        <button id="tour-prev-btn" class="btn btn-sm btn-outline-light" style="visibility: hidden;">Anterior</button>
                        <button id="tour-next-btn" class="btn btn-sm btn-light">Próximo</button>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', overlayHTML);
  }

  _initializeElements() {
    this.elements = {
      overlay: document.getElementById(TourGuide.OVERLAY_ID),
      box: document.getElementById(TourGuide.TOUR_ID),
      titleEl: document.getElementById('tour-title'),
      contentEl: document.getElementById('tour-content'),
      nextBtn: document.getElementById('tour-next-btn'),
      prevBtn: document.getElementById('tour-prev-btn'),
      startBtn: document.getElementById('start-tour-btn'),
    };
  }

  _attachEventListeners() {
    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener('click', () =>
        this.showStep(this.currentStepIndex + 1),
      );
    }
    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener('click', () =>
        this.showStep(this.currentStepIndex - 1),
      );
    }
    if (this.elements.startBtn) {
      this.elements.startBtn.addEventListener('click', () => this.startTour());
    }

    if (this.elements.overlay) {
      this.elements.overlay.addEventListener('click', (event) => {
        if (event.target === this.elements.overlay) {
          this.endTour();
        }
      });
    }

    window.addEventListener('resize', () => {
      if (this.elements.overlay && this.elements.overlay.classList.contains('active')) {
        setTimeout(
          () =>
            this._positionExplanationBox(
              document.getElementById(this.tourSteps[this.currentStepIndex].id),
              this.tourSteps[this.currentStepIndex].position,
            ),
          100,
        );
      }
    });
  }

  startTour() {
    if (!this.elements.overlay) return;

    this.elements.overlay.classList.add('active');
    this.elements.box.classList.add('visible');
    document.body.classList.add('tour-is-active');
    this.currentStepIndex = -1;

    this.elements.box.classList.remove('tour-box-initial-hide');

    this.showStep(0);
  }

  endTour() {
    if (!this.elements.overlay) return;

    this.elements.overlay.classList.remove('active');
    this.elements.box.classList.remove('visible');
    document.body.classList.remove('tour-is-active');

    document
      .querySelectorAll('.tour-highlighted')
      .forEach((el) => el.classList.remove('tour-highlighted'));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.tourSteps.length) {
      this.endTour();
      return;
    }

    this.currentStepIndex = stepIndex;
    const step = this.tourSteps[this.currentStepIndex];
    const targetEl = document.getElementById(step.id);

    if (!targetEl) {
      console.warn(
        `Elemento com ID '${step.id}' não encontrado para o passo ${stepIndex + 1}. Pulando.`,
      );
      this.showStep(this.currentStepIndex + 1);
      return;
    }

    document
      .querySelectorAll('.tour-highlighted')
      .forEach((el) => el.classList.remove('tour-highlighted'));
    targetEl.classList.add('tour-highlighted');

    // 2. Rola para o elemento IMEDIATAMENTE.
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 3. Atualizar Conteúdo
    this.elements.titleEl.textContent = step.title;
    this.elements.contentEl.innerHTML = step.content;

    this.elements.prevBtn.style.visibility = this.currentStepIndex > 0 ? 'visible' : 'hidden';
    this.elements.nextBtn.textContent =
      this.currentStepIndex === this.tourSteps.length - 1 ? 'Finalizar' : 'Próximo';

    // 4. Lógica de Posicionamento e Fluidez
    const MIN_FLUID_DELAY = 50;

    // Esconde a caixa antes do reposicionamento para evitar o "pisca" durante a transição
    this.elements.box.style.opacity = '0';

    setTimeout(() => {
      // 5. Reposicionamento da caixa
      this._positionExplanationBox(targetEl, step.position);

      // 6. Torna o elemento opaco após o posicionamento (a transição CSS o torna suave)
      setTimeout(() => {
        this.elements.box.style.opacity = '1';
      }, 50);
    }, MIN_FLUID_DELAY);
  }

  // --- Lógica de Posicionamento Otimizada ---
  _positionExplanationBox(targetEl, preferredPosition) {
    if (!targetEl || !this.elements.box) return;

    const rect = targetEl.getBoundingClientRect();
    const box = this.elements.box;
    let boxLeft, boxTop;
    const padding = 20;
    const offset = 15; // Distância entre a caixa e o elemento alvo

    const boxHeight = box.offsetHeight;
    const boxWidth = box.offsetWidth;

    let attempts = [preferredPosition, 'bottom', 'top'];
    let finalPosition = null;

    // Lógica de Posicionamento Vertical
    for (const pos of attempts) {
      if (pos === 'top') {
        boxTop = rect.top - boxHeight - offset;
      } else if (pos === 'bottom') {
        boxTop = rect.bottom + offset;
      } else {
        // Padrão: Topo
        boxTop = rect.top - boxHeight - offset;
      }

      // Verifica se a caixa cabe na janela visível
      if (boxTop >= padding && boxTop + boxHeight <= window.innerHeight - padding) {
        finalPosition = pos;
        break;
      }
    }

    if (!finalPosition) {
      // Fallback final: tenta posicionar mesmo que fora do viewport, mas relativo ao elemento
      boxTop =
        preferredPosition === 'bottom' ? rect.bottom + offset : rect.top - boxHeight - offset;
    }

    // Lógica de Posicionamento Horizontal (Centralizado com ajuste de borda)
    boxLeft = rect.left + rect.width / 2 - boxWidth / 2;
    boxLeft = Math.max(padding, Math.min(boxLeft, window.innerWidth - boxWidth - padding));

    // Aplica o estilo com o deslocamento da rolagem vertical (window.scrollY)
    box.style.left = `${boxLeft}px`;
    box.style.top = `${boxTop + window.scrollY}px`;
  }
}