// This function runs when the user clicks an author's name
async function loadAuthorInfo(authorId) {
    // I'm grabbing the modal body where the author details will go
    const authorInfo = document.getElementById("authorInfo");

    // I'm showing a loading message first
    authorInfo.innerHTML = "<p>Loading author information...</p>";

    try {
        // I'm calling my Express route to get this author's details
        const response = await fetch(`/author/${authorId}`);

        // If the response fails, I'll throw an error
        if (!response.ok) {
            throw new Error("Could not load author information");
        }

        // I'm converting the response into JSON
        const data = await response.json();

        // I'm handling cases where some values might be missing
        const deathDate = data.dod ? data.dod : "N/A";

        const sexLabel =
            data.sex === "M" ? "Male" :
            data.sex === "F" ? "Female" :
            data.sex;

        // I'm creating a local fallback just in case Albert's online image fails
        const localAlbertFallback = "/images/albert-einstein.jpg";

        // I'm building the image tag and using a fallback if the original image fails
        let portraitHtml = "<p>No portrait available.</p>";

        if (data.portrait) {
            portraitHtml = `
                <img
                    src="${data.portrait}"
                    alt="${data.fullName}"
                    class="img-fluid rounded shadow author-image"
                    onerror="this.onerror=null; this.src='${localAlbertFallback}';"
                >
            `;
        }

        // I'm placing all the full author details into the modal
        authorInfo.innerHTML = `
            <div class="row g-4 align-items-start">
                <div class="col-md-4 text-center">
                    ${portraitHtml}
                </div>

                <div class="col-md-8">
                    <h3 class="author-name mb-3">${data.fullName}</h3>
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
}