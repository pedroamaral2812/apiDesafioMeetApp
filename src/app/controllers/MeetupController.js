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

  async update(req,res) {

    //Valida os campos, mas dessa vez nenhum campo é obrigatorio pois
    const schema = Yup.object().shape({
      titulo: Yup.string(),
      file_id: Yup.number(),
      descricao: Yup.string(),
      localizacao: Yup.string(),
      data: Yup.date(),
    });

    //Se os campos não foram preenchidos corretamente
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    //Recupera o id do usuario
    const user_id = req.userId;

    //Recupera os dados do meetup
    const meetup = await Meetup.findByPk(req.params.id);

    //Verifica se esse usuario é o que criou os meetups
    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Usuario não autorizado.' });
    }

    //Verifica se o meetup já aconteceu
    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(400).json({ error: 'Meetup com data já passada.' });
    }

    //Verifica se já passou o meetup
    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups." });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {

    //Recupera o id vindo do middleware do token
    const user_id = req.userId;

    console.log(user_id);

    //Faz o select pelo id vindo por parametro na rota
    const meetup = await Meetup.findByPk(req.params.id);

    //Verifica se esse meetup é um meetup do usuario
    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Usuario não autorizado.' });
    }

    //Verifica se o past está true
    if (meetup.past) {
      return res.status(400).json({ error: "Can't delete past meetups." });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
