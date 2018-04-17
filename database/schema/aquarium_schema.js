const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  UID: {//用户ID
    type: String,
    required: true
  },
  aquarium: [{//鱼缸
    name: {type: String},
    coverPhoto: {type: String},
    gallary: [
      {
        photo: {type: String},
        createAt: {type: Date}
      }
    ],
    startAt: {
      type: Date,
      defualt: Date.now()
    },
    displayDemension: {//主缸
      unit: {type: String, required: true},
      height: {type: Number, required: true},
      width: {type: Number, required: true},
      lenght: {type: Number, required: true}
    },
    sumpDemension: {//底缸
      unit: {type: String, defualt: 0},
      height: {type: Number, defualt: 0},
      width: {type: Number, defualt: 0},
      lenght: {type: Number, defualt: 0}
    },
    stocks: {
      fish: [
        {
          class: {type: String},
          species: {type: String},
          amount: {type: Number}
        }
      ],
      coral: [
        {
          class: {type: String},
          species: {type: String},
          amount: {type: Number}
        }
      ],
      CUC: [
        {
          class: {type: String},
          species: {type: String},
          amount: {type: Number}
        }
      ],
      algae: [
        {
          class: {type: String},
          species: {type: String},
          amount: {type: Number}
        }
      ],
      others: [
        {
          class: {type: String},
          species: {type: String},
          amount: {type: Number}
        }
      ]
    },
    waterQuality: [{
      date: {type: Date},
      Temp: {unit: {type: String}, value: {type: Number}},
      PH: {unit: {type: String}, value: {type: Number}},
      KH: {unit: {type: String}, value: {type: Number}},
      GH: {unit: {type: String}, value: {type: Number}},
      NH4: {unit: {type: String}, value: {type: Number}},
      NO2: {unit: {type: String}, value: {type: Number}},
      NO3: {unit: {type: String}, value: {type: Number}},
      PO4: {unit: {type: String}, value: {type: Number}},
      CA: {unit: {type: String}, value: {type: Number}},
      MG: {unit: {type: String}, value: {type: Number}},
      FE: {unit: {type: String}, value: {type: Number}},
      SR: {unit: {type: String}, value: {type: Number}},
      CU: {unit: {type: String}, value: {type: Number}},
      CO2: {unit: {type: String}, value: {type: Number}},
      O2: {unit: {type: String}, value: {type: Number}}
    }],
    equipments: {
      skimmer: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      heater: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      pump: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      wavemaker: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      lighting: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      UV: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      airpump: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      dip: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      },
      other: {
        brand: {type: String},
        model: {type: String},
        power: {type: Number},
        amount: {type: Number}
      }
    },
    // testAlarm: [
    //   {
    //     avtive: {type: Boolean},
    //     name: {type: String}, // no3,po4
    //     time: {type: Date},// 12:30:00
    //     frequency: {type: String}// daily, weekly, monthly, custom
    //   }
    // ]
  }]
});

module.exports = schema;
