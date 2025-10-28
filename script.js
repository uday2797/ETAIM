let userName = localStorage.getItem('etaimUserName');
let locationSuggestionsCache = {}; // Cache for Nominatim suggestions

// --- CSS Styles ---
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

    /* Header */
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

    .back-btn {
        font-size: 22px;
        cursor: pointer;
        color: var(--dark-menu);
        margin-bottom: 15px;
        display: inline-block;
    }

    /* Greeting */
    .greeting {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        margin-bottom: 25px;
    }

    /* Location Inputs */
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

    /* Search Button */
    #search-btn {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: var(--primary-blue);
        color: white;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: 0.2s;
        margin-bottom: 25px;
    }

    #search-btn:hover {
        background: #0056b3;
    }

    /* Suggestions */
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

    /* --- AI DASHBOARD CIRCLE (enlarged & centered) --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 50px;
        margin-bottom: 40px;
    }

    .ai-dashboard-circle {
        width: 190px;
        height: 190px;
        background: linear-gradient(135deg, #007bff, #00c6ff, #ff6f00, #ff00a6);
        background-size: 400% 400%;
        animation: rainbowShift 6s infinite linear;
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 18px;
        box-shadow: 0 8px 30px rgba(0, 123, 255, 0.4);
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.08);
    }

    @keyframes rainbowShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Bottom Nav */
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

    /* Pages */
    .page {
        padding: 20px;
        color: #333;
    }

    .page h2 {
        margin-top: 0;
        color: var(--dark-menu);
    }

    /* Registration form */
    .form-input {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 15px;
    }

    .form-btn {
        width: 100%;
        background: var(--primary-blue);
        color: white;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
    }

    .form-btn:hover {
        background: #0056b3;
    }

    .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
    }
`;

// --- HTML Template ---
const getAppTemplate = (greeting = '') => `
    <div class="app-container">
        <header class="header">
            <div class="logo">ETAIM</div>
            <div id="hamburger-btn" class="hamburger-menu"><i class="fas fa-bars"></i></div>
        </header>

        <div id="side-menu-overlay" class="side-menu-overlay closed">
            <div class="side-menu">
                <div class="menu-item" id="profile-btn">Profile</div>
                <div class="menu-item" id="login-btn">Login</div>
                <div class="menu-item" id="register-btn">Register</div>
                <div class="menu-item menu-settings" id="settings-btn">Settings</div>
            </div>
        </div>

        <div id="main-screen">
            <div id="greeting-text" class="greeting">${greeting}</div>

            <div class="location-inputs">
                <div class="input-group">
                    <label>FROM</label>
                    <input type="text" id="from-input" placeholder="Enter departure location">
                </div>
                <div class="input-group">
                    <label>TO</label>
                    <input type="text" id="to-input" placeholder="Enter destination">
                </div>
                <button id="search-btn">Search</button>
                <div id="suggestions-box" class="hidden"></div>
            </div>

            <div class="ai-dashboard-container">
                <div class="ai-dashboard-circle" id="ai-dashboard-btn">
                    AI Dashboard
                </div>
            </div>
        </div>

        <div id="page-content" class="hidden"></div>

        <nav class="bottom-nav">
            <div class="nav-item active">
                <i class="fas fa-car"></i><span>Commute</span>
            </div>
            <div class="nav-item">
                <i class="fas fa-chart-line"></i><span>Dashboards</span>
            </div>
            <div class="nav-item">
                <i class="fas fa-utensils"></i><span>Food</span>
            </div>
        </nav>
    </div>
`;

// --- Core Logic ---
function initApp() {
    const style = document.createElement('style');
    style.innerText = styles;
    document.head.appendChild(style);

    const root = document.getElementById('app-root');
    const greeting = userName ? getGreeting(userName) : 'Welcome!';
    root.innerHTML = getAppTemplate(greeting);

    const hamburger = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('side-menu-overlay');
    const aiBtn = document.getElementById('ai-dashboard-btn');
    const pageContent = document.getElementById('page-content');
    const mainScreen = document.getElementById('main-screen');

    hamburger.onclick = () => sideMenu.classList.toggle('closed');

    const navigateTo = (pageHTML) => {
        sideMenu.classList.add('closed');
        mainScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.innerHTML = pageHTML;
    };

    const backToHome = () => {
        pageContent.classList.add('hidden');
        mainScreen.classList.remove('hidden');
    };

    // Search button
    document.getElementById('search-btn').onclick = () => {
        alert('Searching rides...');
    };

    // AI Dashboard
    aiBtn.onclick = () => {
        alert('🚀 Opening AI Dashboard...');
    };

    // Profile
    document.getElementById('profile-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Profile</h2>
                <p><strong>Name:</strong> ${userName || 'example'}</p>
                <p><strong>Email:</strong> example@example.com</p>
                <p><strong>Phone:</strong> +1 555-123-4567</p>
                <p><strong>Member Since:</strong> Jan 2024</p>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };

    // Login
    document.getElementById('login-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Login</h2>
                <input type="email" class="form-input" placeholder="Email">
                <input type="password" class="form-input" placeholder="Password">
                <button class="form-btn">Login</button>
                <p style="text-align:center;margin-top:10px;">
                    <a href="#" style="color:var(--primary-blue);text-decoration:none;">Forgot password?</a>
                </p>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };

    // Registration
    document.getElementById('register-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Register</h2>
                <input type="text" class="form-input" placeholder="Full Name">
                <input type="email" class="form-input" placeholder="Email">
                <input type="password" class="form-input" placeholder="Password">
                <input type="tel" class="form-input" placeholder="Phone Number">
                <button class="form-btn">Create Account</button>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };

    // Settings
    document.getElementById('settings-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Settings</h2>
                <div class="toggle"><span>Notifications</span><input type="checkbox" checked></div>
                <div class="toggle"><span>Dark Mode</span><input type="checkbox"></div>
                <p style="margin-top:20px;">App Version: <strong>v1.0.0</strong></p>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };
}

const getGreeting = (name) => {
    const h = new Date().getHours();
    if (h < 12) return `Good Morning, ${name}!`;
    if (h < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
};

document.addEventListener('DOMContentLoaded', initApp);
