/*
Task Structure:

{
    id: str
    name: str
    type: enum(str)
    description: str
    due date: date
}
*/


// Retrieve tasks and nextId from localStorage
const taskDisplayEl = $("#task-display");

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks"));
    //check if tasks is empty
    if (tasks === "" || tasks === undefined || !tasks){
        return [];
    }
    return JSON.parse(localStorage.getItem("tasks"));
}
function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks))
}
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    //generates 32 char uuid
    let myuuid = crypto.randomUUID();
    return myuuid;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $(`<div data-project-id = "${task.id}" class = "card project-card draggable"></div>`)
  const cardHeaderEl = $(`<div class="card-header h4">${task.name}</div>`)
  const cardBodyEl = $(`<div class ="card-body"></div>`)
  const cardTypeEl = $(`<p class ="card-text">${task.type}</p>`)
  const cardDescriptionEl = $(`<p class="card-text">${task.description}</p>`)
  const cardDueDateEl = $(`<p class ="card-text">${task.dueDate}</p>`)
  const cardDeleteBtn = $(`<button data-project-id=${task.id} class ="btn-delete-project btn btn-danger delete">Delete</button>`)
  
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    //date is stored in str convert to date obj
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  cardBodyEl.append(cardTypeEl, [cardDueDateEl, cardDescriptionEl, cardDeleteBtn]);
  taskCard.append(cardHeaderEl, [cardBodyEl]);
  return taskCard;
}

function renderTaskList() {
    let tasks = loadTasks()
    //the lists are the divs to render cards in
    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();
    for (let task of tasks){
        const taskCard = createTaskCard(task);
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
        if (task.type === "In Progress") {
            inProgressList.append(taskCard);
            continue;
        }
        if (task.type === "Done"){
            doneList.append(taskCard);
            continue;
        }
        if (task.type === "To Do"){
            todoList.append(taskCard);
            continue;
        }
    }
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleAddTask(event){
    const taskName = prompt("What is the name of your task?");
    //return on bad data
    if (taskName === "" || taskName === undefined){
        alert("Could not read task name");
        return;
    }
    const description = prompt("Enter a little description of your task")
    const taskType = prompt("Enter the state of the task as 'To Do, In Progress, or Done'");
    const acceptableTypes = ["To Do", "In Progress", "Done"];
    //return if answer doesnt match something in our enum
    if (!acceptableTypes.includes(taskType)){
        alert("Try again with a valid task please");
        return;
    }
    const dueDate = prompt("Enter the due date of the task  in the form of DD/MM/YYYY")
    const newTask = {
        id: generateTaskId(),
        name: taskName,
        type: taskType,
        description: description,
        dueDate: dueDate
    }
    const tasks = loadTasks();
    tasks.push(newTask);
    saveTasks(tasks);
    renderTaskList();
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    console.log("deleting element");
    const taskId = $(this).attr('data-project-id');
    let tasks = loadTasks();
    console.log("deleting: " + taskId);
    //remove the element
    tasks = tasks.filter((a) => a.id !== taskId);

    saveTasks(tasks);

    renderTaskList();
}

function handleDrop(event, ui) {
  const tasks = loadTasks();

  const taskId = ui.draggable[0].dataset.projectId;

  const newStatus = event.target.id;
  console.log("Handling drop for " + taskId);
  for (let task of tasks) {
    if (task.id === taskId) {
      let setStatus = '';
      //map ids to our more aesthetic formatting
      if (newStatus === "to-do"){
        setStatus = "To Do";
      }
      if (newStatus === "in-progress"){
        setStatus = "In Progress";
      }
      if (newStatus === "done"){
        setStatus = "Done";
      }
      task.type = setStatus;
    }
  }
  // ? Save the updated projects array to localStorage (overwritting the previous one) and render the new project data to the screen.
  saveTasks(tasks);
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    taskDisplayEl.on('click', '.btn-delete-project', handleDeleteTask);
    taskDisplayEl.on('click',".btn-success", handleAddTask);
    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });
});