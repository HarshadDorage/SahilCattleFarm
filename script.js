document.addEventListener('DOMContentLoaded', function() {
    // Initialize records from localStorage or empty array
    let records = JSON.parse(localStorage.getItem('semenRecords')) || [];
    let currentUser = null;
    
    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const recordForm = document.getElementById('recordForm');
    const showFormBtn = document.getElementById('showFormBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const semenForm = document.getElementById('semenForm');
    const quickSearch = document.getElementById('quickSearch');
    const quickSearchBtn = document.getElementById('quickSearchBtn');
    const animalModal = document.getElementById('animalModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const summaryCards = document.getElementById('summaryCards');
    const deleteRecordBtn = document.getElementById('deleteRecordBtn');
    
    // Set default date and time
    function setDefaultDateTime() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().substring(0, 5);
        
        document.getElementById('adminDate').value = dateStr;
        document.getElementById('adminTime').value = timeStr;
    }
    
    // Login functionality
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Simple authentication (in real app, use proper authentication)
        if (username === 'admin' && password === 'admin123') {
            currentUser = { username: username, loginTime: new Date() };
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            setDefaultDateTime();
            updateSummaryCards();
            displayRecords(records);
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid credentials!', 'error');
        }
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        appContainer.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        loginForm.reset();
    });
    
    // Show/hide form
    showFormBtn.addEventListener('click', function() {
        document.getElementById('formTitle').textContent = 'New Semen Record';
        document.getElementById('recordId').value = '';
        semenForm.reset();
        setDefaultDateTime();
        deleteRecordBtn.classList.add('hidden');
        recordForm.classList.remove('hidden');
    });
    
    closeFormBtn.addEventListener('click', function() {
        recordForm.classList.add('hidden');
    });
    
    // Form submission
    semenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const recordId = document.getElementById('recordId').value;
        const animalId = document.getElementById('animalId').value.trim();
        const animalName = document.getElementById('animalName').value.trim();
        const semenType = document.getElementById('semenType').value.trim();
        const adminDate = document.getElementById('adminDate').value;
        const adminTime = document.getElementById('adminTime').value;
        const isRepeat = document.getElementById('isRepeat').checked;
        
        const datetimeGiven = `${adminDate}T${adminTime}`;
        const timestamp = new Date(datetimeGiven).getTime();
        
        const recordData = {
            id: animalId,
            name: animalName || 'Unnamed',
            semenType: semenType,
            dateGiven: adminDate,
            timeGiven: adminTime,
            datetimeGiven: datetimeGiven,
            isRepeat: isRepeat,
            timestamp: timestamp,
            lastUpdated: new Date().toISOString()
        };
        
        if (recordId) {
            // Update existing record
            const index = records.findIndex(r => r.timestamp === parseInt(recordId));
            if (index !== -1) {
                records[index] = recordData;
                showNotification('Record updated successfully!', 'success');
            }
        } else {
            // Add new record
            records.push(recordData);
            showNotification('Record added successfully!', 'success');
        }
        
        localStorage.setItem('semenRecords', JSON.stringify(records));
        
        // Reset and hide form
        semenForm.reset();
        recordForm.classList.add('hidden');
        setDefaultDateTime();
        
        // Update display
        updateSummaryCards();
        displayRecords(records);
    });
    
    // Delete record
    deleteRecordBtn.addEventListener('click', function() {
        const recordId = document.getElementById('recordId').value;
        if (!recordId) return;
        
        if (confirm('Are you sure you want to delete this record?')) {
            records = records.filter(r => r.timestamp !== parseInt(recordId));
            localStorage.setItem('semenRecords', JSON.stringify(records));
            
            showNotification('Record deleted successfully!', 'success');
            recordForm.classList.add('hidden');
            updateSummaryCards();
            displayRecords(records);
        }
    });
    
    // Quick search functionality
    function performSearch() {
        const searchTerm = quickSearch.value.toLowerCase();
        
        if (!searchTerm) {
            displayRecords(records);
            updateSummaryCards();
            return;
        }
        
        const filteredRecords = records.filter(record => 
            record.id.toLowerCase().includes(searchTerm) || 
            record.name.toLowerCase().includes(searchTerm)
        );
        
        displayRecords(filteredRecords);
    }
    
    quickSearchBtn.addEventListener('click', performSearch);
    quickSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Display records in table
    function displayRecords(recordsToDisplay) {
        const tableBody = document.getElementById('recordsTable');
        tableBody.innerHTML = '';
        
        // Update record count
        document.getElementById('recordCount').textContent = `${recordsToDisplay.length} records`;
        
        if (recordsToDisplay.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" class="px-3 py-4 text-sm text-gray-500 text-center">
                    No records found
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }
        
        // Sort by date (newest first)
        recordsToDisplay.sort((a, b) => b.timestamp - a.timestamp);
        
        recordsToDisplay.forEach(record => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-3 py-2 text-sm font-medium text-gray-900">${record.id}</td>
                <td class="px-3 py-2 text-sm text-gray-500">${record.name}</td>
                <td class="px-3 py-2 text-sm text-gray-500">
                    ${formatDate(record.dateGiven)} at ${record.timeGiven}
                </td>
                <td class="px-3 py-2 text-sm text-gray-500">
                    ${record.isRepeat ? '🔁' : '➡️'} ${record.semenType}
                </td>
                <td class="px-3 py-2 text-sm text-gray-500">
                    <button class="edit-btn text-indigo-600 hover:text-indigo-900 mr-2" data-id="${record.timestamp}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="view-btn text-green-600 hover:text-green-900" data-id="${record.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const recordId = this.getAttribute('data-id');
                editRecord(recordId);
            });
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const animalId = this.getAttribute('data-id');
                showAnimalDetails(animalId);
            });
        });
    }
    
    // Edit record
    function editRecord(recordId) {
        const record = records.find(r => r.timestamp === parseInt(recordId));
        if (!record) return;
        
        document.getElementById('formTitle').textContent = 'Edit Record';
        document.getElementById('recordId').value = record.timestamp;
        document.getElementById('animalId').value = record.id;
        document.getElementById('animalName').value = record.name;
        document.getElementById('semenType').value = record.semenType;
        document.getElementById('adminDate').value = record.dateGiven;
        document.getElementById('adminTime').value = record.timeGiven;
        document.getElementById('isRepeat').checked = record.isRepeat;
        
        deleteRecordBtn.classList.remove('hidden');
        recordForm.classList.remove('hidden');
    }
    
    // Update summary cards
    function updateSummaryCards() {
        const totalAnimals = new Set(records.map(r => r.id)).size;
        const totalAdministrations = records.length;
        const repeatAdministrations = records.filter(r => r.isRepeat).length;
        
        // Get today's date for filtering
        const today = new Date().toISOString().split('T')[0];
        const todaysRecords = records.filter(r => r.dateGiven === today).length;
        
        summaryCards.innerHTML = `
            <div class="bg-blue-50 p-3 rounded-lg">
                <div class="text-blue-800 text-xs font-medium">Total Animals</div>
                <div class="text-blue-600 text-2xl font-bold mt-1">${totalAnimals}</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
                <div class="text-green-800 text-xs font-medium">Today's Doses</div>
                <div class="text-green-600 text-2xl font-bold mt-1">${todaysRecords}</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
                <div class="text-purple-800 text-xs font-medium">Total Doses</div>
                <div class="text-purple-600 text-2xl font-bold mt-1">${totalAdministrations}</div>
            </div>
        `;
    }
    
    // Show animal details modal
    function showAnimalDetails(animalId) {
        const animalRecords = records.filter(record => record.id === animalId);
        
        if (animalRecords.length === 0) return;
        
        // Sort by date (oldest first)
        animalRecords.sort((a, b) => a.timestamp - b.timestamp);
        
        const firstRecord = animalRecords[0];
        const lastRecord = animalRecords[animalRecords.length - 1];
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];
        
        const totalDays = Math.floor((today - new Date(firstRecord.datetimeGiven)) / (1000 * 60 * 60 * 24));
        const daysSinceLast = Math.floor((today - new Date(lastRecord.datetimeGiven)) / (1000 * 60 * 60 * 24));
        const repeatCount = animalRecords.filter(record => record.isRepeat).length;
        
        // Count doses given on the current day
        const todaysDoses = animalRecords.filter(r => r.dateGiven === todayDate).length;
        
        // Create modal content
        document.getElementById('modalTitle').textContent = `${animalId} - ${firstRecord.name}`;
        
        let recordsHtml = animalRecords.map(record => `
            <div class="py-2 border-b last:border-0">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-medium">${formatDate(record.dateGiven)}</span>
                        <span class="text-xs text-gray-500 ml-2">at ${record.timeGiven}</span>
                    </div>
                    <span class="text-xs ${getDaysPassed(record.datetimeGiven) > 30 ? 'text-green-600' : 'text-yellow-600'}">
                        ${getDaysPassed(record.datetimeGiven)}d ago
                    </span>
                </div>
                <div class="text-sm text-gray-600 mt-1">
                    <span class="font-medium">${record.semenType}</span>
                    ${record.isRepeat ? '<span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Repeat</span>' : ''}
                </div>
            </div>
        `).join('');
        
        document.getElementById('modalContent').innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="text-blue-800 text-xs font-medium">Total Doses</div>
                        <div class="text-blue-600 text-xl font-bold mt-1">${animalRecords.length}</div>
                    </div>
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="text-green-800 text-xs font-medium">Today's Doses</div>
                        <div class="text-green-600 text-xl font-bold mt-1">${todaysDoses}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-purple-50 p-3 rounded-lg">
                        <div class="text-purple-800 text-xs font-medium">Repeat Doses</div>
                        <div class="text-purple-600 text-xl font-bold mt-1">${repeatCount}</div>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-lg">
                        <div class="text-yellow-800 text-xs font-medium">Days Since Last</div>
                        <div class="text-yellow-600 text-xl font-bold mt-1">${daysSinceLast}</div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-lg">
                    <div class="text-gray-800 text-xs font-medium">First Administration</div>
                    <div class="text-gray-600 text-sm mt-1">${formatDate(firstRecord.dateGiven)} at ${firstRecord.timeGiven}</div>
                </div>
                
                <div>
                    <h4 class="font-medium text-gray-800 mb-2">All Administrations</h4>
                    <div class="max-h-60 overflow-y-auto">
                        ${recordsHtml}
                    </div>
                </div>
            </div>
        `;
        
        animalModal.classList.remove('hidden');
    }
    
    // Close modal
    closeModalBtn.addEventListener('click', function() {
        animalModal.classList.add('hidden');
    });
    
    // Helper functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function getDaysPassed(datetimeString) {
        const dateGiven = new Date(datetimeString);
        const today = new Date();
        return Math.floor((today - dateGiven) / (1000 * 60 * 60 * 24));
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-md text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Initialize default date/time
    setDefaultDateTime();
});