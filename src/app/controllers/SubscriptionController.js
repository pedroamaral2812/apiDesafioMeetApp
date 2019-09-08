import * as Yup from 'yup';
import { isBefore, startOfDay, endOfDay, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import { Op } from 'sequelize';


import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

//Libs
import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      //Lista apenas os subcription do usuario logado.
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            data: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'data']],
    });

    return res.json(subscriptions);
  }

  async store(req, res) {

    //Recupera o usuario logado
    const user = await User.findByPk(req.userId);

    //Faz um select no meetUp
    const meetup = await Meetup.findByPk(req.params.meetupId, {
      include: [User],
    });

    //Faz um select para verifica se esse usuario não está se inscrevendo no seu meetup
    if (meetup.user_id === req.userId) {
      return res
        .status(400)
        .json({ error: "Usuário não pode se inscrever no seu proprio meetUp." });
    }

    //Verifica se não é uma pasta passada
    if (meetup.past) {
      return res.status(400).json({ error: "Não se pode inscrever em meetup já passados" });
    }

    console.log(meetup.data);
    //Verifca se o usuario já está inscrito em um meetup
    const checkDate = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            data: meetup.data,
          },
        },
      ],
    });

    if (checkDate) {
      return res
        .status(400)
        .json({ error: "Não se pode inscrever em 2 meetup do mesmo horario." });
    }

    //Grava o novo subscription
    const subscription = await Subscription.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    const formattedDate = format(
      meetup.data,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      {locale: pt}
    );

    await Mail.sendMail({
      to: `${meetup.User.name} <${user.email}>`,
      subject: "Inscrição no meetup",
      template: 'cancellation',
      context: {
        provider: meetup.User.name,
        user: user.name,
        date: formattedDate
      }
    });

    return res.json(meetup);

  }
}

export default new SubscriptionController();
