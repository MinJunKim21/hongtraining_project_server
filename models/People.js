const mongoose = require('mongoose');

const PeopleSchema = new mongoose.Schema(
  {
    peopleName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('People', PeopleSchema);
