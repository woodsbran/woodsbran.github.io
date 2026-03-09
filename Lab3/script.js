// ===============================
// Lab 3 - Sign Up Page
// ===============================
//
// In this file I'm handling:
// 1) zip code lookup
// 2) state -> county lookup
// 3) username availability check
// 4) suggested password
// 5) form validation before submit
//
// I'm doing each part step by step so it's easier to read and explain.
// ===============================


// -----------------------------------
// Event listeners
// -----------------------------------

// When the user changes the zip code, go get the city/lat/long info
document.querySelector("#zip").addEventListener("change", getZipInfo);

// When the user selects a state, go get the counties for that state
document.querySelector("#state").addEventListener("change", getCounties);

// When the user types a username, check if it's available
document.querySelector("#username").addEventListener("input", checkUsername);

// When the user clicks into the password box, show a suggested password
document.querySelector("#password").addEventListener("focus", suggestPassword);

// When the user submits the form, validate the password fields first
document.querySelector("#signupForm").addEventListener("submit", validateForm);


// -----------------------------------
// Load states as soon as the page loads
// -----------------------------------
//
// The rubric says not to use an event listener for this part.
// So I'm just calling the function directly.
getStates();


// ===================================
// ZIP CODE API
// ===================================
//
// Goal:
// When the user enters a zip code,
// update city, latitude, and longitude.
// Also show "Zip code not found" if needed.
// ===================================
async function getZipInfo() {

    // First I grab whatever zip code the user typed
    let zip = document.querySelector("#zip").value;

    // Clear out old error message before checking again
    document.querySelector("#zipError").textContent = "";

    // If the user leaves zip blank, clear the boxes and stop
    if (zip === "") {
        document.querySelector("#city").textContent = "";
        document.querySelector("#latitude").textContent = "";
        document.querySelector("#longitude").textContent = "";
        return;
    }

    // This is the likely API endpoint pattern used for the lab
    let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zip}`;

    try {
        // Go get the data from the API
        let response = await fetch(url);

        // Convert the API response into JSON so JavaScript can read it
        let data = await response.json();

        // Debugging line in case I want to inspect the returned object
        console.log("Zip API data:", data);

        // If no city comes back, then the zip was not found
        if (!data || !data.city) {
            document.querySelector("#zipError").textContent = "Zip code not found";

            // Since zip was bad, clear the boxes too
            document.querySelector("#city").textContent = "";
            document.querySelector("#latitude").textContent = "";
            document.querySelector("#longitude").textContent = "";
            return;
        }

        // If data was found, fill in the city, latitude, and longitude
        document.querySelector("#city").textContent = data.city;
        document.querySelector("#latitude").textContent = data.latitude;
        document.querySelector("#longitude").textContent = data.longitude;
    }
    catch (error) {
        // If something goes wrong with the fetch itself, show it in console
        console.error("Error getting zip info:", error);

        // This message is more of a fallback in case the API fails completely
        document.querySelector("#zipError").textContent = "Unable to retrieve zip code info right now.";
    }
}


// ===================================
// COUNTIES API
// ===================================
//
// Goal:
// When the user selects a state,
// load the counties that belong to that state.
// ===================================
async function getCounties() {

    // Grab the selected state value
    let state = document.querySelector("#state").value;

    // Grab the county dropdown so I can update it
    let countySelect = document.querySelector("#county");

    // Reset the county dropdown each time
    countySelect.innerHTML = '<option value="">Select a County</option>';

    // If no state is selected, stop here
    if (state === "") {
        return;
    }

    // Likely API endpoint pattern for counties
    let url = `https://csumb.space/api/countyListAPI.php?state=${state}`;

    try {
        // Fetch county data
        let response = await fetch(url);

        // Convert response to JSON
        let data = await response.json();

        // Debugging line
        console.log("County API data:", data);

        // Loop through each county object and add an option to the dropdown
        data.forEach(function(countyObj) {
            countySelect.innerHTML += `<option>${countyObj.county}</option>`;
        });
    }
    catch (error) {
        console.error("Error getting counties:", error);
    }
}


// ===================================
// USERNAME AVAILABILITY API
// ===================================
//
// Goal:
// As the user types a username,
// show a color-coded message saying if it's available or not.
// ===================================
async function checkUsername() {

    // Grab the username typed by the user
    let username = document.querySelector("#username").value.trim();

    // Grab the message area
    let usernameMsg = document.querySelector("#usernameMsg");

    // If nothing is typed, clear the message and stop
    if (username === "") {
        usernameMsg.textContent = "";
        return;
    }

    // Likely API endpoint pattern for username check
    let url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;

    try {
        // Fetch username availability
        let response = await fetch(url);

        // Convert response to JSON
        let data = await response.json();

        // Debugging line
        console.log("Username API data:", data);

        // Different versions of this API may return different property names,
        // so I’m checking a few common possibilities just to be safe.
        if (
            data.available === true ||
            data.usernameAvailable === true ||
            data.available === "true"
        ) {
            usernameMsg.textContent = "Username is available";
            usernameMsg.style.color = "green";
        }
        else {
            usernameMsg.textContent = "Username is not available";
            usernameMsg.style.color = "red";
        }
    }
    catch (error) {
        console.error("Error checking username:", error);

        usernameMsg.textContent = "Unable to check username right now";
        usernameMsg.style.color = "orange";
    }
}


// ===================================
// SUGGEST PASSWORD
// ===================================
//
// Goal:
// When the user clicks into the password box,
// show a suggested password next to it.
// ===================================
function suggestPassword() {

    // This creates a random string and cuts it down to 8 characters
    let suggestedPassword = Math.random().toString(36).slice(-8);

    // Show the suggested password on the page
    document.querySelector("#passwordHint").textContent =
        "Suggested password: " + suggestedPassword;
}


// ===================================
// FORM VALIDATION
// ===================================
//
// Goal:
// When user clicks submit:
// 1) password must be at least 6 characters
// 2) password must match retype password
// 3) only allow form submission if valid
// ===================================
function validateForm(e) {

    // I start by assuming the form is valid
    let isValid = true;

    // Clear old error messages first
    document.querySelector("#passwordError").textContent = "";
    document.querySelector("#retypePasswordError").textContent = "";

    // Grab both password values
    let password = document.querySelector("#password").value;
    let retypePassword = document.querySelector("#retypePassword").value;

    // Check password length
    if (password.length < 6) {
        document.querySelector("#passwordError").textContent =
            "Password must be at least 6 characters.";
        isValid = false;
    }

    // Check that both password boxes match
    if (password !== retypePassword) {
        document.querySelector("#retypePasswordError").textContent =
            "Passwords do not match.";
        isValid = false;
    }

    // If anything failed, stop the form from submitting
    if (!isValid) {
        e.preventDefault();
    }
}


// ===================================
// STATES API
// ===================================
//
// Goal:
// When the page loads,
// show all US states in the dropdown.
// ===================================
async function getStates() {

    // Likely API endpoint pattern for all states
    let url = "https://csumb.space/api/allStatesAPI.php";

    try {
        // Fetch the states data
        let response = await fetch(url);

        // Convert response into JSON
        let data = await response.json();

        // Debugging line
        console.log("States API data:", data);

        // Grab the state dropdown
        let stateSelect = document.querySelector("#state");

        // Loop through the states and add each one as an option
        data.forEach(function(stateObj) {
            stateSelect.innerHTML += `
                <option value="${stateObj.usps}">
                    ${stateObj.state}
                </option>
            `;
        });
    }
    catch (error) {
        console.error("Error getting states:", error);
    }
}