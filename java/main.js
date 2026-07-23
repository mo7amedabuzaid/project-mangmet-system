var todoInput = document.getElementById("todoInput");
var searchInput = document.getElementById("searchInput");
var statusFilter = document.getElementById("statusFilter");
var todoList = document.getElementById("todoList");
var todoError = document.getElementById("todoError");
var allCount = document.getElementById("allCount");
var pendingCount = document.getElementById("pendingCount");
var completedCount = document.getElementById("completedCount");
var addButton = document.getElementById("addButton");

var todos = JSON.parse(localStorage.getItem("todos")) || [];

renderTodos();
updateStats();

addButton.addEventListener("click", addTodo);
searchInput.addEventListener("input", renderTodos);
statusFilter.addEventListener("change", renderTodos);
todoInput.addEventListener("input", validateTodoInput);
todoInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTodo();
  }
});

function addTodo() {
  if (!validateTodoInput()) {
    return;
  }

  var todo = {
    id: Date.now(),
    title: todoInput.value.trim(),
    completed: false,
    createdAt: new Date().toLocaleDateString("en-GB"),
  };

  todos.unshift(todo);
  saveTodos();
  clearForm();
  renderTodos();
}

function renderTodos() {
  var filteredTodos = getFilteredTodos();
  var cards = "";

  if (filteredTodos.length === 0) {
    todoList.innerHTML =
      '<div class="empty-state"><h2>No tasks found</h2><p>Try adding a new task or change the current filter.</p></div>';
    updateStats();
    return;
  }

  for (var i = 0; i < filteredTodos.length; i++) {
    var todo = filteredTodos[i];

    cards += `
      <article class="todo-item ${todo.completed ? "completed" : ""}">
        <div class="todo-content">
          <h2 class="todo-title">${highlightMatch(todo.title)}</h2>
          <div class="todo-meta">
            <span class="badge">
              <i class="fa-regular fa-calendar"></i>
              ${todo.createdAt}
            </span>
            <span class="badge">
              <i class="fa-solid ${todo.completed ? "fa-circle-check" : "fa-hourglass-half"}"></i>
              ${todo.completed ? "Completed" : "Pending"}
            </span>
          </div>
        </div>
        <button class="todo-action complete-btn" type="button" onclick="toggleTodo(${todo.id})" aria-label="Toggle complete">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="todo-action delete-btn" type="button" onclick="deleteTodo(${todo.id})" aria-label="Delete task">
          <i class="fa-solid fa-trash"></i>
        </button>
      </article>
    `;
  }

  todoList.innerHTML = cards;
  updateStats();
}

function getFilteredTodos() {
  var keyword = searchInput.value.trim().toLowerCase();
  var filterValue = statusFilter.value;
  var filteredTodos = [];

  for (var i = 0; i < todos.length; i++) {
    var currentTodo = todos[i];
    var matchesSearch = currentTodo.title.toLowerCase().includes(keyword);
    var matchesStatus =
      filterValue === "all" ||
      (filterValue === "completed" && currentTodo.completed) ||
      (filterValue === "pending" && !currentTodo.completed);

    if (matchesSearch && matchesStatus) {
      filteredTodos.push(currentTodo);
    }
  }

  return filteredTodos;
}

function toggleTodo(todoId) {
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === todoId) {
      todos[i].completed = !todos[i].completed;
      break;
    }
  }

  saveTodos();
  renderTodos();
}

function deleteTodo(todoId) {
  var updatedTodos = [];

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id !== todoId) {
      updatedTodos.push(todos[i]);
    }
  }

  todos = updatedTodos;
  saveTodos();
  renderTodos();
}

function updateStats() {
  var completed = 0;

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].completed) {
      completed++;
    }
  }

  allCount.textContent = todos.length;
  completedCount.textContent = completed;
  pendingCount.textContent = todos.length - completed;
}

function validateTodoInput() {
  var isValid = todoInput.value.trim().length >= 3;

  todoError.classList.toggle("show", !isValid && todoInput.value.length > 0);
  return isValid;
}

function clearForm() {
  todoInput.value = "";
  todoError.classList.remove("show");
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function highlightMatch(text) {
  var keyword = searchInput.value.trim();

  if (!keyword) {
    return text;
  }

  var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var regex = new RegExp("(" + escapedKeyword + ")", "ig");

  return text.replace(regex, '<span class="highlight">$1</span>');
}
