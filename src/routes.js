import { Router } from 'express';

//Imports para uploads de arquivos(bibliotca de upload)
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizingController from './app/controllers/OrganizingController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

//Chama o multer
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);
routes.put('/users', authMiddleware, UserController.update);

//Cria uma rota com um middleware para capturar um arquivo por vez(por isso o single)
routes.post('/files', upload.single('files'), FileController.store);

//Rotas do meetup
routes.get('/meetup', MeetupController.index);
routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:id', MeetupController.update);
routes.get('/organization', OrganizingController.index)

export default routes;
