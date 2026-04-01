// I'm grabbing the modal body where the author info will go
const authorInfo = document.getElementById("authorInfo");

// I'm using event delegation so clicks on any author button will work reliably
document.addEventListener("click", async (event) => {
    const clickedAuthor = event.target.closest(".author-link");

    // If the click wasn't on an author button, I'll stop here
    if (!clickedAuthor) {
        return;
    }

    // I'm getting the author id from the button
    const authorId = clickedAuthor.dataset.authorid;

    // I'm resetting the modal content while the data loads
    authorInfo.innerHTML = "<p>Loading author information...</p>";

    try {
        // I'm calling my Express route to get the selected author's details
        const response = await fetch(`/author/${authorId}`);

        // If the response is bad, I'll throw an error
        if (!response.ok) {
            throw new Error("Could not load author data");
        }

        const data = await response.json();

        // If there isn't a date of death, I'll show N/A
        const deathDate = data.dod ? data.dod : "N/A";

        // I'm converting the sex value into a clearer label
        const sexLabel =
            data.sex === "M" ? "Male" :
            data.sex === "F" ? "Female" :
            data.sex;

        // If the portrait is missing, I'll show a fallback message
        const portraitHtml = data.portrait
            ? `<img src="${data.portrait}" alt="${data.fullName}" class="img-fluid rounded shadow author-image">`
            : `<p>No portrait available.</p>`;

        // I'm placing all the full author info into the modal
        authorInfo.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center mb-3 mb-md-0">
                    ${portraitHtml}
                </div>

                <div class="col-md-8">
                    <h3>${data.fullName}</h3>
                    <p><strong>Date of Birth:</strong> ${data.dob}</p>
                    <p><strong>Date of Death:</strong> ${deathDate}</p>
                    <p><strong>Sex:</strong> ${sexLabel}</p>
                    <p><strong>Profession:</strong> ${data.profession}</p>
                    <p><strong>Country:</strong> ${data.country}</p>
                    <p><strong>Biography:</strong> ${data.biography}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Author modal error:", error);
        authorInfo.innerHTML = `
            <p class="text-danger">
                Could not load author information.
            </p>
        `;
    }
});