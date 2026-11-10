"use strict";

// Módulo de Componentes reutilizáveis do AtenaSystem

// Toast/Notification System
const toastState = {
    toasts: [],
    container: null
};

function getOrCreateToastContainer() {
    let container = document.getElementById('atn-toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'atn-toast-container';
        container.className = 'atn-toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    
    return container;
}

function showToast(message, type = 'success', options = {}) {
    const container = getOrCreateToastContainer();
    
    const toastId = Date.now() + Math.random();
    const toast = document.createElement('div');
    toast.className = `atn-toast atn-toast-${type}`;
    toast.setAttribute('data-toast-id', toastId);
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const titleMap = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Atenção',
        info: 'Informação'
    };
    
    toast.innerHTML = `
        <div class="atn-toast-icon">
            <i class="${iconMap[type] || iconMap.info}"></i>
        </div>
        <div class="atn-toast-message">
            <div class="atn-toast-title">${titleMap[type] || titleMap.info}</div>
            <div class="atn-toast-text">${message}</div>
        </div>
        <button class="atn-toast-close" aria-label="Fechar">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const dismiss = () => {
        toast.remove();
        // Remover do array
        toastState.toasts = toastState.toasts.filter(t => t.id !== toastId);
    };
    
    toast.querySelector('.atn-toast-close').addEventListener('click', dismiss);
    toast.addEventListener('click', (e) => {
        if (e.target.closest('.atn-toast-close')) {
            dismiss();
        }
    });
    
    // Auto-dismiss
    const duration = options.duration || 5000;
    setTimeout(() => {
        if (toastState.toasts.find(t => t.id === toastId)) {
            dismiss();
        }
    }, duration);
    
    container.appendChild(toast);
    toastState.toasts.push({ id: toastId, element: toast, type });
    
    // Emitir evento
    document.dispatchEvent(new CustomEvent('atn:toast', { detail: { toastId, message, type } }));
    
    return toastId;
}

function dismissToast(toastId) {
    const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (toast) toast.remove();
}

function dismissAllToasts() {
    document.querySelectorAll('.atn-toast').forEach(t => t.remove());
}

// Modal System
function showModal(content, options = {}) {
    const container = document.getElementById('atn-modal-container');
    if (!container) return null;
    
    const modalId = Date.now() + Math.random();
    const modalHTML = `
        <div class="atn-modal-backdrop show" style="display:block;"></div>
        <div class="atn-modal show" style="display:block;" role="dialog" aria-modal="true" aria-labelledby="modal-title-${modalId}">
            <div class="atn-modal-dialog modal-dialog-centered" style="margin: 0 auto; width: 100%; max-width: 500px;">
                <div class="atn-modal-content" style="background: white; border-radius: var(--atn-radius-lg); box-shadow: var(--atn-shadow-xl); overflow: hidden;">
                    <div class="atn-modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: var(--atn-space-4); border-bottom: 1px solid var(--atn-gray-200);">
                        <h5 class="atn-modal-title" id="modal-title-${modalId}" style="margin: 0; font-size: var(--atn-font-size-lg); font-weight: var(--atn-font-weight-semibold); color: var(--atn-gray-900);"></h5>
                        <button type="button" class="atn-modal-close" style="background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--atn-gray-500); padding: 0;" aria-label="Fechar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="atn-modal-body" style="padding: var(--atn-space-4); max-height: 70vh; overflow-y: auto;"></div>
                    <div class="atn-modal-footer" style="padding: var(--atn-space-4); border-top: 1px solid var(--atn-gray-200); display: flex; gap: var(--atn-space-2); justify-content: flex-end;"></div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = modalHTML;
    const modalEl = document.querySelector(`[aria-modal="true"]`);
    const titleEl = document.getElementById(`modal-title-${modalId}`);
    const bodyEl = modalEl.querySelector('.atn-modal-body');
    const footerEl = modalEl.querySelector('.atn-modal-footer');
    const closeBtn = modalEl.querySelector('.atn-modal-close');
    
    titleEl.textContent = options.title || 'Modal';
    bodyEl.innerHTML = content;
    
    if (options.onClose) {
        closeBtn.addEventListener('click', () => {
            closeModal(modalEl);
            if (options.onClose) options.onClose();
        });
    }
    
    if (options.onSubmit && footerEl) {
        footerEl.innerHTML = `
            <button type="button" class="atn-btn atn-btn-secondary" onclick="closeModal(document.querySelector('[aria-modal=\"true\"]'))">Cancelar</button>
            <button type="button" class="atn-btn atn-btn-primary" onclick="submitModal()"><i class="fas fa-save"></i> Salvar</button>
        `;
    }
    
    return modalEl;
}

function closeModal(modalEl) {
    if (modalEl) {
        modalEl.style.display = 'none';
        modalEl.innerHTML = '';
    }
}

function submitModal() {
    const modalEl = document.querySelector('[aria-modal="true"]');
    if (!modalEl) return;
    
    const footerEl = modalEl.querySelector('.atn-modal-footer');
    const buttons = footerEl.querySelectorAll('.atn-btn');
    const submitBtn = Array.from(buttons).find(btn => btn.textContent.includes('Salvar'));
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
    
    // Chamar função de submit global (definida na página)
    if (typeof window.atnModalSubmit === 'function') {
        window.atnModalSubmit();
    } else {
        closeModal(modalEl);
    }
}

// Dropdown
function initDropdowns() {
    document.querySelectorAll('[data-component="dropdown"]').forEach(container => {
        const trigger = container.querySelector('.atn-dropdown-btn, button, a');
        const menu = container.querySelector('.atn-dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = menu.classList.contains('show');
                
                // Fechar outros dropdowns
                document.querySelectorAll('.atn-dropdown-menu.show').forEach(m => {
                    if (m !== menu) {
                        m.classList.remove('show');
                        m.style.display = 'none';
                        m.style.opacity = '0';
                        m.style.visibility = 'hidden';
                        m.style.transform = 'translateY(-10px)';
                        m.parentElement.querySelector('.atn-dropdown-btn').setAttribute('aria-expanded', 'false');
                    }
                });
                
                if (!isOpen) {
                    menu.classList.add('show');
                    menu.style.display = 'block';
                    menu.style.opacity = '1';
                    menu.style.visibility = 'visible';
                    menu.style.transform = 'translateY(0)';
                    trigger.setAttribute('aria-expanded', 'true');
                } else {
                    menu.classList.remove('show');
                    menu.style.display = 'none';
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateY(-10px)';
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}

// Inicializar componentes
function initComponents() {
    initDropdowns();
}

// Expor API
window.atnComponents = {
    toast: {
        show: showToast,
        dismiss: dismissToast,
        dismissAll: dismissAllToasts
    },
    modal: {
        show: showModal,
        close: closeModal,
        submit: submitModal
    },
    init: initComponents
};

// Event listener para inicializar componentes após content load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents, { once: true });
} else {
    initComponents();
}

// Evento disparado quando conteúdo é carregado
document.addEventListener('atn:content-loaded', () => {
    // Destruir instâncias antigas se necessário
    initComponents();
});

export {
    showToast,
    dismissToast,
    dismissAllToasts,
    showModal,
    closeModal,
    submitModal,
    initComponents
};