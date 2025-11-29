// Configuração do Supabase - COLE SUAS CONFIGURAÇÕES AQUI
// Configuração do Supabase - SUBSTITUA COM SUAS CONFIGURAÇÕES
const SUPABASE_URL = 'https://punthiypqvdopkqbluic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bnRoaXlwcXZkb3BrcWJsdWljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzk0NTEsImV4cCI6MjA3OTk1NTQ1MX0.bwlMwNZnolfaRMeWDi6uQ08sUBH1UyhoJbhkAz7oXpA';
console.log('Iniciando Supabase com URL:', SUPABASE_URL);

// Inicializar Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class ControleGastosSupabase {
    constructor() {
        this.transacoes = [];
        this.competenciaAtual = this.obterCompetenciaAtual();
        this.user = null;
        console.log('Classe inicializada');
        this.init();
    }

    async init() {
        console.log('Iniciando app...');
        this.configurarEventosAuth();
        
        // Verificar sessão existente
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log('Sessão encontrada:', session);
            
            if (session) {
                this.user = session.user;
                this.mostrarApp();
                await this.carregarDadosUsuario();
            } else {
                this.mostrarLogin();
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            this.mostrarLogin();
        }

        // Escutar mudanças de auth
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
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
        console.log('Configurando eventos auth...');
        
        // Login
        document.getElementById('btnEntrar').addEventListener('click', () => {
            console.log('Botão entrar clicado');
            this.fazerLogin();
        });

        // Criar conta
        document.getElementById('btnCriarConta').addEventListener('click', () => {
            console.log('Botão criar conta clicado');
            this.criarConta();
        });

        // Sair
        document.getElementById('btnSair').addEventListener('click', () => {
            console.log('Botão sair clicado');
            this.fazerLogout();
        });

        console.log('Eventos auth configurados');
    }

    async fazerLogin() {
        console.log('Tentando login...');
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;

        console.log('Email:', email, 'Senha:', senha ? '***' : 'vazia');

        if (!email || !senha) {
            this.mostrarMensagem('Preencha email e senha', 'error');
            return;
        }

        try {
            this.mostrarMensagem('Fazendo login...', 'success');
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: senha
            });

            console.log('Resposta login:', { data, error });

            if (error) {
                console.error('Erro no login:', error);
                throw error;
            }
            
            this.mostrarMensagem('Login realizado!', 'success');
        } catch (error) {
            console.error('Erro completo no login:', error);
            this.mostrarMensagem(this.traduzirErroSupabase(error), 'error');
        }
    }

    async criarConta() {
        console.log('Tentando criar conta...');
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
            this.mostrarMensagem('Criando conta...', 'success');
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: senha
            });

            console.log('Resposta criar conta:', { data, error });

            if (error) throw error;
            
            if (data.user && data.session) {
                this.mostrarMensagem('Conta criada com sucesso! Fazendo login...', 'success');
            } else {
                this.mostrarMensagem('Conta criada! Verifique seu email para confirmar.', 'success');
            }
        } catch (error) {
            console.error('Erro completo ao criar conta:', error);
            this.mostrarMensagem(this.traduzirErroSupabase(error), 'error');
        }
    }

    async fazerLogout() {
        try {
            console.log('Fazendo logout...');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log('Logout realizado');
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    traduzirErroSupabase(error) {
        console.log('Traduzindo erro:', error);
        
        const erros = {
            'Invalid login credentials': 'Email ou senha incorretos',
            'Email not confirmed': 'Confirme seu email antes de fazer login',
            'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
            'User already registered': 'Este email já está em uso',
            'Invalid email': 'Email inválido'
        };
        
        return erros[error.message] || error.message || 'Erro desconhecido';
    }

    mostrarMensagem(texto, tipo) {
        console.log(`Mensagem [${tipo}]:`, texto);
        const message = document.getElementById('loginMessage');
        message.textContent = texto;
        message.className = `login-message ${tipo}`;
        
        setTimeout(() => {
            message.textContent = '';
            message.className = 'login-message';
        }, 5000);
    }

    mostrarLogin() {
        console.log('Mostrando tela de login');
        document.getElementById('telaLogin').style.display = 'flex';
        document.getElementById('appPrincipal').style.display = 'none';
    }

    mostrarApp() {
        console.log('Mostrando app principal');
        document.getElementById('telaLogin').style.display = 'none';
        document.getElementById('appPrincipal').style.display = 'block';
        if (this.user) {
            document.getElementById('userEmail').textContent = this.user.email;
        }
    }

    async carregarDadosUsuario() {
        if (!this.user) {
            console.log('Sem usuário para carregar dados');
            return;
        }

        console.log('Carregando dados do usuário:', this.user.id);

        try {
            document.getElementById('listaTransacoes').innerHTML = 
                '<div class="mensagem-vazia">Carregando suas transações...</div>';

            // Carregar transações do Supabase
            const { data: transacoes, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', this.user.id)
                .order('data', { ascending: false });

            console.log('Transações carregadas:', transacoes, 'Erro:', error);

            if (error) throw error;

            this.transacoes = transacoes || [];
            console.log('Total de transações:', this.transacoes.length);

            // Inicializar a aplicação
            this.configurarEventosApp();
            this.carregarCompetencias();
            this.atualizarDashboard();
            this.carregarFiltros();

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            document.getElementById('listaTransacoes').innerHTML = 
                '<div class="mensagem-vazia">Erro ao carregar transações: ' + error.message + '</div>';
        }
    }

    configurarEventosApp() {
        console.log('Configurando eventos do app...');
        
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
        document.getElementById('transacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTransacao();
        });

        // Filtros
        document.getElementById('filtroCategoria').addEventListener('change', () => {
            this.filtrarTransacoes();
        });

        document.getElementById('filtroTipo').addEventListener('change', () => {
            this.filtrarTransacoes();
        });

        // Competência
        document.getElementById('competenciaAtual').addEventListener('change', (e) => {
            this.competenciaAtual = e.target.value;
            this.atualizarDashboard();
            this.carregarFiltros();
        });

        // Tipo de transação
        document.getElementById('tipo').addEventListener('change', (e) => {
            this.atualizarCategorias(e.target.value);
        });

        // Modais
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        document.getElementById('btnCancelar').addEventListener('click', () => {
            this.fecharModalTransacao();
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        console.log('Eventos do app configurados');
    }

    // ... (os outros métodos permanecem iguais - carregarCompetencias, atualizarDashboard, etc.)

    obterCompetenciaAtual() {
        const hoje = new Date();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        return `${ano}-${mes}`;
    }

    carregarCompetencias() {
        const competencias = this.obterTodasCompetencias();
        const select = document.getElementById('competenciaAtual');
        
        select.innerHTML = '';
        competencias.forEach(competencia => {
            const [ano, mes] = competencia.split('-');
            const data = new Date(ano, mes - 1);
            const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            const option = document.createElement('option');
            option.value = competencia;
            option.textContent = nomeMes;
            if (competencia === this.competenciaAtual) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Atualizar texto do mês atual
        this.atualizarTextoMesAtual();
    }

    atualizarTextoMesAtual() {
        const [ano, mes] = this.competenciaAtual.split('-');
        const data = new Date(ano, mes - 1);
        const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        document.getElementById('mesAtualTexto').textContent = nomeMes;
        document.getElementById('mesDespesasTexto').textContent = nomeMes;
    }

    obterTodasCompetencias() {
        const competencias = new Set();
        competencias.add(this.competenciaAtual);
        
        this.transacoes.forEach(transacao => {
            if (transacao.data) {
                const [ano, mes] = transacao.data.split('-');
                competencias.add(`${ano}-${mes}`);
            }
        });

        return Array.from(competencias).sort().reverse();
    }

    atualizarCategorias(tipo) {
        const categoriaSelect = document.getElementById('categoria');
        
        categoriaSelect.innerHTML = '<option value="">Selecione...</option>';
        
        if (tipo === 'receita') {
            categoriaSelect.innerHTML += `
                <option value="salario">Salário</option>
                <option value="freelance">Freelance</option>
                <option value="investimentos">Investimentos</option>
                <option value="outras-receitas">Outras Receitas</option>
            `;
        } else {
            categoriaSelect.innerHTML += `
                <option value="alimentacao">Alimentação</option>
                <option value="transporte">Transporte</option>
                <option value="moradia">Moradia</option>
                <option value="lazer">Lazer</option>
                <option value="saude">Saúde</option>
                <option value="educacao">Educação</option>
                <option value="outras-despesas">Outras Despesas</option>
            `;
        }
    }

    abrirModalTransacao() {
        this.carregarDataAtual();
        this.atualizarCategorias('receita');
        document.getElementById('modalTransacao').style.display = 'block';
    }

    fecharModalTransacao() {
        document.getElementById('modalTransacao').style.display = 'none';
        document.getElementById('transacaoForm').reset();
    }

    abrirModalDespesas() {
        this.carregarDespesasDetalhadas();
        document.getElementById('modalDespesas').style.display = 'block';
    }

    carregarDataAtual() {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('data').value = hoje;
    }

    async adicionarTransacao() {
        if (!this.user) {
            alert('Você precisa estar logado!');
            return;
        }

        const descricao = document.getElementById('descricao').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const categoria = document.getElementById('categoria').value;
        const data = document.getElementById('data').value;
        const tipo = document.getElementById('tipo').value;

        // Validações
        if (!descricao || !valor || !categoria || !data || !tipo) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (valor <= 0) {
            alert('O valor deve ser maior que zero!');
            return;
        }

        const transacao = {
            user_id: this.user.id,
            descricao: descricao,
            valor: valor,
            categoria: categoria,
            data: data,
            tipo: tipo
        };

        try {
            // Salvar no Supabase
            const { data: novaTransacao, error } = await supabase
                .from('transacoes')
                .insert([transacao])
                .select()
                .single();

            if (error) throw error;

            // Adicionar localmente
            this.transacoes.unshift(novaTransacao);
            
            this.atualizarDashboard();
            this.carregarFiltros();
            this.carregarCompetencias();
            this.fecharModalTransacao();
            
            this.mostrarStatusSincronizacao('Transação salva!');
            alert('Transação adicionada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar transação:', error);
            alert('Erro ao salvar transação: ' + error.message);
        }
    }

    async excluirTransacao(id) {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            // Excluir do Supabase
            const { error } = await supabase
                .from('transacoes')
                .delete()
                .eq('id', id)
                .eq('user_id', this.user.id);

            if (error) throw error;

            // Remover localmente
            this.transacoes = this.transacoes.filter(t => t.id !== id);
            
            this.atualizarDashboard();
            this.carregarFiltros();
            this.carregarCompetencias();
            
            this.mostrarStatusSincronizacao('Transação excluída!');
            
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            alert('Erro ao excluir transação: ' + error.message);
        }
    }

    mostrarStatusSincronizacao(mensagem, isError = false) {
        const statusAnterior = document.querySelector('.sync-status');
        if (statusAnterior) statusAnterior.remove();

        const status = document.createElement('div');
        status.className = `sync-status ${isError ? 'error' : ''}`;
        status.textContent = mensagem;
        status.style.background = isError ? '#e53935' : '#4caf50';
        
        document.body.appendChild(status);

        setTimeout(() => status.remove(), 3000);
    }

    atualizarDashboard() {
        const transacoesMes = this.obterTransacoesDoMes();
        const transacoesFiltradas = this.aplicarFiltros(transacoesMes);
        
        const totalReceitas = transacoesFiltradas
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        const totalDespesas = transacoesFiltradas
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        const saldoTotal = this.calcularSaldoTotal();
        const saldoMes = totalReceitas - totalDespesas;

        document.getElementById('totalReceitas').textContent = this.formatarMoeda(totalReceitas);
        document.getElementById('totalDespesas').textContent = this.formatarMoeda(totalDespesas);
        document.getElementById('saldoTotal').textContent = this.formatarMoeda(saldoTotal);
        document.getElementById('saldoMes').textContent = this.formatarMoeda(saldoMes);
        
        const saldoElement = document.getElementById('saldoMes');
        saldoElement.className = 'valor ' + (saldoMes >= 0 ? 'positivo' : 'negativo');

        this.mostrarTransacoes(transacoesFiltradas);
    }

    calcularSaldoTotal() {
        const receitasTotal = this.transacoes
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        const despesasTotal = this.transacoes
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + parseFloat(t.valor), 0);

        return receitasTotal - despesasTotal;
    }

    obterTransacoesDoMes() {
        return this.transacoes.filter(transacao => {
            if (!transacao.data) return false;
            const [ano, mes] = transacao.data.split('-');
            const competenciaTransacao = `${ano}-${mes}`;
            return competenciaTransacao === this.competenciaAtual;
        });
    }

    mostrarTransacoes(transacoes) {
        const lista = document.getElementById('listaTransacoes');
        
        if (transacoes.length === 0) {
            lista.innerHTML = '<div class="mensagem-vazia">Nenhuma transação encontrada para este mês.</div>';
            return;
        }

        const transacoesOrdenadas = transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        lista.innerHTML = transacoesOrdenadas.map(transacao => {
            const descricao = transacao.descricao || 'Sem descrição';
            const valor = isNaN(transacao.valor) ? 0 : parseFloat(transacao.valor);
            const data = transacao.data ? this.formatarData(transacao.data) : 'Data inválida';
            const categoria = this.formatarCategoria(transacao.categoria);

            return `
                <div class="transacao-item" onclick="app.excluirTransacao(${transacao.id})">
                    <div class="transacao-info">
                        <div class="transacao-descricao">${descricao}</div>
                        <div class="transacao-detalhes">
                            ${data} • ${categoria}
                        </div>
                    </div>
                    <div class="transacao-valor ${transacao.tipo}">
                        ${transacao.tipo === 'receita' ? '+' : '-'} ${this.formatarMoeda(valor)}
                    </div>
                </div>
            `;
        }).join('');
    }

    carregarDespesasDetalhadas() {
        const transacoesMes = this.obterTransacoesDoMes();
        const despesas = transacoesMes.filter(t => t.tipo === 'despesa');
        
        const totalDespesas = despesas.reduce((sum, t) => sum + parseFloat(t.valor), 0);
        document.getElementById('totalDespesasModal').textContent = this.formatarMoeda(totalDespesas);
        
        const maiorDespesa = despesas.length > 0 ? Math.max(...despesas.map(t => parseFloat(t.valor))) : 0;
        document.getElementById('maiorDespesa').textContent = this.formatarMoeda(maiorDespesa);
        
        // Média por dia
        const diasNoMes = new Date(this.competenciaAtual.split('-')[0], this.competenciaAtual.split('-')[1], 0).getDate();
        const mediaDia = totalDespesas / diasNoMes;
        document.getElementById('mediaDia').textContent = this.formatarMoeda(mediaDia);
        
        this.mostrarDespesasPorCategoria(despesas);
        this.mostrarDespesasDetalhadas(despesas);
    }

    mostrarDespesasPorCategoria(despesas) {
        const categoriasMap = {};
        
        despesas.forEach(despesa => {
            if (!categoriasMap[despesa.categoria]) {
                categoriasMap[despesa.categoria] = 0;
            }
            categoriasMap[despesa.categoria] += parseFloat(despesa.valor);
        });

        const lista = document.getElementById('listaCategoriasDespesas');
        
        if (Object.keys(categoriasMap).length === 0) {
            lista.innerHTML = '<div class="mensagem-vazia">Nenhuma despesa encontrada</div>';
            return;
        }

        lista.innerHTML = Object.entries(categoriasMap)
            .sort(([,a], [,b]) => b - a)
            .map(([categoria, valor]) => `
                <div class="categoria-item">
                    <div class="categoria-nome">${this.formatarCategoria(categoria)}</div>
                    <div class="categoria-valor">${this.formatarMoeda(valor)}</div>
                </div>
            `).join('');
    }

    mostrarDespesasDetalhadas(despesas) {
        const lista = document.getElementById('listaDespesasDetalhadas');
        
        if (despesas.length === 0) {
            lista.innerHTML = '<div class="mensagem-vazia">Nenhuma despesa encontrada</div>';
            return;
        }

        const despesasOrdenadas = despesas.sort((a, b) => new Date(b.data) - new Date(a.data));

        lista.innerHTML = despesasOrdenadas.map(despesa => `
            <div class="despesa-item">
                <div class="transacao-info">
                    <div class="transacao-descricao">${despesa.descricao}</div>
                    <div class="transacao-detalhes">
                        ${this.formatarData(despesa.data)} • ${this.formatarCategoria(despesa.categoria)}
                    </div>
                </div>
                <div class="transacao-valor despesa">
                    - ${this.formatarMoeda(parseFloat(despesa.valor))}
                </div>
            </div>
        `).join('');
    }

    carregarFiltros() {
        this.carregarCategoriasFiltro();
    }

    carregarCategoriasFiltro() {
        const transacoesMes = this.obterTransacoesDoMes();
        const categorias = [...new Set(transacoesMes.map(t => t.categoria).filter(Boolean))].sort();
        const select = document.getElementById('filtroCategoria');
        
        select.innerHTML = '<option value="">Todas categorias</option>';
        categorias.forEach(categoria => {
            select.innerHTML += `<option value="${categoria}">${this.formatarCategoria(categoria)}</option>`;
        });
    }

    aplicarFiltros(transacoes) {
        const categoria = document.getElementById('filtroCategoria').value;
        const tipo = document.getElementById('filtroTipo').value;

        return transacoes.filter(transacao => {
            const matchCategoria = !categoria || transacao.categoria === categoria;
            const matchTipo = !tipo || transacao.tipo === tipo;
            
            return matchCategoria && matchTipo;
        });
    }

    filtrarTransacoes() {
        this.atualizarDashboard();
    }

    limparFiltros() {
        document.getElementById('filtroCategoria').value = '';
        document.getElementById('filtroTipo').value = '';
        this.filtrarTransacoes();
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }

    formatarData(data) {
        if (!data) return 'Data inválida';
        try {
            return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
        } catch (e) {
            return 'Data inválida';
        }
    }

    formatarCategoria(categoria) {
        const categorias = {
            'salario': 'Salário',
            'freelance': 'Freelance',
            'investimentos': 'Investimentos',
            'outras-receitas': 'Outras Receitas',
            'alimentacao': 'Alimentação',
            'transporte': 'Transporte',
            'moradia': 'Moradia',
            'lazer': 'Lazer',
            'saude': 'Saúde',
            'educacao': 'Educação',
            'outras-despesas': 'Outras Despesas'
        };
        return categorias[categoria] || categoria || 'Sem categoria';
    }
}

// Inicializar a aplicação
console.log('DOM carregado, inicializando app...');
document.addEventListener('DOMContentLoaded', function() {
    window.app = new ControleGastosSupabase();
});
