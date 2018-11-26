require('dotenv');

const passport = require('passport'),
      session = require('express-session'),
      cors = require('cors'),
      mongoose = require('mongoose'),
      app = require('express')(),
      server = require('http').createServer(app),
      allRoutes = require('./routes'),
      { CLIENT_ORIGIN } = require('./config/client.config');

app.use(express.json());

app.use(passport.initialize());
require('./config/passport.config')(passport);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'this-is-super-secret',
    resave: true,
    saveUninitialized: true,
  }),
);

app.use(express.static('client/build'));
app.use('/', allRoutes(passport));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/jankenjoust')
  .then(() => {
    server.listen(process.env.PORT || 8080, () => {
      console.log(
        `🌎  ==> API Server now listening on PORT ${process.env.PORT || 8080}`,
      );
    });
  })
  .catch((err) => {
    console.log(`Error: ${err}`)
  });
