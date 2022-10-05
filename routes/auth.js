const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//Register
router.post(
  'https://hongtrainingbe.herokuapp.com/server/auth/register',
  async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
        role: req.body.role,
      });
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//Login
router.post(
  'https://hongtrainingbe.herokuapp.com/server/auth/login',
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      !user && res.status(400).json('Wrong credentialsdddd');

      const validated = await bcrypt.compare(req.body.password, user.password);
      !validated && res.status(400).json('Wrong credentialsssss!');

      const { password, ...others } = user._doc; //password 숨긴게 user로 넘겨지지 않게 하는 과정. others를 넘기고, 그 안에 _doc에는 패스워드 뺀 data들 사용 가능
      res.status(200).json(others);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

module.exports = router;
