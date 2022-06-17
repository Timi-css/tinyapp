const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  let result = "";
  const character =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let characterLength = character.length;

  for (let i = 0; i < 6; i++) {
    result += character.charAt(Math.floor(Math.random() * characterLength));
  }
  return result;
}

function fetchUserWithEmail (email) {
  for (const userId in users) {
    if (users[userId].email === email) {
       return users[userId]
    }
    
  }
  return null;

}
// ==========================================================================

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ==========================================================================
// Login route
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password;
 if (email === "" || password === "") {
   res.send("Please fill in email and password")
   return;
 }

  const user = fetchUserWithEmail(email);


  if (user) {
    if(user.password === password) {
      res.cookie("user_id", user.id);
      res.redirect("/urls")
    } else {
      res.send("Invalid credentials")
    }
  } else {
    res.send("User not found")
  }

});

// ==========================================================================

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]; // <- if there's no cookie then user will be undefined
  const templateVars = { user: user };
  // if(user) { redirect to urls}
  // else {render login}
  console.log(user)
  if (user) {res.redirect("/urls");}
  else {
    res.render("login", templateVars)
  };

  
});

// ==========================================================================
// Logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
// ==========================================================================

// Fake database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
// ================REGISTRATION ENDPOINT=======================================
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const userEmail = users[email];
  const password = req.body.password;
  const userPassword = users[password];
  if (userEmail) { //if (users[email])
    return res
      .status(401)
      .send("Email is already in use, please enter a new email");
  }
  if (userPassword === "" || userEmail === "") {
    return res.status(401).send("Please enter in valid email and password");
  }
  users[userId] = {
    id: userId,
    email: email,
    password: password,
  };

  res.cookie("user_id", userId);
  console.log(users);
  res.redirect("/urls");
});
// ===========================================================================
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
});

// ==========================================================================

// ==========================================================================

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});
// ==========================================================================

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// ==========================================================================

// ==========================================================================

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const username = req.cookies["username"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userId] || null,
  };
  console.log("template", templateVars);
  res.render("urls_show", templateVars);
});

// ==========================================================================

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase); //add new urlObject to database
  // console.log(shortURL);
  res.redirect(`urls/${shortURL}`);
});

// ==========================================================================

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// ==========================================================================

app.get("/urls/:shortURL", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username || null,
  };
  res.render("urls_show", templateVars);
});

// ==========================================================================

app.get("/", (req, res) => {
  res.send("Hello!");
});

// ==========================================================================

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// ==========================================================================

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

// ==========================================================================

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// ==========================================================================

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

// ==========================================================================

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n");
});

// ==========================================================================

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// ==========================================================================
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// ==========================================================================
