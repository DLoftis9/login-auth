const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const app = express();
const routes = require('./abstraks/routes/routes');
var cors = require("cors");

// mongodb connection to project db
// mongoose.connect("mongodb://localhost:27017/socialAbstraks");
// const db = mongoose.connection;

// mongo error
// db.on('error', console.error.bind(console, 'connection error:'));

// delcare sessions for usage
// the store property saves user's session 
// id frm logging and logging out
// app.use(session({
//   secret: 'I am local',
//   resave: true,
//   saveUninitialized: false,
//   store: new MongoStore({
//     mongooseConnection: db
//   })
// }));

app.use(cors());

// Setup request body JSON parsing.
app.use(express.json());

// Setup morgan which gives us HTTP request logging.
app.use(morgan('dev'));

// A message for the root route.
app.get('/', (req, res) => {
  res.json({
    message: 'You have accessed the root route',
  });
});

// included project based routes
// routes being with api
app.use('/api', routes);

// Send 404 if no other route matched.
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// Setup a global error handler.
app.use((err, req, res, next) => {
  console.error(`Global error handler: ${JSON.stringify(err.stack)}`);

  res.status(500).json({
    message: err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Set our port.
app.set('port', process.env.PORT || 5000);

// Start listening on our port.
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});