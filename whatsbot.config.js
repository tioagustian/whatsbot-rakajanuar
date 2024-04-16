const example = require('./commands/example');
const topologi = require('./commands/topologi');
const mop = require('./commands/mop');
const permit = require('./commands/permit');
const tssr = require('./commands/tssr');
const evidence = require('./commands/evidence');
const submitmop = require('./commands/submitmop');
const submittp = require('./commands/submittp');
const submitpermit = require('./commands/submitpermit');
const abd = require('./commands/abd');
const patp = require('./commands/patp');

module.exports = {
  cpm: 1000,
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
      keyword: '!tssr',
      description: 'Submit TSSR',
      accept: 'text',
      action: tssr.submitId
    },
    {
      keyword: '!evidence',
      description: 'Submit evidence',
      accept: 'text',
      action: evidence.submitId
    },
    {
      keyword: '!abd',
      description: 'Submit ABD file',
      accept: 'text',
      action: abd.submitId
    },
    {
      keyword: '!patp',
      description: 'Submit PATP file',
      accept: 'text',
      action: patp.submitId
    },
  ]
};