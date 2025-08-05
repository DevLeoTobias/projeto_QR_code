/*
====================================
VIDA EM MEMÓRIA - JAVASCRIPT PRINCIPAL
====================================
Autor: [Seu Nome]
Versão: 1.0
Descrição: Funcionalidades principais da aplicação
*/

// ==================== CONFIGURAÇÃO GLOBAL ====================
const VidaMemoria = {
    // Configurações
    config: {
        maxFileSize: 5 * 1024 * 1024, // 5MB para imagens
        maxAudioSize: 10 * 1024 * 1024, // 10MB para audio
        allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        allowedAudioTypes: ['audio/mpeg', 'audio/mp3']
    },
    
    // Cache para dados do memorial
    cache: {},
    
    // Estado da aplicação
    state: {
        isFormValid: false,
        isSubmitting: false,
        currentPage: window.location.pathname
    }
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Vida em Memória - Aplicação iniciada');
    
    // Detectar página atual e inicializar funcionalidades específicas
    const currentPage = VidaMemoria.state.currentPage;
    
    if (currentPage.includes('criar-memorial')) {
        initFormularioMemorial();
    } else if (currentPage.includes('memorial.html')) {
        initPaginaMemorial();
    }
    
    // Inicializar funcionalidades globais
    initGlobalFeatures();
});

// ==================== FUNCIONALIDADES GLOBAIS ====================
function initGlobalFeatures() {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Adicionar animações de entrada
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

// ==================== FORMULÁRIO DE CRIAÇÃO ====================
function initFormularioMemorial() {
    console.log('📝 Inicializando formulário de memorial');
    
    const form = document.getElementById('criarMemorialForm');
    const fotoInput = document.getElementById('fotoMemorial');
    const audioInput = document.getElementById('trilhaSonora');
    
    if (!form) return;
    
    // Preview de foto
    if (fotoInput) {
        fotoInput.addEventListener('change', handleFotoPreview);
    }
    
    // Validação de audio
    if (audioInput) {
        audioInput.addEventListener('change', handleAudioValidation);
    }
    
    // Validação em tempo real
    form.addEventListener('input', validateForm);
    
    // Submit do formulário
    form.addEventListener('submit', handleFormSubmit);
    
    // Validação inicial
    validateForm();
}

function handleFotoPreview(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('fotoPreview');
    
    // Limpar preview anterior
    previewContainer.innerHTML = '';
    
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!VidaMemoria.config.allowedImageTypes.includes(file.type)) {
        showError('Por favor, selecione uma imagem válida (JPG, PNG ou GIF)');
        event.target.value = '';
        return;
    }
    
    // Validar tamanho
    if (file.size > VidaMemoria.config.maxFileSize) {
        showError('A imagem deve ter no máximo 5MB');
        event.target.value = '';
        return;
    }
    
    // Criar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Preview da foto';
        img.className = 'img-thumbnail';
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.objectFit = 'cover';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn btn-sm btn-danger mt-2';
        removeBtn.innerHTML = '🗑️ Remover';
        removeBtn.onclick = () => {
            previewContainer.innerHTML = '';
            event.target.value = '';
            validateForm();
        };
        
        previewContainer.appendChild(img);
        previewContainer.appendChild(document.createElement('br'));
        previewContainer.appendChild(removeBtn);
    };
    
    reader.readAsDataURL(file);
    validateForm();
}

function handleAudioValidation(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tipo
    if (!VidaMemoria.config.allowedAudioTypes.includes(file.type)) {
        showError('Por favor, selecione um arquivo MP3 válido');
        event.target.value = '';
        return;
    }
    
    // Validar tamanho
    if (file.size > VidaMemoria.config.maxAudioSize) {
        showError('O arquivo de áudio deve ter no máximo 10MB');
        event.target.value = '';
        return;
    }
    
    showSuccess(`Arquivo de áudio "${file.name}" carregado com sucesso!`);
    validateForm();
}

function validateForm() {
    const form = document.getElementById('criarMemorialForm');
    if (!form) return;
    
    const requiredFields = [
        'nomePessoa',
        'dataNascimento', 
        'dataFalecimento',
        'mensagemPersonalizada'
    ];
    
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const value = field.value.trim();
            
            if (!value) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            }
        }
    });
    
    // Validação específica de datas
    const dataNasc = form.querySelector('[name="dataNascimento"]');
    const dataFalec = form.querySelector('[name="dataFalecimento"]');
    
    if (dataNasc && dataFalec && dataNasc.value && dataFalec.value) {
        if (new Date(dataNasc.value) >= new Date(dataFalec.value)) {
            dataFalec.classList.add('is-invalid');
            isValid = false;
            showError('A data de falecimento deve ser posterior à data de nascimento');
        }
    }
    
    VidaMemoria.state.isFormValid = isValid;
    
    // Habilitar/desabilitar botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = !isValid;
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!VidaMemoria.state.isFormValid || VidaMemoria.state.isSubmitting) {
        return;
    }
    
    VidaMemoria.state.isSubmitting = true;
};