const fs = require('fs')
fs.writeFileSync('./AHHH.json', JSON.stringify({hi: 1}, null, 4));