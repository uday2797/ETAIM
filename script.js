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

    .search-btn {
        width: 100%;
        background-color: var(--primary-blue);
        color: white;
        padding: 12px;
        border-radius: 8px;
        border: none;
        font-size: 16px;
        cursor: pointer;
        margin-bottom: 25px;
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
        margin-top: 90px; /* moved down ~2 inches */
        margin-bottom: 40px;
    }

    .ai-dashboard-circle {
        width: 200px; /* increased size by ~1 inch */
        height: 200px;
        background: linear-gradient(135deg, #6a11cb, #2575fc);
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 18px;
        box-shadow: 0 5px 20px rgba(0, 123, 255, 0.4);
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 25px rgba(0, 123, 255, 0.6);
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

    /* Modal + Menu (unchanged) */
    .side-menu-overlay { ... }
    .side-menu { ... }

    .hidden { display: none !important; }

    .page { padding: 20px; color: #333; }
    .page h2 { margin-top: 0; color: var(--dark-menu); }

    .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
    }
`;

// --- HTML Template (added search button) ---
const getAppTemplate = (greeting = '') => `
    <div class="app-container">
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
                <button id="search-btn" class="search-btn">Search</button>
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
    const greeting = userName ? getGreeting(userName) : '';
    root.innerHTML = getAppTemplate(greeting);

    const aiBtn = document.getElementById('ai-dashboard-btn');
    const mainScreen = document.getElementById('main-screen');
    const pageContent = document.getElementById('page-content');

    const navigateTo = (html) => {
        mainScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.innerHTML = html;
    };

    const backToHome = () => {
        pageContent.classList.add('hidden');
        mainScreen.classList.remove('hidden');
    };

    // --- Registration Form Page ---
    aiBtn.onclick = () => {
        const toLocation = document.getElementById('to-input').value || '';
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Registration Form</h2>

                <label>Destination Location</label>
                <input type="text" id="dest" value="${toLocation}" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">

                <div class="toggle">
                    <span>Is destination an office location?</span>
                    <input type="checkbox" id="isOffice">
                </div>

                <div id="loginTimeContainer" class="hidden">
                    <label>Login Time</label>
                    <input type="time" id="loginTime" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                </div>

                <label>Usual Commute Mode</label>
                <select id="commuteMode" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                    <option value="">Select</option>
                    <option>Own Vehicle</option>
                    <option>Ola</option>
                    <option>Uber</option>
                    <option>Rapido</option>
                </select>

                <label>Food Preference</label>
                <select id="foodPref" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                    <option value="">Select</option>
                    <option>South Indian</option>
                    <option>North Indian</option>
                </select>

                <button id="submitReg" class="search-btn">Submit</button>
            </div>
        `);

        document.getElementById('back-btn').onclick = backToHome;

        const isOffice = document.getElementById('isOffice');
        const loginTimeContainer = document.getElementById('loginTimeContainer');
        isOffice.addEventListener('change', () => {
            loginTimeContainer.classList.toggle('hidden', !isOffice.checked);
        });

        document.getElementById('submitReg').onclick = () => {
            alert('✅ Registration Submitted Successfully!');
            backToHome();
        };
    };

    // Search button
    document.getElementById('search-btn').onclick = () => {
        alert('🔍 Searching for best commute options...');
    };
}

const getGreeting = (name) => {
    const h = new Date().getHours();
    if (h < 12) return `Good Morning, ${name}!`;
    if (h < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
};

document.addEventListener('DOMContentLoaded', initApp);
