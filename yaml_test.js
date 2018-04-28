const yaml = require('js-yaml');
const fs   = require('fs');


const SexyYamlType = new yaml.Type('!sexy', {
  kind: 'sequence',
  construct: function (data) {
    return data.map(function (string) { return 'sexy ' + string; });
  }
});

const SEXY_SCHEMA = yaml.Schema.create([ SexyYamlType ]);

// const result = yaml.load(yourData, { schema: SEXY_SCHEMA });
// Get document, or throw exception on error
try {
  const file = fs.readFileSync(__dirname + '/sample.yml', 'utf8');
  const doc = yaml.safeLoad(file, { schema: SEXY_SCHEMA });
  console.log(doc.seq);
  const text = yaml.safeDump(doc, { schema: SEXY_SCHEMA });
  fs.writeFile(__dirname + '/yaml_output.yml', text, () => {
    console.log('yaml file saved as yaml_output.yml');
  })
    
  
  
} catch (e) {
  console.log(e);
}

