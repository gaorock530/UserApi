
const api = require('../../database/aquariumAPI');
const SERVER_ERROR = require('../const/server_error');

module.exports = (server, authentication) => {
  server.get('/:username/aquarium', authentication({auth: 'SELF'}), async (req, res) => {
    if (req.access.username.toUpperCase() !== req.params.username.toUpperCase()) return res.send({
      code: 401, msg: 'Authorization Exceeded!'
    });
    try {
      const auqa = api.fetch({_id: req.access._id});
      res.send(auqa);
    }catch(e) {
      console.log(e);
      res.send(SERVER_ERROR);
    }
  });

  server.post('/:username/auqarium/addNewAquarium', authentication({auth: 'SELF'}), async (req, res) => {
    if (req.access.username.toUpperCase() !== req.params.username.toUpperCase()) return res.send({
      code: 401, msg: 'Authorization Exceeded!'
    });
  });

  server.post('/:username/auqarium/addPhoto', authentication({auth: 'SELF'}), async (req, res) => {
    if (req.access.username.toUpperCase() !== req.params.username.toUpperCase()) return res.send({
      code: 401, msg: 'Authorization Exceeded!'
    });
  });

  server.post('/:username/auqarium/addFish', authentication({auth: 'SELF'}), async (req, res) => {
    if (req.access.username.toUpperCase() !== req.params.username.toUpperCase()) return res.send({
      code: 401, msg: 'Authorization Exceeded!'
    });
  });

}