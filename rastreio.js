document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const loginForm = document.getElementById('login-form');
    const rastreioForm = document.getElementById('rastreio-form');
    const resultadoRastreio = document.getElementById('resultado-rastreio');
    const welcomeMessage = document.querySelector('.welcome-message');
    const contatoForm = document.getElementById('contato-form');
    const contatoSuccess = document.getElementById('contato-success');
    const loginSection = document.getElementById('login-section');
    const rastreioSection = document.getElementById('rastreio-section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Dados simulados para demonstração
    let usuariosCadastrados = [
        { email: 'cliente@exemplo.com', documento: '12345678900' },
        { email: 'teste@imperialrodas.com', documento: '98765432100' }
    ];
    
    let pedidosRastreio = [
        { 
            codigo: 'AA12345678BR', 
            status: 'preparacao',
            cliente: 'João Silva',
            endereco: 'Rua das Flores, 123 - São Paulo, SP',
            dataEstimada: '15/12/2023',
            dataPedido: '05/12/2023',
            ultimaAtualizacao: '07/12/2023 às 14:30'
        },
        { 
            codigo: 'AA87654321BR', 
            status: 'confirmado',
            cliente: 'Maria Oliveira',
            endereco: 'Av. Paulista, 1000 - São Paulo, SP',
            dataEstimada: '20/12/2023',
            dataPedido: '10/12/2023',
            ultimaAtualizacao: '10/12/2023 às 09:15'
        },
        { 
            codigo: 'AA76372890BR', 
            status: 'preparacao',
            cliente: 'Carlos Mendes',
            endereco: 'Rua Augusta, 500 - São Paulo, SP',
            dataEstimada: '18/12/2023',
            dataPedido: '08/12/2023',
            ultimaAtualizacao: '09/12/2023 às 11:45'
        },
        { 
            codigo: 'AA99887766BR', 
            status: 'entregue',
            cliente: 'Ana Costa',
            endereco: 'Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP',
            dataEstimada: '12/12/2023',
            dataPedido: '02/12/2023',
            ultimaAtualizacao: '12/12/2023 às 16:30'
        }
    ];
    
    // Verificar se há dados de usuário cadastrado no localStorage
    const usuarioCadastrado = localStorage.getItem('usuarioCadastrado');
    if (usuarioCadastrado) {
        const dadosUsuario = JSON.parse(usuarioCadastrado);
        
        // Adicionar usuário aos usuários cadastrados para permitir login
        usuariosCadastrados.push({
            email: dadosUsuario.email,
            documento: dadosUsuario.documento
        });
        
        // Adicionar pedido aos pedidos de rastreio
        const dataAtual = new Date();
        const dataEstimada = new Date();
        dataEstimada.setDate(dataEstimada.getDate() + 10); // Adiciona 10 dias
        
        pedidosRastreio.push({
            codigo: dadosUsuario.codigoRastreio,
            status: dadosUsuario.status || 'preparacao',
            cliente: dadosUsuario.nome,
            endereco: dadosUsuario.endereco + ' - ' + dadosUsuario.cidade_estado,
            dataEstimada: dataEstimada.toLocaleDateString('pt-BR'),
            dataPedido: dadosUsuario.dataCadastro,
            ultimaAtualizacao: dataAtual.toLocaleDateString('pt-BR') + ' às ' + 
                              dataAtual.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
        });
    }
    
    // Verificar se já está logado (simulação)
    function verificarLogin() {
        const usuarioLogado = sessionStorage.getItem('usuarioLogado');
        if (usuarioLogado) {
            // Mostrar mensagem de boas-vindas e esconder formulário de login
            loginSection.style.display = 'none';
            welcomeMessage.style.display = 'block';
            welcomeMessage.querySelector('span').textContent = JSON.parse(usuarioLogado).email;
        } else {
            // Mostrar formulário de login e esconder mensagem de boas-vindas
            loginSection.style.display = 'block';
            welcomeMessage.style.display = 'none';
        }
    }
    
    // Inicializar a página
    verificarLogin();
    
    // Aplicar máscaras aos campos
    if (document.getElementById('cpf_cnpj')) {
        IMask(document.getElementById('cpf_cnpj'), {
            mask: [{
                mask: '000.000.000-00',
                maxLength: 11
            }, {
                mask: '00.000.000/0000-00',
                maxLength: 14
            }],
            dispatch: function (appended, dynamicMasked) {
                const value = dynamicMasked.value + appended;
                return dynamicMasked.compiledMasks.find(function (m) {
                    const regexp = new RegExp(`^[0-9]{0,${m.maxLength}}$`);
                    return value.replace(/[^0-9]/g, '').match(regexp);
                });
            }
        });
    }
    
    // Máscara para o código de rastreio
    if (document.getElementById('codigo_rastreio')) {
        IMask(document.getElementById('codigo_rastreio'), {
            mask: 'AA00000000BR',
            definitions: {
                'A': /[A-Z]/
            }
        });
    }
    
    // Efeito de foco nos campos
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Verificar se o campo já tem valor ao carregar a página
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Função para validar campos
    function validateField(field) {
        // Verificar se o campo é obrigatório e está vazio
        if (field.required && field.value.trim() === '') {
            showError(field, 'Este campo é obrigatório');
            return false;
        }
        
        // Validar email
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                showError(field, 'Por favor, insira um email válido');
                return false;
            }
        }
        
        // Se passou por todas as validações
        field.parentElement.classList.remove('error');
        return true;
    }
    
    // Função para mostrar erro
    function showError(field, message) {
        const formGroup = field.parentElement;
        formGroup.classList.add('error');
        
        // Verificar se já existe uma mensagem de erro
        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('span');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }
        
        errorMessage.textContent = message;
    }
    
    // Evento de submit do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email');
            const cpfCnpj = document.getElementById('cpf_cnpj');
            
            // Validar campos
            const isEmailValid = validateField(email);
            const isCpfCnpjValid = validateField(cpfCnpj);
            
            if (!isEmailValid || !isCpfCnpjValid) {
                return;
            }
            
            // Simular verificação de login
            const documento = cpfCnpj.value.replace(/[^0-9]/g, '');
            const usuarioEncontrado = usuariosCadastrados.find(u => 
                u.email === email.value && u.documento === documento);
            
            if (usuarioEncontrado) {
                // Salvar usuário logado na sessão
                sessionStorage.setItem('usuarioLogado', JSON.stringify({
                    email: email.value,
                    documento: documento
                }));
                
                // Atualizar interface
                verificarLogin();
                
                // Limpar campos
                loginForm.reset();
            } else {
                // Mostrar erro de login inválido
                alert('Email ou CPF/CNPJ inválidos. Por favor, verifique seus dados.');
            }
        });
    }
    
    // Evento de submit do formulário de rastreio
    if (rastreioForm) {
        rastreioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const codigoRastreio = document.getElementById('codigo_rastreio');
            
            // Validar campo
            const isCodigoValid = validateField(codigoRastreio);
            
            if (!isCodigoValid) {
                return;
            }
            
            // Verificar formato do código (AA********BR)
            const codigoRegex = /^AA[0-9]{8}BR$/;
            if (!codigoRegex.test(codigoRastreio.value)) {
                showError(codigoRastreio, 'Formato inválido. Use o formato AA12345678BR');
                return;
            }
            
            // Simular busca de pedido
            const pedido = pedidosRastreio.find(p => p.codigo === codigoRastreio.value);
            
            if (pedido) {
                // Mostrar resultado do rastreio
                resultadoRastreio.style.display = 'block';
                
                // Preencher informações do pedido
                document.querySelector('.codigo-display').textContent = pedido.codigo;
                document.querySelector('.cliente-nome').textContent = pedido.cliente;
                document.querySelector('.endereco-entrega').textContent = pedido.endereco;
                document.querySelector('.data-estimada').textContent = pedido.dataEstimada;
                document.querySelector('.data-pedido').textContent = pedido.dataPedido;
                document.querySelector('.ultima-atualizacao').textContent = pedido.ultimaAtualizacao;
                
                // Atualizar timeline baseado no status
                atualizarTimeline(pedido.status);
                
                // Scroll suave para o resultado
                resultadoRastreio.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Mostrar erro de código não encontrado
                showError(codigoRastreio, 'Código de rastreio não encontrado');
            }
        });
    }
    
    // Função para atualizar a timeline baseado no status
    function atualizarTimeline(status) {
        // Reset de todos os itens
        timelineItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Ativar itens baseado no status atual
        const statusIndex = {
            'confirmado': 0,
            'preparacao': 1,
            'transito': 2,
            'entregue': 3
        };
        
        // Ativar todos os itens até o status atual
        for (let i = 0; i <= statusIndex[status]; i++) {
            if (timelineItems[i]) {
                timelineItems[i].classList.add('active');
            }
        }
        
        // Mostrar QR code se o pedido foi entregue
        const qrCodeSection = document.getElementById('qr-code-section');
        if (status === 'entregue' && qrCodeSection) {
            mostrarQRCode();
            qrCodeSection.style.display = 'block';
        } else if (qrCodeSection) {
            qrCodeSection.style.display = 'none';
        }
    }
    
    // Função para gerar e mostrar QR code
    function mostrarQRCode() {
        const codigoRastreio = document.querySelector('.codigo-display').textContent.replace('Código: ', '');
        const clienteNome = document.querySelector('.cliente-nome').textContent;
        const dataEntrega = new Date().toLocaleDateString('pt-BR');
        
        // Dados para o QR code
        const dadosQR = {
            codigo: codigoRastreio,
            cliente: clienteNome,
            empresa: 'Imperial Rodas',
            dataEntrega: dataEntrega,
            status: 'ENTREGUE',
            confirmacao: 'ENTREGA_CONFIRMADA'
        };
        
        const textoQR = JSON.stringify(dadosQR);
        
        // Gerar QR code
        const qrCodeElement = document.getElementById('qr-code');
        const qrCodeText = document.getElementById('qr-code-text');
        
        if (qrCodeElement && typeof QRCode !== 'undefined') {
            // Limpar QR code anterior
            qrCodeElement.innerHTML = '';
            
            // Gerar novo QR code
            QRCode.toCanvas(qrCodeElement, textoQR, {
                width: 200,
                height: 200,
                margin: 2,
                color: {
                    dark: '#8B4513',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) {
                    console.error('Erro ao gerar QR code:', error);
                    qrCodeElement.innerHTML = '<p style="color: #8B4513; padding: 20px;">Erro ao gerar QR code</p>';
                }
            });
            
            // Mostrar código de confirmação
            if (qrCodeText) {
                qrCodeText.textContent = codigoRastreio + '-CONF';
            }
        }
    }
    
    // Evento de submit do formulário de contato
    if (contatoForm) {
        contatoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const assunto = document.getElementById('assunto');
            const mensagem = document.getElementById('mensagem');
            
            // Validar campos
            const isAssuntoValid = validateField(assunto);
            const isMensagemValid = validateField(mensagem);
            
            if (!isAssuntoValid || !isMensagemValid) {
                return;
            }
            
            // Simular envio da mensagem
            const submitBtn = contatoForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            // Simular delay de envio
            setTimeout(function() {
                // Esconder formulário e mostrar mensagem de sucesso
                contatoForm.style.display = 'none';
                contatoSuccess.style.display = 'block';
                
                // Resetar botão
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Limpar campos
                contatoForm.reset();
            }, 1500);
        });
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Remover usuário da sessão
            sessionStorage.removeItem('usuarioLogado');
            
            // Atualizar interface
            verificarLogin();
            
            // Esconder resultado do rastreio
            if (resultadoRastreio) {
                resultadoRastreio.style.display = 'none';
            }
            
            // Limpar campo de rastreio
            if (rastreioForm) {
                rastreioForm.reset();
            }
        });
    }
    
    // Botão para voltar ao topo
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Botão para nova consulta
    const newSearchBtn = document.getElementById('new-search');
    if (newSearchBtn) {
        newSearchBtn.addEventListener('click', function() {
            // Esconder resultado e limpar formulário
            resultadoRastreio.style.display = 'none';
            rastreioForm.reset();
            
            // Focar no campo de rastreio
            document.getElementById('codigo_rastreio').focus();
        });
    }
});