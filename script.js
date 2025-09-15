let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let isDarkMode = localStorage.getItem("darkMode") === "true";
let calendar;

// ========== RENDER TASKS ==========
function renderTasks() {
  const taskList = document.getElementById("taskList");
  const searchText = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filter").value;

  taskList.innerHTML = "";

  tasks
    .filter(task => {
      const matchesSearch = task.text.toLowerCase().includes(searchText);
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.completed) ||
        (filter === "pending" && !task.completed);
      return matchesSearch && matchesFilter;
    })
    .forEach((task, index) => {
      let li = document.createElement("li");
      li.className = task.completed ? "completed" : "";

      li.innerHTML = `
        <div>
          <strong>${task.text}</strong>
          <span class="category-tag category-${task.category}">${task.category}</span><br>
          <span class="task-meta">${task.dateTime || ""} → ${task.endTime || "N/A"}</span>
        </div>
        <div class="actions">
          <button class="done" onclick="toggleComplete(${index})">✔</button>
          <button class="edit" onclick="editTask(${index})">✎</button>
          <button class="delete" onclick="deleteTask(${index})">🗑</button>
        </div>
      `;
      taskList.appendChild(li);
    });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateCalendar();
}

// ========== TASK OPS ==========
function addTask() {
  const taskInput = document.getElementById("task");
  const datetimeInput = document.getElementById("datetime");
  const categoryInput = document.getElementById("category");

  if (!taskInput.value.trim()) return alert("Enter task!");

  let endTime = "";
  if (datetimeInput.value) {
    const start = new Date(datetimeInput.value);
    endTime = new Date(start.getTime() + 3600000).toISOString().slice(0, 16);
  }

  tasks.push({
    text: taskInput.value.trim(),
    dateTime: datetimeInput.value,
    endTime,
    category: categoryInput.value,
    completed: false,
    reminded: false
  });

  taskInput.value = "";
  datetimeInput.value = "";
  categoryInput.value = "General";
  renderTasks();
}

function deleteTask(i) { tasks.splice(i,1); renderTasks(); }
function toggleComplete(i) { tasks[i].completed=!tasks[i].completed; renderTasks(); }
function editTask(i) {
  const newTask = prompt("Edit task:", tasks[i].text);
  if (newTask) { tasks[i].text=newTask; renderTasks(); }
}

// ========== THEME ==========
const themeToggle=document.getElementById("themeToggle");
function applyTheme(){
  document.body.classList.toggle("dark",isDarkMode);
  themeToggle.textContent=isDarkMode?"☀️ Light Mode":"🌙 Dark Mode";
  localStorage.setItem("darkMode",isDarkMode);
}
themeToggle.onclick=()=>{isDarkMode=!isDarkMode;applyTheme();};

// ========== CALENDAR ==========
function initCalendar(){
  const calendarEl=document.getElementById("calendar");
  calendar=new FullCalendar.Calendar(calendarEl,{
    initialView:"dayGridMonth",
    height:600,
    editable:true,
    headerToolbar:false,
    events:[]
  });
  calendar.render();
  updateCalendar();
}
function updateCalendar(){
  if(!calendar) return;
  calendar.removeAllEvents();
  tasks.forEach(task=>{
    if(task.dateTime){
      calendar.addEvent({
        title:`${task.text} (${task.category})${task.completed?" ✅":""}`,
        start:task.dateTime,
        end:task.endTime||null,
        backgroundColor:getCategoryColor(task.category),
        borderColor:"#333"
      });
    }
  });
}
function getCategoryColor(cat){
  switch(cat){
    case "Work":return "#2196f3";
    case "Personal":return "#4caf50";
    case "Shopping":return "#ff9800";
    default:return "#9e9e9e";
  }
}

// ========== INIT ==========
applyTheme();
renderTasks();
initCalendar();
