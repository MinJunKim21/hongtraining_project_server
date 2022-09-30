const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();
const authRoute = require('./routes/auth');

const PeopleModel = require('./models/People');
const People = require('./models/People');

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(console.log('connected to mongoDB'))
  .catch((err) => console.log(err));

app.use('/server/auth', authRoute);

app.post('/insert', async (req, res) => {
  const peopleName = req.body.peopleName;
  const gender = req.body.gender;
  const partnerGender = req.body.partnerGender;
  const healthExperience = req.body.healthExperience;
  const partnerExperience = req.body.partnerExperience;
  const whyVolunteer = req.body.whyVolunteer;

  const people = new PeopleModel({
    peopleName: peopleName,
    gender: gender,
    partnerGender: partnerGender,
    healthExperience: healthExperience,
    partnerExperience: partnerExperience,
    whyVolunteer: whyVolunteer,
  });

  try {
    await people.save();
    res.send('inserted data');
  } catch (err) {
    console.log(err);
  }
});

app.get('/read', async (req, res) => {
  PeopleModel.find({}, (err, result) => {
    if (err) {
      res.send(err);
    }

    res.send(result);
  });
});

app.put('/update', async (req, res) => {
  const newPeopleName = req.body.newPeopleName;
  const id = req.body.id;

  try {
    await PeopleModel.findById(id, (err, updatedPeople) => {
      updatedPeople.peopleName = newPeopleName;
      updatedPeople.save();
      res.send('update');
    });
  } catch (err) {
    console.log(err);
  }
});

app.delete('/delete/:id', async (req, res) => {
  const id = req.params.id;

  await PeopleModel.findByIdAndRemove(id).exec();
  res.send('deleted');
});

app.listen(process.env.PORT || 5001, () => console.log('backend is running'));
