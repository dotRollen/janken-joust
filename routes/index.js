const path = require('path'),
      router = require('express').Router();

module.exports = (passport) => {
  router.use('/api/v1', apiRoutes(passport));

  router.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  return router;
}