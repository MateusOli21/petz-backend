const { Router } = require('express');
const multer = require('multer');

const multerConfig = require('./config/multer');

const routes = new Router();
const upload = multer(multerConfig);

const UserController = require('./app/controllers/UserController');
const SessionController = require('./app/controllers/SessionController');
const FileController = require('./app/controllers/FileController');
const PetsController = require('./app/controllers/PetsController');

const authMiddleware = require('./app/middlewares/auth');

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/pets', PetsController.store);
routes.put('/pets/:id', PetsController.update);
routes.delete('/pets/:id', PetsController.delete);

module.exports = routes;
