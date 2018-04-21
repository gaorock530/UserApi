# Localhost
Transactions:                  10000 
Availability:                    100 %
Elapsed time:                 16.737 s
Response time:               166.747 ms
Transaction rate:            597.479 trans/sec
Average Concurrency:          99.671 
Successful transactions:       10000 
Failed transactions:               0 
Longest transaction:             279 ms
90th percentile:                 196 ms
50th percentile:                 164 ms
Shortest transaction:             54 ms
# aliyun
Transactions:                  10000 
Availability:                  98.54 %
Elapsed time:                 85.081 s
Response time:               841.839 ms
Transaction rate:            117.535 trans/sec
Average Concurrency:          98.977 
Successful transactions:        9854 
Failed transactions:             146 
Longest transaction:            9904 ms
90th percentile:                1154 ms
50th percentile:                 284 ms
Shortest transaction:             10 ms
#Heroku
Transactions:                  10000 
Availability:                  99.84 %
Elapsed time:                124.212 s
Response time:               996.973 ms
Transaction rate:             80.508 trans/sec
Average Concurrency:           81.76 
Successful transactions:        9984 
Failed transactions:              16 
Longest transaction:           84565 ms
90th percentile:                1691 ms
50th percentile:                 624 ms
Shortest transaction:            525 ms
#Taobao
Transactions:                  10000 
Availability:                    100 %
Elapsed time:                142.223 s
Response time:              1390.832 ms
Transaction rate:             70.312 trans/sec
Average Concurrency:          97.841 
Successful transactions:       10000 
Failed transactions:               0 
Longest transaction:           19463 ms
90th percentile:                3170 ms
50th percentile:                 299 ms
Shortest transaction:             33 ms

siegem -c 100 -d0 -r 100 -H 'token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWQ4ZWUwODEyYmU3ZjEwNjAxNzk5ZGYiLCJhY2Nlc3MiOjIsImhhc2giOiJjUnFMZ1p2cUhyM1hzbzBKdEZJMXRoeEFhUEtCdWF5aU1EbC94L1VGTDUwIiwiZXhwaXJlcyI6MTUyNDc5OTc1MjgzNywiaWF0IjoxNTI0MTY2MTUzfQ.DUpW_ocNVfsVSIJ3CqN_SKJCX4kOjH_kpBlkqu0Y-1Q' http://localhost:5000/user/magic444


siegem -c 1500 -d0 -r 1 -H 'token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWQ4ZWUwODEyYmU3ZjEwNjAxNzk5ZGYiLCJhY2Nlc3MiOjIsImhhc2giOiJjUnFMZ1p2cUhyM1hzbzBKdEZJMXRoeEFhUEtCdWF5aU1EbC94L1VGTDUwIiwiZXhwaXJlcyI6MTUyNDc5OTc1MjgzNywiaWF0IjoxNTI0MTY2MTUzfQ.DUpW_ocNVfsVSIJ3CqN_SKJCX4kOjH_kpBlkqu0Y-1Q' http://www.baiud.com

siegem -c 100 -d0 -r 100 http://www.taobao.com/

siegem -c 100 -d0 -r 100 -H 'token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YWRhY2UwMzNhNmY5OTAwMTRmYTJlMzgiLCJhY2Nlc3MiOjIsImhhc2giOiJjUnFMZ1p2cUhyM1hzbzBKdEZJMXRoeEFhUEtCdWF5aU1EbC94L1VGTDUwIiwiZXhwaXJlcyI6MTUyNDg5MzgyNjkwOSwiaWF0IjoxNTI0Mjg5MDI3fQ.-FJqv3Vo4JVypJYUFh9Bp0lxluOjUQyo2Fs2jjIvAzQ' https://magic-userapi-reefapp.herokuapp.com/user/punkhead