const mongoose = require('mongoose');

const UsermanagerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Usermanager', UsermanagerSchema);
