'use strict';
const autocannon = require('autocannon')
 
autocannon({
  url: 'http://localhost:5000/user/magic444',
  // url: 'http://shadowstrike.tv/',
  connections: 10000, //default
  pipelining: 100, // default
  duration: 5,
  headers: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWQ4ZWUwODEyYmU3ZjEwNjAxNzk5ZGYiLCJhY2Nlc3MiOjIsImhhc2giOiJjUnFMZ1p2cUhyM1hzbzBKdEZJMXRoeEFhUEtCdWF5aU1EbC94L1VGTDUwIiwiZXhwaXJlcyI6MTUyNDc5OTc1MjgzNywiaWF0IjoxNTI0MTY2MTUzfQ.DUpW_ocNVfsVSIJ3CqN_SKJCX4kOjH_kpBlkqu0Y-1Q'
  }
}, console.log)
