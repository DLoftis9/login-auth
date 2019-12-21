var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); // remove with passport implementation

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true
  }
},
{
  timestamps: true
}
);

// authenticate input against database documents
// may have to look up how to track sessions using passport
UserSchema.statics.authenticate = function(email, password, callback) {
  // set up a query to find the document 
  // with the user's email address
  User.findOne({ email: email })
    .exec(function (error, user) {
      if (error) {
        return callback(error);
      } else if( !user ) {
        // returning an error if there was a problem with the 
        // document (e.g. cannot find a user in the database)
        var err = new Error('User not found');
        err.status = 401;
        return callback(err);
      }
      // if successful for finding a user's docuent in the database, 
      // use the compare method to comare the supplied password 
      // with the hashed version
      bcrypt.compare(password, user.password, function(error, result) { // remove with passport implementation
        if (result === true) {
          // if the passwords match, return null or the 
          // user's document because the user is authentic
          // the null represents a error
          return callback(null, user);
        } else {
          return callback();
        }
      })
    })
}

// remove UserSchema.pre() with passport implementation
// hash password before saving to database
UserSchema.pre('save', function(next) {
   var user = this;
   bcrypt.hash(user.password, 10, function(err, hash) {
    if(err) {
      return next(err);
    }

    user.password = hash;
    next(); 
   });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;