const express = require("express");
const bcrypt = require("bcryptjs");

const Users = require("../users/users-model");

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  const rounds = process.env.HASH_ROUNDS || 12;
  const hash = bcrypt.hashSync(password, rounds);

  Users.add({ username, password: hash })
    .then(user => {
      res.status(201).json({ data: user });
    })
    .catch(err => res.json({ error: err.message }));
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .then(users => {
      const user = users[0];

      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.loggedIn = true;

        res.status(200).json({
          message: `${user.username} logged in`,
          session: req.session,
        });
      } else {
        res.status(401).json({ error: "INVALID CREDENTIALS" });
      }
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

module.exports = router;
