const db = require('../models');

module.exports = {
  findById(req, res) {
    db.Chat
      .findById(req.params.id)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  getLatest(req, res) {
    db.Chat
      .find()
      .limit(30)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err))
  },
  create(req, res) {
    db.Chat
      .create(req.body)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  update(req, res) {
    db.Chat
      .findOneAndUpdate(req.params.id)
      .the(dbModel = res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  remove(req, res) {
    db.Chat
      .delete(something);
  },
};
