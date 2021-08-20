import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: 'User does not exist.'});
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id}, 'mysecretkeyambot', { expiresIn: "1h"});

    res.status(200).json({ result: existingUser, token: token });
  } catch(error) {
    res.status(500).json({ message: 'Server error.' });
  }
}

export const signUp = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(404).json({ message: 'User already exist.'});
    }

    if (password !== confirmPassword) {
      return res.status(404).json({ message: 'Password dont match.'});
    }

    const hashedPassword = await bcrypt.hash(password, 12);//12 is the level of difficulty os the salst value

    const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}`});
    const token = jwt.sign({ email: email, id: result._id}, 'mysecretkeyambot', { expiresIn: "1h"});

    res.status(200).json({ result: result, token: token });
  } catch(error) {
    res.status(500).json({ message: 'Server error.' });
  }
}
