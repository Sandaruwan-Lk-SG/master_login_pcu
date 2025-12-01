// ==========================================
// USER MANAGEMENT SCRIPT (MASTER ADMIN ONLY) - FINAL CORRECTED PASSWORD
// ==========================================

const BACKEND_URL = 'https://pcu-inventory-backend-production.up.railway.app'; 
const masterPin = localStorage.getItem('masterPin');
const userListBody = document.querySelector('#userList tbody');
const addMessageDiv = document.getElementById('addMessage');
const listMessageDiv = document.getElementById('listMessage');

if (!masterPin) {
    alert('Unauthorized Access. Please login as Master Admin.');
    window.location.href = 'index.html';
}

// ----------------------------------------------------
// 1. Fetch and Display Users (CRITICAL: Needs masterPin header)
// ----------------------------------------------------
async function fetchUsers() {
    listMessageDiv.textContent = 'Loading users...';
    listMessageDiv.style.color = '#f1faee';
    userListBody.innerHTML = '';

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'GET',
            headers: {
                'X-Master-Pin': masterPin // CRITICAL HEADER
            }
        });
        
        if (response.status === 403) {
             throw new Error('403 Forbidden: Master Admin PIN rejected by server. (Check Railway ENV VAR)');
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const users = await response.json();
        listMessageDiv.textContent = ''; 
        // ... (display logic)
        
    } catch (error) {
        listMessageDiv.textContent = `Error loading users: ${error.message}`;
        listMessageDiv.style.color = '#e63946';
        console.error("Fetch Users Error:", error);
    }
}

// ----------------------------------------------------
// 2. Add New User (Password validation added)
// ----------------------------------------------------
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessageDiv.textContent = 'Adding user...';
    addMessageDiv.style.color = '#f1faee';

    const username = document.getElementById('newUsername').value.trim();
    const role = document.getElementById('newRole').value;
    const pin = document.getElementById('newPin').value; // Password

    if (pin.length < 8) { // Minimum 8 character password check
        addMessageDiv.textContent = 'Password must be at least 8 characters long.';
        addMessageDiv.style.color = '#e63946';
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Pin': masterPin // CRITICAL HEADER
            },
            body: JSON.stringify({ 
                username: username, 
                role: role, 
                pin: pin 
            }) 
        });

        const data = await response.json();
        
        if (response.ok) {
            addMessageDiv.textContent = `User ${data.username} added successfully!`;
            addMessageDiv.style.color = '#64ffda'; 
            document.getElementById('addUserForm').reset(); 
            fetchUsers(); 
        } else {
            addMessageDiv.textContent = data.error || data.message || `Failed to add user (Status: ${response.status}).`;
            addMessageDiv.style.color = '#e63946';
        }
    } catch (error) {
        addMessageDiv.textContent = 'Network Error! Check Backend status.';
        addMessageDiv.style.color = '#e63946';
        console.error("Add User Network Error:", error);
    }
});

// ----------------------------------------------------
// 3. Remove User (CRITICAL: Needs masterPin header)
// ----------------------------------------------------
async function removeUser(username) {
    if (!confirm(`Are you sure you want to remove user: ${username}?`)) {
        return;
    }
    // ... (message setup)
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/users/${encodeURIComponent(username)}`, {
            method: 'DELETE',
            headers: {
                'X-Master-Pin': masterPin // CRITICAL HEADER
            }
        });
        // ... (rest of the logic)
    } catch (error) {
        // ...
    }
}

fetchUsers();
