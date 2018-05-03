const _ = require('lodash');
const api = require('../api/todoApi');
const {ConvertUTCTimeToLocalTime} = require('../helper/timezone');
const ERROR = require('../const/error');

module.exports = (server, authentication) => {
  server.get('/todoList', authentication({auth: 'SELF'}), (req, res) => {
    res.status(200).send(req.user.todoList);
  });

  server.get('/todo/load', authentication({auth: 'SELF'}), (req, res) => {
    if (req.query.id) {
      const list = req.user.todoList.filter((todos) => {
        return todos.id === req.query.id;
      })
      res.status(200).send(list[0].todos);
    }else {
      const list = req.user.todoList.map((todos) => {
        return {title: todos.title, id: todos.id};
      });
      res.status(200).send(list);
    }
  });

  server.post('/todo/register', async (req, res) => {
    const registerObj = _.pick(req.body, api.allowedToModify);
    if (!registerObj.username || !registerObj.password || !registerObj.email) return res.status(400).send(ERROR(400));
    const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
    try {
      const cb = await api.register(registerObj, req.userInfo.IP, req.userInfo.agent, expires);
      res.status(cb.code).send(ERROR(cb.code, cb.msg));
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  /**
   * -------------------------------------
   * @description{Login/out}
   * -------------------------------------
   */
  server.post('/todo/login', async(req, res) => {
    //check if complete body
    const {loginString, password} = req.body;
    if (!loginString || !password) return res.status(400).send(ERROR(400));
    //check input type
    let check;
    if (api.vaildEmail(loginString)) check = {'email': loginString.toUpperCase()};
    else if (api.vaildUsername(loginString)) check = {'nameForCheck': loginString.toUpperCase()};
    else return res.status(400).send(ERROR(400, 'Input Not Vaild!'));

    try {
      const user = await api.check(check);
      if (!user) return res.status(404).send(ERROR(404));
      const isPasswordVaild = api.checkPassword(user, password);
      if (!isPasswordVaild) return res.status(401).send(ERROR(401));
      const expires = ConvertUTCTimeToLocalTime(true, null, process.env.EXPIRES_DAY);
      const token = await user.generateAuthToken(req.userInfo.IP, req.userInfo.agent, expires);
      return res.status(200).send({
        username: user.username,
        token,
        todoList: user.todoList
      });
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  server.post('/todo/logout', authentication({auth: 'SELF'}), async (req, res) => {
    // return console.log(req.user, req.headers.token);
    try {
      const cb = await req.user.removeToken(req.headers.token);
      if (!cb) res.status(403).send(ERROR(403));
      res.status(200).send(`${req.user.username} has logged out!`);
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403));
    }
  });

  server.post('/todo/isLogin', authentication({auth: 'SELF'}), (req, res) => {
    res.status(200).send({ username: req.user.username });
  });

  server.post('/todo/create', authentication({auth: 'SELF'}), async (req, res) => {
    try {
      if (!req.body.title) return res.status(406).send('Miss title');
      const cb = await api.createList(req.user, req.body.title);
      res.status(200).send(cb);
    }catch(e){
      console.log(e);
      res.status(400).send(e);
    }
    // res.send(req.body.title);
  })

  server.put('/todo/updateTodo', authentication({auth: 'SELF'}), async (req, res) => {
    if (!req.body.todos || !req.body.id || !req.body.title) return res.status(400).send(ERROR(400, 'miss [todos || id || title]'));
    let cb;
    try{
      const todos = JSON.parse(req.body.todos);
      if (Object.keys(todos).length === 0) {
        cb = await api.updateListTitle(req.user, req.body.id, req.body.title , todos);
      }else {
        cb = await api.updateTodos(req.user, req.body.id, req.body.title , todos);
      }
      // if (cb.code !== 200) return res.status(cb.code).send(ERROR(cb.code, cb.msg))
      res.status(200).send({code: 200, data: cb});
    }catch(e) {
      console.log(e);
      res.status(403).send(ERROR(403, e));
    }
  })
}