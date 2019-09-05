import Meetup from '../models/Meetup';

class OrganizingController {
  async index(req, res) {

    console.log(req.userId);
    const organization = await Meetup.findAll({
      where: {user_id : req.userId}
    });

    return res.json(organization);
  }
}

export default new OrganizingController();
