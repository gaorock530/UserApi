
  user: {
   username: String,
   password: String,
   email: Email,
   nameForCheck: String (lowwercased Username),
   registedDate: Date,
   lastVisit: Date,
   auth: String({USER, ADMIN(trade, topics...), SUPER, OWNER}),
   qualification: String({Buyer, Seller}),
   address: {
     country: String,
     state: String,
     city: String,
     district: String,
     street: String,
     detail: String
   }，
   phoneNo: Number,
   Items: [
     {
       ID: String,
       category: String(lifestock, tank, lighting...),
       price: Money,
       region: String(City)
     }
   ]
   status: [
     {
       lebal: String({active, inactive, frozen, banned}),
       date: Date
     }
   ],
   tokens: [
     {
       access: Auth,
       token: String,
       expires: Null || Date
     }
   ]
   grade: {
     level: Number,
     points: Number,
     seller: Null || {
       level: Number,
       points: Number
     }
   }
   balance: {
     usable: Money,
     deposit: Money
   },
   transactions: [{
     status: String({purchase, cancelled, transport, received, done}),
     items: [
       {
         ID: String,
         price: Money,
         amount: Number
       }
     ],
     date: Date,
     transportation: {
       compony: String,
       serialNo: String
     },
     feedback: {
       stars: Number(1~5),
       message: String
     }
   }]
  }
