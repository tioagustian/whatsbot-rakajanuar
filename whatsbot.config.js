const example = require('./commands/example');
const topologi = require('./commands/topologi');
const mop = require('./commands/mop');
const permit = require('./commands/permit');
const tikor = require('./commands/tikor');
const ttsr = require('./commands/ttsr');

module.exports = {
  cpm: 750,
  welcomeMessage: {
    enabled: true,
    message: 'Welcome to WhatsBot!',
    showMenu: true,
  },
  router: [
    {
      keyword: '!help',
      description: 'Show menu',
      showMenu: true
    },
    {
      keyword: '!ping',
      description: 'Ping!',
      accept: 'text',
      action: example.ping
    },
    {
      keyword: '!topologi',
      description: 'Topologi',
      accept: 'text',
      action: topologi.submitId
    },
    {
      keyword: '!mop',
      description: 'MOP',
      accept: 'text',
      action: mop.submitId
    },
    {
      keyword: '!permit',
      description: 'Permit',
      accept: 'text',
      action: permit.submitId
    },
    {
      keyword: '!ttsr',
      description: 'Submit TTSR',
      accept: 'text',
      action: ttsr.submitId
    }
  ]
};