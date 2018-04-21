'use strict';

const useragent = require('useragent');

var ClientInfo = (req, res, next) => {
  const IP = req.header('x-real-ip') || 'no proxy';
  const REMOTEIP = req.header('x-forwarded-for') || req.connection.remoteAddress;
  const AGENT = useragent.parse(req.headers['user-agent']);
  req.userInfo = {
    IP: {
      realIP: IP,
      remoteIP: REMOTEIP
    },
    agent: AGENT
  }
  res.setHeader('Server', 'MagicBox');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();

  // //check if client broswer is IE and < 11
  // if (useragent.is(req.headers['user-agent']).ie && parseInt(req.clientAgent.toVersion()) < 11){
  //   //res.render('ie',{browser: req.clientAgent.toAgent()});
  //   res.render('index');

  // //check if client is mobile device
  // }else if (/(android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|phone)/ig.test(req.clientAgent.device.toString())) {
  //   //res.render('mobile',{device: req.clientAgent.device.toString()});
  //   res.render('index');
  // //normal
  // }else{
  //   next();
  // }

};

module.exports = ClientInfo;