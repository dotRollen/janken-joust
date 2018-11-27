const { Strategy: GithubStrategy } = require('passport-github'),
      { GITHUB_CONFIG } = require('./oauth.config'),
      User = require('../models/user');

module.exports = (passport) => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((obj, done) => done(null, obj));

  passport.use(
    new GithubStrategy(
      GITHUB_CONFIG,
      (accessToken, refreshToken, profile, done) => {
        User.findOne({
          email: profile.emails[0].value,
        },
        (err, user) => {
          if (err) {
            return done(err);
          };

          if (!user) {
            const newUser = new User();

            newUser.displayName = profile.displayName;
            newUser.provider = profile.provider;
            newUser.username = profile.username;
            newUser.email = profile.emails[0].value;
            newUser.avatar = profile.photos[0].value;

            newUser.save((error, user) => {
              if (err) return done(err);
              return done(null, user);
            });
          } else {
            return done(null, user);
          }
        }
        )
      }
    )
  );
  // TODO google strategy
}