var ircClient = require('node-irc');
var path = require('path');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json'), 'utf8'));

var server = config.IRC.Server,
    port = config.IRC.port,
    myNick = config.IRC.BotName,
    fullname = config.IRC.RealName
    chan = config.IRC.Channel;

var client = new ircClient(server, port, myNick, fullname);
client.verbosity = 2;


client.on('ready', function () {
    client.join(chan);
});

console.log(server);
console.log(port);
console.log(myNick);
console.log(fullname);
console.log(chan);
client.connect();