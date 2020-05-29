const Yup = require('yup');

const Pet = require('../models/Pet');
const User = require('../models/User');
const File = require('../models/File');

class PetController {
  async index(req, res) {
    const user_id = req.userId;

    const pets = await Pet.findAll({
      where: { user_id },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: ['id', 'name', 'sex', 'age', 'weight', 'comments'],
    });

    return res.status(200).json(pets);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      age: Yup.number(),
      sex: Yup.string(),
      weight: Yup.number(),
      castred: Yup.string(),
      comments: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const userId = req.userId;
    const user = await User.findByPk(userId);

    if (user.provider) {
      return res.status(400).json({ error: 'Providers cannot create pets.' });
    }

    const petToCreate = Object.assign({ user_id: userId }, req.body);

    const { id } = await Pet.create(petToCreate);

    const pet = await Pet.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: [
        'id',
        'user_id',
        'name',
        'sex',
        'age',
        'weight',
        'castred',
        'comments',
      ],
    });

    return res.status(201).json(pet);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      age: Yup.number(),
      sex: Yup.string(),
      weight: Yup.number(),
      castred: Yup.string(),
      comments: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (user.provider) {
      return res.status(400).json({ error: 'Providers cannot update pets.' });
    }

    const id = req.params.id;
    const pet = await Pet.findOne({ where: { id, user_id } });
    if (!pet) {
      return res.status(400).json({ error: 'Pet not found.' });
    }

    await pet.update(req.body);

    const petUpdated = await Pet.findByPk(id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name'] },
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
      attributes: ['id', 'name', 'sex', 'age', 'weight', 'castred', 'comments'],
    });

    return res.status(200).json(petUpdated);
  }

  async delete(req, res) {
    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (user.provider) {
      return res.status(400).json({ error: 'Providers cannot update pets.' });
    }

    const id = req.params.id;
    const pet = await Pet.findOne({
      where: { id, user_id },
      attributes: ['id', 'user_id', 'name'],
    });

    if (!pet) {
      return res.status(400).json({ error: 'Pet not found.' });
    }

    await pet.destroy();

    return res.status(200).json(pet);
  }
}

module.exports = new PetController();
