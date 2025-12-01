// ==========================================
// 1. CONFIGURATION
// ==========================================
// Railway Backend URL එක මෙතනට දාන්න
const API_BASE_URL = "https://pcu-inventory-backend-production.up.railway.app";

let currentUser = null; // ලොග් වුනාට පස්සේ user විස්තර මෙතන save වෙනවා
let allItems = [];      // Search කරනකොට වේගෙන් පෙන්නන්න item list එක මෙතන තියාගන්නවා

// ==========================================
// 2. DOM ELEMENTS (HTML එකේ තියෙන IDs)
// ==========================================
const loginScreen = document.getElementById('login-screen');
const appScreen   = document.getElementById('app');

// Login Elements
const loginNameSelect = document.getElementById('login-name');
const loginPinInput   = document.getElementById('login-pin');
const loginBtn        = document.getElementById('btn-login');

// Transaction Elements
const searchInput     = document.getElementById('item-search');
const qtyInput        = document.getElementById('trans-qty');
const destInput       = document.getElementById('trans-destination');
const btnIn           = document.getElementById('btn-in');
const btnOut          = document.getElementById('btn-out');

// ==========================================
// 3. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. මුලින්ම Login Screen එක පෙන්නන්න
    loginScreen.style.display = 'block';
    appScreen.style.display = 'none';

    // 2. Buttons වලට click events දාගන්න
    loginBtn.addEventListener('click', handleLogin);
    btnIn.addEventListener('click', () => handleTransaction('IN'));
    btnOut.addEventListener('click', () => handleTransaction('OUT'));

    // 3. Live Search සඳහා listener එකක්
    searchInput.addEventListener('input', handleSearchInput);
});

// ==========================================
// 4. SECURE LOGIN LOGIC 🔐
// ==========================================
async function handleLogin() {
    const selectedName = loginNameSelect.value;
    const enteredPin = loginPinInput.value;

    if (!enteredPin) return alert("PIN එක ඇතුලත් කරන්න.");

    try {
        // PIN එක කෙලින්ම Server එකට යවනවා check කරන්න
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: enteredPin })
        });

        const result = await response.json();

        if (result.success) {
            // Login Success!
            currentUser = { 
                name: selectedName, // User තෝරාගත් නම
                role: result.role   // Server එකෙන් දුන්න role එක (admin/user)
            };

            alert(`Welcome, ${selectedName} (${result.role})`);
            
            // Screen එක මාරු කරන්න
            loginScreen.style.display = 'none';
            appScreen.style.display = 'block';

            // Items ටික load කරගන්න
            fetchItems();
        } else {
            // Login Failed
            alert("PIN එක වැරදියි!");
            loginPinInput.value = ''; // Clear PIN
        }

    } catch (error) {
        console.error("Login Error:", error);
        alert("Server connection error.");
    }
}

// ==========================================
// 5. DATA FETCHING (ITEMS)
// ==========================================
async function fetchItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/items`);
        if (!response.ok) throw new Error("Failed to fetch");

        allItems = await response.json();
        console.log("Items Loaded:", allItems.length);
        
        // Search List එක update කරන්න (Datalist එකක් තියෙනවා නම්)
        updateDatalist(allItems);

    } catch (error) {
        console.error("Error loading items:", error);
    }
}

function updateDatalist(items) {
    const dataList = document.getElementById('item-list');
    if (!dataList) return;

    dataList.innerHTML = ''; // පරණ ලිස්ට් එක clear කරන්න
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.sku;
        option.innerText = `${item.name} | Stock: ${item.current_stock}`;
        dataList.appendChild(option);
    });
}

function handleSearchInput(e) {
    // මේකෙන් අපි SKU එක ගැහුවම නම හෝ category එක පෙන්නන්න පුළුවන්
    const val = e.target.value;
    const match = allItems.find(i => i.sku === val);
    
    // අවශ්‍ය නම් UI එකේ කොහේ හරි Item නම පෙන්නන්න පුළුවන්
    if (match) {
        // උදාහරණයට: document.getElementById('item-name-display').innerText = match.name;
        searchInput.style.borderColor = "green"; // Found!
    } else {
        searchInput.style.borderColor = "";
    }
}

// ==========================================
// 6. TRANSACTION LOGIC (IN / OUT) 📦
// ==========================================
async function handleTransaction(type) {
    const sku = searchInput.value.trim();
    const qty = parseInt(qtyInput.value);
    const destination = destInput.value;

    // Validation
    if (!sku) return alert("SKU එක ඇතුලත් කරන්න.");
    if (!qty || qty <= 0) return alert("නිවැරදි ප්‍රමාණයක් ඇතුලත් කරන්න.");
    if (type === 'OUT' && !destination) return alert("OUT කරන විට Destination (Line No) අවශ්‍යයි.");

    const payload = {
        sku: sku,
        type: type, // 'IN' or 'OUT'
        qty: qty,
        user_logged: currentUser.name, // ලොග් වී සිටින කෙනා
        destination: destination || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            alert(`සාර්ථකයි! නව Stock එක: ${result.newStock}`);
            // Inputs clear කරන්න
            qtyInput.value = '';
            searchInput.value = '';
            destInput.value = '';
            // Stock එක update කරගන්න ආයේ load කරනවා
            fetchItems();
        } else {
            alert(`Error: ${result.message}`);
        }

    } catch (error) {
        console.error("Transaction Error:", error);
        alert("Transaction failed via Server.");
    }
}
