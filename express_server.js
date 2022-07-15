const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
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

function fetchUserWithEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
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
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

// ==========================================================================
// Login route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.send("Please fill in email and password");
    return;
  }
  const user = fetchUserWithEmail(email);

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send("Invalid credentials");
    }
  } else {
    res.send("User not found");
  }
});

// ==========================================================================

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]; // <- if there's no cookie then user will be undefined
  const templateVars = { user: user };
  // if(user) { redirect to urls}
  // else {render login}
  console.log(user);
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// ==========================================================================
// Logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
// ==========================================================================

// ================REGISTRATION ENDPOINT=======================================
app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const userEmail = users[email];
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userPassword = users[password];
  if (userEmail) {
    //if (users[email])
    return res
      .status(401)
      .send("Email is already in use, please enter a new email");
  }
  if (userPassword === "" || userEmail === "") {
    return res.status(401).send("Please enter in valid email and password");
  }
  console.log(hashedPassword);
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = userId;
  console.log(users);
  res.redirect("/urls");
});
// ===========================================================================
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("register", templateVars);
});

// ==========================================================================

// ==========================================================================

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_index", templateVars);
});
// ==========================================================================

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user: user };
  res.render("urls_new", templateVars);
});

// ==========================================================================

// ==========================================================================

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
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
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
  };
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
  const username = req.session.user_id;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username || null,
  };
  res.render("urls_show", templateVars);
});

// ==========================================================================

app.get("/", (req, res) => {
  const username = req.session.user_id;
  if (username) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// ==========================================================================

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b><body></html>\n");
});

app.get("/u/:shortUrl", (req, res) => {
  const shortURL = req.params.shortUrl;
  const url = urlDatabase[shortUrl];

  if (url) {
    res.redirect(url.longURL);
    return;
  }

  res.send("Does not exist");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});

//

// ==========================================================================

app.post("/urls/:id", (req, res) => {
  // update a url
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.id;
  // display a message if the user is not logged in, or if the URL does not belong to them
  if (
    !user ||
    !urlDatabase[shortURL] ||
    userID !== urlDatabase[shortURL].userID
  ) {
    return res.status(403).send("That URL is not yours to change!\n");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

// ==========================================================================
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// ==========================================================================
