const router = require('express').Router(),
      usersController = require('../../controllers/users.controller');

module.exports = (passport) => {
  router.route('/')
    .get((req, res) => res.json({ message: 'users endpoint' }));

  router.route('/:id')
    .get((req, res) => res.json({ message: 'user id endpoint' }));

  return router;
};