const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const authRoute = require('./routes/auth');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require('dotenv').config();

const PeopleModel = require('./models/People');
const People = require('./models/People');
const Usermanager = require('./models/Usermanager');

//db 연결하기
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log('connected to mongoDB'))
  .catch((err) => console.log(err));

//middleware
app.use(express.json());
app.use(cors({ origin: 'https://crople.netlify.app', credentials: true }));

app.set('trust proxy', 1);

app.use(
  session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // One Week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// session에 user를 저장하는데, 쿠키로 세션아이디를 시리얼라이즈함 그떄 시리얼화 반대화를 진행
passport.serializeUser((user, done) => {
  return done(null, user._id);
});

passport.deserializeUser((id, done) => {
  Usermanager.findById(id, (err, doc) => {
    return done(null, doc);
  });

  // User.findById(id, (err: Error, doc: IMongoDBUser) => {
  //   // Whatever we return goes to the client and binds to the req.user property
  //   return done(null, doc);
  // })
});

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: '/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      // called on successful authentication
      // insert into database
      // console.log(profile);
      // cb(null, profile);
      Usermanager.findOne({ googleId: profile.id }, async (err, doc) => {
        if (err) {
          return cb(err, null);
        }
        // doc이 없으면 새로 하나 유저를 저장함

        //여기 부분을 켰다 껏다하면 새로운 유저 로그인이  디비에 저장되었다가 아니었다가
        if (!doc) {
          const newUsermanager = new Usermanager({
            googleId: profile.id,
            username: profile.name.givenName,
          });

          await newUsermanager.save();
          cb(null, newUsermanager);
        }

        cb(null, doc);
      });
    }
  )
);
// 바로 밑의 get req를 젤 먼저하고, 위의 client id 있는 부분의 과정으로 인증을 검사하고, client id 있는 부분 바로 밑의 function을 콜백한다 인증과정이 성공적이라면. 그러고서 결과가 어쩌든 간에 get auth/google/callback 인 콜백함수를 진행.
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'https://crople.netlify.app/signinpage',
    // session: true,
  }),
  function (req, res) {
    // successful authentication, redirect
    res.redirect('https://crople.netlify.app/manager');
  }
);

app.use('/', authRoute);

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

//local5001 홈페이지 출력 테스트
app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/getuser', (req, res) => {
  res.send(req.user);
});

app.get('/auth/logout', (req, res) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.send('done');
    });
  }
});

app.listen(process.env.PORT || 5001, () => console.log('backend is running'));
