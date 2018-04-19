module.exports = (code, msg) => {
  switch (code) {
    case 200:
      return msg;
    case 400:
      return {msg: msg || 'Missing Condition! Bad Arguments!'}
    case 401:
      return {msg: msg || 'Not Authrozied!'}
    case 403:
      return {msg: msg || 'Please contact ADMIN to check {console.log} for more Information!'};
    case 404:
      return {msg: msg || 'Nothing Found!'};
    case 406:
      return {msg: msg || 'Not Allowed!'};
    default:
      throw 'Wrong response code';
  }
} 