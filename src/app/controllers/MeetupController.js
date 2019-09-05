import * as Yup from 'yup';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {user_id : 1}
    });

    return res.json(meetup);
  }

  async store(req, res) {

    //Faz as validações atraves do YUP
    const schema = Yup.object().shape({
      titulo: Yup.string().required(),
      file_id: Yup.number().required(),
      descricao: Yup.string().required(),
      localizacao: Yup.string().required(),
      data: Yup.date().required(),
    });

    //Retorna erro caso a validação de campos encontre algum erro
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    //Verifica se a data que será inserida é uma data já passada. O metodo isBefore já faz essa comparação
    if (isBefore(parseISO(req.body.data), new Date())) {
      return res.status(400).json({ error: 'Data Passadas não são permitidas' });
    }

    //Recupera o id do usuario vindo do middleware
    const user_id = req.userId;

    console.log(req.body);
    //Insere no banco de dados o meeteep
    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.json(meetup);

  }
}

export default new MeetupController();
