const router = require('express').Router(),
      usersRoutes = require('./users'),
      gamesRoutes = require('./resources'),
      authRoutes = require('./auth'),
      chatRoutes = require('./chats');

module.exports = (passport) => {
  router.route('/wake-up')
    .get((req, res) => res.send('I\'m Awake'));

  router.use('/users', usersRoutes(passport));
  router.use('/games', gamesRoutes(passport));
  router.use('/chats', gamesRoutes(passport));
  router.use('/auth', authRoutes(passport));

  return router;
}