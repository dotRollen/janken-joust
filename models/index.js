const userModel = require('./user').default,
      gameModel = require('./game').default,
      chatModel = require('./chat').default;

module.exports = {
  User: userModel,
  Game: gameModel,
  Chat: chatModel,
};
