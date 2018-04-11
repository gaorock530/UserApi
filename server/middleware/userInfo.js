const useragent = require('useragent');

var ClientInfo = (req, res, next) => {
  
  req.realIP = req.header('x-real-ip') || 'no proxy';
  req.clientIP = req.header('x-forwarded-for') || req.connection.remoteAddress;
  req.clientAgent = useragent.parse(req.headers['user-agent']);
  res.setHeader('Server', 'MagicBox');
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