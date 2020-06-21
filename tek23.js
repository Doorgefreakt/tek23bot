// npm plugins
const Discord = require('discord.js'),
        fs = require('fs'),
        xml2js = require('xml2js'),
        mysql = require('mysql');

// json files to load
const { prefix, token, channelIds }= require('./config/discord.json');
const cfg_pubhub = require('./config/pubsubhubbub.json'),
        cfg_mysql = require('./config/mysql.json');

// MySQL Initialization
let con = mysql.createConnection({
    user: cfg_mysql.user,
    password: cfg_mysql.password,
    host: cfg_mysql.host,
    port: cfg_mysql.port,
    database: cfg_mysql.database
});

// Discord Initialization
const client = new Discord.Client();
client.login(`${token}`);

client.once('ready', () => {
    console.log('Tek23 Bot has started.');
});

// PubSubHubbub Initialization
const pubSubHubbub = require("pubsubhubbub"),
    crypto = require("crypto"),
    
    pubsub = pubSubHubbub.createServer({
        callbackUrl: cfg_pubhub.callbackURL,
    }),
    
    topic = cfg_pubhub.topic,
    hub = cfg_pubhub.hub;

pubsub.listen(cfg_pubhub.port);

// PubSubHubbub functions
pubsub.on("subscribe", function(data){
    console.log("Subscribed "+ topic);
    console.log("to " + hub);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribed " + topic);
    console.log("from " + hub);
});

pubsub.on("error", function(error){
    console.log("Error");
    console.log(error);
});

pubsub.on("listen", function(){
    console.log("Server listening on port %s", cfg_pubhub.port);
    pubsub.subscribe(topic, hub);
});

pubsub.on("feed", function(data){
    const parser = new xml2js.Parser({explicitRoot: false}, {mergeAttrs: true});

    const videoChannel = client.channels.cache.get(channelIds[0].videos);

    console.log("feed incoming.");
    
    parser.parseString(data.feed.toString(), function (err, result) {
        fs.writeFileSync('./log/feed/youtubeFeedData.json', JSON.stringify(result, null, 2));
    });

    if (fs.existsSync('./log/feed/youtubeFeedData.json')) {
        let youtubeFeedData = require('./log/feed/youtubeFeedData.json');
        let videoLink = youtubeFeedData['entry'][0]['link'][0]['$']['href'];
        let videoTitle = youtubeFeedData['entry'][0]['title'][0];

    } else {
        console.log('youtubeFeedData.json not found');
    }
});

// Discord functions
client.on('message', message => {
    switch (message.content) {
        case `${prefix}exit`:
            console.log("Tek23 will now shut down");
            pubsub.unsubscribe(topic, hub);
            process.exit();
        default:
            if (message.content.startsWith(prefix)) {
                message.channel.send("That command was not recognized.")
            } else {
                break;
            }
    }    
});

// General functions
