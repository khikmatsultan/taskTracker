document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('addTaskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');
    const editModal = document.getElementById('editModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const saveEditBtn = document.querySelector('.save-edit-btn');
    const closeModal = document.querySelector('.close-modal');

    // Task data
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentEditId = null;

    // Initialize the app
    function init() {
        renderTasks();
        updateStats();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Add task
        taskForm.addEventListener('submit', addTask);

        // Filter tasks
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.dataset.filter;
                renderTasks();
            });
        });

        // Edit modal
        closeModal.addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        saveEditBtn.addEventListener('click', saveEditedTask);

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    // Add a new task
    function addTask(e) {
        e.preventDefault();
        
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateStats();
    }

    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found</p>';
            return;
        }

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <div class="task-actions">
                    <button class="btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;

            taskList.appendChild(taskItem);

            // Add event listeners to the new task
            const checkbox = taskItem.querySelector('.task-check');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            editBtn.addEventListener('click', () => openEditModal(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }

    // Toggle task completion status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        updateStats();
    }

    // Open edit modal
    function openEditModal(id) {
        const task = tasks.find(task => task.id === id);
        if (!task) return;

        currentEditId = id;
        editTaskInput.value = task.text;
        editModal.style.display = 'flex';
    }

    // Save edited task
    function saveEditedTask() {
        const newText = editTaskInput.value.trim();
        if (newText === '') return;

        tasks = tasks.map(task => {
            if (task.id === currentEditId) {
                return { ...task, text: newText };
            }
            return task;
        });

        saveTasks();
        renderTasks();
        editModal.style.display = 'none';
    }

    // Delete task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    // Update task statistics
    function updateStats() {
        const pendingTasks = tasks.filter(task => !task.completed).length;
        const completedTasks = tasks.filter(task => task.completed).length;

        pendingCount.textContent = pendingTasks;
        completedCount.textContent = completedTasks;
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Initialize the app
    init();
});