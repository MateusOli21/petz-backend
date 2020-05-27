const Yup = require('yup');

const Establishment = require('../models/Establishment');
const User = require('../models/User');
const File = require('../models/File');

class EstablishmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      contact: Yup.string().required(),
      location: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user.provider) {
      return res
        .status(400)
        .json({ error: 'Clients cannot create establishments.' });
    }

    const establishmentToCreate = Object.assign({ user_id: userId }, req.body);

    const { id } = await Establishment.create(establishmentToCreate);

    const establishment = await Establishment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: ['id', 'name', 'email', 'contact', 'location'],
    });

    res.status(200).json(establishment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      contact: Yup.string(),
      location: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (!user.provider) {
      return res
        .status(400)
        .json({ error: 'Clients cannot update establishments.' });
    }

    const id = req.params.id;
    const establishment = await Establishment.findOne({
      where: { id, user_id },
    });
    if (!establishment) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    await establishment.update(req.body);

    const establishmentUpdated = await Establishment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: ['id', 'name', 'email', 'contact', 'location'],
    });

    res.status(200).json(establishmentUpdated);
  }

  async delete(req, res) {
    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (!user.provider) {
      return res
        .status(400)
        .json({ error: 'Clients cannot update establishments.' });
    }

    const id = req.params.id;
    const establishment = await Establishment.findOne({
      where: { id, user_id },
      attributes: ['id', 'user_id', 'name'],
    });

    if (!establishment) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    await establishment.destroy();

    res.status(200).json(establishment);
  }
}

module.exports = new EstablishmentController();
