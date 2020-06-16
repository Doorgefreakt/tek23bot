const config = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Tek23 Bot has started.');
});

client.login(config.token);

client.on('message', message => {
    if (message.content === 'ping') {
        message.channel.send('pong');
    };
});
