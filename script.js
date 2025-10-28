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

    #search-btn {
        width: 100%;
        padding: 12px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        margin-top: 5px;
        cursor: pointer;
        transition: background 0.3s ease;
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

    /* AI Dashboard */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 60px;
        margin-bottom: 50px;
    }

    .ai-dashboard-circle {
        width: 180px;
        height: 180px;
        background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff6f91, #ffc371);
        background-size: 300% 300%;
        border-radius: 50%;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 20px;
        box-shadow: 0 5px 25px rgba(255, 111, 145, 0.4);
        cursor: pointer;
        animation: rainbowPulse 6s ease infinite;
        transition: transform 0.3s ease;
        text-align: center;
    }

    .ai-dashboard-circle:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 30px rgba(255, 105, 180, 0.5);
    }

    @keyframes rainbowPulse {
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

    .toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
    }

    .hidden {
        display: none !important;
    }
`;

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
                <button id="search-btn">Search</button>
            </div>

            <div class="ai-dashboard-container">
                <div class="ai-dashboard-circle" id="ai-dashboard-btn">
                    AI Dashboard
                </div>
            </div>
        </div>

        <div id="page-content" class="hidden"></div>
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
    const searchBtn = document.getElementById('search-btn');
    const pageContent = document.getElementById('page-content');
    const mainScreen = document.getElementById('main-screen');

    // Back to Home helper
    const backToHome = () => {
        pageContent.classList.add('hidden');
        mainScreen.classList.remove('hidden');
    };

    // --- Registration Page ---
    function showRegistrationForm() {
        mainScreen.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.innerHTML = `
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Registration</h2>
                <input type="text" placeholder="Full Name" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                <input type="email" placeholder="Email" style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                <select style="width:100%;padding:10px;margin:10px 0;border:1px solid #ccc;border-radius:6px;">
                    <option value="">Select Role</option>
                    <option>Rider</option>
                    <option>Driver</option>
                </select>
                <div class="toggle"><span>Receive Updates</span><input type="checkbox" checked></div>
                <button id="submit-reg" style="width:100%;padding:10px;background:var(--primary-blue);color:white;border:none;border-radius:6px;">Submit</button>
            </div>
        `;
        document.getElementById('back-btn').onclick = backToHome;
        document.getElementById('submit-reg').onclick = () => {
            alert("🎉 Registration submitted successfully!");
            backToHome();
        };
    }

    // --- Clicks ---
    aiBtn.onclick = () => alert('🚀 Opening AI Dashboard...');
    searchBtn.onclick = showRegistrationForm;
}

const getGreeting = (name) => {
    const h = new Date().getHours();
    if (h < 12) return `Good Morning, ${name}!`;
    if (h < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
};

document.addEventListener('DOMContentLoaded', initApp);
