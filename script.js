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
        width: 400px;
        height: 900px;
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

    /* --- AI DASHBOARD RECTANGLE (RAINBOW) --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 80px;
        margin-bottom: 40px;
    }

    .ai-dashboard-circle {
        width: 100%;
        max-width: 280px;
        height: 150px;
        background: linear-gradient(
            90deg,
            red,
            orange,
            yellow,
            green,
            blue,
            indigo,
            violet
        );
        border-radius: 25px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 20px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.05);
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
        height: auto;
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

    /* --- PAGE VIEW (Profile/Login/Settings) --- */
    .page-view {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--app-bg);
        border-radius: 30px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 1100;
        display: none;
        flex-direction: column;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        font-weight: bold;
        color: var(--dark-menu);
        background: #f9f9f9;
    }

    .back-btn {
        margin-right: 10px;
        font-size: 18px;
        cursor: pointer;
        color: var(--dark-menu);
    }

    .page-content {
        padding: 20px;
        overflow-y: auto;
        flex-grow: 1;
    }

    .hidden {
        display: none !important;
    }
`;

// --- 2. HTML TEMPLATE ---
const getAppTemplate = (initialGreeting = '') => `
    <div class="app-container">
        <div id="side-menu-overlay" class="side-menu-overlay closed">
            <div class="side-menu">
                <div class="menu-item" data-page="profile">Profile</div>
                <div class="menu-item" data-page="login">Login</div>
                <div class="menu-item" data-page="settings">Settings</div>
            </div>
        </div>

        <header class="header">
            <div class="logo">ETAIM</div>
            <div id="hamburger-btn" class="hamburger-menu"><i class="fas fa-bars"></i></div>
        </header>

        <div id="greeting-text" class="greeting">
            ${initialGreeting}
        </div>

        <div class="location-inputs">
            <div class="input-group">
                <label>FROM</label>
                <input type="text" id="from-input" placeholder="Enter departure location">
            </div>
            <div class="input-group">
                <label>TO</label>
                <input type="text" id="to-input" placeholder="Enter destination">
            </div>
            <div id="suggestions-box" class="hidden"></div>
        </div>

        <div class="ai-dashboard-container">
            <div class="ai-dashboard-circle">🌈 AI Dashboard</div>
        </div>

        <nav class="bottom-nav">
            <div class="nav-item active">
                <i class="fas fa-car"></i>
                <span>Commute</span>
            </div>
            <div class="nav-item">
                <i class="fas fa-chart-line"></i>
                <span>Dashboards</span>
            </div>
            <div class="nav-item">
                <i class="fas fa-utensils"></i>
                <span>Food</span>
            </div>
        </nav>

        <!-- Hidden Pages -->
        <div id="profile-page" class="page-view">
            <div class="page-header"><span class="back-btn"><i class="fas fa-arrow-left"></i></span>Profile</div>
            <div class="page-content">
                <p><strong>Name:</strong> ${userName || "Guest User"}</p>
                <p><strong>Email:</strong> user@example.com</p>
                <p><strong>Phone:</strong> +91-9876543210</p>
                <p><strong>Joined:</strong> October 2025</p>
            </div>
        </div>

        <div id="login-page" class="page-view">
            <div class="page-header"><span class="back-btn"><i class="fas fa-arrow-left"></i></span>Login</div>
            <div class="page-content">
                <label>Email:</label>
                <input type="email" placeholder="Enter your email" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:8px;">
                <label>Password:</label>
                <input type="password" placeholder="Enter your password" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
                <button style="width:100%;padding:12px;background:var(--primary-blue);color:white;border:none;border-radius:8px;margin-top:15px;cursor:pointer;">Login</button>
                <p style="text-align:center;margin-top:15px;color:#555;">Forgot password?</p>
            </div>
        </div>

        <div id="settings-page" class="page-view">
            <div class="page-header"><span class="back-btn"><i class="fas fa-arrow-left"></i></span>Settings</div>
            <div class="page-content">
                <p><strong>Notifications:</strong> <input type="checkbox" checked></p>
                <p><strong>Dark Mode:</strong> <input type="checkbox"></p>
                <p><strong>Language:</strong> English</p>
                <p><strong>App Version:</strong> 1.0.0</p>
            </div>
        </div>
    </div>
`;

// --- 3. CORE LOGIC ---
function initApp() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    const root = document.getElementById('app-root');
    const getGreeting = (name) => {
        const hour = new Date().getHours();
        let timeOfDay;
        if (hour < 12) timeOfDay = 'Morning';
        else if (hour < 18) timeOfDay = 'Afternoon';
        else timeOfDay = 'Evening';
        return `Good ${timeOfDay}, ${name}!`;
    };
    root.innerHTML = getAppTemplate(userName ? getGreeting(userName) : '');

    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    hamburgerBtn.addEventListener('click', () => {
        sideMenuOverlay.classList.toggle('closed');
    });
    sideMenuOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'side-menu-overlay') sideMenuOverlay.classList.add('closed');
    });

    // Handle menu page navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.dataset.page + '-page';
            sideMenuOverlay.classList.add('closed');
            document.getElementById(pageId).style.display = 'flex';
        });
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.page-view').style.display = 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', initApp);
