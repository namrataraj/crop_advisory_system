import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios"; 

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "cropadvreg",
  password: "mahi4122",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

//i added for navigating to  dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard.ejs"); 
});
//till here
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password; 
  const crop_preferences = req.body.crop_preferences || null; // Optional field
  const location = req.body.location;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
        res.send("Email already exists. Try logging in.");
    } else {
        //const hashedPassword = await bcrypt.hash(password, 10); // Don't forget to hash the password
        const result = await db.query(
            "INSERT INTO users (name, email, password, crop_preferences, location) VALUES ($1, $2, $3, $4, $5)",
            [name, email, password, crop_preferences, location]
        );
        console.log(result);
        res.render("login.ejs");
    }
  } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register user." });
  }
});


app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      if (password === storedPassword) {
        res.render("dashboard.ejs");
      } else {
        res.send("Incorrect Password");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/predict", async (req, res) => {
  try {
    const response = await axios.post('http://localhost:5000/predict', req.body); // Update the URL if needed
    res.json(response.data); // Send the prediction back to the frontend
  } catch (error) {
    console.error("Error making prediction:", error);
    res.status(500).json({ error: "Failed to make prediction." });
  }
});





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
