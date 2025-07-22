const API_URL = 'https://dummyjson.com/todos';
const ITEMS_PER_PAGE = 10;

let todos = [];
let currentPage = 1;

const todoList = document.getElementById('todoList');
const pagination = document.getElementById('pagination');
const addTodoForm = document.getElementById('addTodoForm');
const newTodoInput = document.getElementById('newTodoInput');
const searchInput = document.getElementById('searchInput');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');

// Fetch todos from API
async function fetchTodos() {
    try {
        showLoading(true);
        const response = await axios.get(`${API_URL}?limit=150`); 
        todos = response.data.todos;
        renderTodos();
    } catch (error) {
        showError('Failed to fetch todos. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = filterTodos();
    const paginatedTodos = paginateTodos(filteredTodos);
    
    todoList.innerHTML = '';
    paginatedTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `list-group-item ${todo.completed ? 'completed' : ''}`;
        li.textContent = todo.todo;
        todoList.appendChild(li);
    });

    renderPagination(filteredTodos.length);
}

// Filter todos based on search and date range
function filterTodos() {
    return todos.filter(todo => {
        const matchesSearch = todo.todo.toLowerCase().includes(searchInput.value.toLowerCase());
        const todoDate = new Date(todo.id); // Using id as a proxy for date since the API doesn't provide dates
        const fromDateValue = fromDate.value ? new Date(fromDate.value) : null;
        const toDateValue = toDate.value ? new Date(toDate.value) : null;

        const matchesDateRange = 
            (!fromDateValue || todoDate >= fromDateValue) &&
            (!toDateValue || todoDate <= toDateValue);

        return matchesSearch && matchesDateRange;
    });
}

// Paginate todos
function paginateTodos(filteredTodos) {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTodos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}

// Render pagination
function renderPagination(totalItems) {
    const pageCount = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.textContent = i;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            renderTodos();
        });
        li.appendChild(a);
        pagination.appendChild(li);
    }
}

// Add new todo
async function addTodo(todo) {
    try {
        showLoading(true);
        const response = await axios.post(API_URL + '/add', { todo, completed: false, userId: 1 });
        todos.unshift(response.data);
        renderTodos();
        newTodoInput.value = '';
    } catch (error) {
        showError('Failed to add todo. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.classList.toggle('d-none', !show);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    setTimeout(() => {
        errorMessage.classList.add('d-none');
    }, 5000);
}

// Event listeners
addTodoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTodo = newTodoInput.value.trim();
    if (newTodo) {
        addTodo(newTodo);
    }
});

searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderTodos();
});

fromDate.addEventListener('change', renderTodos);
toDate.addEventListener('change', renderTodos);

// Initial fetch
fetchTodos();