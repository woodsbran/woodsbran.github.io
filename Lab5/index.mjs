// I'm importing express to create my server
import express from "express";

// I'm importing mysql so I can connect to my database
import mysql from "mysql2/promise";

// I'm creating my express app
const app = express();

// I'm setting EJS so I can render pages
app.set("view engine", "ejs");

// This lets me use files like css and js from the public folder
app.use(express.static("public"));

// This lets me read form data from the page
app.use(express.urlencoded({ extended: true }));

// This is my database connection using the credentials I got
const pool = mysql.createPool({
    host: "sql3.freesqldatabase.com",
    user: "sql3821835",
    password: "ipdqXWzxBk",
    database: "sql3821835",
    port: 3306,
    connectionLimit: 10,
    waitForConnections: true
});

// This is my home route
app.get("/", async (req, res) => {
    try {
        // I'm grabbing whatever the user typed or selected from the form
        const keyword = req.query.keyword || "";
        const category = req.query.category || "";
        const authorId = req.query.authorId || "";
        const minLikes = req.query.minLikes || "";
        const maxLikes = req.query.maxLikes || "";

        // I'm getting the list of categories from the database for the dropdown
        const [categories] = await pool.query(`
            SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category
        `);

        // I'm getting the full author names from the database for the dropdown
        const [authors] = await pool.query(`
            SELECT authorId, CONCAT(firstName, ' ', lastName) AS fullName
            FROM q_authors
            ORDER BY firstName, lastName
        `);

        // This is my main query to get quotes and the author name together
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

        // I'm using this array to safely store the values for the query
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

        // If the user picked an author, I'll filter by that author
        if (authorId) {
            sql += ` AND q.authorId = ?`;
            params.push(authorId);
        }

        // If the user entered a minimum likes value, I'll filter for that
        if (minLikes) {
            sql += ` AND q.likes >= ?`;
            params.push(minLikes);
        }

        // If the user entered a maximum likes value, I'll filter for that
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
            authorId,
            minLikes,
            maxLikes
        });

    } catch (err) {
        console.error(err);
        res.send("Database error");
    }
});

// This is just a test route to make sure my database works
app.get("/dbTest", async (req, res) => {
    try {
        // I'm getting a few quotes from my database
        const [rows] = await pool.query("SELECT * FROM q_quotes LIMIT 5");

        // I'm sending them to the browser
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