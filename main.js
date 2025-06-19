document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const expenseForm = document.getElementById('expense-form');
    const categoryInput = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const dateInput = document.getElementById('date');
    const expensesContainer = document.getElementById('expenses-container');
    const monthTotalElement = document.getElementById('month-total');
    const topCategoryElement = document.getElementById('top-category');
    const filterMonthSelect = document.getElementById('filter-month');
    const filterCategorySelect = document.getElementById('filter-category');
    const categoriesDatalist = document.getElementById('categories');
    
    // Inicializa o armazenamento local se não existir
    if (!localStorage.getItem('expenses')) {
        localStorage.setItem('expenses', JSON.stringify([]));
    }
    
    // Carrega despesas do armazenamento local
    let expenses = JSON.parse(localStorage.getItem('expenses'));
    
    // Inicializa a aplicação
    initApp();
    
    // Função para inicializar a aplicação
    function initApp() {
        // Configura a data padrão para hoje
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        // Carrega os meses disponíveis para filtro
        loadMonthFilter();
        
        // Carrega as categorias disponíveis
        loadCategories();
        
        // Exibe as despesas
        displayExpenses();
        
        // Atualiza o resumo
        updateSummary();
    }
    
    // Evento para adicionar nova despesa
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const category = categoryInput.value.trim();
        const description = descriptionInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const date = dateInput.value;
        
        if (!category || isNaN(amount) || amount <= 0 || !date) {
            alert('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }
        
        // Cria nova despesa
        const newExpense = {
            id: Date.now(),
            category,
            description,
            amount,
            date
        };
        
        // Adiciona à lista de despesas
        expenses.push(newExpense);
        
        // Atualiza o armazenamento local
        saveExpenses();
        
        // Limpa o formulário
        expenseForm.reset();
        dateInput.value = today;
        
        // Atualiza a exibição
        displayExpenses();
        updateSummary();
        loadCategories();
    });
    
    // Função para salvar despesas no armazenamento local
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    
    // Função para exibir despesas
    function displayExpenses() {
        // Obtém os filtros atuais
        const monthFilter = filterMonthSelect.value;
        const categoryFilter = filterCategorySelect.value;
        
        // Filtra as despesas
        let filteredExpenses = [...expenses];
        
        if (monthFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}` === monthFilter;
            });
        }
        
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        }
        
        // Ordena por data (mais recente primeiro)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Limpa o container
        expensesContainer.innerHTML = '';
        
        if (filteredExpenses.length === 0) {
            expensesContainer.innerHTML = '<p class="empty-message">Nenhuma despesa encontrada com os filtros atuais.</p>';
            return;
        }
        
        // Adiciona cada despesa ao container
        filteredExpenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString('pt-BR');
            
            expenseElement.innerHTML = `
                <div>${formattedDate}</div>
                <div>${expense.category}</div>
                <div>${expense.description || '-'}</div>
                <div>R$ ${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="action-btn delete-btn" data-id="${expense.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            expensesContainer.appendChild(expenseElement);
        });
        
        // Adiciona event listeners para os botões de exclusão
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExpense(id);
            });
        });
    }
    
    // Função para excluir uma despesa
    function deleteExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveExpenses();
            displayExpenses();
            updateSummary();
            loadCategories();
        }
    }
    
    // Função para atualizar o resumo
    function updateSummary() {
        // Obtém o mês atual para o filtro
        const currentMonth = filterMonthSelect.value !== 'all' ? 
            filterMonthSelect.value : 
            new Date().toISOString().slice(0, 7);
        
        // Filtra despesas do mês
        const monthlyExpenses = expenses.filter(expense => {
            return expense.date.startsWith(currentMonth);
        });
        
        // Calcula o total do mês
        const monthTotal = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
        monthTotalElement.textContent = `R$ ${monthTotal.toFixed(2)}`;
        
        // Encontra a categoria mais gasta
        const categoryTotals = {};
        monthlyExpenses.forEach(expense => {
            if (categoryTotals[expense.category]) {
                categoryTotals[expense.category] += expense.amount;
            } else {
                categoryTotals[expense.category] = expense.amount;
            }
        });
        
        let topCategory = '-';
        let maxAmount = 0;
        
        for (const category in categoryTotals) {
            if (categoryTotals[category] > maxAmount) {
                maxAmount = categoryTotals[category];
                topCategory = category;
            }
        }
        
        topCategoryElement.textContent = topCategory;
    }
    
    // Função para carregar os meses disponíveis para filtro
    function loadMonthFilter() {
        // Obtém todos os meses únicos com despesas
        const months = new Set();
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(month);
        });
        
        // Ordena os meses (do mais recente para o mais antigo)
        const sortedMonths = Array.from(months).sort().reverse();
        
        // Limpa e preenche o select
        filterMonthSelect.innerHTML = '';
        
        // Adiciona a opção "Todos"
        filterMonthSelect.innerHTML = '<option value="all">Todos os meses</option>';
        
        // Adiciona cada mês como opção
        sortedMonths.forEach(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            const monthName = monthNames[parseInt(monthNum) - 1];
            
            const option = document.createElement('option');
            option.value = month;
            option.textContent = `${monthName}/${year}`;
            filterMonthSelect.appendChild(option);
        });
    }
    
    // Função para carregar as categorias disponíveis
    function loadCategories() {
        // Obtém todas as categorias únicas
        const categories = new Set();
        expenses.forEach(expense => {
            categories.add(expense.category);
        });
        
        // Limpa e preenche o datalist e o select de filtro
        categoriesDatalist.innerHTML = '';
        filterCategorySelect.innerHTML = '<option value="all">Todas as Categorias</option>';
        
        // Ordena as categorias alfabeticamente
        const sortedCategories = Array.from(categories).sort();
        
        sortedCategories.forEach(category => {
            // Adiciona ao datalist
            const optionDatalist = document.createElement('option');
            optionDatalist.value = category;
            categoriesDatalist.appendChild(optionDatalist);
            
            // Adiciona ao select de filtro
            const optionSelect = document.createElement('option');
            optionSelect.value = category;
            optionSelect.textContent = category;
            filterCategorySelect.appendChild(optionSelect);
        });
    }
    
    // Event listeners para os filtros
    filterMonthSelect.addEventListener('change', function() {
        displayExpenses();
        updateSummary();
    });
    
    filterCategorySelect.addEventListener('change', displayExpenses);
});