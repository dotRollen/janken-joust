const db = require('../models');

module.exports = {
  findById(req, res) {
    db.Game
      .findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create(req, res) {
    db.Game
      .create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  update(req, res) {
    db.Game
      .findOneAndUpdate(req.params.id)
      .the(dbModel = res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  remove(req, res) {
    db.Game
      .delete(something);
  },
};
