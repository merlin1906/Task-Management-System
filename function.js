// Application State
let students = JSON.parse(localStorage.getItem('students') || '[]');
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// Save data to localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Navigation Functions
function showHomePage() {
    hideAllPages();
    document.getElementById('homePage').classList.add('active');
}

function showStaffPortal() {
    hideAllPages();
    document.getElementById('staffPage').classList.add('active');
    updateStudentSelects();
    loadStudentsTable();
    loadTasksTable();
    loadSubmissions();
}

function showStudentPortal() {
    hideAllPages();
    document.getElementById('studentPage').classList.add('active');
    updateStudentSelects();
}

function hideAllPages() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
}

// Tab Management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Handle assignment type change
function handleAssignmentTypeChange() {
    const assignmentType = document.getElementById('assignmentType').value;
    const departmentGroup = document.getElementById('departmentGroup');
    const studentGroup = document.getElementById('studentGroup');
    
    if (assignmentType === 'department') {
        departmentGroup.style.display = 'block';
        studentGroup.style.display = 'none';
        document.getElementById('assignToStudent').value = '';
    } else if (assignmentType === 'individual') {
        departmentGroup.style.display = 'none';
        studentGroup.style.display = 'block';
        document.getElementById('assignToDepartment').value = '';
        updateStudentSelects();
    } else {
        departmentGroup.style.display = 'none';
        studentGroup.style.display = 'none';
    }
}

// Student Management
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const studentDepartment = document.getElementById('studentDepartment').value;
    const studentClass = document.getElementById('studentClass').value;
    
    // Check if student ID already exists
    if (students.find(student => student.id === studentId)) {
        showToast('Student ID already exists!', 'error');
        return;
    }
    
    const newStudent = {
        id: studentId,
        name: studentName,
        department: studentDepartment,
        class: studentClass
    };
    
    students.push(newStudent);
    saveData();
    
    document.getElementById('studentForm').reset();
    loadStudentsTable();
    updateStudentSelects();
    showToast('Student added successfully!', 'success');
});

function loadStudentsTable() {
    const tableBody = document.getElementById('studentsTableBody');
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.class}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
    });
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? This will also delete all their tasks.')) {
        students = students.filter(student => student.id !== studentId);
        tasks = tasks.filter(task => task.assignedTo !== studentId);
        saveData();
        loadStudentsTable();
        loadTasksTable();
        updateStudentSelects();
        showToast('Student deleted successfully!', 'success');
    }
}

function updateStudentSelects() {
    const selects = ['assignToStudent', 'studentSelect'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Student</option>';
            
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.id}) - ${student.department}`;
                select.appendChild(option);
            });
            
            select.value = currentValue;
        }
    });
}

// Task Management
document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskTitle = document.getElementById('taskTitle').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const assignmentType = document.getElementById('assignmentType').value;
    
    let assignedStudents = [];
    
    if (assignmentType === 'individual') {
        const assignedTo = document.getElementById('assignToStudent').value;
        if (!assignedTo) {
            showToast('Please select a student!', 'error');
            return;
        }
        assignedStudents = [assignedTo];
    } else if (assignmentType === 'department') {
        const department = document.getElementById('assignToDepartment').value;
        if (!department) {
            showToast('Please select a department!', 'error');
            return;
        }
        assignedStudents = students.filter(student => student.department === department).map(student => student.id);
        
        if (assignedStudents.length === 0) {
            showToast('No students found in the selected department!', 'error');
            return;
        }
    }
    
    // Create tasks for all assigned students
    assignedStudents.forEach(studentId => {
        const newTask = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: taskTitle,
            description: taskDescription,
            deadline: taskDeadline,
            assignedTo: studentId,
            assignmentType: assignmentType,
            department: assignmentType === 'department' ? document.getElementById('assignToDepartment').value : null,
            status: 'pending',
            submittedOn: null,
            fileName: null,
            fileContent: null,
            notes: null
        };
        tasks.push(newTask);
    });
    
    saveData();
    document.getElementById('taskForm').reset();
    handleAssignmentTypeChange(); // Reset form visibility
    loadTasksTable();
    
    const message = assignmentType === 'department' ? 
        `Task assigned to ${assignedStudents.length} students in the department!` : 
        'Task created successfully!';
    showToast(message, 'success');
});

function loadTasksTable() {
    const tableBody = document.getElementById('tasksTableBody');
    if (!tableBody) {
        console.log('Tasks table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    console.log('Loading tasks:', tasks);
    
    tasks.forEach(task => {
        const student = students.find(s => s.id === task.assignedTo);
        const studentName = student ? `${student.name} (${student.department})` : 'Unknown';
        const deadline = new Date(task.deadline).toLocaleString();
        
        const assignedToText = task.assignmentType === 'department' ? 
            `${task.department} Dept.` : studentName;
        
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${assignedToText}</td>
            <td>${deadline}</td>
            <td><span class="status-badge status-${task.status}">${task.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
                ${task.status === 'submitted' ? 
                    `<button class="btn btn-success btn-sm" onclick="downloadFile('${task.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>` : ''}
            </td>
        `;
    });
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveData();
        loadTasksTable();
        loadSubmissions();
        showToast('Task deleted successfully!', 'success');
    }
}

// Student Portal Functions
function loadStudentTasks() {
    const studentId = document.getElementById('studentSelect').value;
    const taskSection = document.getElementById('studentTasksSection');
    const tasksList = document.getElementById('studentTasksList');
    
    if (!studentId) {
        taskSection.style.display = 'none';
        return;
    }
    
    taskSection.style.display = 'block';
    
    const studentTasks = tasks.filter(task => task.assignedTo === studentId);
    tasksList.innerHTML = '';
    
    if (studentTasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">No tasks assigned yet.</p>';
        return;
    }
    
    studentTasks.forEach(task => {
        const deadline = new Date(task.deadline);
        const isOverdue = deadline < new Date() && task.status === 'pending';
        const statusClass = isOverdue ? 'overdue' : task.status;
        
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <div class="task-meta">
                <div><strong>Deadline:</strong> ${deadline.toLocaleString()}</div>
                <div><span class="status-badge status-${statusClass}">
                    ${isOverdue ? 'OVERDUE' : task.status.toUpperCase()}
                </span></div>
                ${task.assignmentType === 'department' ? 
                    `<div><strong>Department Assignment:</strong> ${task.department}</div>` : ''}
            </div>
            <div class="task-actions">
                ${task.status === 'pending' ? 
                    `<button class="btn btn-primary" onclick="openSubmissionModal('${task.id}')">
                        <i class="fas fa-upload"></i> Submit Assignment
                    </button>` : 
                    `<div class="submission-info">
                        <p><strong>Submitted on:</strong> ${new Date(task.submittedOn).toLocaleString()}</p>
                        <p><strong>File:</strong> ${task.fileName}</p>
                        ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ''}
                    </div>`
                }
            </div>
        `;
        tasksList.appendChild(taskCard);
    });
}

// File Submission Functions
function openSubmissionModal(taskId) {
    document.getElementById('taskIdForSubmission').value = taskId;
    document.getElementById('submissionModal').style.display = 'block';
}

function closeSubmissionModal() {
    document.getElementById('submissionModal').style.display = 'none';
    document.getElementById('submissionForm').reset();
}

document.getElementById('submissionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskIdForSubmission').value;
    const fileInput = document.getElementById('assignmentFile');
    const notes = document.getElementById('submissionNotes').value;
    const file = fileInput.files[0];
    
    if (!file) {
        showToast('Please select a file to upload', 'error');
        return;
    }
    
    // Convert file to base64 for storage
    const reader = new FileReader();
    reader.onload = function(e) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'submitted';
            task.submittedOn = new Date().toISOString();
            task.fileName = file.name;
            task.fileContent = e.target.result;
            task.notes = notes;
            
            saveData();
            closeSubmissionModal();
            loadStudentTasks();
            loadSubmissions();
            showToast('Assignment submitted successfully!', 'success');
        }
    };
    
    reader.readAsDataURL(file);
});

// File Download Function
function downloadFile(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.fileContent) {
        const link = document.createElement('a');
        link.href = task.fileContent;
        link.download = task.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('File downloaded successfully!', 'success');
    } else {
        showToast('File not found', 'error');
    }
}

// Submissions Management
function loadSubmissions() {
    const submissionsList = document.getElementById('submissionsList');
    submissionsList.innerHTML = '';
    
    const submittedTasks = tasks.filter(task => task.status === 'submitted');
    
    if (submittedTasks.length === 0) {
        submissionsList.innerHTML = '<p class="no-submissions">No submissions yet.</p>';
        return;
    }
    
    submittedTasks.forEach(task => {
        const student = students.find(s => s.id === task.assignedTo);
        const studentName = student ? `${student.name} (${student.department})` : 'Unknown';
        
        const submissionCard = document.createElement('div');
        submissionCard.className = 'submission-card';
        submissionCard.innerHTML = `
            <h4>${task.title}</h4>
            <div class="submission-meta">
                <div><strong>Student:</strong> ${studentName}</div>
                <div><strong>Submitted On:</strong> ${new Date(task.submittedOn).toLocaleString()}</div>
                <div><strong>File Name:</strong> ${task.fileName}</div>
                <div><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleString()}</div>
                ${task.assignmentType === 'department' ? 
                    `<div><strong>Department Task:</strong> ${task.department}</div>` : ''}
            </div>
            ${task.notes ? `<p><strong>Student Notes:</strong> ${task.notes}</p>` : ''}
            <div class="submission-actions">
                <button class="btn btn-success btn-sm" onclick="downloadFile('${task.id}')">
                    <i class="fas fa-download"></i> Download File
                </button>
            </div>
        `;
        submissionsList.appendChild(submissionCard);
    });
}

// Toast Notification System
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    updateStudentSelects();
    loadStudentsTable();
    loadTasksTable();
    loadSubmissions();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('submissionModal');
    if (event.target === modal) {
        closeSubmissionModal();
    }
}
