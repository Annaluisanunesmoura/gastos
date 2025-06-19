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

    // Dados
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    // Configura data padrão
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Evento para adicionar gasto
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const expense = {
            id: Date.now(),
            category: categoryInput.value.trim(),
            description: descriptionInput.value.trim(),
            amount: parseFloat(amountInput.value),
            date: dateInput.value
        };

        expenses.push(expense);
        saveExpenses();
        expenseForm.reset();
        dateInput.value = today;
        loadExpenses();
    });

    // Carrega os gastos
    function loadExpenses() {
        const monthFilter = filterMonthSelect.value;
        const categoryFilter = filterCategorySelect.value;

        let filteredExpenses = [...expenses];

        // Filtra por mês
        if (monthFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}` === monthFilter;
            });
        }

        // Filtra por categoria
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => 
                expense.category === categoryFilter
            );
        }

        // Ordena por data (mais recente primeiro)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Exibe os gastos
        displayExpenses(filteredExpenses);
        updateSummary(filteredExpenses);
        updateFilters();
    }

    // Exibe os gastos na tabela
    function displayExpenses(expensesToDisplay) {
        expensesContainer.innerHTML = '';

        if (expensesToDisplay.length === 0) {
            expensesContainer.innerHTML = `
                <p class="empty-message">
                    <i class="fas fa-info-circle"></i> Nenhuma despesa encontrada.
                </p>
            `;
            return;
        }

        expensesToDisplay.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString('pt-BR');

            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            expenseElement.innerHTML = `
                <div>${formattedDate}</div>
                <div>${expense.category}</div>
                <div>${expense.description || '-'}</div>
                <div>R$ ${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button onclick="deleteExpense(${expense.id})" class="action-btn delete-btn" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            expensesContainer.appendChild(expenseElement);
        });
    }

    // Atualiza o resumo
    function updateSummary(expensesToAnalyze) {
        // Total do mês
        const monthTotal = expensesToAnalyze.reduce((total, expense) => 
            total + expense.amount, 0
        );
        monthTotalElement.textContent = `R$ ${monthTotal.toFixed(2)}`;

        // Categoria mais gasta
        const categoryTotals = {};
        expensesToAnalyze.forEach(expense => {
            categoryTotals[expense.category] = 
                (categoryTotals[expense.category] || 0) + expense.amount;
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

    // Atualiza os filtros
    function updateFilters() {
        // Filtro de meses
        const months = new Set();
        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months.add(month);
        });

        const sortedMonths = Array.from(months).sort().reverse();
        filterMonthSelect.innerHTML = '<option value="all">Todos os meses</option>';

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

        // Filtro de categorias
        const categories = new Set(expenses.map(expense => expense.category));
        filterCategorySelect.innerHTML = '<option value="all">Todas as Categorias</option>';
        categoriesDatalist.innerHTML = '';

        Array.from(categories).sort().forEach(category => {
            // Para o datalist (auto-complete)
            const optionDatalist = document.createElement('option');
            optionDatalist.value = category;
            categoriesDatalist.appendChild(optionDatalist);

            // Para o select de filtro
            const optionSelect = document.createElement('option');
            optionSelect.value = category;
            optionSelect.textContent = category;
            filterCategorySelect.appendChild(optionSelect);
        });
    }

    // Deleta um gasto (global para funcionar nos botões dinâmicos)
    window.deleteExpense = function(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveExpenses();
            loadExpenses();
        }
    };

    // Salva no localStorage
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // Eventos dos filtros
    filterMonthSelect.addEventListener('change', loadExpenses);
    filterCategorySelect.addEventListener('change', loadExpenses);

    // Carrega dados iniciais
    loadExpenses();
});
