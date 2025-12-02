// ==========================================
// USER MANAGEMENT FRONTEND SCRIPT (script.js) - FINAL FIX (Password Validation Removed)
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

// 1. Fetch and Display Users (GET /api/users) - (Remains unchanged)
async function fetchUsers() { /* ... */ } // (Keep the original fetchUsers function)


// 2. Add New User (POST /api/users) - FIX APPLIED HERE
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessageDiv.textContent = 'Adding user...';
    const username = document.getElementById('newUsername').value.trim();
    const role = document.getElementById('newRole').value;
    const pin = document.getElementById('newPin').value;

    // 🛑 REMOVED: if (pin.length < 8) { ... }

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Master-Pin': masterPin },
            body: JSON.stringify({ username, role, pin }) 
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessageDiv.textContent = `User ${username} created successfully!`;
            document.getElementById('addUserForm').reset();
            fetchUsers();
        } else if (response.status === 409) {
             addMessageDiv.textContent = `Error: Username '${username}' already exists.`;
        } else {
             // Display specific error message from the backend
             const errorMessage = data.error || data.message || response.statusText;
             addMessageDiv.textContent = `Failed to add user: ${errorMessage}`;
        }
    } catch (error) {
        addMessageDiv.textContent = 'Network Error! Failed to connect to backend.';
    }
});


// 3. Remove Existing User (DELETE /api/users/:username) - (Remains unchanged)
async function removeUser(username) { /* ... */ } // (Keep the original removeUser function)


// Initial Execution
fetchUsers();
