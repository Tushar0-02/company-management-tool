// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLRmJjeIt0kfD_G5X14PdF51VCnkj7Jaw",
  authDomain: "instaphish-1218f.firebaseapp.com",
  projectId: "instaphish-1218f",
  storageBucket: "instaphish-1218f.appspot.com",
  messagingSenderId: "103826099482",
  appId: "1:103826099482:web:4fd85d62b0a160cc8230a3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Employee-specific JavaScript
class EmployeePortal {
    constructor() {
        this.currentUser = {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            department: 'IT',
            position: 'Software Developer',
            employeeId: 'EMP001'
        };
        
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.updateUserInfo();
        this.showSection('dashboard');
        this.loadInitialData();
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                this.showSection(target);
            });
        });

        // Attendance buttons
        document.getElementById('clockInBtn')?.addEventListener('click', () => this.clockIn());
        document.getElementById('clockOutBtn')?.addEventListener('click', () => this.clockOut());
        document.getElementById('breakBtn')?.addEventListener('click', () => this.takeBreak());

        // Task filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTasks(e.target.dataset.filter);
            });
        });

        // Forms
        document.querySelector('.leave-form')?.addEventListener('submit', (e) => this.handleLeaveSubmit(e));
        document.querySelector('.profile-form')?.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.querySelector('.emergency-form')?.addEventListener('submit', (e) => this.handleEmergencyUpdate(e));

        // Task modal
        const taskModalForm = document.querySelector('#taskModal form');
        if (taskModalForm) {
            taskModalForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }
        
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.hideTaskModal());
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    }

    async loadInitialData() {
        try {
            // Load tasks
            await this.loadTasks();
            
            // Load attendance records
            await this.loadAttendance();
            
            // Load leave records
            await this.loadLeaveHistory();
            
            // Load notifications
            await this.loadNotifications();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Error loading data', 'error');
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-target="${sectionName}"]`);
        if (navItem) navItem.classList.add('active');

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const section = document.getElementById(sectionName);
        if (section) section.classList.add('active');

        // Load section-specific data
        switch(sectionName) {
            case 'tasks':
                this.loadTasks();
                break;
            case 'attendance':
                this.loadAttendance();
                break;
            case 'leave':
                this.loadLeaveHistory();
                break;
            case 'notifications':
                this.loadNotifications();
                break;
        }
    }

    updateUserInfo() {
        const userElement = document.getElementById('currentEmployee');
        if (userElement) {
            userElement.textContent = `Welcome, ${this.currentUser.name}`;
        }
    }

    // Firebase Storage Methods

    // Attendance Methods
    async clockIn() {
        try {
            const attendanceData = {
                employeeId: this.currentUser.employeeId,
                employeeName: this.currentUser.name,
                clockIn: new Date(),
                date: new Date().toISOString().split('T')[0],
                status: 'present',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('attendance').add(attendanceData);
            
            this.showToast('Clocked in successfully!', 'success');
            document.getElementById('clockInBtn').disabled = true;
            document.getElementById('clockOutBtn').disabled = false;
            
            // Update UI
            const statusElement = document.querySelector('.current .status-badge');
            if (statusElement) {
                statusElement.textContent = 'Clocked In';
                statusElement.className = 'status-badge present';
            }

            await this.loadAttendance();
            
        } catch (error) {
            console.error('Error clocking in:', error);
            this.showToast('Error clocking in', 'error');
        }
    }

    async clockOut() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const attendanceQuery = await db.collection('attendance')
                .where('employeeId', '==', this.currentUser.employeeId)
                .where('date', '==', today)
                .get();

            if (!attendanceQuery.empty) {
                const doc = attendanceQuery.docs[0];
                await doc.ref.update({
                    clockOut: new Date(),
                    totalHours: this.calculateHours(doc.data().clockIn.toDate(), new Date())
                });
            }

            this.showToast('Clocked out successfully!', 'success');
            document.getElementById('clockInBtn').disabled = false;
            document.getElementById('clockOutBtn').disabled = true;
            
            // Update UI
            const statusElement = document.querySelector('.current .status-badge');
            if (statusElement) {
                statusElement.textContent = 'Clocked Out';
                statusElement.className = 'status-badge absent';
            }

            await this.loadAttendance();
            
        } catch (error) {
            console.error('Error clocking out:', error);
            this.showToast('Error clocking out', 'error');
        }
    }

    calculateHours(clockIn, clockOut) {
        const diff = clockOut - clockIn;
        return (diff / (1000 * 60 * 60)).toFixed(2);
    }

    takeBreak() {
        this.showToast('Break started!', 'info');
    }

    async loadAttendance() {
        try {
            const attendanceQuery = await db.collection('attendance')
                .where('employeeId', '==', this.currentUser.employeeId)
                .orderBy('date', 'desc')
                .limit(10)
                .get();

            const tbody = document.querySelector('.attendance-table tbody');
            if (tbody) {
                tbody.innerHTML = '';
                
                attendanceQuery.forEach(doc => {
                    const data = doc.data();
                    const row = this.createAttendanceRow(data);
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    }

    createAttendanceRow(data) {
        const row = document.createElement('tr');
        const clockInTime = data.clockIn ? data.clockIn.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
        const clockOutTime = data.clockOut ? data.clockOut.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
        
        row.innerHTML = `
            <td>${new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
            <td>${clockInTime}</td>
            <td>${clockOutTime}</td>
            <td>${data.totalHours || '-'}</td>
            <td><span class="status-badge ${data.status || 'present'}">${data.status || 'Present'}</span></td>
        `;
        
        return row;
    }

    // Task Methods
    showTaskModal() {
        document.getElementById('taskModal').style.display = 'block';
    }

    hideTaskModal() {
        document.getElementById('taskModal').style.display = 'none';
        const form = document.getElementById('taskModal').querySelector('form');
        if (form) form.reset();
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        try {
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                employeeId: this.currentUser.employeeId,
                employeeName: this.currentUser.name,
                status: 'pending',
                progress: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('tasks').add(taskData);
            
            this.showToast('Task created successfully!', 'success');
            this.hideTaskModal();
            await this.loadTasks();
            
        } catch (error) {
            console.error('Error creating task:', error);
            this.showToast('Error creating task', 'error');
        }
    }

    async loadTasks() {
        try {
            const tasksQuery = await db.collection('tasks')
                .where('employeeId', '==', this.currentUser.employeeId)
                .orderBy('createdAt', 'desc')
                .get();

            const tasksContainer = document.querySelector('.tasks-list-employee');
            if (tasksContainer) {
                tasksContainer.innerHTML = '';
                
                tasksQuery.forEach(doc => {
                    const task = doc.data();
                    task.id = doc.id;
                    const taskCard = this.createTaskCard(task);
                    tasksContainer.appendChild(taskCard);
                });
            }

            this.updateTaskStats(tasksQuery);
            
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = `task-card ${task.priority}-priority`;
        card.setAttribute('data-task-id', task.id);
        
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
        
        card.innerHTML = `
            <div class="task-header">
                <h4>${task.title}</h4>
                <div class="task-meta">
                    <span class="priority ${task.priority}">${task.priority}</span>
                    <span class="due-date">Due: ${dueDate}</span>
                </div>
            </div>
            <p class="task-description">${task.description || 'No description'}</p>
            <div class="task-footer">
                <div class="task-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                    <span>${task.progress}%</span>
                </div>
                <div class="task-actions">
                    ${task.status !== 'completed' ? `
                        <button class="btn btn-sm btn-success" onclick="app.updateTaskProgress('${task.id}', 100)">
                            <i class="fas fa-check"></i> Complete
                        </button>
                        <button class="btn btn-sm btn-info" onclick="app.updateTaskProgress('${task.id}', ${task.progress + 25})">
                            <i class="fas fa-edit"></i> Update
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-secondary" disabled>
                            <i class="fas fa-check"></i> Completed
                        </button>
                    `}
                </div>
            </div>
        `;
        
        return card;
    }

    updateTaskStats(tasksQuery) {
        let total = 0, pending = 0, inProgress = 0, completed = 0;
        
        tasksQuery.forEach(doc => {
            const task = doc.data();
            total++;
            if (task.status === 'completed') completed++;
            else if (task.progress > 0) inProgress++;
            else pending++;
        });

        // Update stats display
        const stats = document.querySelectorAll('.task-stat .stat-number');
        if (stats.length >= 4) {
            stats[0].textContent = total;
            stats[1].textContent = pending;
            stats[2].textContent = inProgress;
            stats[3].textContent = completed;
        }
    }

    async updateTaskProgress(taskId, progress) {
        try {
            const status = progress === 100 ? 'completed' : 'in-progress';
            
            await db.collection('tasks').doc(taskId).update({
                progress: progress,
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showToast('Task updated successfully!', 'success');
            await this.loadTasks();
            
        } catch (error) {
            console.error('Error updating task:', error);
            this.showToast('Error updating task', 'error');
        }
    }

    filterTasks(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.showToast(`Showing ${filter} tasks`, 'info');
        // Implement actual filtering logic here
    }

    // Leave Methods
    async handleLeaveSubmit(e) {
        e.preventDefault();
        try {
            const leaveData = {
                employeeId: this.currentUser.employeeId,
                employeeName: this.currentUser.name,
                type: document.getElementById('leaveType').value,
                startDate: document.getElementById('leaveStart').value,
                endDate: document.getElementById('leaveEnd').value,
                reason: document.getElementById('leaveReason').value,
                contact: document.getElementById('leaveContact').value,
                status: 'pending',
                appliedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('leaveApplications').add(leaveData);
            
            this.showToast('Leave application submitted successfully!', 'success');
            e.target.reset();
            await this.loadLeaveHistory();
            
        } catch (error) {
            console.error('Error submitting leave application:', error);
            this.showToast('Error submitting leave application', 'error');
        }
    }

    async loadLeaveHistory() {
        try {
            const leaveQuery = await db.collection('leaveApplications')
                .where('employeeId', '==', this.currentUser.employeeId)
                .orderBy('appliedAt', 'desc')
                .get();

            const tbody = document.querySelector('.leave-history-table tbody');
            if (tbody) {
                tbody.innerHTML = '';
                
                leaveQuery.forEach(doc => {
                    const data = doc.data();
                    const row = this.createLeaveHistoryRow(data);
                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading leave history:', error);
        }
    }

    createLeaveHistoryRow(data) {
        const row = document.createElement('tr');
        const typeIcon = data.type === 'vacation' ? 'fa-umbrella-beach' : 
                        data.type === 'sick' ? 'fa-bed' : 'fa-user-clock';
        
        const startDate = new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const endDate = new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const duration = Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        
        row.innerHTML = `
            <td><i class="fas ${typeIcon}"></i> ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${duration} days</td>
            <td>${data.reason}</td>
            <td><span class="status-badge ${data.status}">${data.status}</span></td>
        `;
        
        return row;
    }

    // Profile Methods
    async handleProfileUpdate(e) {
        e.preventDefault();
        try {
            const profileData = {
                name: document.getElementById('profileName').value,
                email: document.getElementById('profileEmail').value,
                phone: document.getElementById('profilePhone').value,
                dob: document.getElementById('profileDob').value,
                address: document.getElementById('profileAddress').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('employeeProfiles').doc(this.currentUser.employeeId).set(profileData, { merge: true });
            
            this.showToast('Profile updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Error updating profile', 'error');
        }
    }

    async handleEmergencyUpdate(e) {
        e.preventDefault();
        try {
            const emergencyData = {
                emergencyName: document.getElementById('emergencyName').value,
                emergencyRelation: document.getElementById('emergencyRelation').value,
                emergencyPhone: document.getElementById('emergencyPhone').value,
                emergencyEmail: document.getElementById('emergencyEmail').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('employeeProfiles').doc(this.currentUser.employeeId).set(emergencyData, { merge: true });
            
            this.showToast('Emergency contact updated!', 'success');
            
        } catch (error) {
            console.error('Error updating emergency contact:', error);
            this.showToast('Error updating emergency contact', 'error');
        }
    }

    // Notification Methods
    async loadNotifications() {
        try {
            const notificationsQuery = await db.collection('notifications')
                .where('employeeId', '==', this.currentUser.employeeId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const container = document.querySelector('.notifications-list-employee');
            if (container) {
                container.innerHTML = '';
                
                notificationsQuery.forEach(doc => {
                    const notification = doc.data();
                    const notificationItem = this.createNotificationItem(notification);
                    container.appendChild(notificationItem);
                });
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? '' : 'unread'}`;
        
        const iconClass = notification.type === 'urgent' ? 'fas fa-exclamation-circle' :
                         notification.type === 'info' ? 'fas fa-info-circle' :
                         notification.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        
        const iconType = notification.type === 'urgent' ? 'urgent' :
                        notification.type === 'info' ? 'info' :
                        notification.type === 'success' ? 'success' : 'warning';
        
        const timeAgo = this.getTimeAgo(notification.createdAt?.toDate());
        
        item.innerHTML = `
            <div class="notification-icon ${iconType}">
                <i class="${iconClass}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <span class="notification-time">${timeAgo}</span>
            </div>
            ${notification.action ? `
                <div class="notification-actions">
                    <button class="btn btn-sm btn-primary">${notification.action}</button>
                </div>
            ` : ''}
        `;
        
        return item;
    }

    getTimeAgo(date) {
        if (!date) return 'Recently';
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    markAllAsRead() {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
        this.showToast('All notifications marked as read', 'success');
    }

    clearNotifications() {
        if (confirm('Are you sure you want to clear all notifications?')) {
            document.querySelector('.notifications-list-employee').innerHTML = '';
            this.showToast('All notifications cleared', 'success');
        }
    }

    // Utility Methods
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.showToast('Logged out successfully', 'success');
            // In real app, redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
}

// Initialize the employee portal
document.addEventListener('DOMContentLoaded', function() {
    window.app = new EmployeePortal();
});