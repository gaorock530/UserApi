const server = require('./app');
const request = require('supertest');

it('should run', (done) => {
  request(server)
    .post('/register')
    .expect('Not Found')
    .end(done)
})