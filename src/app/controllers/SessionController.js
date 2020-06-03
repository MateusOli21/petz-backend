const jwt = require('jsonwebtoken');
const Yup = require('yup');
const { Op } = require('sequelize');

const authConfig = require('../../config/auth');

const User = require('../models/User');
const File = require('../models/File');
const Pet = require('../models/Pet');
const Establishment = require('../models/Establishment');
const Service = require('../models/Service');

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
        include: [
          { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
        ],
        attributes: [
          'id',
          'name',
          'castred',
          'sex',
          'age',
          'weight',
          'comments',
        ],
      });

      return res.status(200).json({
        user: { id, name, provider, email, avatar, pets },
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

    const establishmentsIds = await establishments.map((establishment) => {
      const establishment_id = establishment.id;

      return establishment_id;
    });

    const services = await Service.findAll({
      where: {
        establishment_id: {
          [Op.or]: establishmentsIds,
        },
      },
      attributes: ['id', 'name', 'value', 'time', 'establishment_id'],
    });

    return res.status(200).json({
      user: { id, name, provider, email, avatar, establishments, services },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

module.exports = new SessionController();
