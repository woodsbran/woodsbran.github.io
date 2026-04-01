// I'm importing express so I can create my server
import express from "express";

// I'm importing mysql so I can connect to my database
import mysql from "mysql2/promise";

// I'm creating my express app
const app = express();

// I'm telling express to use EJS
app.set("view engine", "ejs");

// This lets me use files from my public folder like css, js, and images
app.use(express.static("public"));

// This lets me read form data from the page
app.use(express.urlencoded({ extended: true }));

// This lets me work with json when needed
app.use(express.json());

// This is my database connection
const pool = mysql.createPool({
    host: "sql3.freesqldatabase.com",
    user: "sql3821835",
    password: "ipdqXWzxBk",
    database: "sql3821835",
    port: 3306,
    connectionLimit: 10,
    waitForConnections: true
});

// This is my main home route
app.get("/", async (req, res) => {
    try {
        // I'm grabbing the values the user entered in the search form
        const keyword = req.query.keyword || "";
        const category = req.query.category || "";
        const author = req.query.author || "";
        const minLikes = req.query.minLikes || "";
        const maxLikes = req.query.maxLikes || "";

        // I'm getting all unique categories for the category dropdown
        const [categories] = await pool.query(`
            SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category
        `);

        // I'm getting all full author names for the datalist
        const [authors] = await pool.query(`
            SELECT authorId,
                   CONCAT(firstName, ' ', lastName) AS fullName
            FROM q_authors
            ORDER BY firstName, lastName
        `);

        // This is my main search query
        let sql = `
            SELECT q.quoteId,
                   q.quote,
                   q.category,
                   q.likes,
                   q.authorId,
                   CONCAT(a.firstName, ' ', a.lastName) AS fullName
            FROM q_quotes q
            JOIN q_authors a
              ON q.authorId = a.authorId
            WHERE 1
        `;

        // I'm using this array to safely hold the values for the query
        let params = [];

        // If the user typed a keyword, I'll search inside the quote text
        if (keyword) {
            sql += ` AND q.quote LIKE ?`;
            params.push(`%${keyword}%`);
        }

        // If the user picked a category, I'll filter by category
        if (category) {
            sql += ` AND q.category = ?`;
            params.push(category);
        }

        // If the user typed an author name, I'll search by the full author name
        if (author) {
            sql += ` AND CONCAT(a.firstName, ' ', a.lastName) LIKE ?`;
            params.push(`%${author}%`);
        }

        // If the user entered a minimum likes value, I'll use it
        if (minLikes) {
            sql += ` AND q.likes >= ?`;
            params.push(minLikes);
        }

        // If the user entered a maximum likes value, I'll use it
        if (maxLikes) {
            sql += ` AND q.likes <= ?`;
            params.push(maxLikes);
        }

        // I'm sorting the results from highest likes to lowest
        sql += ` ORDER BY q.likes DESC`;

        // I'm running the finished query
        const [quotes] = await pool.query(sql, params);

        // I'm sending everything to the page
        res.render("index", {
            categories,
            authors,
            quotes,
            keyword,
            category,
            author,
            minLikes,
            maxLikes
        });

    } catch (err) {
        console.error("Home route error:", err);
        res.send("Database error");
    }
});

// This route gets one author's full info for the modal
app.get("/author/:authorId", async (req, res) => {
    try {
        // I'm getting the author id from the URL
        const authorId = req.params.authorId;

        // I'm pulling the full author info from the database
        const [rows] = await pool.query(`
            SELECT authorId,
                   firstName,
                   lastName,
                   CONCAT(firstName, ' ', lastName) AS fullName,
                   dob,
                   dod,
                   sex,
                   profession,
                   country,
                   portrait,
                   biography
            FROM q_authors
            WHERE authorId = ?
        `, [authorId]);

        // If the author isn't found, I'll return an error
        if (rows.length === 0) {
            return res.status(404).json({ error: "Author not found" });
        }

        // I'm sending the author back as json
        res.json(rows[0]);

    } catch (err) {
        console.error("Author route error:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// This is still my database test route
app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM q_quotes LIMIT 5");
        res.send(rows);
    } catch (err) {
        console.error(err);
        res.send("Database error");
    }
});

// This starts my server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});