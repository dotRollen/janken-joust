const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      Game = mongoose.model('Game', gameSchema);

const gameSchema = new Schema({
  state: {
    type: String,
  },
  creator: {
    UID: {
      type: String,
    },
    displayName: {
      type: String,
    },
    choice: {
      type: String,
    },
  },
  joiner: {
    UID: {
      type: String,
    },
    displayName: {
      type: String,
    },
    choice: {
      type: String,
    },
  }, 
});

module.exports = Game;