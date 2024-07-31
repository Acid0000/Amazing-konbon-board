// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="task-card card mb-3" data-id="${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Deadline: ${task.deadline}</small></p>
                <button class="btn btn-danger delete-task-btn">Delete</button>
            </div>
        </div>
    `);

    const deadline = dayjs(task.deadline);
    const now = dayjs();
    if (now.isAfter(deadline)) {
        taskCard.addClass('bg-danger text-white');
    } else if (now.add(2, 'day').isAfter(deadline)) {
        taskCard.addClass('bg-warning text-dark');
    }

    return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        if (task.status === 'to-do') {
            $('#todo-cards').append(taskCard);
        } else if (task.status === 'in-progress') {
            $('#in-progress-cards').append(taskCard);
        } else if (task.status === 'done') {
            $('#done-cards').append(taskCard);
        }
    });

    $('.task-card').draggable({
        revert: "invalid",
        helper: "clone",
        start: function (event, ui) {
            $(this).hide();
            ui.helper.css('z-index', 1000);
        },
        stop: function (event, ui) {
            $(this).css('z-index', 1).show();
        },
        appendTo: 'body'
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $('#task-title').val();
    const description = $('#task-desc').val();
    const deadline = $('#task-deadline').val();
    const id = generateTaskId();
    const task = { id, title, description, deadline, status: 'to-do' };

    taskList.push(task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    const taskCard = createTaskCard(task);
    $('#todo-cards').append(taskCard);

    $('#formModal').modal('hide');
    $('#task-form')[0].reset();

    // Make the new task card draggable
    taskCard.draggable({
        revert: "invalid",
        helper: "clone",
        start: function (event, ui) {
            $(this).hide();
            ui.helper.css('z-index', 1000);
        },
        stop: function (event, ui) {
            $(this).css('z-index', 1).show();
        },
        appendTo: 'body'
    });
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskCard = $(event.target).closest('.task-card');
    const taskId = taskCard.data('id');

    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));

    taskCard.remove();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskCard = $(ui.helper);
    const taskId = taskCard.data('id');
    const newStatus = $(this).closest('.lane').attr('id').replace('-cards', '');

    const task = taskList.find(task => task.id === taskId);
    task.status = newStatus;

    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#task-form').on('submit', handleAddTask);

    $('body').on('click', '.delete-task-btn', handleDeleteTask);

    $('.lane .card-body').droppable({
        accept: ".task-card",
        drop: handleDrop,
        tolerance: "pointer",
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active"
    });

    $('#task-deadline').attr('type', 'date');
});
