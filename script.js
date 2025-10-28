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

    /* Search Ride Button */
    #search-btn {
        width: 100%;
        background-color: var(--primary-blue);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        margin-top: 10px;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
    }
    #search-btn:hover {
        background-color: #0056cc;
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

    /* --- AI DASHBOARD CIRCLE --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 130px; /* moved down by 2 inches approx */
        margin-bottom: 40px;
    }

    .ai-dashboard-circle {
        width: 200px; /* increased by 1 inch approx */
        height: 200px;
        background: linear-gradient(135deg, #ff00cc, #3333ff, #00ffff);
        background-size: 300% 300%;
        animation: rainbowShift 6s ease infinite;
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 18px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        transition: transform 0.3s ease;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.08);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
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

    /* Modal & Pages */
    .modal-overlay, .side-menu-overlay, .page {
        transition: all 0.3s ease;
    }

    .hidden {
        display: none !important;
    }

    .page {
        padding: 20px;
        color: #333;
    }

    .page h2 {
        margin-top: 0;
        color: var(--dark-menu);
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
                <div class="menu-item" id="profile-btn">Profile</div>
                <div class="menu-item" id="login-btn">Login</div>
                <div class="menu-item menu-settings" id="settings-btn">Settings</div>
            </div>
        </div>

        <header class="header">
            <div class="logo">ETAIM</div>
            <div id="hamburger-btn" class="hamburger-menu"><i class="fas fa-bars"></i></div>
        </header>

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
                <button id="search-btn">Search Ride</button>
                <div id="suggestions-box" class="hidden"></div>
            </div>

            <div class="ai-dashboard-container">
                <div class="ai-dashboard-circle" id="ai-dashboard-btn">
                    Create AI Dashboard
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
    const greeting = userName ? getGreeting(userName) : '';
    root.innerHTML = getAppTemplate(greeting);

    const nameModal = document.getElementById('name-prompt-modal');
    const nameInput = document.getElementById('user-name-input');
    const saveBtn = document.getElementById('save-name-btn');
    const greetingText = document.getElementById('greeting-text');
    const hamburger = document.getElementById('hamburger-btn');
    const sideMenu = document.getElementById('side-menu-overlay');
    const aiBtn = document.getElementById('ai-dashboard-btn');
    const pageContent = document.getElementById('page-content');
    const mainScreen = document.getElementById('main-screen');

    if (!userName) nameModal.classList.remove('hidden');

    saveBtn.onclick = () => {
        const val = nameInput.value.trim();
        if (val) {
            localStorage.setItem('etaimUserName', val);
            userName = val;
            nameModal.classList.add('hidden');
            greetingText.textContent = getGreeting(val);
        } else alert('Please enter your name.');
    };

    hamburger.onclick = () => sideMenu.classList.toggle('closed');

    // --- Search button functionality ---
    const searchBtn = document.getElementById('search-btn');
    searchBtn.onclick = () => alert('🔍 Searching for rides...');

    // --- Navigation ---
    const navigateTo = (html) => {
        mainScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.innerHTML = html;
    };

    const backToHome = () => {
        pageContent.classList.add('hidden');
        mainScreen.classList.remove('hidden');
    };

    // --- AI Dashboard → Registration Form ---
    aiBtn.onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Registration Form</h2>
                <label>Destination Location:</label>
                <input type="text" id="dest-location" placeholder="Enter destination" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;">

                <div class="toggle">
                    <span>Office Location?</span>
                    <input type="checkbox" id="office-toggle">
                </div>

                <div id="login-time-container" class="hidden">
                    <label>Login Time:</label>
                    <input type="time" id="login-time" style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ccc;border-radius:6px;">
                </div>

                <label>Usual Commute Mode:</label>
                <select id="commute-mode" style="width:100%;padding:10px;border-radius:6px;border:1px solid #ccc;margin-bottom:10px;">
                    <option value="">Select</option>
                    <option value="own">Own Vehicle</option>
                    <option value="ola">Ola</option>
                    <option value="uber">Uber</option>
                    <option value="rapido">Rapido</option>
                </select>

                <label>Food Preference:</label>
                <select id="food-pref" style="width:100%;padding:10px;border-radius:6px;border:1px solid #ccc;margin-bottom:15px;">
                    <option value="">Select</option>
                    <option value="south">South Indian</option>
                    <option value="north">North Indian</option>
                </select>

                <button id="submit-btn" style="width:100%;padding:12px;background:var(--primary-blue);color:#fff;border:none;border-radius:6px;font-weight:600;">Submit</button>
            </div>
        `);

        // Back button logic
        document.getElementById('back-btn').onclick = backToHome;

        // Office toggle visibility logic
        const officeToggle = document.getElementById('office-toggle');
        const loginTimeContainer = document.getElementById('login-time-container');
        officeToggle.onchange = () => {
            if (officeToggle.checked) loginTimeContainer.classList.remove('hidden');
            else loginTimeContainer.classList.add('hidden');
        };

        // Submit button action
        document.getElementById('submit-btn').onclick = () => {
            alert('✅ Registration submitted successfully!');
            backToHome();
        };
    };

    // --- Profile, Login, Settings pages (unchanged) ---
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

    document.getElementById('login-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Login</h2>
                <input type="email" placeholder="Email" style="width:100%;padding:10px;margin:10px 0;border-radius:6px;border:1px solid #ccc;">
                <input type="password" placeholder="Password" style="width:100%;padding:10px;margin:10px 0;border-radius:6px;border:1px solid #ccc;">
                <button style="width:100%;padding:10px;background:var(--primary-blue);color:#fff;border:none;border-radius:6px;">Login</button>
                <p style="text-align:center;margin-top:10px;"><a href="#" style="color:var(--primary-blue);text-decoration:none;">Forgot password?</a></p>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };

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
