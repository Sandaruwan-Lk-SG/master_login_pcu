// ==========================================
// USER MANAGEMENT FRONTEND SCRIPT (script.js) - FINAL FIX ('pin' -> 'password')
// ==========================================

const BACKEND_URL = 'https://pcu-inventory-backend-production.up.railway.app'; 
const masterPin = localStorage.getItem('masterPin');
const userListBody = document.querySelector('#userList tbody');
const addMessageDiv = document.getElementById('addMessage');
const listMessageDiv = document.getElementById('listMessage');

// --- Initialization ---
if (!masterPin) {
    alert('Unauthorized Access. Please login as Master Admin.');
    window.location.href = 'index.html'; 
}

// 1. Fetch and Display Users (GET /api/users)
async function fetchUsers() {
    listMessageDiv.textContent = 'Loading users...';
    userListBody.innerHTML = '';

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'GET',
            headers: { 'X-Master-Pin': masterPin }
        });
        
        if (response.status === 403) {
             listMessageDiv.textContent = 'AUTHORIZATION FAILED: Master Admin PIN rejected. Session expired?';
             return;
        }
        if (!response.ok) { throw new Error(`Failed to fetch: ${response.statusText}`); }

        const users = await response.json();
        listMessageDiv.textContent = users.length === 0 ? 'No users found.' : '';

        users.forEach(user => {
            const row = userListBody.insertRow();
            row.insertCell(0).textContent = user.id; 
            row.insertCell(1).textContent = user.username;
            row.insertCell(2).textContent = user.role.toUpperCase();

            const actionCell = row.insertCell(3);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'btn btn-sm btn-danger';
            removeButton.onclick = () => removeUser(user.username); 
            actionCell.appendChild(removeButton);
        });
        
    } catch (error) {
        listMessageDiv.textContent = `Error loading users: ${error.message}. Check backend status.`;
    }
}

// 2. Add New User (POST /api/users)
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessageDiv.textContent = 'Adding user...';
    const username = document.getElementById('newUsername').value.trim();
    const role = document.getElementById('newRole').value;
    const password = document.getElementById('newPassword').value; // ✅ CHANGED: Reads 'newPassword'

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Master-Pin': masterPin },
            body: JSON.stringify({ username, role, password }) // ✅ CHANGED: Sends 'password'
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessageDiv.textContent = `User ${username} created successfully!`;
            addMessageDiv.className = 'text-success';
            document.getElementById('addUserForm').reset();
            fetchUsers();
        } else if (response.status === 409) {
             addMessageDiv.textContent = `Error: Username '${username}' already exists.`;
             addMessageDiv.className = 'text-danger';
        } else {
             const errorMessage = data.error || data.message || response.statusText;
             addMessageDiv.textContent = `Failed to add user: ${errorMessage}`;
             addMessageDiv.className = 'text-danger';
        }
    } catch (error) {
        addMessageDiv.textContent = 'Network Error! Failed to connect to backend.';
        addMessageDiv.className = 'text-danger';
    }
});


// 3. Remove Existing User (DELETE /api/users/:username)
async function removeUser(username) {
    if (!confirm(`Are you sure you want to remove the user: ${username}?`)) { return; }
    listMessageDiv.textContent = `Attempting to remove user ${username}...`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${username}`, {
            method: 'DELETE', 
            headers: { 'X-Master-Pin': masterPin }
        });

        if (response.ok || response.status === 204) {
            listMessageDiv.textContent = `User ${username} successfully removed.`;
            listMessageDiv.className = 'text-success';
            fetchUsers();
        } else if (response.status === 404) {
            listMessageDiv.textContent = `User ${username} not found.`;
            listMessageDiv.className = 'text-warning';
        } else {
            listMessageDiv.textContent = `Deletion failed: ${response.statusText}`;
            listMessageDiv.className = 'text-danger';
        }
    } catch (error) {
        listMessageDiv.textContent = 'Network or Server Error during deletion.';
        listMessageDiv.className = 'text-danger';
    }
}

// Initial Execution
fetchUsers();
