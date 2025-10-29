// Data Management
class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize employees
        if (!localStorage.getItem('employees')) {
            const defaultEmployees = [
                {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@company.com',
                    department: 'IT',
                    position: 'Software Developer',
                    phone: '+1234567890',
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    email: 'jane@company.com',
                    department: 'HR',
                    position: 'HR Manager',
                    phone: '+1234567891',
                    status: 'active'
                },
                {
                    id: 3,
                    name: 'Mike Johnson',
                    email: 'mike@company.com',
                    department: 'Finance',
                    position: 'Accountant',
                    phone: '+1234567892',
                    status: 'active'
                }
            ];
            localStorage.setItem('employees', JSON.stringify(defaultEmployees));
        }

        // Initialize attendance
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify([]));
        }

        // Initialize tasks
        if (!localStorage.getItem('tasks')) {
            const defaultTasks = [
                {
                    id: 1,
                    title: 'Design Homepage',
                    description: 'Create new homepage design',
                    assigneeId: 1,
                    priority: 'high',
                    dueDate: '2024-12-31',
                    status: 'in-progress',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Hiring Process',
                    description: 'Review applications for senior developer',
                    assigneeId: 2,
                    priority: 'medium',
                    dueDate: '2024-12-20',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('tasks', JSON.stringify(defaultTasks));
        }

        // Initialize leave requests
        if (!localStorage.getItem('leaveRequests')) {
            localStorage.setItem('leaveRequests', JSON.stringify([]));
        }

        // Initialize notifications
        if (!localStorage.getItem('notifications')) {
            const defaultNotifications = [
                {
                    id: 1,
                    title: 'Welcome!',
                    message: 'Welcome to Company Management System',
                    type: 'info',
                    timestamp: new Date().toISOString(),
                    read: false
                }
            ];
            localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
        }

        // Initialize current user
        if (!localStorage.getItem('currentUser')) {
            const currentUser = {
                id: 1,
                name: 'John Doe',
                email: 'john@company.com',
                department: 'IT'
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    addData(key, item) {
        const data = this.getData(key);
        // Generate unique ID if not provided
        if (!item.id) {
            item.id = Date.now();
        }
        data.push(item);
        this.setData(key, data);
        return item;
    }

    updateData(key, id, updates) {
        const data = this.getData(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates };
            this.setData(key, data);
            return data[index];
        }
        return null;
    }

    deleteData(key, id) {
        const data = this.getData(key);
        const filteredData = data.filter(item => item.id !== id);
        this.setData(key, filteredData);
        return filteredData;
    }
}

// Notification System
class NotificationSystem {
    constructor() {
        this.dataManager = new DataManager();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type, 'show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    addNotification(title, message, type = 'info') {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.dataManager.addData('notifications', notification);
        this.updateNotificationBadge();
        return notification;
    }

    markAsRead(notificationId) {
        this.dataManager.updateData('notifications', notificationId, { read: true });
        this.updateNotificationBadge();
    }

    markAllAsRead() {
        const notifications = this.dataManager.getData('notifications');
        const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true
        }));
        this.dataManager.setData('notifications', updatedNotifications);
        this.updateNotificationBadge();
    }

    clearAll() {
        this.dataManager.setData('notifications', []);
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const notifications = this.dataManager.getData('notifications');
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('navNotificationCount');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    }
}

// Main Application
class CompanyManagementSystem {
    constructor() {
        this.dataManager = new DataManager();
        this.notificationSystem = new NotificationSystem();
        this.currentUser = this.dataManager.getData('currentUser');
        this.currentDate = new Date().toISOString().split('T')[0];
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.updateUserInfo();
        this.notificationSystem.updateNotificationBadge();
        this.showSection('dashboard');
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.showSection(target);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.showToast('Logged out successfully', 'success');
        });

        // Attendance
        document.getElementById('clockInBtn').addEventListener('click', () => this.clockIn());
        document.getElementById('clockOutBtn').addEventListener('click', () => this.clockOut());
        document.getElementById('breakBtn').addEventListener('click', () => this.takeBreak());

        // Tasks
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showTaskModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('cancelTask').addEventListener('click', () => this.hideTaskModal());

        // Employees
        document.getElementById('addEmployeeBtn').addEventListener('click', () => this.showEmployeeModal());
        document.getElementById('employeeForm').addEventListener('submit', (e) => this.handleEmployeeSubmit(e));
        document.getElementById('cancelEmployee').addEventListener('click', () => this.hideEmployeeModal());

        // Leave Management
        document.getElementById('leaveForm').addEventListener('submit', (e) => this.handleLeaveSubmit(e));

        // Notifications
        document.getElementById('markAllRead').addEventListener('click', () => this.markAllNotificationsRead());
        document.getElementById('clearNotifications').addEventListener('click', () => this.clearAllNotifications());

        // Modal close events
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Filter attendance
        document.getElementById('filterBtn').addEventListener('click', () => this.filterAttendance());
    }

    updateUserInfo() {
        const userElement = document.getElementById('currentEmployee');
        if (userElement && this.currentUser) {
            userElement.textContent = `Welcome, ${this.currentUser.name}`;
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-target="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
        }

        // Load section data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'attendance':
                this.loadAttendance();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'employees':
                this.loadEmployees();
                break;
            case 'leave':
                this.loadLeaveRequests();
                break;
            case 'notifications':
                this.loadNotifications();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Dashboard Methods
    loadDashboard() {
        const employees = this.dataManager.getData('employees');
        const attendance = this.dataManager.getData('attendance');
        const tasks = this.dataManager.getData('tasks');

        // Update stats
        document.getElementById('totalEmployees').textContent = employees.length;
        
        const todayAttendance = attendance.filter(a => a.date === this.currentDate);
        document.getElementById('presentToday').textContent = todayAttendance.length;
        
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        document.getElementById('pendingTasks').textContent = pendingTasks.length;

        // Simple leave count (for demo)
        const onLeave = employees.length - todayAttendance.length;
        document.getElementById('onLeave').textContent = Math.max(0, onLeave);

        this.loadRecentAttendance();
        this.loadTaskProgress();
    }

    loadRecentAttendance() {
        const attendance = this.dataManager.getData('attendance');
        const recent = attendance.slice(-5).reverse();
        
        const container = document.getElementById('recentAttendance');
        if (container) {
            container.innerHTML = recent.map(record => `
                <div class="attendance-record" style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                    <strong>${record.employeeName}</strong> - 
                    ${record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'N/A'}
                    ${record.clockOut ? ` to ${new Date(record.clockOut).toLocaleTimeString()}` : ''}
                </div>
            `).join('');
        }
    }

    loadTaskProgress() {
        const tasks = this.dataManager.getData('tasks');
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const container = document.getElementById('taskProgress');
        if (container) {
            container.innerHTML = `
                <div class="progress-info">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${completed}/${total} tasks completed (${progress}%)</div>
                </div>
            `;
        }
    }

    // Attendance Methods
    loadAttendance() {
        const attendance = this.dataManager.getData('attendance');
        const userAttendance = attendance.filter(a => a.employeeId === this.currentUser.id);
        
        const tbody = document.getElementById('attendanceBody');
        if (tbody) {
            tbody.innerHTML = userAttendance.map(record => `
                <tr>
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : 'N/A'}</td>
                    <td>${record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : 'N/A'}</td>
                    <td>${record.totalHours || 'N/A'}</td>
                    <td><span class="status-badge ${record.status}">${record.status}</span></td>
                </tr>
            `).join('');
        }

        this.updateAttendanceStatus();
    }

    updateAttendanceStatus() {
        const attendance = this.dataManager.getData('attendance');
        const todayRecord = attendance.find(a => 
            a.date === this.currentDate && a.employeeId === this.currentUser.id
        );

        const statusElement = document.getElementById('currentStatus');
        const clockInBtn = document.getElementById('clockInBtn');
        const clockOutBtn = document.getElementById('clockOutBtn');

        if (todayRecord) {
            if (statusElement) statusElement.textContent = 'Clocked In';
            if (statusElement) statusElement.style.color = 'var(--success-color)';
            if (clockInBtn) clockInBtn.disabled = true;
            if (clockOutBtn) clockOutBtn.disabled = false;
            
            if (todayRecord.clockOut) {
                if (statusElement) statusElement.textContent = 'Clocked Out';
                if (statusElement) statusElement.style.color = 'var(--warning-color)';
                if (clockOutBtn) clockOutBtn.disabled = true;
            }
        } else {
            if (statusElement) statusElement.textContent = 'Not Clocked In';
            if (statusElement) statusElement.style.color = 'var(--danger-color)';
            if (clockInBtn) clockInBtn.disabled = false;
            if (clockOutBtn) clockOutBtn.disabled = true;
        }
    }

    clockIn() {
        const attendanceRecord = {
            id: Date.now(),
            employeeId: this.currentUser.id,
            employeeName: this.currentUser.name,
            date: this.currentDate,
            clockIn: new Date().toISOString(),
            status: 'present'
        };

        this.dataManager.addData('attendance', attendanceRecord);
        this.notificationSystem.addNotification('Clock In', 'You have successfully clocked in', 'success');
        this.showToast('Clocked in successfully!', 'success');
        
        this.loadAttendance();
    }

    clockOut() {
        const attendance = this.dataManager.getData('attendance');
        const todayRecord = attendance.find(a => 
            a.date === this.currentDate && a.employeeId === this.currentUser.id && !a.clockOut
        );

        if (todayRecord) {
            const clockOutTime = new Date();
            const clockInTime = new Date(todayRecord.clockIn);
            const diffMs = clockOutTime - clockInTime;
            const totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

            this.dataManager.updateData('attendance', todayRecord.id, {
                clockOut: clockOutTime.toISOString(),
                totalHours: totalHours
            });

            this.notificationSystem.addNotification('Clock Out', 'You have successfully clocked out', 'success');
            this.showToast('Clocked out successfully!', 'success');
            
            this.loadAttendance();
        } else {
            this.showToast('No clock-in record found for today!', 'error');
        }
    }

    takeBreak() {
        this.showToast('Break time recorded!', 'info');
        this.notificationSystem.addNotification('Break Time', 'Your break has been recorded', 'info');
    }

    filterAttendance() {
        // Simple filter implementation
        this.loadAttendance();
        this.showToast('Attendance filtered!', 'info');
    }

    // Task Management Methods
    showTaskModal() {
        const modal = document.getElementById('taskModal');
        const assigneeSelect = document.getElementById('taskAssignee');
        
        if (assigneeSelect) {
            const employees = this.dataManager.getData('employees');
            assigneeSelect.innerHTML = employees.map(emp => 
                `<option value="${emp.id}">${emp.name} (${emp.department})</option>`
            ).join('');
        }
        
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        
        if (modal) modal.style.display = 'none';
        if (form) form.reset();
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const task = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            assigneeId: parseInt(document.getElementById('taskAssignee').value),
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.dataManager.addData('tasks', task);
        
        const assignee = this.dataManager.getData('employees').find(e => e.id === task.assigneeId);
        if (assignee) {
            this.notificationSystem.addNotification(
                'New Task Assigned', 
                `You have been assigned: ${task.title}`, 
                'info'
            );
        }

        this.showToast('Task created successfully!', 'success');
        this.hideTaskModal();
        this.loadTasks();
    }

    loadTasks() {
        const tasks = this.dataManager.getData('tasks');
        const employees = this.dataManager.getData('employees');
        
        // Clear task lists
        ['todoTasks', 'progressTasks', 'completedTasks'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });

        tasks.forEach(task => {
            const assignee = employees.find(e => e.id === task.assigneeId);
            const taskElement = this.createTaskElement(task, assignee);
            
            let targetContainer;
            switch(task.status) {
                case 'pending':
                    targetContainer = document.getElementById('todoTasks');
                    break;
                case 'in-progress':
                    targetContainer = document.getElementById('progressTasks');
                    break;
                case 'completed':
                    targetContainer = document.getElementById('completedTasks');
                    break;
                default:
                    targetContainer = document.getElementById('todoTasks');
            }
            
            if (targetContainer && taskElement) {
                targetContainer.appendChild(taskElement);
            }
        });

        this.setupTaskDragAndDrop();
    }

    createTaskElement(task, assignee) {
        const div = document.createElement('div');
        div.className = `task-item ${task.priority}`;
        div.draggable = true;
        div.dataset.taskId = task.id;

        div.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
            </div>
            <div class="task-description">${task.description || 'No description'}</div>
            <div class="task-assignee">Assigned to: ${assignee?.name || 'Unknown'}</div>
            <div class="task-due">Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</div>
            <div class="task-actions">
                <select class="status-select">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>To Do</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        `;

        // Add event listener for status change
        const select = div.querySelector('.status-select');
        select.addEventListener('change', (e) => {
            this.updateTaskStatus(task.id, e.target.value);
        });

        return div;
    }

    updateTaskStatus(taskId, newStatus) {
        this.dataManager.updateData('tasks', taskId, { status: newStatus });
        this.showToast('Task status updated!', 'success');
        this.loadTasks();
        this.loadDashboard();
    }

    setupTaskDragAndDrop() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            });
        });

        const columns = document.querySelectorAll('.task-list');
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.dataset.status;
                
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    // Employee Management Methods
    showEmployeeModal() {
        const modal = document.getElementById('employeeModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideEmployeeModal() {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');
        
        if (modal) modal.style.display = 'none';
        if (form) form.reset();
    }

    handleEmployeeSubmit(e) {
        e.preventDefault();
        
        const employee = {
            name: document.getElementById('empName').value,
            email: document.getElementById('empEmail').value,
            department: document.getElementById('empDepartment').value,
            position: document.getElementById('empPosition').value,
            phone: document.getElementById('empPhone').value,
            status: 'active',
            joinDate: new Date().toISOString()
        };

        this.dataManager.addData('employees', employee);
        this.notificationSystem.addNotification(
            'New Employee Added',
            `${employee.name} has been added to ${employee.department} department`,
            'info'
        );

        this.showToast('Employee added successfully!', 'success');
        this.hideEmployeeModal();
        this.loadEmployees();
        this.loadDashboard();
    }

    loadEmployees() {
        const employees = this.dataManager.getData('employees');
        const tbody = document.getElementById('employeesBody');
        
        if (tbody) {
            tbody.innerHTML = employees.map(emp => `
                <tr>
                    <td>${emp.name}</td>
                    <td>${emp.email}</td>
                    <td>${emp.department}</td>
                    <td>${emp.position}</td>
                    <td><span class="status-badge ${emp.status}">${emp.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="app.editEmployee(${emp.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteEmployee(${emp.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    editEmployee(id) {
        this.showToast(`Edit employee ${id} - Feature coming soon!`, 'info');
    }

    deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            this.dataManager.deleteData('employees', id);
            this.showToast('Employee deleted successfully!', 'success');
            this.loadEmployees();
            this.loadDashboard();
        }
    }

    // Leave Management Methods
    handleLeaveSubmit(e) {
        e.preventDefault();
        
        const leaveRequest = {
            employeeId: this.currentUser.id,
            employeeName: this.currentUser.name,
            type: document.getElementById('leaveType').value,
            startDate: document.getElementById('leaveStart').value,
            endDate: document.getElementById('leaveEnd').value,
            reason: document.getElementById('leaveReason').value,
            status: 'pending',
            appliedDate: new Date().toISOString()
        };

        this.dataManager.addData('leaveRequests', leaveRequest);
        
        this.notificationSystem.addNotification(
            'Leave Application Submitted',
            `Your ${leaveRequest.type} leave request has been submitted`,
            'info'
        );

        this.showToast('Leave application submitted successfully!', 'success');
        e.target.reset();
        this.loadLeaveRequests();
    }

    loadLeaveRequests() {
        const leaveRequests = this.dataManager.getData('leaveRequests');
        const userRequests = leaveRequests.filter(lr => lr.employeeId === this.currentUser.id);
        
        const tbody = document.getElementById('leaveBody');
        if (tbody) {
            tbody.innerHTML = userRequests.map(request => `
                <tr>
                    <td>${request.type}</td>
                    <td>${new Date(request.startDate).toLocaleDateString()}</td>
                    <td>${new Date(request.endDate).toLocaleDateString()}</td>
                    <td>${request.reason}</td>
                    <td><span class="status-badge ${request.status}">${request.status}</span></td>
                </tr>
            `).join('');
        }
    }

    // Notification Methods
    loadNotifications() {
        const notifications = this.dataManager.getData('notifications');
        const container = document.getElementById('notificationsList');
        
        if (container) {
            container.innerHTML = notifications.slice().reverse().map(notification => `
                <div class="notification-item ${notification.read ? '' : 'unread'}" 
                     onclick="app.markNotificationAsRead(${notification.id})">
                    <div class="notification-content">
                        <strong>${notification.title}</strong>
                        <p>${notification.message}</p>
                        <div class="notification-time">
                            ${new Date(notification.timestamp).toLocaleString()}
                        </div>
                    </div>
                    ${!notification.read ? '<div class="unread-dot"></div>' : ''}
                </div>
            `).join('');
        }
    }

    markNotificationAsRead(id) {
        this.notificationSystem.markAsRead(id);
        this.loadNotifications();
    }

    markAllNotificationsRead() {
        this.notificationSystem.markAllAsRead();
        this.loadNotifications();
        this.showToast('All notifications marked as read', 'success');
    }

    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications?')) {
            this.notificationSystem.clearAll();
            this.loadNotifications();
            this.showToast('All notifications cleared', 'success');
        }
    }

    // Reports Methods
    loadReports() {
        this.generateAttendanceChart();
        this.generateTaskChart();
        this.generateDepartmentChart();
        this.generateLeaveChart();
    }

    generateAttendanceChart() {
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;

        // Sample data
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Hours Worked',
                    data: [8, 7.5, 8.5, 8, 7, 4, 0],
                    backgroundColor: 'rgba(54, 162, 235, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }

    generateTaskChart() {
        const ctx = document.getElementById('taskChart');
        if (!ctx) return;

        const tasks = this.dataManager.getData('tasks');
        const statusCounts = {
            pending: tasks.filter(t => t.status === 'pending').length,
            'in-progress': tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pending', 'In Progress', 'Completed'],
                datasets: [{
                    data: [statusCounts.pending, statusCounts['in-progress'], statusCounts.completed],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    generateDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        const employees = this.dataManager.getData('employees');
        const deptCounts = {};
        employees.forEach(emp => {
            deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
        });

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(deptCounts),
                datasets: [{
                    data: Object.values(deptCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    generateLeaveChart() {
        const ctx = document.getElementById('leaveChart');
        if (!ctx) return;

        // Sample data
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Leave Requests',
                    data: [12, 19, 8, 15, 12, 10],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Utility Methods
    showToast(message, type = 'success') {
        this.notificationSystem.showToast(message, type);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new CompanyManagementSystem();
});

// Add CSS for additional styles
const additionalStyles = `
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: capitalize;
    }
    
    .status-badge.present, .status-badge.active, .status-badge.completed {
        background: #d4edda;
        color: #155724;
    }
    
    .status-badge.pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .status-badge.absent, .status-badge.inactive {
        background: #f8d7da;
        color: #721c24;
    }
    
    .progress-bar {
        width: 100%;
        height: 20px;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
        margin: 0.5rem 0;
    }
    
    .progress-fill {
        height: 100%;
        background: var(--success-color);
        transition: width 0.3s ease;
    }
    
    .progress-text {
        text-align: center;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .unread-dot {
        width: 10px;
        height: 10px;
        background: var(--info-color);
        border-radius: 50%;
        margin-left: 1rem;
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
    }
    
    .task-priority {
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        font-size: 0.7rem;
        color: white;
        text-transform: uppercase;
    }
    
    .priority-high {
        background: var(--danger-color);
    }
    
    .priority-medium {
        background: var(--warning-color);
    }
    
    .priority-low {
        background: var(--success-color);
    }
    
    .attendance-record {
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
        font-size: 0.9rem;
    }
    
    .attendance-record:last-child {
        border-bottom: none;
    }
    
    .notification-item {
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .notification-item:hover {
        background-color: #f8f9fa;
    }
    
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .filter-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: center;
    }
    
    .filter-controls .form-control {
        width: auto;
    }
    
    .leave-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    
    @media (max-width: 768px) {
        .leave-container {
            grid-template-columns: 1fr;
        }
        
        .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);