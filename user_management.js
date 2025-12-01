// ==========================================
// USER MANAGEMENT SCRIPT (MASTER ADMIN ONLY) - FINAL CORRECTED VERSION
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
// 1. Fetch and Display Users (CRITICAL: Checking for 403 Forbidden)
// ----------------------------------------------------
async function fetchUsers() {
    listMessageDiv.textContent = 'Loading users...';
    listMessageDiv.style.color = '#f1faee';
    userListBody.innerHTML = '';

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'GET',
            headers: {
                'X-Master-Pin': masterPin 
            }
        });
        
        if (response.status === 403) {
             listMessageDiv.textContent = 'AUTHORIZATION FAILED: Check MASTER_ADMIN_PIN value in Railway Env Vars.';
             listMessageDiv.style.color = '#e63946';
             throw new Error('403 Forbidden: Master Admin PIN rejected by server.');
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const users = await response.json();
        listMessageDiv.textContent = users.length === 0 ? 'No users found.' : '';

        // ... (Logic to display users remains the same)
        users.forEach(user => {
            const row = userListBody.insertRow();
            row.insertCell(0).textContent = user.id;
            row.insertCell(1).textContent = user.username;
            row.insertCell(2).textContent = user.role.toUpperCase();

            const actionCell = row.insertCell(3);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'remove-btn';
            removeButton.onclick = () => removeUser(user.username);
            actionCell.appendChild(removeButton);
        });
        
    } catch (error) {
        // ...
        console.error("Fetch Users Error:", error);
    }
}

// ----------------------------------------------------
// 2. Add New User (CRITICAL: Removed numeric validation)
// ----------------------------------------------------
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    addMessageDiv.textContent = 'Adding user...';
    addMessageDiv.style.color = '#f1faee';

    const username = document.getElementById('newUsername').value.trim();
    const role = document.getElementById('newRole').value;
    const pin = document.getElementById('newPin').value; // Password

    if (pin.length < 8) { 
        addMessageDiv.textContent = 'Password must be at least 8 characters long.';
        addMessageDiv.style.color = '#e63946';
        return;
    }
    
    // !!! CRITICAL FIX: REMOVED THE NUMERIC (DIGIT ONLY) CHECK HERE !!!

    try {
        const response = await fetch(`${BACKEND_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Pin': masterPin 
            },
            body: JSON.stringify({ 
                username: username, 
                role: role, 
                pin: pin 
            }) 
        });

        const data = await response.json();
        
        if (response.ok) {
            // ... (success logic)
        } else {
            // ... (error logic)
        }
    } catch (error) {
        // ... (network error logic)
    }
});

// ... (fetchUsers and removeUser functions)

fetchUsers();
