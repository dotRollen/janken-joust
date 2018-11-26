const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      Chat = mongoose.model('Chat', chatSchema);

const chatSchema = new Schema({
  name: {
    type: String,
  },
  message: {
    type: String,
  },
})