const { parseISO, startOfDay, endOfDay } = require('date-fns');
const { Op } = require('sequelize');

const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Establishment = require('../models/Establishment');
const Service = require('../models/Service');

class ScheduleController {
  async index(req, res) {
    const user_id = req.userId;
    const establishment_id = req.params.establishmentId;

    const checkIsProvider = await User.findOne({
      where: { id: user_id, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(400).json({ error: 'User is not a provider.' });
    }

    const checkEstablishment = await Establishment.findOne({
      where: { id: establishment_id, user_id },
    });

    if (!checkEstablishment) {
      return res
        .status(400)
        .json({ error: 'You do not have permission to this establishment.' });
    }

    const { date } = req.query;
    const parsedDate = parseISO(date);
    console.log(parsedDate);

    const appointments = await Appointment.findAll({
      where: {
        establishment_id,
        canceled_at: null,
        date: { [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)] },
      },
      include: [
        { model: User, as: 'user', attributes: ['name'] },
        { model: Pet, as: 'pet', attributes: ['name'] },
        { model: Service, as: 'service', attributes: ['name'] },
      ],
      attributes: ['id', 'date'],
      order: ['date'],
    });

    res.status(200).json(appointments);
  }
}

module.exports = new ScheduleController();
