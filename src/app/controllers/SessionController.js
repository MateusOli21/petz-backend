const jwt = require('jsonwebtoken');
const Yup = require('yup');

const authConfig = require('../../config/auth');

const User = require('../models/User');
const File = require('../models/File');
const Pet = require('../models/Pet');
const Establishment = require('../models/Establishment');

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    const { id, name, avatar, provider } = user;

    if (!provider) {
      const pets = await Pet.findAll({
        where: { user_id: id },
        attributes: ['id', 'name', 'sex', 'age', 'weight', 'comments'],
      });

      return res.status(200).json({
        user: { id, name, provider, avatar, pets },
        token: jwt.sign({ id }, authConfig.secret, {
          expiresIn: authConfig.expiresIn,
        }),
      });
    }

    const establishments = await Establishment.findAll({
      where: { user_id: id },
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: ['id', 'name', 'email', 'contact', 'location'],
    });

    return res.status(200).json({
      user: { id, name, provider, avatar, establishments },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

module.exports = new SessionController();
