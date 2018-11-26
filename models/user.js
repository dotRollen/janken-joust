const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = mongoose.model('User', userSchema);

const userSchema = new Schema({
  provider: {
    type: String,
  },
  avatar: {
    type: String,
  },
  displayName: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  photos: [
    {
      value: {
        type: String,
      },
    },
  ],
});

module.exports = User;
