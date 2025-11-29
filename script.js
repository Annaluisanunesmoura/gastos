// Configuração do Supabase - SUBSTITUA COM SUAS CONFIGURAÇÕES
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-publica';

// Inicializar Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ControleGastosSupabase {
    constructor() {
        this.transacoes = [];
        this.competenciaAtual = this.obterCompetenciaAtual();
        this.user = null;
        this.init();
    }

    async init() {
        this.configurarEventosAuth();
        
        // Verifica se já está logado
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.user = session.user;
            this.mostrarApp();
            await this.carregarDadosUsuario();
        } else {
            this.mostrarLogin();
        }

        // Escuta mudanças de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Evento auth:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                this.mostrarApp();
                this.carregarDadosUsuario();
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.mostrarLogin();
            }
        });
    }

    configurarEventosAuth() {
        // Login
        document.getElementById('btnEntrar').addEventListener('click', () => {
            this.fazerLogin();
        });

        // Criar conta
        document.getElementById('btnCriarConta').addEventListener('click', () => {
            this.criarConta();
        });

        // Sair
        document.getElementById('btnSair').addEventListener('click', () => {
            this.fazerLogout();
        });

        // Enter nos campos de login
        document.getElementById('loginSenha').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fazerLogin();
            }
        });
    }

    async fazerLogin() {
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;

        if (!email || !senha) {
            this.mostrarMensagem('Preencha email e senha', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha
            });

            if (error) throw error;
            
            this.mostrarMensagem('Login realizado com sucesso!', 'success');
        } catch (error) {
            this.mostrarMensagem(this.traduzirErroSupabase(error), 'error');
        }
    }

    async criarConta() {
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;

        if (!email || !senha) {
            this.mostrarMensagem('Preencha email e senha', 'error');
            return;
        }

        if (senha.length < 6) {
            this.mostrarMensagem('A senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: senha
            });

            if (error) throw error;
            
            this.mostrarMensagem('Conta criada com sucesso! Você já pode fazer login.', 'success');
        } catch (error) {
            this.mostrarMensagem(this.traduzirErroSupabase(error), 'error');
        }
    }

    async fazerLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    traduzirErroSupabase(error) {
        const erros = {
            'invalid_credentials': 'Email ou senha incorretos',
            'email_not_confirmed': 'Confirme seu email antes de fazer login',
            'weak_password': 'A senha é muito fraca',
            'email_already_exists': 'Este email já está em uso',
            'invalid_email': 'Email inválido'
        };
        
        return erros[error.message] || error.message || 'Erro desconhecido';
    }

    mostrarMensagem(texto, tipo) {
        const message = document.getElementById('loginMessage');
        message.textContent = texto;
        message.className = `login-message ${tipo}`;
        
        setTimeout(() => {
            message.textContent = '';
            message.className = 'login-message';
        }, 5000);
    }

    mostrarLogin() {
        document.getElementById('telaLogin').style.display = 'flex';
        document.getElementById('appPrincipal').style.display = 'none';
    }

    mostrarApp() {
        document.getElementById('telaLogin').style.display = 'none';
        document.getElementById('appPrincipal').style.display = 'block';
        if (this.user) {
            document.getElementById('userEmail').textContent = this.user.email;
        }
    }

    async carregarDadosUsuario() {
        if (!this.user) return;

        try {
            document.getElementById('listaTransacoes').innerHTML = 
                '<div class="mensagem-vazia">Carregando suas transações...</div>';

            // Carregar transações do Supabase
            const { data: transacoes, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', this.user.id)
                .order('data', { ascending: false });

            if (error) throw error;

            this.transacoes = transacoes || [];

            // Inicializar a aplicação
            this.configurarEventosApp();
            this.carregarCompetencias();
            this.atualizarDashboard();
            this.carregarFiltros();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            document.getElementById('listaTransacoes').innerHTML = 
                '<div class="mensagem-vazia">Erro ao carregar transações</div>';
        }
    }

    configurarEventosApp() {
        // Botões principais
        document.getElementById('btnNovaTransacao').addEventListener('click', () => {
            this.abrirModalTransacao();
        });

        document.getElementById('btnVerDespesas').addEventListener('click', () => {
            this.abrirModalDespesas();
        });

        document.getElementById('btnLimparFiltros').addEventListener('click', () => {
            this.limparFiltros();
        });

        // Formulário
        document.getElementById('
// Configuração do Supabase - SUBSTITUA COM SUAS CONFIGURAÇÕES
const SUPABASE_URL = 'https://punthiypqvdopkqbluic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bnRoaXlwcXZkb3BrcWJsdWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzk0NTEsImV4cCI6MjA3OTk1NTQ1MX0.bwlMwNZnolfaRMeWDi6uQ08sUBH1UyhoJbhkAz7oXpA';
