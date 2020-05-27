const { Router } = require('express');

const routes = new Router();

routes.get('/', (req, res) => {
  res.status(200).json({ success: 'ok' });
});

module.exports = routes;
