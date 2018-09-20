var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');
var config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json'), 'utf8'));
var ircClient = require(path.join(__dirname + '/Libraries/node-irc.js'));

"use strict";

var server = config.IRC.Server;
var port = config.IRC.Port;
var myNick = config.IRC.BotName;
var fullname = config.IRC.RealName;
var chan = config.IRC.Channel;
var greetmsg = config.IRC.GreetMsg;
var trigger = config.IRC.TriggerChar;
var httpregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;


var client = new ircClient(server, port, myNick, fullname);
client.verbosity = 2;
client.debug = false;

client.on('ready', function () {
    client.join(chan);
});

// Handy to see if the config options have been read correctly.
console.log("Connecting to: " + server);
console.log("On port: " + port);
console.log("As Nick: " + myNick);
console.log("My real name is: " + fullname);
console.log("I'm lurking in: " + chan);
console.log("I will be triggered when " + trigger + "Is on the front of the message in the channel");

client.on('PRIVMSG', function (data) {
    var message = 'Oh, ' + data.sender + 'you tried to message me, well... I am afraid to say that I am a bot, not a sentient being. So I am just gonna do a typical bot thing and send you your message back. Here it is : ' + data.message;
    if (data.sender !== myNick) client.say(data.sender, message);
});

client.on('KICK', function (data) {
    var privMessage = 'Im sorry but you seem to be some kind of an douche, ' + data.message[0] + ', or else you wouldnt have been kicked by ' + data.sender + ' on ' + data.receiver + ' because of ' + data.message[1];
    var chanMessage = 'Sorry guys, but ' + data.message[0] + ' had to go!';
    client.say(data.message[0], privMessage);
    client.say(data.receiver, chanMessage);
});

client.on('INVITE', function (data) {
    var message = 'Thank you for your invite to ' + data.message + ', ' + data.sender + 'However my home is #Logsee, so I will stick there. Maybe try getting your own bot?';
    client.say(data.message, message);
});

client.on('CHANMSG', function (data) {
    //pingpong will always be enabled, handy for testing
    if (data.message.match(trigger + 'ping')) {
        client.say(chan, 'pong')
    }

    //own commands in this bit, should all be represented in the config file

    //bofh excuse generator
    if (data.message.match(trigger + 'bofh')) {
        if (config.Modules.BOFH) {
            var bofhexcuse = require('huh');
            var response = bofhexcuse.get('en');
            client.say(chan, response);
        }
    };

    // Say Hello! a useless features by P0pzi <3
    if (data.message.match(new RegExp([trigger + 'hello', trigger + 'hello!', trigger + 'hey', trigger + 'hey!', trigger + 'hi', trigger + 'hi!'].join("|")))) {
        client.say(chan, `Hello ${data.sender}! \\ (•◡•) /`)
    };

    // Thank the bot, a useless features by P0pzi <3
    if (data.message.toLowerCase().match(new RegExp([trigger + 'thank', trigger + 'thanks', trigger + 'ty'].join("|")))) {
        client.say(chan, `You\'re welcome ${data.sender} <3`);
    };

    if (data.message.toLowerCase().match(new RegExp([trigger + 'yolo', trigger + 'swag', trigger + 'yoloswag'].join("|")))) {
        client.say(chan, `Bad ${data.sender}! °Д°    ┻━┻ ︵ヽ(\`Д´)ﾉ︵ ┻━┻    °Д°`)
    };

    // DuckDuckGo search
    if (data.message.toLowerCase().match(new RegExp([trigger + 's', trigger + 'search', trigger + 'google', trigger + 'ddg'].join("|")))) {
        client.say(chan, 'Searching not yet ready </3');
    };

    // Fetches web page title element
    if (data.message.match(httpregex)) {
        if (config.Modules.HttpTitleFetcher) {
            // Open the webpage, get HTML
            var attempts = 0;
            var req = function(requesting_url) {
                let req_url = url.parse(requesting_url);
                let port = req_url.protocol == 'https:' ? https : http; // Decides wether not to use the http or https packages
                
                let req_get = port.request({host: req_url.host, path: req_url.path}, function (res) {
                    let content = "";
                    res.setEncoding("utf8");

                    if (res.statusCode == 301) { // Follow redirects Todo: Add redirect limitation to stop bot going in endless loops.
                        if (attempts > 4) {
                            req_get.abort();
                            client.say(chan, `^^^ Nice redirection loop you have there ${data.sender} ^^^`);
                        } else {
                            attempts ++;
                            console.log('Redirecting...');
                            req_get.abort();
                            req(res.headers.location);
                        }
                    };

                    res.on("data", function (chunk) {
                        content += chunk;
                    });

                    res.on("end", function () {
                        if (content.includes('<title>')) {
                            var reggy = /<title>(.*)<\/title>/g
                            var title = reggy.exec(content)[1];
                            client.say(chan, `^^^ ${title} ^^^`);
                        }
                    });
                });
                req_get.end();
            };
            req(data.message);
        };
    };
});

// git notification mechanism - popzi
client.on('GIT', function (data) {
    // Is it an initial webhook test?
    console.log('Got GIT:', data);
    if (data.message.zen == 'Design for failure.') {
        client.say(chan, `Passed GIT webhook.`);
    } else {
        client.say(chan, `${data.message.pusher.name} has made a commit - ${data.message.compare}`);
    }
});

// Connect to irc
client.connect();
