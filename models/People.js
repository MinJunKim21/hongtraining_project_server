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
    partnerGender: {
      type: String,
      required: true,
    },
    healthExperience: {
      type: String,
      required: true,
    },
    partnerExperience: {
      type: String,
      required: true,
    },
    whyVolunteer: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('People', PeopleSchema);
