const example = require('./commands/example');
const topologi = require('./commands/topologi');
const mop = require('./commands/mop');
const permit = require('./commands/permit');
const tssr = require('./commands/tssr');
const evidence = require('./commands/evidence');
const submitmop = require('./commands/submitmop');
const submittp = require('./commands/submittp');
const submitpermit = require('./commands/submitpermit');

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
      keyword: '!submittp',
      description: 'Submit Topologi file',
      accept: 'text',
      action: submittp.submitId
    },
    {
      keyword: '!submitmop',
      description: 'Submit MOP file',
      accept: 'text',
      action: submitmop.submitId
    },
    {
      keyword: '!submitpermit',
      description: 'Submit Permit file',
      accept: 'text',
      action: submitpermit.submitId
    },
  ]
};