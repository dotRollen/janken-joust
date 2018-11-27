const router = require('express').Router(),
      chatsController = require('../../controllers/chats.controller');

module.exports = (passport) => {
  router.route('/')
    .get((req, res) => res.json({ message: 'chats endpoint' }));

  return router;
};