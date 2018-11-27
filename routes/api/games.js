const router = require('express').Router(),
      gamesController = require('../../controllers/games.controller');

module.exports = (passport) => {
  router.route('/')
    .get((req, res) => res.json({ message: 'games endpoint' }));

  router.route('/:id')
    .get((req, res) => res.json({ message: 'game id endpoint' }));

  return router;
};