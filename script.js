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
        background: linear-gradient(135deg, #ff6ec4 0%, #7873f5 25%, #42e695 50%, #f9d423 75%, #ff6ec4 100%);
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
        top: 155px; /* Position it correctly under the TO input */
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

    .suggestion-item:last-child {
        border-bottom: none;
    }

    .suggestion-item:hover {
        background-color: #f0f4f8;
    }

    /* --- AI DASHBOARD RECTANGLE --- */
    .ai-dashboard-container {
        display: flex;
        justify-content: center;
        margin-top: 192px; /* 2 inches = 192px */
        margin-bottom: 40px;
    }

    .ai-dashboard-rectangle {
        width: 260px;
        height: 70px;
        background: linear-gradient(90deg, #ff6ec4 0%, #7873f5 100%);
        border-radius: 24px;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        text-align: center;
        font-size: 20px;
        box-shadow: 0 5px 20px rgba(0, 123, 255, 0.2);
        cursor: pointer;
        transition: box-shadow 0.2s;
    }
    .ai-dashboard-rectangle:hover {
        box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
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
        background: linear-gradient(90deg, #ff6ec4 0%, #7873f5 33%, #42e695 66%, #f9d423 100%);
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

    .menu-spacer {
        flex-grow: 1; 
        min-height: 50px;
    }

    .menu-settings {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* --- NAME PROMPT MODAL --- */
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

    .modal-content h3 {
        margin-top: 0;
        color: var(--dark-menu);
    }

    #user-name-input {
        width: 90%;
        padding: 10px;
        margin: 15px 0;
        border: 1px solid #ddd;
        border-radius: 6px;
        text-align: center;
    }

    #save-name-btn {
        background-color: var(--primary-blue);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.2s;
    }

    #save-name-btn:hover {
        background-color: #0056b3;
    }

    .hidden {
        display: none !important;
    }
`;


// --- 2. HTML TEMPLATE ---
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
                <div class="menu-item">Profile</div>
                <div class="menu-item">Login</div>
                <div class="menu-spacer"></div>
                <div class="menu-item menu-settings">Settings</div>
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
                <label>HEADING LOCATION</label>
                <input type="text" id="from-input" placeholder="Enter heading location">
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

    </div>
`;


// --- 3. CORE LOGIC & NOMINATIM INTEGRATION ---

// Global function called after DOM is fully loaded
function initApp() {
    
    // Inject the CSS styles
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    // --- Helper Functions ---
    const getGreeting = (name) => {
        const hour = new Date().getHours();
        let timeOfDay;

        // Current time is Monday, October 27, 2025 at 11:52:27 PM IST.
        if (hour < 12) {
            timeOfDay = 'Morning';
        } else if (hour < 18) {
            timeOfDay = 'Afternoon';
        } else {
            timeOfDay = 'Evening';
        }
        return `Good ${timeOfDay}, ${name}!`;
    };

    // --- RENDER APP ---
    const root = document.getElementById('app-root');
    const initialGreetingText = userName ? getGreeting(userName) : '';
    root.innerHTML = getAppTemplate(initialGreetingText);

    // --- Element References (After rendering) ---
    const namePromptModal = document.getElementById('name-prompt-modal');
    const userNameInput = document.getElementById('user-name-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const greetingText = document.getElementById('greeting-text');
   
 const hamburgerBtn = document.getElementById('hamburger-btn');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const suggestionsBox = document.getElementById('suggestions-box');
    
    let activeInput = null; // Track which input is currently being typed in

    // --- NOMINATIM API LOGIC ---
    let debounceTimeout;
    const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

    const fetchLocationSuggestions = async (query) => {
        // Simple client-side cache check
        if (locationSuggestionsCache[query]) {
            return locationSuggestionsCache[query];
        }

        // Build the URL for the free OpenStreetMap Nominatim API
        // limit=5: Get top 5 results
        // addressdetails=0: Minimal data
        // dedupe=1: Deduplicate results
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0&dedupe=1`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Format and cache data
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
    };

    const handleLocationInput = async (e) => {
        const inputElement = e.target;
        const query = inputElement.value.trim();
        activeInput = inputElement; // Set the currently active input

        clearTimeout(debounceTimeout);
        
        // Only start searching if query is 3 characters or more
        if (query.length < 3) {
            suggestionsBox.classList.add('hidden');
            return;
        }

        // Debounce the API call to wait for the user to stop typing
        debounceTimeout = setTimeout(async () => {
            const suggestions = await fetchLocationSuggestions(query);
            renderSuggestions(suggestions);
        }, 300); 
    };

    const renderSuggestions = (suggestions) => {
        suggestionsBox.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionsBox.classList.add('hidden');
            return;
        }

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion.display_name;
            
            // Handle selection of a suggestion
            item.addEventListener('click', () => {
                if (activeInput) {
                    activeInput.value = suggestion.display_name;
                    suggestionsBox.classList.add('hidden');
                    activeInput.focus(); // Keep focus after selection
                }
            });
            suggestionsBox.appendChild(item);
        });
        suggestionsBox.classList.remove('hidden');
    };

    // --- EVENT LISTENERS ---

    // Attach input handler (for live search) to both location fields
    fromInput.addEventListener('input', handleLocationInput);
    toInput.addEventListener('input', handleLocationInput);

    // Hide suggestions when focus is lost (clicked outside)
    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== fromInput && e.target !== toInput) {
            suggestionsBox.classList.add('hidden');
        }
    });

    // --- UI INTERACTION LOGIC (Greeting, Menu, Prompt) ---

    // Name Prompt Logic
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

    // Side Menu Toggle
    hamburgerBtn.addEventListener('click', () => {
        sideMenuOverlay.classList.toggle('closed');
    });

    // Close Menu on overlay click
    sideMenuOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'side-menu-overlay') {
            sideMenuOverlay.classList.add('closed');
        }
    });
}

// Initial application launch when the DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
