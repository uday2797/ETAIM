let userName = localStorage.getItem('etaimUserName');
let locationSuggestionsCache = {}; // Cache to store suggestions

// --- 1. CSS STYLES (Injected into the DOM) ---
const styles = `
    :root {
        --primary-blue: #007bff;
        --dark-menu: #0d3b66;
        --light-bg: #f0f4f8;
        --app-bg: #ffffff;
    }

    body {
        font-family: 'Arial', sans-serif;
        background-color: var(--light-bg);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
    }

    .app-container {
        width: 375px;
        height: 800px;
        background-color: var(--app-bg);
        border-radius: 30px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        padding: 20px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
    }

    /* --- HEADER --- */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20px;
        color: var(--dark-menu);
    }

    .logo {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 1px;
    }

    .hamburger-menu i {
        font-size: 24px;
        cursor: pointer;
    }

    /* --- GREETING --- */
    .greeting {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        margin-bottom: 25px;
    }

    /* --- INPUT FIELDS & SUGGESTIONS --- */
    .location-inputs {
        position: relative;
    }

    .input-group {
        margin-bottom: 15px;
    }

    .input-group label {
        display: block;
        font-size: 12px;
        color: #888;
        margin-bottom: 5px;
        text-transform: uppercase;
    }

    .location-inputs input {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-sizing: border-box;
        font-size: 16px;
    }

    /* Custom Suggestions Box for Nominatim */
    #suggestions-box {
        position: absolute;
        width: 100%;
        top: 155px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;
        max-height: 200px;
        overflow-y: auto;
    }

    .suggestion-item {
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        font-size: 14px;
        color: #333;
        transition: background-color 0.1s;
    }

    .suggestion-item:hover {
        background-color: #f0f4f8;
    }

    /* --- AI DASHBOARD RECTANGLE --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 120px;
        margin-bottom: 40px;
    }

    .ai-dashboard-circle {
        width: 350px;
        height: 130px;
        background: linear-gradient(90deg, #ffb3b3, #ffe0b3, #ffffb3, #b3ffb3, #b3e0ff, #d1b3ff, #ffb3e6);
        border-radius: 25px;
        color: #111;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 700;
        text-align: center;
        font-size: 22px;
        box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
    }

    /* --- BOTTOM NAVIGATION --- */
    .bottom-nav {
        display: flex;
        justify-content: space-around;
        padding: 10px 0;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--app-bg);
        border-top: 1px solid #f0f0f0;
        border-bottom-left-radius: 30px;
        border-bottom-right-radius: 30px;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #999;
        cursor: pointer;
        font-size: 12px;
        padding: 5px;
    }

    .nav-item i {
        font-size: 20px;
        margin-bottom: 4px;
    }

    .nav-item.active {
        color: var(--primary-blue);
    }

    /* --- SIDE MENU --- */
    .side-menu-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .side-menu-overlay.closed {
        opacity: 0;
        visibility: hidden;
    }

    .side-menu {
        position: absolute;
        top: 55px;
        right: 20px;
        width: 180px;
        background-color: var(--dark-menu);
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        padding: 10px 0;
        color: white;
        display: flex;
        flex-direction: column;
    }

    .menu-item {
        padding: 12px 20px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .menu-item:hover {
        background-color: #1a4e85;
    }

    .menu-settings {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* --- MODAL (Name Prompt) --- */
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 12px;
        width: 80%;
        max-width: 300px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    /* --- PAGE OVERLAYS (Profile/Login/Settings) --- */
    .page-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 2000;
        padding: 20px;
        display: none;
        flex-direction: column;
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .page-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
    }

    .back-btn {
        font-size: 20px;
        margin-right: 10px;
        cursor: pointer;
        color: var(--dark-menu);
    }

    .page-title {
        font-size: 20px;
        font-weight: 600;
        color: var(--dark-menu);
    }

    .page-content {
        flex-grow: 1;
        overflow-y: auto;
        font-size: 15px;
        color: #333;
    }

    .info-item {
        margin-bottom: 10px;
    }

    .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .toggle input {
        transform: scale(1.2);
    }
`;

// --- 2. TEMPLATE ---
const getAppTemplate = (initialGreeting = '') => `
<div class="app-container">
    <div id="name-prompt-modal" class="modal-overlay">
        <div class="modal-content">
            <h3>Welcome!</h3>
            <p>Please enter your name to personalize your experience.</p>
            <input type="text" id="user-name-input" placeholder="Your Name">
            <button id="save-name-btn">Continue</button>
        </div>
    </div>

    <div id="side-menu-overlay" class="side-menu-overlay closed">
        <div class="side-menu">
            <div class="menu-item" data-page="profile">Profile</div>
            <div class="menu-item" data-page="login">Login</div>
            <div class="menu-item menu-settings" data-page="settings">Settings</div>
        </div>
    </div>

    <header class="header">
        <div class="logo">ETAIM</div>
        <div id="hamburger-btn" class="hamburger-menu"><i class="fas fa-bars"></i></div>
    </header>

    <div id="greeting-text" class="greeting">${initialGreeting}</div>

    <div class="location-inputs">
        <div class="input-group"><label>FROM</label><input type="text" id="from-input" placeholder="Enter departure location"></div>
        <div class="input-group"><label>TO</label><input type="text" id="to-input" placeholder="Enter destination"></div>
        <div id="suggestions-box" class="hidden"></div>
    </div>

    <div class="ai-dashboard-container"><div class="ai-dashboard-circle" id="ai-dashboard-btn">AI Dashboard</div></div>

    <nav class="bottom-nav">
        <div class="nav-item active"><i class="fas fa-car"></i><span>Commute</span></div>
        <div class="nav-item"><i class="fas fa-chart-line"></i><span>Dashboards</span></div>
        <div class="nav-item"><i class="fas fa-utensils"></i><span>Food</span></div>
    </nav>

    <!-- Profile / Login / Settings Pages -->
    <div id="profile-page" class="page-overlay">
        <div class="page-header"><span class="back-btn">←</span><span class="page-title">Profile</span></div>
        <div class="page-content">
            <div class="info-item"><strong>Name:</strong> ${userName || "Jane Doe"}</div>
            <div class="info-item"><strong>Email:</strong> jane.doe@example.com</div>
            <div class="info-item"><strong>Phone:</strong> +1 987 654 3210</div>
            <div class="info-item"><strong>Member since:</strong> Jan 2023</div>
        </div>
    </div>

    <div id="login-page" class="page-overlay">
        <div class="page-header"><span class="back-btn">←</span><span class="page-title">Login</span></div>
        <div class="page-content">
            <input type="email" placeholder="Email" style="width:100%;padding:10px;margin-bottom:10px;border-radius:6px;border:1px solid #ccc;">
            <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:10px;border-radius:6px;border:1px solid #ccc;">
            <button style="width:100%;padding:10px;border:none;border-radius:6px;background:#007bff;color:#fff;font-size:16px;">Login</button>
            <p style="text-align:center;margin-top:10px;color:#007bff;cursor:pointer;">Forgot password?</p>
        </div>
    </div>

    <div id="settings-page" class="page-overlay">
        <div class="page-header"><span class="back-btn">←</span><span class="page-title">Settings</span></div>
        <div class="page-content">
            <div class="toggle"><span>Notifications</span><input type="checkbox" checked></div>
            <div class="toggle"><span>Dark Mode</span><input type="checkbox"></div>
            <div class="info-item"><strong>App Version:</strong> 1.0.3</div>
        </div>
    </div>
</div>
`;

// --- 3. CORE LOGIC ---
function initApp() {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const getGreeting = (name) => {
        const hour = new Date().getHours();
        const time = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
        return `Good ${time}, ${name}!`;
    };

    const root = document.getElementById('app-root');
    root.innerHTML = getAppTemplate(userName ? getGreeting(userName) : "");

    // Element refs
    const nameModal = document.getElementById('name-prompt-modal');
    const nameInput = document.getElementById('user-name-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const greetText = document.getElementById('greeting-text');
    const menuBtn = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('side-menu-overlay');
    const aiBtn = document.getElementById('ai-dashboard-btn');

    // AI Dashboard
    aiBtn.addEventListener('click', () => alert("🚀 Opening AI Dashboard..."));

    // Show/hide side menu
    menuBtn.addEventListener('click', () => sideMenu.classList.toggle('closed'));
    sideMenu.addEventListener('click', (e) => {
        if (e.target.id === 'side-menu-overlay') sideMenu.classList.add('closed');
    });

    // Save name
    if (!userName) nameModal.classList.remove('hidden');
    saveNameBtn.addEventListener('click', () => {
        const n = nameInput.value.trim();
        if (!n) return alert("Please enter your name");
        userName = n;
        localStorage.setItem('etaimUserName', n);
        nameModal.classList.add('hidden');
        greetText.textContent = getGreeting(n);
    });

    // --- Side menu page logic ---
    const pages = {
        profile: document.getElementById('profile-page'),
        login: document.getElementById('login-page'),
        settings: document.getElementById('settings-page')
    };

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page && pages[page]) {
                sideMenu.classList.add('closed');
                pages[page].style.display = 'flex';
            }
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.page-overlay').style.display = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', initApp);
