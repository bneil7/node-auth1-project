const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

const usersRouter = require("./users/users-router.js");
const authRouter = require("./auth/auth-router.js");
const dbConnection = require("./database/db-config.js");
const protected = require("./auth/protected-mw.js");

const server = express();

const sessionConfiguration = {
  name: "Cookie Monster",
  secret: process.env.SECRET || "literally just noms bud",
  cookie: {
    maxAge: 1000 * 60 * 10, // cookie expires after 10 mins
    secure: process.env.COOKIE_SECURE || false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: true,
  store: new KnexSessionStore({
    knex: dbConnection,
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 1000 * 60 * 60, // delete expired sessions every hour
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfiguration));

server.use("/api/users", protected, usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.get("/hash", (req, res) => {
  try {
    // read a password property from the headers
    const password = req.headers.password;

    // hash the password and send it back. both the password and the hash
    const rounds = process.env.HASH_ROUNDS || 8; // 8 is the number of rounds as 2 ^ 8
    const hash = bcrypt.hashSync(password, rounds);

    res.status(200).json({ password, hash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = server;
