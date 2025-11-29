// Sistema de Notificações Bonitas
class Notificacao {
    static mostrar(mensagem, tipo = 'sucesso') {
        this.remover();
        
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao ${tipo}`;
        notificacao.id = 'notificacao';
        
        const icone = tipo === 'sucesso' ? '✅' : '❌';
        const titulo = tipo === 'sucesso' ? 'Sucesso!' : 'Erro!';
        
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <div class="notificacao-icon">${icone}</div>
                <div class="notificacao-texto">
                    <h4>${titulo}</h4>
                    <p>${mensagem}</p>
                </div>
                <button class="notificacao-fechar" onclick="Notificacao.remover()">×</button>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.classList.add('mostrar');
        }, 100);
        
        setTimeout(() => {
            this.remover();
        }, 5000);
    }
    
    static remover() {
        const notificacao = document.getElementById('notificacao');
        if (notificacao) {
            notificacao.classList.remove('mostrar');
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 400);
        }
    }
}

class ControleGastos {
    constructor() {
        this.transacoes = this.carregarTransacoes();
        this.competenciaAtual = this.obterCompetenciaAtual();
        this.anoAtual = new Date().getFullYear();
        this.init();
    }

    init() {
        this.carregarCompetencias();
        this.configurarEventos();
        this.atualizarDashboard();
        this.carregarFiltros();
    }

    configurarEventos() {
        document.getElementById('transacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTransacao();
        });

        document.getElementById('competenciaAtual').addEventListener('change', (e) => {
            this.competenciaAtual = e.target.value;
            this.atualizarDashboard();
            this.carregarFiltros();
        });

        document.getElementById('filtroCategoria').addEventListener('change', () => this.filtrarTransacoes());
        document.getElementById('filtroTipo').addEventListener('change', () => this.filtrarTransacoes());

        document.getElementById('tipo').addEventListener('change', (e) => {
            this.atualizarCategorias(e.target.value);
        });

        document.getElementById('anoSelecionado').addEventListener('change', (e) => {
            this.carregarVisaoAnual(e.target.value);
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modals = ['modalTransacao', 'modalDespesas', 'modalVisaoAnual'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    this[`fecharModal${modalId.replace('modal', '')}`]();
                }
            });
        });
    }

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

        this.atualizarTextoMesAtual();
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

        // Ordenar do mais recente para o mais antigo
        return Array.from(competencias).sort().reverse();
    }

    obterTodosAnos() {
        const anos = new Set();
        anos.add(this.anoAtual);
        
        this.transacoes.forEach(transacao => {
            if (transacao.data) {
                const ano = transacao.data.split('-')[0];
                anos.add(parseInt(ano));
            }
        });

        return Array.from(anos).sort((a, b) => b - a);
    }

    atualizarTextoMesAtual() {
        const [ano, mes] = this.competenciaAtual.split('-');
        const data = new Date(ano, mes - 1);
        const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        document.getElementById('mesAtualTexto').textContent = nomeMes;
        document.getElementById('mesDespesasTexto').textContent = nomeMes;
    }

    atualizarCategorias(tipo) {
        const categoriaSelect = document.getElementById('categoria');
        const valorAtual = categoriaSelect.value;
        
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
        
        if (valorAtual) {
            categoriaSelect.value = valorAtual;
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

    fecharModalDespesas() {
        document.getElementById('modalDespesas').style.display = 'none';
    }

    abrirModalVisaoAnual() {
        this.carregarModalVisaoAnual();
        document.getElementById('modalVisaoAnual').style.display = 'block';
    }

    fecharModalVisaoAnual() {
        document.getElementById('modalVisaoAnual').style.display = 'none';
    }

    carregarModalVisaoAnual() {
        const anos = this.obterTodosAnos();
        const selectAno = document.getElementById('anoSelecionado');
        
        selectAno.innerHTML = '';
        anos.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = ano;
            if (ano === this.anoAtual) {
                option.selected = true;
            }
            selectAno.appendChild(option);
        });

        document.getElementById('anoVisaoTexto').textContent = this.anoAtual;
        this.carregarVisaoAnual(this.anoAtual);
    }

    carregarVisaoAnual(ano) {
        this.carregarResumoAnual(ano);
        this.carregarTabelaMensal(ano);
        this.carregarGraficoCategorias(ano);
    }

    carregarResumoAnual(ano) {
        const transacoesAno = this.transacoes.filter(t => t.data && t.data.startsWith(ano.toString()));
        
        const receitaAnual = transacoesAno
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);

        const despesaAnual = transacoesAno
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);

        const saldoAnual = receitaAnual - despesaAnual;

        document.getElementById('receitaAnual').textContent = this.formatarMoeda(receitaAnual);
        document.getElementById('despesaAnual').textContent = this.formatarMoeda(despesaAnual);
        document.getElementById('saldoAnualModal').textContent = this.formatarMoeda(saldoAnual);
        document.getElementById('saldoAnualModal').className = 'valor ' + (saldoAnual >= 0 ? 'positivo' : 'negativo');
    }

    carregarTabelaMensal(ano) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const tbody = document.querySelector('#tabelaMensal tbody');
        tbody.innerHTML = '';

        meses.forEach((nomeMes, index) => {
            const mesNum = String(index + 1).padStart(2, '0');
            const competencia = `${ano}-${mesNum}`;
            
            const transacoesMes = this.transacoes.filter(t => 
                t.data && t.data.startsWith(competencia)
            );

            const receitas = transacoesMes
                .filter(t => t.tipo === 'receita')
                .reduce((sum, t) => sum + t.valor, 0);

            const despesas = transacoesMes
                .filter(t => t.tipo === 'despesa')
                .reduce((sum, t) => sum + t.valor, 0);

            const saldo = receitas - despesas;
            const status = saldo >= 0 ? 'positivo' : 'negativo';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${nomeMes}</strong></td>
                <td>${this.formatarMoeda(receitas)}</td>
                <td>${this.formatarMoeda(despesas)}</td>
                <td class="saldo-${status}">${this.formatarMoeda(saldo)}</td>
                <td><span class="status-${status}">${saldo >= 0 ? '✅ Positivo' : '❌ Negativo'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    carregarGraficoCategorias(ano) {
        const transacoesAno = this.transacoes.filter(t => 
            t.data && t.data.startsWith(ano.toString()) && t.tipo === 'despesa'
        );

        const categoriasMap = {};
        
        transacoesAno.forEach(despesa => {
            if (!categoriasMap[despesa.categoria]) {
                categoriasMap[despesa.categoria] = 0;
            }
            categoriasMap[despesa.categoria] += despesa.valor;
        });

        const container = document.getElementById('graficoCategoriasAnual');
        
        if (Object.keys(categoriasMap).length === 0) {
            container.innerHTML = '<div class="mensagem-vazia">Nenhuma despesa encontrada para este ano</div>';
            return;
        }

        // Ordenar por valor (maior primeiro)
        const categoriasOrdenadas = Object.entries(categoriasMap)
            .sort(([,a], [,b]) => b - a);

        const maiorValor = Math.max(...categoriasOrdenadas.map(([,valor]) => valor));

        container.innerHTML = categoriasOrdenadas.map(([categoria, valor]) => {
            const porcentagem = (valor / maiorValor) * 100;
            return `
                <div class="categoria-grafico-item">
                    <div class="categoria-grafico-nome">${this.formatarCategoria(categoria)}</div>
                    <div class="categoria-grafico-bar">
                        <div class="categoria-grafico-fill" style="width: ${porcentagem}%"></div>
                    </div>
                    <div class="categoria-grafico-valor">${this.formatarMoeda(valor)}</div>
                </div>
            `;
        }).join('');
    }

    carregarDataAtual() {
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('data').value = hoje;
    }

    adicionarTransacao() {
        const descricao = document.getElementById('descricao').value;
        const valor = parseFloat(document.getElementById('valor').value);
        const categoria = document.getElementById('categoria').value;
        const data = document.getElementById('data').value;
        const tipo = document.getElementById('tipo').value;

        // Validações
        if (!descricao || !valor || !categoria || !data || !tipo) {
            Notificacao.mostrar('Por favor, preencha todos os campos!', 'erro');
            return;
        }

        if (valor <= 0) {
            Notificacao.mostrar('O valor deve ser maior que zero!', 'erro');
            return;
        }

        const transacao = {
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            categoria: categoria,
            data: data,
            tipo: tipo
        };

        this.transacoes.push(transacao);
        this.salvarTransacoes();
        this.atualizarDashboard();
        this.carregarFiltros();
        this.carregarCompetencias();
        this.fecharModalTransacao();
        
        Notificacao.mostrar('Transação adicionada com sucesso!', 'sucesso');
    }

    excluirTransacao(id) {
        this.transacoes = this.transacoes.filter(t => t.id !== id);
        this.salvarTransacoes();
        this.atualizarDashboard();
        this.carregarFiltros();
        this.carregarCompetencias();
        Notificacao.mostrar('Transação excluída com sucesso!', 'sucesso');
    }

    atualizarDashboard() {
        const transacoesMes = this.obterTransacoesDoMes();
        const transacoesFiltradas = this.aplicarFiltros(transacoesMes);
        
        const totalReceitas = transacoesFiltradas
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);

        const totalDespesas = transacoesFiltradas
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);

        const saldoTotal = this.calcularSaldoTotal();
        const saldoMes = totalReceitas - totalDespesas;

        document.getElementById('totalReceitas').textContent = this.formatarMoeda(totalReceitas);
        document.getElementById('totalDespesas').textContent = this.formatarMoeda(totalDespesas);
        document.getElementById('saldoTotal').textContent = this.formatarMoeda(saldoTotal);
        document.getElementById('saldoMes').textContent = this.formatarMoeda(saldoMes);
        
        // Atualizar cor do saldo
        const saldoElement = document.getElementById('saldoMes');
        saldoElement.className = 'valor ' + (saldoMes >= 0 ? 'positivo' : 'negativo');

        this.mostrarTransacoes(transacoesFiltradas);
    }

    calcularSaldoTotal() {
        const receitasTotal = this.transacoes
            .filter(t => t.tipo === 'receita')
            .reduce((sum, t) => sum + t.valor, 0);

        const despesasTotal = this.transacoes
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + t.valor, 0);

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
            lista.innerHTML = '<div class="mensagem-vazia">Nenhuma transação encontrada para este mês. Clique em "Nova Transação" para começar!</div>';
            return;
        }

        // Ordenar por data (mais recente primeiro)
        const transacoesOrdenadas = transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

        lista.innerHTML = transacoesOrdenadas.map(transacao => {
            const descricao = transacao.descricao || 'Sem descrição';
            const valor = isNaN(transacao.valor) ? 0 : transacao.valor;
            const data = transacao.data ? this.formatarData(transacao.data) : 'Data inválida';
            const categoria = this.formatarCategoria(transacao.categoria);
            const icone = transacao.tipo === 'receita' ? '📈' : '📉';

            return `
                <div class="transacao-item" onclick="controleGastos.excluirTransacao(${transacao.id})">
                    <div class="transacao-info">
                        <div class="transacao-descricao">${icone} ${descricao}</div>
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
        
        // Total de despesas
        const totalDespesas = despesas.reduce((sum, t) => sum + t.valor, 0);
        document.getElementById('totalDespesasModal').textContent = this.formatarMoeda(totalDespesas);
        
        // Maior despesa
        const maiorDespesa = despesas.length > 0 ? Math.max(...despesas.map(t => t.valor)) : 0;
        document.getElementById('maiorDespesa').textContent = this.formatarMoeda(maiorDespesa);
        
        // Média por dia
        const diasNoMes = new Date(this.competenciaAtual.split('-')[0], this.competenciaAtual.split('-')[1], 0).getDate();
        const mediaDia = totalDespesas / diasNoMes;
        document.getElementById('mediaDia').textContent = this.formatarMoeda(mediaDia);
        
        // Despesas por categoria
        this.mostrarDespesasPorCategoria(despesas);
        
        // Lista de despesas detalhadas
        this.mostrarDespesasDetalhadas(despesas);
    }

    mostrarDespesasPorCategoria(despesas) {
        const categoriasMap = {};
        
        despesas.forEach(despesa => {
            if (!categoriasMap[despesa.categoria]) {
                categoriasMap[despesa.categoria] = 0;
            }
            categoriasMap[despesa.categoria] += despesa.valor;
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
                    <div class="categoria-info">
                        <span class="categoria-nome">${this.formatarCategoria(categoria)}</span>
                    </div>
                    <span class="categoria-valor">${this.formatarMoeda(valor)}</span>
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
                    - ${this.formatarMoeda(despesa.valor)}
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

    salvarTransacoes() {
        localStorage.setItem('controleGastos', JSON.stringify(this.transacoes));
    }

    carregarTransacoes() {
        try {
            const dados = localStorage.getItem('controleGastos');
            const transacoes = dados ? JSON.parse(dados) : [];
            
            // Validar e limpar transações corrompidas
            return transacoes.filter(transacao => 
                transacao && 
                transacao.descricao && 
                !isNaN(transacao.valor) && 
                transacao.data
            );
        } catch (e) {
            console.error('Erro ao carregar transações:', e);
            return [];
        }
    }
}

// Funções globais para os botões do HTML
function abrirModalTransacao() {
    controleGastos.abrirModalTransacao();
}

function fecharModalTransacao() {
    controleGastos.fecharModalTransacao();
}

function abrirModalDespesas() {
    controleGastos.abrirModalDespesas();
}

function fecharModalDespesas() {
    controleGastos.fecharModalDespesas();
}

function abrirModalVisaoAnual() {
    controleGastos.abrirModalVisaoAnual();
}

function fecharModalVisaoAnual() {
    controleGastos.fecharModalVisaoAnual();
}

function limparFiltros() {
    controleGastos.limparFiltros();
}

// Inicializar a aplicação
const controleGastos = new ControleGastos();
