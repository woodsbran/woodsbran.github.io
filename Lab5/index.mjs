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
        // I'm getting the list of categories from the quotes table
        const [categories] = await pool.query(`
            SELECT DISTINCT category
            FROM q_quotes
            ORDER BY category
        `);

        // I'm getting the full author names from the authors table
        const [authors] = await pool.query(`
            SELECT authorId, CONCAT(firstName, ' ', lastName) AS fullName
            FROM q_authors
            ORDER BY firstName, lastName
        `);

        // Right now I'm just sending empty quotes until I build the search
        res.render("index", {
            categories,
            authors,
            quotes: []
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