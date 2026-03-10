// ==========================================
// HW 3 - Rick and Morty Character Finder
// ==========================================
//
// In this file I'm doing a few main things:
// 1) waiting for the user to submit the form
// 2) validating the input
// 3) building the API URL
// 4) using fetch() to get character data
// 5) showing the results on the page in card format
// ==========================================


// ------------------------------------------
// Event listener
// ------------------------------------------
//
// This listens for the form submission.
// When the user clicks Search, it runs searchCharacters().
document.querySelector("#searchForm").addEventListener("submit", searchCharacters);


// ==========================================
// Main search function
// ==========================================
async function searchCharacters(e) {

    // This stops the page from refreshing when the form is submitted
    e.preventDefault();

    // ------------------------------------------
    // Step 1: grab what the user typed
    // ------------------------------------------
    let characterName = document.querySelector("#characterName").value.trim();
    let species = document.querySelector("#species").value.trim();

    // Grab the error message area and the results area
    let errorMsg = document.querySelector("#errorMsg");
    let results = document.querySelector("#results");

    // ------------------------------------------
    // Step 2: clear old messages/results first
    // ------------------------------------------
    errorMsg.textContent = "";
    results.innerHTML = "";

    // ------------------------------------------
    // Step 3: validate the character name
    // ------------------------------------------
    //
    // The rubric says I need at least one JS validation.
    // So here I’m checking that the name field is not empty.
    if (characterName === "") {
        errorMsg.textContent = "Please enter a character name.";
        return;
    }

    // ------------------------------------------
    // Step 4: build the API URL
    // ------------------------------------------
    //
    // I start with the character name because that's my main required search field.
    let url = `https://rickandmortyapi.com/api/character/?name=${encodeURIComponent(characterName)}`;

    // If the user also typed a species, I add it to the URL too
    if (species !== "") {
        url += `&species=${encodeURIComponent(species)}`;
    }

    // I’m logging the URL just in case I want to check it in the console
    console.log("API URL:", url);

    try {
        // ------------------------------------------
        // Step 5: fetch the data from the API
        // ------------------------------------------
        let response = await fetch(url);

        // Convert the response into JSON so JavaScript can read it
        let data = await response.json();

        // Log the full API data for debugging if needed
        console.log("API data:", data);

        // ------------------------------------------
        // Step 6: check if there are results
        // ------------------------------------------
        //
        // If no matching characters are found,
        // the API usually won't have a results array.
        if (!data.results) {
            results.innerHTML = `<p class="no-results">No matching characters found.</p>`;
            return;
        }

        // ------------------------------------------
        // Step 7: loop through each character
        // ------------------------------------------
        //
        // For each character returned,
        // I’m creating a card and adding it to the page.
        data.results.forEach(function(character) {
            results.innerHTML += `
                <div class="card">
                    <img src="${character.image}" alt="${character.name}">
                    <div class="card-content">
                        <h2>${character.name}</h2>
                        <p><strong>Status:</strong> ${character.status}</p>
                        <p><strong>Species:</strong> ${character.species}</p>
                        <p><strong>Gender:</strong> ${character.gender}</p>
                        <p><strong>Origin:</strong> ${character.origin.name}</p>
                        <p><strong>Location:</strong> ${character.location.name}</p>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        // ------------------------------------------
        // Step 8: handle errors
        // ------------------------------------------
        //
        // If something goes wrong with fetch or the API call,
        // I show a message on the page and log the error in console.
        results.innerHTML = `<p class="no-results">Something went wrong while loading the API data.</p>`;
        console.error("Fetch error:", error);
    }
}