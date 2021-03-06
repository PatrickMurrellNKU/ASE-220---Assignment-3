var fs = require("fs");
var http = require("http");
var bodyParser = require("body-parser");
var path = require("path");
var express = require("express");
var session = require("express-session");
const axios = require("axios");
const bcrypt = require("bcrypt");
const { debug } = require("console");
var host = "127.0.0.1";
var port = "5876";
var app = express();

app.use(express.static(path.join(__dirname, "assets")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "my password" }));

function checkIfUserIsSignedIn(req, res, next) {
  console.log(req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.send("not signed in");
    return;
  }
}

app.get("/", function (req, res, next) {
  fs.readFile("index.html", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data.toString());
  });
});

app.get("/article/:id", function (req, res, next) {
  fs.readFile("article.html", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data.toString());
  });
});

app.get("/edit/:id", checkIfUserIsSignedIn, function (req, res, next) {
  fs.readFile("author/edit.html", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data.toString());
  });
});

app.get("/API/articles", function (req, res, next) {
  fs.readFile("data/articles.json", function (err, data) {
    res.json(JSON.parse(data.toString()));
    return;
  });
});

app.get("/accounts", function (req, res, next) {
  fs.readFile("data/accounts.json", function (err, data) {
    res.json(JSON.parse(data.toString()));
    return;
  });
});

app.put("/API/articles", function (req, res, next) {
  fs.writeFile(
    "data/articles.json",
    JSON.stringify(req.body),
    function (err, data) {
      res.json(req.body);
    }
  );
});

app.get("/signin", function (req, res, next) {
  fs.readFile("signin.html", function (err, data) {
    if (err) {
      console.log(err);
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data.toString());
  });
});

app.get("/user", checkIfUserIsSignedIn, function (req, res, next) {
  res.json(req.session.user);
});

app.get("/private", checkIfUserIsSignedIn, function (req, res, next) {
  fs.readFile("private.html", function (err, data) {
    res.send(data.toString());
  });
});

app.get("/create", checkIfUserIsSignedIn, function (req, res, next) {
  fs.readFile("author/create.html", function (err, data) {
    res.send(data.toString());
  });
});

app.get("/signout", function (req, res, next) {
  req.session.user = null;
  fs.readFile("index.html", function (err, data) {
    res.send(data.toString());
  });
});

app.get("/signup", function (req, res, next) {
  fs.readFile("signup.html", function (err, data) {
    res.send(data.toString());
  });
});

app.post("/API/articles", function (req, res, next) {
  fs.readFile("data/articles.json", function (err, data) {
    var articles = JSON.parse(data.toString());
    articles.push(req.body);
    fs.writeFile(
      "data/articles.json",
      JSON.stringify(articles),
      function (err, data) {
        res.json(articles);
      }
    );
  });
});

app.post("/API/signin", function (req, res, next) {
  console.log(req.body);
  fs.readFile("data/accounts.json", function (err, data) {
    let users = JSON.parse(data.toString());
    for (let i = 0; i < users.length; i++) {
      if (
        users[i].email == req.body.email &&
        users[i].password == req.body.password
      ) {
        req.session.user = {
          ID: i,
          firstname: users[i].firstname,
          lastname: users[i].lastname,
          role: users[i].role,
        };
        res.json({ status: 1, message: "authentication is successful" });
        return;
      }
    }
    res.json({ status: -1, message: "authentication is unsuccessful" });
    return;
  });
});

app.post("/accounts", function (req, res, next) {
  fs.readFile("data/accounts.json", function (err, data) {
    users = JSON.parse(data.toString());
    // Verify if user is in database
    for (var i = 0; i < users.length; i++) {
      if (users[i].email == req.body.email) {
        res.json({ status: 1 });
        return;
      }
    }
    users.push(req.body);
    fs.writeFile(
      "data/accounts.json",
      JSON.stringify(users),
      function (err, data) {
        res.json(users);
      }
    );
  });
});

app.delete("/API/articles", function (req, res, next) {
  fs.readFile("data/articles.json", function (err, data) {
    var articles = JSON.parse(data.toString());
    for (let [i, article] of articles.entries()) {
      if (
        article.Title == req.body.Title &&
        article.Author == req.body.Author &&
        article.Date == req.body.Date
      ) {
        articles.splice(i, 1);
      }
    }
    console.log(articles);
    fs.writeFile(
      "data/articles.json",
      JSON.stringify(articles),
      function (err, data) {
        res.json(articles);
      }
    );
  });
});

app.listen(port);
module.exports = app;
