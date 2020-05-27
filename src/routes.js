const { Router } = require('express');
const multer = require('multer');

const multerConfig = require('./config/multer');

const routes = new Router();
const upload = multer(multerConfig);

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');
const PetsController = require('./app/controllers/PetsController');
const EstablishmentController = require('./app/controllers/EstablishmentController');
const ServiceController = require('./app/controllers/ServiceController');

const authMiddleware = require('./app/middlewares/auth');

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/pets', PetsController.index);
routes.post('/pets', PetsController.store);
routes.put('/pets/:id', PetsController.update);
routes.delete('/pets/:id', PetsController.delete);

routes.get('/establishments', EstablishmentController.index);
routes.post('/establishments', EstablishmentController.store);
routes.put('/establishments/:id', EstablishmentController.update);
routes.delete('/establishments/:id', EstablishmentController.delete);

routes.get('/services/:establishmentId', ServiceController.index);
routes.post('/services/:establishmentId', ServiceController.store);
routes.put('/services/:establishmentId/:id', ServiceController.update);
routes.delete('/services/:establishmentId/:id', ServiceController.delete);

module.exports = routes;
