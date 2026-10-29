// ---------------------------
// Local Storage Helper Functions
// ---------------------------

// Save a key-value pair in localStorage after converting value to JSON
function setLocalStorageItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Retrieve a value from localStorage and parse it from JSON
function getLocalStorageItem(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

// ---------------------------
// Page Management Functions
// ---------------------------

// Show a specific page by ID and hide all other pages
function showPage(pageId) {
  // Select all elements with class 'page'
  const pages = document.querySelectorAll(".page");

  // Hide all pages
  pages.forEach((page) => page.classList.remove("active"));

  // Find the target page and show it
  const pageToShow = document.getElementById(pageId);
  if (pageToShow) {
    pageToShow.classList.add("active");
  }
}

// Show the home page
function showHomePage() {
  showPage("homePage");
}

// Show the staff dashboard and load all related data
function showStaffDashboard() {
  showPage("staffPage");           // Show staff dashboard
  loadStudents();                  // Load student list
  loadTasks();                     // Load all tasks
  loadSubmissions();              // Load task submissions
  updateStudentDropdown();        // Update dropdown with students
  updateAssignmentOptions();      // Update assignment-related options
  loadTaskTracker();              // Load task progress tracker
}

// Show the student login page and update dropdown
function showStudentLogin() {
    const loginPage = document.getElementById("studentLoginPage");

    if (!loginPage) {
        alert("Student Login page HTML not found!");
        return;
    }

    showPage("studentLoginPage");

    updateStudentDropdown();
}

// Show the student dashboard and load assigned tasks
function showStudentDashboard() {
  showPage("studentPage");
  loadStudentTasks();             // Load tasks for the logged-in student
}

// ---------------------------
// Tab Navigation (e.g., inside a dashboard)
// ---------------------------

// Show a specific tab section and activate the related button
function showTab(tabId) {
  // Hide all tab contents
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Deactivate all tab buttons
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((button) => button.classList.remove("active"));

  // Get the tab content to show and the button to activate
  const tabToShow = document.getElementById(tabId + "Tab");
  const buttonToActivate = document.querySelector(
    `.tab-btn[onclick="showTab('${tabId}')"]`
  );

  // If both elements exist, activate them
  if (tabToShow && buttonToActivate) {
    tabToShow.classList.add("active");
    buttonToActivate.classList.add("active");
  }
}

// ---------------------------
// Student Login Function
// ---------------------------

// Handle student login based on selected roll number
function loginStudent() {
  // Get the selected roll number from dropdown
  const studentSelect = document.getElementById("studentSelect");
  currentStudent = studentSelect.value;

  // Proceed only if a roll number is selected
  if (currentStudent) {
    // Get the list of students from localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");

    // Find the student object by roll number
    const student = students.find((s) => s.rollNumber === currentStudent);

    // If student is found, welcome them and show dashboard
    if (student) {
      const studentWelcome = document.getElementById("studentWelcome");
      studentWelcome.textContent = `Welcome, ${student.name}!`;
      showStudentDashboard(); // Navigate to student dashboard
    } else {
      // Student not found
      alert("Student not found. Please contact staff.");
    }
  } else {
    // No selection made
    alert("Please select your roll number.");
  }
}


// Load students with edit and delete buttons in staff portal
function loadStudents() {
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const tableContainer = document.getElementById("studentsTable");

  if (tableContainer) {
    if (students.length === 0) {
      tableContainer.innerHTML = '<p class="no-data">No students added yet.</p>';
      return;
    }

    let tableHTML = `<table class="table">
      <thead>
        <tr><th>Name</th><th>Roll Number</th><th>Class</th><th>Year</th><th>Actions</th></tr>
      </thead><tbody>`;

    students.forEach((student) => {
      tableHTML += `<tr>
        <td>${student.name}</td>
        <td>${student.rollNumber}</td>
        <td>${student.class}</td>
        <td>${student.year}</td>
        <td>
          <button class="btn btn-edit" onclick="editStudent('${student.rollNumber}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteStudent('${student.rollNumber}')">Delete</button>
        </td>
      </tr>`;
    });

    tableHTML += "</tbody></table>";

    tableContainer.innerHTML = tableHTML;
  }
}

// Edit a student and prepare form for updates
function editStudent(rollNumber) {
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const student = students.find((s) => s.rollNumber === rollNumber);
  if (student) {
    document.getElementById("studentName").value = student.name;
    document.getElementById("rollNumber").value = student.rollNumber;
    document.getElementById("studentClass").value = student.class;
    document.getElementById("yearOfStudy").value = student.year;
    deleteStudent(rollNumber, false); // Delete old before update
  }
}

// Delete a student
function deleteStudent(rollNumber, reloadList = true) {
  let students = JSON.parse(localStorage.getItem("students") || "[]");
  students = students.filter((s) => s.rollNumber !== rollNumber);
  localStorage.setItem("students", JSON.stringify(students));
  if (reloadList) {
    loadStudents();
    updateStudentDropdown();
  }
}

// Load tasks with edit and delete buttons in staff portal
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const taskContainer = document.getElementById("tasksTable");

  if (taskContainer) {
    if (tasks.length === 0) {
      taskContainer.innerHTML = '<p class="no-data">No tasks assigned yet.</p>';
      return tasks;
    }

    let tableHTML = `<table class="table">
      <thead>
        <tr><th>Title</th><th>Description</th><th>Deadline</th><th>Actions</th></tr>
      </thead><tbody>`;

    tasks.forEach((task) => {
      tableHTML += `<tr>
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.deadline}</td>
        <td>
          <button class="btn btn-edit" onclick="editTask('${task.taskId}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteTask('${task.taskId}')">Delete</button>
        </td>
      </tr>`;
    });

    tableHTML += "</tbody></table>";

    taskContainer.innerHTML = tableHTML;
  }
  return tasks;
}

// Edit a task and pre-fill form inputs
function editTask(taskId) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks.find((t) => t.taskId === taskId);
  if (task) {
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskDeadline").value = task.deadline;

    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const assignedTo = task.assignedTo;

    let assignmentType = "individual";

    // Detect assignment type
    const classesAssigned = new Set(
      assignedTo.map((roll) => {
        const s = students.find((stu) => stu.rollNumber === roll);
        return s ? s.class : null;
      })
    );

    const yearsAssigned = new Set(
      assignedTo.map((roll) => {
        const s = students.find((stu) => stu.rollNumber === roll);
        return s ? s.year : null;
      })
    );

    if (
      classesAssigned.size === 1 &&
      assignedTo.length ===
        students.filter((s) => s.class === Array.from(classesAssigned)[0]).length
    ) {
      assignmentType = "class";
      document.getElementById("assignmentType").value = "class";
      updateAssignmentOptions();
      document.getElementById("classSelect").value = Array.from(classesAssigned)[0];
    } else if (
      yearsAssigned.size === 1 &&
      assignedTo.length ===
        students.filter((s) => s.year === Array.from(yearsAssigned)[0]).length
    ) {
      assignmentType = "year";
      document.getElementById("assignmentType").value = "year";
      updateAssignmentOptions();
      document.getElementById("yearSelect").value = Array.from(yearsAssigned)[0];
    } else {
      assignmentType = "individual";
      document.getElementById("assignmentType").value = "individual";
      updateAssignmentOptions();
      assignedTo.forEach((roll) => {
        let checkbox = document.getElementById(`student-${roll}`);
        if (checkbox) checkbox.checked = true;
      });
    }

    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
      taskForm.dataset.editingTaskId = task.taskId;
    }
  }
}

// Delete a task
function deleteTask(taskId) {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks = tasks.filter((t) => t.taskId !== taskId);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();
  loadTaskTracker();
}

// Update the student dropdown for student login page
function updateStudentDropdown() {
  const studentSelect = document.getElementById("studentSelect");
  if (!studentSelect) return;

  studentSelect.innerHTML = '<option value="">Select your Roll Number</option>';

  const students = JSON.parse(localStorage.getItem("students") || "[]");
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.rollNumber;
    option.textContent = `${student.rollNumber} - ${student.name}`;
    studentSelect.appendChild(option);
  });
}

// Update assignment options according to selected assignment type
function updateAssignmentOptions() {
  const assignmentTypeSelect = document.getElementById("assignmentType");
  const assignmentTargets = document.getElementById("assignmentTargets");
  if (!assignmentTargets || !assignmentTypeSelect) return;

  const assignmentType = assignmentTypeSelect.value;
  assignmentTargets.innerHTML = "";

  const students = JSON.parse(localStorage.getItem("students") || "[]");

  if (assignmentType === "individual") {
    if (students.length === 0) {
      assignmentTargets.innerHTML =
        "<p>No students available. Add students first.</p>";
      return;
    }
    let checkboxesHTML = '<div class="checkbox-group">';
    students.forEach((student) => {
      checkboxesHTML += `<div class="checkbox-item">
          <input type="checkbox" id="student-${student.rollNumber}" value="${student.rollNumber}">
          <label for="student-${student.rollNumber}">${student.name} (${student.rollNumber})</label>
        </div>`;
    });
    checkboxesHTML += "</div>";
    assignmentTargets.innerHTML = checkboxesHTML;
  } else if (assignmentType === "class") {
    const classes = Array.from(
      new Set(students.map((s) => s.class))
    ).filter(Boolean);
    if (classes.length === 0) {
      assignmentTargets.innerHTML =
        "<p>No classes available. Add students with classes first.</p>";
      return;
    }
    let selectHTML = `<label for="classSelect">Select Class:</label>
      <select id="classSelect">
        <option value="">Select a class</option>`;
    classes.forEach((className) => {
      selectHTML += `<option value="${className}">${className}</option>`;
    });
    selectHTML += "</select>";
    assignmentTargets.innerHTML = selectHTML;
  } else if (assignmentType === "year") {
    const years = Array.from(
      new Set(students.map((s) => s.year))
    ).filter(Boolean);
    if (years.length === 0) {
      assignmentTargets.innerHTML =
        "<p>No years available. Add students with years first.</p>";
      return;
    }
    let selectHTML = `<label for="yearSelect">Select Year:</label>
      <select id="yearSelect">
        <option value="">Select a year</option>`;
    years.forEach((year) => {
      selectHTML += `<option value="${year}">${year}</option>`;
    });
    selectHTML += "</select>";
    assignmentTargets.innerHTML = selectHTML;
  }
}

// Global variables
let currentStudent = "";
let currentTask = "";
let selectedFile = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  loadStudents();
  loadTasks();
  loadSubmissions();
  updateStudentDropdown();
  updateAssignmentOptions();

  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelection);
  }
});

// Form submission handlers
const studentForm = document.getElementById("studentForm");
if (studentForm) {
  studentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const studentName = document.getElementById("studentName").value.trim();
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const studentClass = document.getElementById("studentClass").value.trim();
    const yearOfStudy = document.getElementById("yearOfStudy").value.trim();

    if (!studentName || !rollNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    addStudent(studentName, rollNumber, studentClass, yearOfStudy);
  });
}

const taskForm = document.getElementById("taskForm");
if (taskForm) {
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const taskTitle = document.getElementById("taskTitle").value.trim();
    const taskDescription = document.getElementById("taskDescription").value.trim();
    const taskDeadline = document.getElementById("taskDeadline").value.trim();
    const assignmentType = document.getElementById("assignmentType").value;

    if (!taskTitle || !taskDescription || !taskDeadline) {
      alert("Please fill in all required fields.");
      return;
    }

    assignTask(taskTitle, taskDescription, taskDeadline, assignmentType);
  });
}

// Load submissions in the staff dashboard
function loadSubmissions() {
    const submissions = JSON.parse(
        localStorage.getItem("submissions") || "[]"
    );

    const container = document.getElementById("submissionsTable");

    if (!container) {
        console.error("submissionsTable element missing in HTML");
        return;
    }

    if (submissions.length === 0) {
        container.innerHTML = "<p>No submissions yet.</p>";
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Student Roll</th>
                    <th>Task ID</th>
                    <th>File Name</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    submissions.forEach(s => {
        html += `
            <tr>
                <td>${s.studentRoll || "-"}</td>
                <td>${s.taskId || "-"}</td>
                <td>${s.file?.name || "No file"}</td>
                <td>${s.submittedOn || "-"}</td>
                <td>${s.status || "-"}</td>
            </tr>
        `;
    });

    html += "</tbody></table>";
    container.innerHTML = html;
}

// File handling functions
function handleFileSelection(event) {
  const file = event.target.files[0];
  const selectedFileName = document.getElementById("selectedFileName");

  if (file) {
    selectedFile = file;
    selectedFileName.innerHTML = `<div class="file-preview">📎 ${file.name} (${formatFileSize(
      file.size
    )})</div>`;
  } else {
    selectedFile = null;
    selectedFileName.innerHTML = "";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}


function openUploadModal(taskId) {
  currentTask = taskId;

  const modal = document.getElementById("uploadModal");
  const taskInfo = document.getElementById("uploadTaskInfo");
  const fileInput = document.getElementById("fileInput");
  const selectedFileName = document.getElementById("selectedFileName");

  if (!modal) {
    console.error("uploadModal element not found in HTML");
    return;
  }

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks.find(t => t.taskId === taskId);

  if (taskInfo && task) {
    taskInfo.innerHTML = `
      <p><strong>Task:</strong> ${task.title}</p>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><strong>Deadline:</strong> ${task.deadline}</p>
    `;
  }

  if (fileInput) fileInput.value = "";
  if (selectedFileName) selectedFileName.innerHTML = "";

  selectedFile = null;
  modal.style.display = "block";
}

function closeUploadModal() {
  const modal = document.getElementById("uploadModal");

  if (modal) modal.style.display = "none";

  selectedFile = null;
}


function submitAssignment() {
  if (!selectedFile) {
    alert("Please select a file to upload");
    return;
  }

  const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      data: e.target.result,
      uploadDate: new Date().toISOString().split("T")[0],
    };

    const existingIndex = submissions.findIndex(
      (s) => s.studentRoll === currentStudent && s.taskId === currentTask
    );

    const newSubmission = {
      studentRoll: currentStudent,
      taskId: currentTask,
      file: fileData,
      status: "submitted",
      submittedOn: new Date().toISOString().split("T")[0],
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = newSubmission;
    } else {
      submissions.push(newSubmission);
    }

    localStorage.setItem("submissions", JSON.stringify(submissions));

    alert("Assignment uploaded successfully!");
    closeUploadModal();
    loadStudentTasks();
    loadTaskTracker();
  };

  reader.readAsDataURL(selectedFile);
}

// Add a new student
function addStudent(name, rollNumber, studentClass, yearOfStudy) {
  let students = JSON.parse(localStorage.getItem("students") || "[]");

  // Check duplicate rollNumber
  const duplicate = students.find((s) => s.rollNumber === rollNumber);
  if (duplicate) {
    alert("Roll Number already exists. Please use a unique Roll Number.");
    return;
  }

  const newStudent = {
    id: "stu_" + Date.now(),
    name: name,
    rollNumber: rollNumber,
    class: studentClass,
    year: yearOfStudy,
  };

  students.push(newStudent);
  localStorage.setItem("students", JSON.stringify(students));

  loadStudents();

  // Clear form fields
  document.getElementById("studentName").value = "";
  document.getElementById("rollNumber").value = "";
  document.getElementById("studentClass").value = "";
  document.getElementById("yearOfStudy").value = "";

  updateStudentDropdown();
}

// Assign a task (supports edit by replacing existing)
function assignTask(title, description, deadline, assignmentType) {
  let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  const assignedTo = [];

  if (assignmentType === "individual") {
    const checkboxes = document.querySelectorAll(
      "#assignmentTargets input[type='checkbox']:checked"
    );
    checkboxes.forEach((cb) => assignedTo.push(cb.value));
  } else if (assignmentType === "class") {
    const classSelect = document.getElementById("classSelect");
    if (classSelect) {
      const selectedClass = classSelect.value;
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      students.forEach((student) => {
        if (student.class === selectedClass) {
          assignedTo.push(student.rollNumber);
        }
      });
    }
  } else if (assignmentType === "year") {
    const yearSelect = document.getElementById("yearSelect");
    if (yearSelect) {
      const selectedYear = yearSelect.value;
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      students.forEach((student) => {
        if (student.year === selectedYear) {
          assignedTo.push(student.rollNumber);
        }
      });
    }
  }

  const taskForm = document.getElementById("taskForm");
  const editingTaskId = taskForm && taskForm.dataset.editingTaskId;

  if (editingTaskId) {
    const idx = tasks.findIndex((t) => t.taskId === editingTaskId);
    if (idx >= 0) tasks.splice(idx, 1);
  }

  const newTask = {
    taskId: editingTaskId || "task_" + Date.now(),
    title,
    description,
    deadline,
    assignedTo,
    createdOn: new Date().toISOString().split("T")[0],
  };

  tasks.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Clear form
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskDeadline").value = "";
  if (document.getElementById("assignmentType"))
    document.getElementById("assignmentType").value = "individual";
  updateAssignmentOptions();

  if (taskForm) delete taskForm.dataset.editingTaskId;

  loadTasks();
  loadTaskTracker();
}

function loadStudentTasks() {
  const container = document.getElementById("studentTasks");
  if (!container || !currentStudent) return;

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");

  const studentTasks = tasks.filter((task) =>
    task.assignedTo.includes(currentStudent)
  );

  if (studentTasks.length === 0) {
    container.innerHTML = '<p class="no-data">No tasks assigned yet.</p>';
    return;
  }

  let html = "";

  studentTasks.forEach((task) => {
    const submission = submissions.find(
      (s) => s.studentRoll === currentStudent && s.taskId === task.taskId
    );

    const status = submission ? submission.status : "pending";
    const isOverdue = new Date(task.deadline) < new Date() && status !== "completed";

    html += `<div class="task-card">
      <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-status status-${status} ${isOverdue ? "overdue" : ""}">
          ${
            status === "completed"
              ? "Completed"
              : status === "submitted"
              ? "Submitted"
              : isOverdue
              ? "Overdue"
              : "Pending"
          }
        </div>
      </div>
      <div class="task-info">
        <p><strong>Description:</strong> ${task.description}</p>
        <p><strong>Deadline:</strong> ${task.deadline}</p>
        <p><strong>Assigned:</strong> ${task.createdOn}</p>
      </div>`;

    if (submission && submission.file) {
      html += `<div class="task-files">
        <h5>Uploaded File:</h5>
        <div class="file-item">
          <div class="file-details">
            <div class="file-name">📎 ${submission.file.name}</div>
            <div class="file-size">${formatFileSize(submission.file.size)} • Uploaded: ${
        submission.submittedOn
      }</div>
          </div>
          <button onclick="downloadFile('${currentStudent}', '${task.taskId}')" class="download-btn">
            Download
          </button>
        </div>
      </div>`;
    }

    html += `<div class="task-actions">`;
    if (status !== "completed") {
      html += `<button onclick="openUploadModal('${task.taskId}')" class="btn btn-primary">${
        submission ? "Update File" : "Upload Assignment"
      }</button>`;
      if (submission) {
        html += `<button onclick="markCompleted('${task.taskId}')" class="btn btn-success">Mark as Completed</button>`;
      }
    } else {
      html += `<span style="color: #059669; font-weight: 600;">✅ Task Completed</span>`;
    }
    html += `</div></div>`;
  });

  container.innerHTML = html;
}

// Mark assignment as completed
function markCompleted(taskId) {
  const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
  const index = submissions.findIndex(
    (s) => s.studentRoll === currentStudent && s.taskId === taskId
  );

  if (index >= 0) {
    submissions[index].status = "completed";
    localStorage.setItem("submissions", JSON.stringify(submissions));
    loadStudentTasks();
    loadTaskTracker();
  }
}

// Download submitted file
function downloadFile(studentRoll, taskId) {
  const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
  const submission = submissions.find(
    (s) => s.studentRoll === studentRoll && s.taskId === taskId
  );

  if (submission && submission.file) {
    const link = document.createElement("a");
    link.href = submission.file.data;
    link.download = submission.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


// Load task tracker without completed checkbox (show status only)
function loadTaskTracker() {
  const container = document.getElementById("taskTracker");
  if (!container) return;

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");

  if (tasks.length === 0) {
    container.innerHTML = '<p class="no-data">No tasks assigned yet.</p>';
    return;
  }

  let html = '<div class="tracker-grid">';

  tasks.forEach((task) => {
    task.assignedTo.forEach((rollNumber) => {
      const student = students.find((s) => s.rollNumber === rollNumber);
      const submission = submissions.find(
        (s) => s.studentRoll === rollNumber && s.taskId === task.taskId
      );

      const status = submission ? submission.status : "pending";
      const isOverdue = new Date(task.deadline) < new Date() && status !== "completed";

      html += `<div class="tracker-item">
        <div class="tracker-header"><h4>${
          student ? student.name : "Unknown Student"
        }</h4></div>
        <div class="tracker-status"><span class="task-status status-${status} ${
        isOverdue ? "overdue" : ""
      }">${
        status === "completed"
          ? "Completed"
          : status === "submitted"
          ? "Submitted"
          : isOverdue
          ? "Overdue"
          : "Pending"
      }</span></div>
        <div class="tracker-details">
          <p><strong>Task:</strong> ${task.title}</p>
          <p><strong>Roll:</strong> ${rollNumber}</p>
          <p><strong>Deadline:</strong> ${task.deadline}</p>`;

      if (submission && submission.file) {
        html += `<div class="file-info">
            <span class="file-link" onclick="downloadFile('${rollNumber}', '${task.taskId}')">📎 ${
          submission.file.name
        }</span>
            <small>(${formatFileSize(submission.file.size)})</small>
            <button onclick="downloadFile('${rollNumber}', '${
          task.taskId
        }')" class="download-btn">Download</button>
          </div>
          <p><small>Submitted: ${submission.submittedOn}</small></p>`;
      } else {
        html += `<p><em>No file uploaded</em></p>`;
      }

      html += `</div></div>`;
    });
  });

  html += "</div>";
  container.innerHTML = html;
}
