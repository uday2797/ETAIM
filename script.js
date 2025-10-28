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
    #map-section {
        margin-top: 10px;
        background: #fff;
        padding: 10px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        position: relative;
        z-index: 0;
    }
    
    #map-section h3 {
        text-align: center;
        margin-bottom: 8px;
        font-size: 15px;
        color: #333;
    }
    
    #map {
        width: 100%;
        height: 45px; /* ↓ reduced height */
        border-radius: 10px;
        border: 1px solid #ddd;
        overflow: hidden;
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

    /* AI Dashboard Circle */
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

    /* Side Menu */
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

    /* Modal */
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
    }

    .hidden {
        display: none !important;
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
                    <input type="text" id="from-input" placeholder="Enter heading location">
                </div>
                <div class="input-group">
                    <label>TO</label>
                    <input type="text" id="to-input" placeholder="Enter destination">
                </div>
                <div id="suggestions-box" class="hidden"></div>
            </div>

            <button id="search-btn">Search Rides</button>

            <div class="ai-dashboard-container">
                <div class="ai-dashboard-circle" id="ai-dashboard-btn">
                    Create AI Dashboard
                </div>
            </div>
            <div id="map-section">
                <h3>Nearby Activity Map</h3>
                <div id="map"></div>
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
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const suggestionsBox = document.getElementById('suggestions-box');

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
    sideMenu.onclick = (e) => { if (e.target.id === 'side-menu-overlay') sideMenu.classList.add('closed'); };

    // Nominatim Autocomplete
    async function fetchLocationSuggestions(query) {
        if (!query || query.length < 3) return [];
        if (locationSuggestionsCache[query]) return locationSuggestionsCache[query];
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            locationSuggestionsCache[query] = data;
            return data;
        } catch (err) {
            console.error('Error fetching locations:', err);
            return [];
        }
    }

    function showSuggestions(data, inputEl) {
        if (!data.length) {
            suggestionsBox.classList.add('hidden');
            return;
        }
        suggestionsBox.innerHTML = data
            .map(d => `<div class="suggestion-item">${d.display_name}</div>`)
            .join('');
        suggestionsBox.classList.remove('hidden');

        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.onclick = () => {
                inputEl.value = item.textContent;
                suggestionsBox.classList.add('hidden');
            };
        });
    }

    [fromInput, toInput].forEach(inputEl => {
        inputEl.addEventListener('input', async () => {
            const query = inputEl.value.trim();
            const suggestions = await fetchLocationSuggestions(query);
            showSuggestions(suggestions, inputEl);
        });
    });

    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== fromInput && e.target !== toInput) {
            suggestionsBox.classList.add('hidden');
        }
    });

    // --- Initialize map ---
    setTimeout(() => {
        if (document.getElementById('map')) {
            const map = L.map('map').setView([16.5062, 80.6480], 13); // Vijayawada coords
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            L.marker([16.5062, 80.6480]).addTo(map).bindPopup('Your Location');
        }
    }, 500);


    document.getElementById('search-btn').onclick = () => {
        alert(`Searching rides from "${fromInput.value}" to "${toInput.value}"`);
    };

    // AI Dashboard
    aiBtn.onclick = () => alert('🚀 Opening AI Dashboard...');

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

    // Profile Page
    document.getElementById('profile-btn').onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Profile</h2>
                <p><strong>Name:</strong> ${userName || 'Guest'}</p>
                <p><strong>Email:</strong> example@example.com</p>
                <p><strong>Phone:</strong> +91-9999999999</p>
                <p><strong>Member Since:</strong> Jan 2024</p>
            </div>
        `);
        document.getElementById('back-btn').onclick = backToHome;
    };

    // Login Page
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

    // Settings Page
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
        // --- New Smart Enhancements (Mock + Real Location) ---
     
    let userCoords = null;

    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            console.log("📍 User location:", userCoords);

            // Update map center to user's location
            if (window.map && userCoords) {
                map.setView(userCoords, 13);
                L.marker(userCoords).addTo(map).bindPopup("You are here").openPopup();
            }

            // Generate nearby recommendations (mock)
            showSmartInsights();
        }, (err) => {
            console.warn("❗ Location access denied, using default Vijayawada coords");
            userCoords = [16.5062, 80.6480];
            showSmartInsights();
        });
    } else {
        console.warn("❗ Geolocation not supported");
        userCoords = [16.5062, 80.6480];
        showSmartInsights();
    }

    // Function to generate mock smart cards
    function showSmartInsights() {
        const insightsContainer = document.createElement("div");
        insightsContainer.style.marginTop = "15px";

        const famousPlaces = [
            { name: "Kanaka Durga Temple", distance: "3.2 km", eta: "10 mins" },
            { name: "Prakasam Barrage", distance: "4.5 km", eta: "15 mins" },
            { name: "PVP Mall", distance: "2.8 km", eta: "8 mins" }
        ];
        const restaurants = [
            { name: "Sweet Magic", eta: "30 mins" },
            { name: "Ironhill Bistro", eta: "45 mins" },
            { name: "Minerva Coffee Shop", eta: "35 mins" }
        ];

        const randomPlace = famousPlaces[Math.floor(Math.random() * famousPlaces.length)];
        const randomFood = restaurants[Math.floor(Math.random() * restaurants.length)];

        insightsContainer.innerHTML = `
            <div style="background:#fff;padding:12px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.1);margin-bottom:10px;">
                <h4 style="margin:0 0 5px;color:#007bff;">Nearby Highlight</h4>
                <p style="margin:0;font-size:14px;">${randomPlace.name} – ${randomPlace.distance} away</p>
                <small>ETA by car: ${randomPlace.eta}</small>
            </div>
            <div style="background:#fff;padding:12px;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                <h4 style="margin:0 0 5px;color:#ff6f00;">Food ETA</h4>
                <p style="margin:0;font-size:14px;">${randomFood.name} – delivers in ${randomFood.eta}</p>
                <small>Mock estimate by Swiggy/Zomato</small>
            </div>
        `;
        document.querySelector("#main-screen").appendChild(insightsContainer);
    }

    // --- Commute Details ---
    const commuteBtn = document.querySelectorAll(".nav-item")[0];
    commuteBtn.onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Nearby Famous Spots</h2>
                <div style="margin-top:10px;">
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>Kanaka Durga Temple</strong> – 3.2 km<br>
                        Ola: ₹110 | Uber: ₹105 | Rapido: ₹60<br>
                        <small>Recommended: <b>Rapido (Cheap & Fast)</b></small>
                    </div>
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>PVP Mall</strong> – 2.8 km<br>
                        Ola: ₹90 | Uber: ₹95 | Rapido: ₹55<br>
                        <small>Recommended: <b>Rapido</b></small>
                    </div>
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>Prakasam Barrage</strong> – 4.5 km<br>
                        Ola: ₹130 | Uber: ₹125 | Auto: ₹70<br>
                        <small>Recommended: <b>Auto (Balanced Choice)</b></small>
                    </div>
                </div>
            </div>
        `);
        document.getElementById("back-btn").onclick = backToHome;
    };

    // --- Food Details ---
    const foodBtn = document.querySelectorAll(".nav-item")[2];
    foodBtn.onclick = () => {
        navigateTo(`
            <div class="page">
                <div class="back-btn" id="back-btn">← Back</div>
                <h2>Top Restaurants Nearby</h2>
                <div style="margin-top:10px;">
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>Sweet Magic</strong> – 30 mins delivery<br>
                        Swiggy ETA: 28 min | Zomato ETA: 32 min<br>
                        <small>Recommended: <b>Swiggy (Faster)</b></small>
                    </div>
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>Ironhill Bistro</strong> – 45 mins delivery<br>
                        Swiggy ETA: 47 min | Zomato ETA: 44 min<br>
                        <small>Recommended: <b>Zomato (Slightly Faster)</b></small>
                    </div>
                    <div style="padding:10px;border-bottom:1px solid #eee;">
                        <strong>Minerva Coffee Shop</strong> – 35 mins delivery<br>
                        Swiggy ETA: 36 min | Zomato ETA: 35 min<br>
                        <small>Recommended: <b>Either</b></small>
                    </div>
                </div>
            </div>
        `);
        document.getElementById("back-btn").onclick = backToHome;
    };
    
}

const getGreeting = (name) => {
    const h = new Date().getHours();
    if (h < 12) return `Good Morning, ${name}!`;
    if (h < 18) return `Good Afternoon, ${name}!`;
    return `Good Evening, ${name}!`;
};

document.addEventListener('DOMContentLoaded', initApp);
