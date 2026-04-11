/************************************************
 * Here I import the packages I need.
 ************************************************/
import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

/************************************************
 * Here I load the variables from my .env file.
 ************************************************/
dotenv.config();

/************************************************
 * Here I create my Express app.
 ************************************************/
const app = express();

/************************************************
 * Here I set the port.
 * Render gives a port when deployed.
 * Locally I use 3000.
 ************************************************/
const PORT = process.env.PORT || 3000;

/************************************************
 * Here I tell Express to use EJS.
 ************************************************/
app.set("view engine", "ejs");

/************************************************
 * Here I let Express read form data.
 ************************************************/
app.use(express.urlencoded({ extended: true }));

/************************************************
 * Here I connect my public folder for CSS.
 ************************************************/
app.use(express.static("public"));

/************************************************
 * Here I create my MySQL connection pool.
 * This is how my app talks to the database.
 ************************************************/
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

/************************************************
 * HOME PAGE
 * This is my main admin dashboard.
 ************************************************/
app.get("/", async (req, res) => {
  res.render("index");
});

/************************************************
 * AUTHORS PAGE
 * Here I get all authors so I can show them
 * in a table on the authors page.
 ************************************************/
app.get("/authors", async (req, res) => {
  try {
    const sql = `
      SELECT authorId, firstName, lastName, profession, country
      FROM q_authors
      ORDER BY lastName, firstName
    `;

    const [authors] = await pool.query(sql);

    res.render("authors", { authors });
  } catch (error) {
    console.log(error);
    res.send("Error loading authors.");
  }
});

/************************************************
 * SHOW ADD AUTHOR FORM
 ************************************************/
app.get("/authors/new", async (req, res) => {
  res.render("addAuthor");
});

/************************************************
 * ADD AUTHOR
 * Here I insert a new author into the database.
 ************************************************/
app.post("/authors/new", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      dod,
      profession,
      country,
      gender,
      portrait,
      biography
    } = req.body;

    const sql = `
      INSERT INTO q_authors
      (firstName, lastName, dob, dod, profession, country, gender, portrait, biography)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      firstName,
      lastName,
      dob || null,
      dod || null,
      profession,
      country,
      gender,
      portrait,
      biography
    ]);

    res.redirect("/authors");
  } catch (error) {
    console.log(error);
    res.send("Error adding author.");
  }
});

/************************************************
 * SHOW EDIT AUTHOR FORM
 * Here I get one author by id and send it
 * into the form so the values are pre-filled.
 ************************************************/
app.get("/authors/edit/:authorId", async (req, res) => {
  try {
    const authorId = req.params.authorId;

    const sql = `
      SELECT *
      FROM q_authors
      WHERE authorId = ?
    `;

    const [rows] = await pool.query(sql, [authorId]);

    if (rows.length === 0) {
      return res.send("Author not found.");
    }

    res.render("editAuthor", { author: rows[0] });
  } catch (error) {
    console.log(error);
    res.send("Error loading author.");
  }
});

/************************************************
 * UPDATE AUTHOR
 * Here I save the edits made to the author.
 ************************************************/
app.post("/authors/edit/:authorId", async (req, res) => {
  try {
    const authorId = req.params.authorId;

    const {
      firstName,
      lastName,
      dob,
      dod,
      profession,
      country,
      gender,
      portrait,
      biography
    } = req.body;

    const sql = `
      UPDATE q_authors
      SET firstName = ?,
          lastName = ?,
          dob = ?,
          dod = ?,
          profession = ?,
          country = ?,
          gender = ?,
          portrait = ?,
          biography = ?
      WHERE authorId = ?
    `;

    await pool.query(sql, [
      firstName,
      lastName,
      dob || null,
      dod || null,
      profession,
      country,
      gender,
      portrait,
      biography,
      authorId
    ]);

    res.redirect("/authors");
  } catch (error) {
    console.log(error);
    res.send("Error updating author.");
  }
});

/************************************************
 * DELETE AUTHOR
 * Here I delete the selected author.
 ************************************************/
app.get("/authors/delete/:authorId", async (req, res) => {
  try {
    const authorId = req.params.authorId;

    const sql = `
      DELETE FROM q_authors
      WHERE authorId = ?
    `;

    await pool.query(sql, [authorId]);

    res.redirect("/authors");
  } catch (error) {
    console.log(error);
    res.send("Error deleting author. If this author has quotes attached, delete those quotes first.");
  }
});

/************************************************
 * QUOTES PAGE
 * Here I join quotes with authors and categories
 * so the table shows readable information.
 ************************************************/
app.get("/quotes", async (req, res) => {
  try {
    const sql = `
      SELECT q.quoteId,
             q.quote,
             q.authorId,
             q.categoryId,
             a.firstName,
             a.lastName,
             c.category
      FROM q_quotes q
      JOIN q_authors a ON q.authorId = a.authorId
      JOIN q_categories c ON q.categoryId = c.categoryId
      ORDER BY q.quoteId
    `;

    const [quotes] = await pool.query(sql);

    res.render("quotes", { quotes });
  } catch (error) {
    console.log(error);
    res.send("Error loading quotes.");
  }
});

/************************************************
 * SHOW ADD QUOTE FORM
 * Here I load the authors list and categories
 * list from the database for the dropdowns.
 ************************************************/
app.get("/quotes/new", async (req, res) => {
  try {
    const authorSql = `
      SELECT authorId, firstName, lastName
      FROM q_authors
      ORDER BY lastName, firstName
    `;

    const categorySql = `
      SELECT categoryId, category
      FROM q_categories
      ORDER BY category
    `;

    const [authors] = await pool.query(authorSql);
    const [categories] = await pool.query(categorySql);

    res.render("addQuote", { authors, categories });
  } catch (error) {
    console.log(error);
    res.send("Error loading add quote form.");
  }
});

/************************************************
 * ADD QUOTE
 * Here I insert a new quote into the database.
 ************************************************/
app.post("/quotes/new", async (req, res) => {
  try {
    const { quote, authorId, categoryId } = req.body;

    const sql = `
      INSERT INTO q_quotes
      (quote, authorId, categoryId)
      VALUES (?, ?, ?)
    `;

    await pool.query(sql, [quote, authorId, categoryId]);

    res.redirect("/quotes");
  } catch (error) {
    console.log(error);
    res.send("Error adding quote.");
  }
});

/************************************************
 * SHOW EDIT QUOTE FORM
 * Here I get the quote plus the author and
 * category dropdown data so everything is
 * pre-filled correctly.
 ************************************************/
app.get("/quotes/edit/:quoteId", async (req, res) => {
  try {
    const quoteId = req.params.quoteId;

    const quoteSql = `
      SELECT *
      FROM q_quotes
      WHERE quoteId = ?
    `;

    const authorSql = `
      SELECT authorId, firstName, lastName
      FROM q_authors
      ORDER BY lastName, firstName
    `;

    const categorySql = `
      SELECT categoryId, category
      FROM q_categories
      ORDER BY category
    `;

    const [quoteRows] = await pool.query(quoteSql, [quoteId]);
    const [authors] = await pool.query(authorSql);
    const [categories] = await pool.query(categorySql);

    if (quoteRows.length === 0) {
      return res.send("Quote not found.");
    }

    res.render("editQuote", {
      quoteRecord: quoteRows[0],
      authors,
      categories
    });
  } catch (error) {
    console.log(error);
    res.send("Error loading quote.");
  }
});

/************************************************
 * UPDATE QUOTE
 * Here I save the quote edits.
 ************************************************/
app.post("/quotes/edit/:quoteId", async (req, res) => {
  try {
    const quoteId = req.params.quoteId;
    const { quote, authorId, categoryId } = req.body;

    const sql = `
      UPDATE q_quotes
      SET quote = ?,
          authorId = ?,
          categoryId = ?
      WHERE quoteId = ?
    `;

    await pool.query(sql, [quote, authorId, categoryId, quoteId]);

    res.redirect("/quotes");
  } catch (error) {
    console.log(error);
    res.send("Error updating quote.");
  }
});

/************************************************
 * DELETE QUOTE
 * Here I delete the selected quote.
 ************************************************/
app.get("/quotes/delete/:quoteId", async (req, res) => {
  try {
    const quoteId = req.params.quoteId;

    const sql = `
      DELETE FROM q_quotes
      WHERE quoteId = ?
    `;

    await pool.query(sql, [quoteId]);

    res.redirect("/quotes");
  } catch (error) {
    console.log(error);
    res.send("Error deleting quote.");
  }
});

/************************************************
 * START SERVER
 ************************************************/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});