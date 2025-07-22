// Script para o Acordo Comercial - Imperial Rodas

document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const form = document.getElementById('acordo-form');
  const inputs = form.querySelectorAll('input[required]');
  const submitBtn = document.querySelector('.submit-btn');
  const successMessage = document.getElementById('success-message');
  const dataInput = document.getElementById('data_assinatura');
  const cpfCnpjInput = document.getElementById('cpf_cnpj');
  const telefoneInput = document.getElementById('telefone');
  
  // Adicionar efeito de foco nos campos
  inputs.forEach(input => {
    // Adicionar classe ao elemento pai quando o campo estiver em foco
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    // Remover classe quando o campo perder o foco
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
      
      // Validar campo quando perder o foco
      validateField(this);
    });
  });
  
  // Função para validar campos
  function validateField(field) {
    // Remover mensagens de erro existentes
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Verificar se o campo está vazio
    if (field.required && field.value.trim() === '') {
      showError(field, 'Este campo é obrigatório');
      return false;
    }
    
    // Validações específicas por tipo de campo
    if (field.id === 'email' && field.value.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        showError(field, 'Por favor, insira um e-mail válido');
        return false;
      }
    }
    
    return true;
  }
  
  // Função para mostrar mensagem de erro
  function showError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
    field.classList.add('error');
  }
  
  // Formatar CPF/CNPJ
  if (cpfCnpjInput) {
    cpfCnpjInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length <= 11) {
        // Formato CPF: 000.000.000-00
        if (value.length > 9) {
          cpfCnpjInput.value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
          cpfCnpjInput.value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        } else if (value.length > 3) {
          cpfCnpjInput.value = value.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
        } else {
          cpfCnpjInput.value = value;
        }
      } else {
        // Formato CNPJ: 00.000.000/0000-00
        if (value.length > 12) {
          cpfCnpjInput.value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
          cpfCnpjInput.value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
          cpfCnpjInput.value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        } else if (value.length > 2) {
          cpfCnpjInput.value = value.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
        } else {
          cpfCnpjInput.value = value;
        }
      }
    });
  }
  
  // Formatar telefone
  if (telefoneInput) {
    telefoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 10) {
        // Formato celular: (00) 00000-0000
        telefoneInput.value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else {
        // Formato fixo: (00) 0000-0000
        if (value.length > 6) {
          telefoneInput.value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
          telefoneInput.value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        } else {
          telefoneInput.value = value;
        }
      }
    });
  }
  
  // Formatar data automaticamente
  if (dataInput) {
    dataInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 0) {
        if (value.length <= 2) {
          dataInput.value = value;
        } else if (value.length <= 4) {
          dataInput.value = value.slice(0, 2) + '/' + value.slice(2);
        } else {
          dataInput.value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
        }
      }
    });
  }
  
  // Função para gerar código de rastreio
  function gerarCodigoRastreio() {
    // Formato: AA + 8 dígitos aleatórios + BR
    const digitos = Math.floor(10000000 + Math.random() * 90000000);
    return `AA${digitos}BR`;
  }

  // Processar envio do formulário
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Validar todos os campos antes de enviar
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      // Rolar até o primeiro campo com erro
      const firstError = form.querySelector('.error-message');
      if (firstError) {
        firstError.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Gerar código de rastreio
    const codigoRastreio = gerarCodigoRastreio();
    
    // Coletar dados do formulário para uso na página de rastreio
    const dadosUsuario = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      documento: document.getElementById('cpf_cnpj').value.replace(/\D/g, ''),
      endereco: document.getElementById('endereco').value,
      cidade_estado: document.getElementById('cidade_estado').value,
      telefone: document.getElementById('telefone').value,
      codigoRastreio: codigoRastreio,
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
      status: 'preparacao'
    };
    
    // Salvar dados no localStorage para uso na página de rastreio
    localStorage.setItem('usuarioCadastrado', JSON.stringify(dadosUsuario));
    
    // Simular envio com um pequeno delay para melhor experiência do usuário
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSANDO...';
    submitBtn.disabled = true;
    
    setTimeout(function() {
      // Ocultar o formulário com animação
      form.style.opacity = '0';
      form.style.height = '0';
      form.style.overflow = 'hidden';
      form.style.transition = 'opacity 0.5s ease, height 0.5s ease';
      
      // Mostrar mensagem de sucesso e código de rastreio
      setTimeout(function() {
        // Atualizar o código de rastreio na mensagem de sucesso
        document.getElementById('codigo-rastreio').textContent = codigoRastreio;
        
        successMessage.style.display = 'block';
        // Rolar para o topo da mensagem de sucesso
        successMessage.scrollIntoView({behavior: 'smooth'});
      }, 500);
    }, 1500);
  });
  
  // Adicionar efeito de hover nos elementos interativos
  const interactiveElements = document.querySelectorAll('.box, .submit-btn, input, .radio-label');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
      this.classList.add('hover-effect');
    });
    
    element.addEventListener('mouseleave', function() {
      this.classList.remove('hover-effect');
    });
  });
});