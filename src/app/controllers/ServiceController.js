const Yup = require('yup');

const Service = require('../models/Service');
const User = require('../models/User');
const Establishment = require('../models/Establishment');

class ServiceController {
  async index(req, res) {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user.provider) {
      return res
        .status(400)
        .json({ error: 'Clients cannot create establishments.' });
    }

    const establishmentId = req.params.establishmentId;
    const establishmentExists = await Establishment.findOne({
      where: {
        id: establishmentId,
        user_id: userId,
      },
    });

    if (!establishmentExists) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    const services = await Service.findAll({
      where: { establishment_id: establishmentId },
      attributes: ['id', 'name', 'value', 'time'],
    });

    return res.status(200).json(services);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      value: Yup.number().required(),
      time: Yup.number().required(),
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

    const establishmentId = req.params.establishmentId;
    const establishmentExists = await Establishment.findOne({
      where: {
        id: establishmentId,
        user_id: userId,
      },
    });

    if (!establishmentExists) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    const serviceToCreate = Object.assign(
      { establishment_id: establishmentId },
      req.body
    );

    const { id } = await Service.create(serviceToCreate);
    const service = await Service.findByPk(id, {
      include: [
        {
          model: Establishment,
          as: 'establishment',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'name', 'value', 'time'],
    });

    return res.status(200).json(service);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      value: Yup.number(),
      time: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user.provider) {
      return res.status(400).json({ error: 'Clients cannot update services.' });
    }

    const establishmentId = req.params.establishmentId;
    const establishmentExists = await Establishment.findOne({
      where: {
        id: establishmentId,
        user_id: userId,
      },
    });

    if (!establishmentExists) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    const id = req.params.id;
    const service = await Service.findOne({
      where: {
        id,
        establishment_id: establishmentId,
      },
    });

    if (!service) {
      return res.status(400).json({ error: 'Service not found.' });
    }

    await service.update(req.body);

    const serviceUpdated = await Service.findByPk(id, {
      include: [
        {
          model: Establishment,
          as: 'establishment',
          attributes: ['id', 'name'],
        },
      ],
      attributes: ['id', 'name', 'value', 'time'],
    });

    return res.status(200).json(serviceUpdated);
  }

  async delete(req, res) {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user.provider) {
      return res.status(400).json({ error: 'Clients cannot delete services.' });
    }

    const establishmentId = req.params.establishmentId;
    const establishmentExists = await Establishment.findOne({
      where: {
        id: establishmentId,
        user_id: userId,
      },
    });

    if (!establishmentExists) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    const id = req.params.id;
    const service = await Service.findOne({
      where: {
        id,
        establishment_id: establishmentId,
      },
      attributes: ['id', 'establishment_id', 'name'],
    });

    if (!service) {
      return res.status(400).json({ error: 'Service not found.' });
    }

    await service.destroy();

    return res.status(200).json(service);
  }
}

module.exports = new ServiceController();
