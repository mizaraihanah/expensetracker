$(document).ready(function () {
    const usersKey = 'users';
    let chartInstance;  // Variable to hold the chart instance

    function getUsers() {
        return JSON.parse(localStorage.getItem(usersKey)) || [];
    }

    function saveUsers(users) {
        localStorage.setItem(usersKey, JSON.stringify(users));
    }

    function getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    function getUser(username) {
        return getUsers().find(user => user.username === username);
    }

    function saveUser(user) {
        let users = getUsers();
        let index = users.findIndex(u => u.username === user.username);
        if (index !== -1) {
            users[index] = user;
            saveUsers(users);
        }
    }

    function addExpense(expense) {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        user.expenses.push(expense);
        saveUser(user);
    }

    function deleteExpense(index) {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        user.expenses.splice(index, 1);
        saveUser(user);
    }

    function getExpenses() {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        return user.expenses;
    }

    function updateSummary() {
        let currentMonth = new Date().getMonth();
        let total = getExpenses().filter(expense => new Date(expense.date).getMonth() === currentMonth)
            .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        $('#total-expenses').text(total.toFixed(2));
    }

    function refreshExpenses() {
        $('#expense-list').empty();
        getExpenses().forEach((expense, index) => {
            $('#expense-list').append(`
                <tr>
                    <td>${expense.name}</td>
                    <td>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>${expense.date}</td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-expense" data-index="${index}">
                            <i class="fas fa-edit"></i> 
                        </button>
                        <button class="btn btn-danger btn-sm delete-expense" data-index="${index}">
                            <i class="fas fa-trash-alt"></i> 
                        </button>
                    </td>
                </tr>
            `);
        });
        updateSummary();
        updateChart(); // Call updateChart after refreshing expenses
    }

    $('#expense-form').submit(function (e) {
        e.preventDefault();
        let name = $('#expense-name').val();
        let amount = parseFloat($('#expense-amount').val());
        let date = $('#expense-date').val();

        addExpense({ name, amount, date });
        $('#expense-form')[0].reset();
        refreshExpenses();
    });

    $(document).on('click', '.delete-expense', function () {
        let index = $(this).data('index');

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteExpense(index);
                refreshExpenses();
                Swal.fire(
                    'Deleted!',
                    'Your expense has been deleted.',
                    'success'
                );
            }
        });
    });

    $(document).on('click', '.edit-expense', function () {
        let index = $(this).data('index');
        let expense = getExpenses()[index];
        $('#expense-name').val(expense.name);
        $('#expense-amount').val(expense.amount);
        $('#expense-date').val(expense.date);
        deleteExpense(index);
        refreshExpenses();
    });

    function updateChart() {
        let ctx = document.getElementById('expense-chart').getContext('2d');
        let monthlyExpenses = {};

        getExpenses().forEach(expense => {
            let month = new Date(expense.date).getMonth();
            if (!monthlyExpenses[month]) {
                monthlyExpenses[month] = 0;
            }
            monthlyExpenses[month] += parseFloat(expense.amount);
        });

        let labels = [];
        let data = [];
        for (let i = 0; i < 12; i++) {
            labels.push(new Date(0, i).toLocaleString('default', { month: 'long' }));
            data.push(monthlyExpenses[i] || 0);
        }

        if (chartInstance) {
            // Update existing chart data
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = data;
            chartInstance.update();
        } else {
            // Create new chart instance
            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monthly Expenses',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Initial loading of expenses and chart
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    } else {
        refreshExpenses();
    } 
});

function exitApp() {
    window.location.href = "login.html";
}
