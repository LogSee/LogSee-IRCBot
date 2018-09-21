var path = require('path');
var fs = require('fs');
var request = require('request'); // npm install request
var url = require('url');
var config = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json'), 'utf8'));
var ircClient = require(path.join(__dirname + '/Libraries/node-irc.js'));

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
    var msg = data.message.toLowerCase();


    //pingpong will always be enabled, handy for testing
    if ([`${trigger}ping`].some(x => msg.startsWith(x))) {
        client.say(chan, 'Pong!')
    };

    //bofh excuse generator
    if ([`${trigger}bofh`].some(x => msg.startsWith(x))) {
        if (config.Modules.BOFH) {
            var bofhexcuse = require('huh');
            var response = bofhexcuse.get('en');
            client.say(chan, response);
        }
    };

    // Say Hello! a useless features by P0pzi <3
    if ([`${trigger}hi`, `${trigger}hello`].some(x => msg.startsWith(x))) {
        client.say(chan, `Hello ${data.sender}! \\ (•◡•) /`)
    };

    // Thank the bot, a useless features by P0pzi <3
    if ([`${trigger}ty`, `${trigger}thanks`, `${trigger}thank`].some(x => msg.startsWith(x))) {
        client.say(chan, `You\'re welcome ${data.sender} <3`);
    };

    // Gen-Z killer
    if ([`${trigger}swag`, `${trigger}yolo`].some(x => msg.startsWith(x))) {
        client.say(chan, `Bad ${data.sender}! °Д°    ┻━┻ ︵ヽ(\`Д´)ﾉ︵ ┻━┻    °Д°`)
    };

    if ([`${trigger}goodbot`].some(x => msg.startsWith(x))) {
        client.say(chan, `I love you ${data.sender} (◕‿◕✿)`);
    };
    if ([`${trigger}badbot`].some(x => msg.startsWith(x))) {
        client.say(chan, `ಠ╭╮ಠ no.`);
    };
    if ([`${trigger}dong`].some(x => msg.startsWith(x))) {
        client.say(chan, `(ง ͠ ͠° ͟ل͜ ͡°)ง NEVER UNDERESTIMATE THE POWER OF THE DONG (ง ͠ ͠° ͟ل͜ ͡°)ง`);
    };
    if ([`${trigger}shrug`].some(x => msg.startsWith(x))) {
        client.say(chan, `¯\\_(ツ)_/¯`);
    };
    
    // Fetches web page title element
    if (data.message.match(httpregex)) { // Screw this bit.
        if (config.Modules.HttpTitleFetcher) {
            // Open the webpage, get HTML
            requesting_url = httpregex.exec(data.message)[0];
            console.log('User requests URL', requesting_url);

            request({
                url: requesting_url
            }, function(err, response, body) {

                if (err) {
                    console.log('ERROR\n', err);
                    client.say(chan, `${data.sender} hurt me! :( Can a master please check my logs?`)
                };

                if (response) {
                    console.log('Got Response');
                    //console.log(response);

                    if (!response.headers['content-type']) {
                        console.log('No header content? wtf website?');
                    };

                    if (response.headers['content-type'] && ['image/png', 'image/jpeg'].some(x => response.headers['content-type'].match(x))) {
                        console.log('This is an image!');

                        client.say(chan, `^^^ Image hosted on ${response.request.host} (${response.request.path} - ${(response.connection.bytesRead / 1000000).toFixed(2)}MB) ^^^`)
                    };

                    if (response.headers['content-type'] && ['text/html', 'text/css'].some(x => response.headers['content-type'].match(x))) {
                        console.log('This is a readable');
                        var title_regx = /<title>(.+?)<\/title>/gms; // Find the first title in the body
                        var title = title_regx.exec(body); // SANITIZE IT
                        if (title && title.length >= 1) {
                            client.say(chan, `^^^ ${title[1].replace(/(\r\n\t|\n|\r\t)/gms,"").trim()} ^^^`);
                        } else {
                            client.say(chan, `^^^ ${response.request.host} (${response.request.path} - ${(response.connection.bytesRead / 1000000).toFixed(2)}MB) ^^^`)
                        }
                    };

                    if (response.headers['content-type'] && ['text/plain'].some(x => response.headers['content-type'].match(x))) {
                        console.log('This is plain text');
                        client.say(chan, `^^^ Raw plain text (${response.connection.bytesRead} Bytes) ^^^`);
                    };
                };
            });
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
        client.say(chan, `${data.message.pusher.name} has made a commit on project ${data.message.repository.full_name} "${data.message.head_commit.message}" - ${data.message.compare}`);
    };
});

// Connect to irc
client.connect();
