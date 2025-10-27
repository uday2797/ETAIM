let userName = localStorage.getItem('etaimUserName');
let locationSuggestionsCache = {};
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
let debounceTimeout;
let activeInput = null; 

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
        /* Updated Background: Rainbow Gradient */
        background: linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet);
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
    
    /* --- GENERAL PAGE CONTENT --- */
    .page-content {
        padding: 20px 0;
    }

    /* --- HEADER --- */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20px;
        color: var(--dark-menu);
    }
    .header.internal-page {
        justify-content: flex-start;
    }
    .header.internal-page .logo {
        margin-left: 20px;
    }

    .logo {
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 1px;
    }
    
    .back-btn {
        font-size: 24px;
        cursor: pointer;
        color: var(--primary-blue);
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
    
    /* Custom Suggestions Box */
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

    /* --- AI DASHBOARD RECTANGLE (Updated) --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        /* Pushed 2 inches (~192px) below existing content. Adjusting margin-top */
        margin-top: 192px; 
        margin-bottom: 40px;
    }

    .ai-dashboard-rectangle {
        width: 100%;
        height: 80px;
        background-color: var(--primary-blue);
        border-radius: 12px; /* Rectangle with rounded corners */
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 18px;
        box-shadow: 0 5px 20px rgba(0, 123, 255, 0.4);
        cursor: pointer;
    }

    /* --- BOTTOM NAVIGATION (Updated with Rainbow) --- */
    .bottom-nav {
        display: flex;
        justify-content: space-around;
        padding: 10px 0;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet); /* Rainbow Background */
        border-top: 1px solid #f0f0f0;
        border-bottom-left-radius: 30px;
        border-bottom-right-radius: 30px;
    }

    .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white; /* Text color changed for contrast */
        cursor: pointer;
        font-size: 12px;
        padding: 5px;
        width: 30%;
        border-radius: 8px;
        transition: background-color 0.2s;
        /* The individual nav items will have a light background on active/hover, 
           but the primary rainbow background is on the container */
    }

    .nav-item i {
        font-size: 20px;
        margin-bottom: 4px;
    }

    .nav-item.active {
        color: yellow; /* Active item contrast */
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
    /* ... (rest of side menu styles remain the same for functionality) ... */

    /* --- COMMON UI/MODAL STYLES --- */
    .hidden {
        display: none !important;
    }
    
    .form-group {
        margin-bottom: 15px;
        text-align: left;
    }

    .form-group input {
        width: 90%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
    }

    .info-box {
        background: #f0f4f8;
        padding: 20px;
        border-radius: 8px;
        margin-top: 20px;
        text-align: left;
    }
    .info-box p {
        margin: 5px 0;
        font-size: 16px;
    }
`;


// --- 2. PAGE TEMPLATES ---

// Main Dashboard Page Template (Home)
const getHomePageTemplate = (initialGreeting = '') => `
    <header class="header">
        <div class="logo">ETAIM</div>
        <div id="hamburger-btn" class="hamburger-menu"><i class="fas fa-bars"></i></div>
    </header>

    <div id="main-dashboard-page">
        <div id="greeting-text" class="greeting">
            ${initialGreeting}
        </div>

        <div class="location-inputs">
            <div class="input-group">
                <label>HEADING LOCATION</label> <input type="text" id="from-input" placeholder="Enter heading location">
            </div>
            
            <div class="input-group">
                <label>TO</label>
                <input type="text" id="to-input" placeholder="Enter destination">
            </div>

            <div id="suggestions-box" class="hidden">
                </div>
        </div>

        <div class="ai-dashboard-container">
            <div class="ai-dashboard-rectangle">
                AI Dashboard
            </div>
        </div>
    </div>
`;

// Profile Page Template
const getProfilePageTemplate = (name) => `
    <header class="header internal-page">
        <span id="back-to-home" class="back-btn"><i class="fas fa-arrow-left"></i></span>
        <div class="logo">Profile</div>
    </header>
    <div class="page-content">
        <h2>Your Profile</h2>
        <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p>You can manage your saved locations and preferences here.</p>
        </div>
    </div>
`;

// Login/Registration Page Template
const getLoginPageTemplate = () => `
    <header class="header internal-page">
        <span id="back-to-home" class="back-btn"><i class="fas fa-arrow-left"></i></span>
        <div class="logo">Registration</div>
    </header>
    <div class="page-content">
        <h2>Register / Sign Up</h2>
        <form id="registration-form">
            <div class="form-group">
                <label for="mobile">Mobile Number</label>
                <input type="tel" id="mobile" name="mobile" required>
            </div>
            <div class="form-group">
                <label for="age">Age</label>
                <input type="number" id="age" name="age">
            </div>
            <div class="form-group">
                <label for="email">Email ID</label>
                <input type="email" id="email" name="email" required>
            </div>
            <button type="submit" id="register-btn" style="background-color: var(--primary-blue); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Register</button>
        </form>
    </div>
`;

// Settings Page Template
const getSettingsPageTemplate = () => `
    <header class="header internal-page">
        <span id="back-to-home" class="back-btn"><i class="fas fa-arrow-left"></i></span>
        <div class="logo">Settings</div>
    </header>
    <div class="page-content">
        <h2>App Settings</h2>
        <button id="logout-btn" style="background-color: red; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
            Logout
        </button>
    </div>
`;

// Common Bottom Navigation
const bottomNavHTML = `
    <nav class="bottom-nav">
        <div class="nav-item active" data-page="home">
            <i class="fas fa-car"></i>
            <span>Commute</span>
        </div>
        <div class="nav-item" data-page="dashboards">
            <i class="fas fa-chart-line"></i>
            <span>Dashboards</span>
        </div>
        <div class="nav-item" data-page="food">
            <i class="fas fa-utensils"></i>
            <span>Food</span>
        </div>
    </nav>
`;


// --- 3. CORE LOGIC & ROUTING ---

const router = {
    // Dictionary of page templates
    'home': getHomePageTemplate,
    'profile': getProfilePageTemplate,
    'login': getLoginPageTemplate,
    'settings': getSettingsPageTemplate
};

function navigate(page, data = null) {
    const root = document.getElementById('app-root');
    const templateFunction = router[page];

    if (!templateFunction) {
        console.error('Page not found:', page);
        return;
    }

    // Render the new page content
    let contentHTML;
    if (page === 'home') {
        contentHTML = templateFunction(userName ? getGreeting(userName) : '');
    } else if (page === 'profile') {
        contentHTML = templateFunction(userName || 'Guest');
    } else {
        contentHTML = templateFunction(data);
    }

    // Inject content and the bottom nav (if not an internal page)
    if (page === 'home') {
        root.innerHTML = `<div class="app-container">${contentHTML} ${bottomNavHTML}</div>`;
    } else {
        // For internal pages, we only show the content (no bottom nav)
        root.innerHTML = `<div class="app-container">${contentHTML}</div>`;
    }

    // Re-attach event listeners for the new DOM elements
    attachEventListeners(page);
}

function getGreeting(name) {
    const hour = new Date().getHours();
    let timeOfDay;

    if (hour < 12) {
        timeOfDay = 'Morning';
    } else if (hour < 18) {
        timeOfDay = 'Afternoon';
    } else {
        timeOfDay = 'Evening';
    }
    return `Good ${timeOfDay}, ${name}!`;
}

function attachEventListeners(currentPage) {
    const appContainer = document.querySelector('.app-container');

    // Attach HOME and BACK button listeners
    const backBtn = document.getElementById('back-to-home');
    if (backBtn) {
        backBtn.addEventListener('click', () => navigate('home'));
    }

    // Handle internal page buttons
    if (currentPage === 'settings') {
        document.getElementById('logout-btn').addEventListener('click', () => {
            alert('Logged out successfully!');
            localStorage.removeItem('etaimUserName');
            userName = null;
            navigate('home');
        });
    } else if (currentPage === 'login') {
        document.getElementById('registration-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const mobile = document.getElementById('mobile').value;
            const age = document.getElementById('age').value;
            const email = document.getElementById('email').value;
            alert(`Registration successful! Mobile: ${mobile}, Age: ${age}, Email: ${email}`);
            navigate('home'); // Go back to home after mock registration
        });
    }

    // --- DASHBOARD/HOME-SPECIFIC LISTENERS ---
    if (currentPage === 'home') {
        const namePromptModal = document.getElementById('name-prompt-modal');
        const userNameInput = document.getElementById('user-name-input');
        const saveNameBtn = document.getElementById('save-name-btn');
        const greetingText = document.getElementById('greeting-text');
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sideMenuOverlay = document.getElementById('side-menu-overlay');
        const fromInput = document.getElementById('from-input');
        const toInput = document.getElementById('to-input');
        const suggestionsBox = document.getElementById('suggestions-box');
        
        // --- 1. NAME PROMPT ---
        if (!userName) {
            namePromptModal.classList.remove('hidden');
        } else {
            namePromptModal.classList.add('hidden');
        }

        saveNameBtn.addEventListener('click', () => {
            const inputName = userNameInput.value.trim();
            if (inputName) {
                userName = inputName;
                localStorage.setItem('etaimUserName', userName);
                namePromptModal.classList.add('hidden');
                greetingText.textContent = getGreeting(userName);
            } else {
                alert('Please enter your name to continue.');
            }
        });

        // --- 2. SIDE MENU ---
        hamburgerBtn.addEventListener('click', () => {
            sideMenuOverlay.classList.toggle('closed');
        });

        sideMenuOverlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('side-menu-overlay')) {
                sideMenuOverlay.classList.add('closed');
            }
        });
        
        // Side Menu Item Navigation
        appContainer.querySelectorAll('.side-menu .menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const text = e.target.textContent.trim();
                sideMenuOverlay.classList.add('closed'); // Close menu immediately
                
                if (text === 'Profile') {
                    navigate('profile');
                } else if (text === 'Login') {
                    navigate('login');
                } else if (text === 'Settings') {
                    navigate('settings');
                } else if (text === 'Logout') {
                    document.getElementById('logout-btn').click(); // trigger logout button logic
                }
            });
        });


        // --- 3. NOMINATIM API LOGIC ---
        fromInput.addEventListener('input', handleLocationInput);
        toInput.addEventListener('input', handleLocationInput);

        document.addEventListener('click', (e) => {
            if (!suggestionsBox.contains(e.target) && e.target !== fromInput && e.target !== toInput) {
                suggestionsBox.classList.add('hidden');
            }
        });

        function handleLocationInput(e) {
            const inputElement = e.target;
            const query = inputElement.value.trim();
            activeInput = inputElement;

            clearTimeout(debounceTimeout);
            
            if (query.length < 3) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            debounceTimeout = setTimeout(async () => {
                const suggestions = await fetchLocationSuggestions(query);
                renderSuggestions(suggestions, inputElement);
            }, 300);
        }

        function renderSuggestions(suggestions, inputElement) {
            suggestionsBox.innerHTML = '';
            // Position the box dynamically based on the active input
            const rect = inputElement.getBoundingClientRect();
            const containerRect = document.querySelector('.location-inputs').getBoundingClientRect();
            
            // Calculate top position relative to the .location-inputs container
            suggestionsBox.style.top = `${rect.top - containerRect.top + rect.height + 5}px`;
            
            if (suggestions.length === 0) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion.display_name;
                
                item.addEventListener('click', () => {
                    inputElement.value = suggestion.display_name;
                    suggestionsBox.classList.add('hidden');
                });
                suggestionsBox.appendChild(item);
            });
            suggestionsBox.classList.remove('hidden');
        }

        // Fetcher is kept simple to avoid dependency on global state/elements
        async function fetchLocationSuggestions(query) {
            if (locationSuggestionsCache[query]) return locationSuggestionsCache[query];
            const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0&dedupe=1`;
            
            try {
                const response = await fetch(url);
                const data = await response.json();
                
                const formattedData = data.map(place => ({
                    display_name: place.display_name,
                    lat: place.lat,
                    lon: place.lon
                }));
                
                locationSuggestionsCache[query] = formattedData;
                return formattedData;
            } catch (error) {
                console.error('Nominatim API error:', error);
                return [];
            }
        }
    }
}

// Initial application launch
document.addEventListener('DOMContentLoaded', () => navigate('home'));
