const router = require('express').Router();

module.exports = (passport) => {
  router.route('/github/callback')
    .get(passport.authenticate('github'), (req, res) => {
      const user = {
        displayName: req.user.displayName,
        avatar: req.user.avatar,
        username: req.user.username,
        email: req.user.email,
        id: req.user.id,
        sessions: req.user.sessions,
        dailyQuota: req.user.dailyQuota,
        experience: req.user.experience,
      };
    })

  router.use((req, res, next) => {
    req.session.scoketId = req.query.socketId;
    next();
  });

  router.route('/github')
    .get(passport.authenticate('github'));

  return router;
}