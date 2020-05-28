const Yup = require('yup');
const { parseISO, startOfHour, isBefore, subHours } = require('date-fns');
const pt = require('date-fns/locale/pt');

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Establishment = require('../models/Establishment');
const Service = require('../models/Service');

class AppointmentController {
  async index(req, res) {
    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (user.provider) {
      return res
        .status(400)
        .json({ error: 'Providers cannot list appointments.' });
    }

    const { page = 1 } = req.query;
    const appointments = await Appointment.findAll({
      where: { user_id, canceled_at: null },
      order: ['date'],
      limit: 15,
      offset: (page - 1) * 15,
      attributes: ['id', 'date'],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name'],
        },
        {
          model: Establishment,
          as: 'establishment',
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'value', 'time'],
        },
      ],
    });
    return res.status(200).json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      pet_id: Yup.number().required(),
      establishment_id: Yup.number().required(),
      service_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const user_id = req.userId;
    const user = await User.findByPk(user_id);
    if (user.provider) {
      return res
        .status(400)
        .json({ error: 'Providers cannot create appointments.' });
    }

    const { date, establishment_id, pet_id, service_id } = req.body;

    const establishmentExists = await Establishment.findOne({
      where: { id: establishment_id },
    });
    if (!establishmentExists) {
      return res.status(400).json({ error: 'Establishment not found.' });
    }

    const serviceExists = await Service.findOne({
      where: { id: service_id, establishment_id },
    });
    if (!serviceExists) {
      return res.status(400).json({ error: 'Service not found.' });
    }

    const petExists = await Pet.findOne({ where: { id: pet_id, user_id } });
    if (!petExists) {
      return res.status(400).json({ error: 'Pet not found.' });
    }

    const hourStart = startOfHour(parseISO(date));
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const checkAvailability = await Appointment.findOne({
      where: { establishment_id, canceled_at: null, date: hourStart },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available.' });
    }

    const { id } = await Appointment.create({
      date: hourStart,
      user_id,
      pet_id,
      establishment_id,
      service_id,
    });

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name'],
        },
        {
          model: Establishment,
          as: 'establishment',
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'value', 'time'],
        },
      ],
      attributes: ['id', 'date'],
    });

    return res.status(201).json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      attributes: ['id', 'date', 'canceled_at'],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name'],
        },
        {
          model: Establishment,
          as: 'establishment',
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'value', 'time'],
        },
      ],
    });

    if (appointment.canceled_at) {
      return res.status(400).json({ error: 'Appointment already canceled.' });
    }

    if (appointment.user.id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment.",
      });
    }

    const dateWithSub = subHours(parseISO(appointment.date), 2);

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'You can only cncel appointments 2 hours in advance.' });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    return res.status(200).json(appointment);
  }
}

module.exports = new AppointmentController();
