const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
var anti_spam = require("discord-anti-spam");
let xp = require('./xp.json')
require('./util/eventLoader')(client);
require('events').EventEmitter.prototype._maxListeners = 100;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.on('ready', () => {
//PLAYING,STREAMING,LISTENING,WATCHING
client.user.setActivity('dev by Kordik#1419 |~help', {type: "PLAYING"})
}); 

 anti_spam(client, {
   warnBuffer: 3, //Maximum amount of messages allowed to send in the interval time before getting warned.
   maxBuffer: 5, // Maximum amount of messages allowed to send in the interval time before getting banned.
   interval: 1000, // Amount of time in ms users can send a maximum of the maxBuffer variable before getting banned.
   warningMessage: "stop spamming or I'll whack your head off.", // Warning message send to the user indicating they are going to fast.
   banMessage: "has been banned for spamming, anyone else?", // Ban message, always tags the banned user in front of it.
   maxDuplicatesWarning: 7,// Maximum amount of duplicate messages a user can send in a timespan before getting warned
   maxDuplicatesBan: 10, // Maximum amount of duplicate messages a user can send in a timespan before getting banned
   deleteMessagesAfterBanForPastDays: 7 // Delete the spammed messages after banning for the past x days.
 });

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    const props = require(`./commands/${f}`);
    log(`Loading Command: ${props.help.name}. 👌`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      const cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  const mod_role = message.guild.roles.find('name', settings.modrolename || settings.modrolename2);
  if (mod_role && message.member.roles.has(mod_role.id)) permlvl = 2;
  const admin_role = message.guild.roles.find('name', settings.adminrolename || settings.adminrolename2);
  if (admin_role && message.member.roles.has(admin_role.id)) permlvl = 3;
  if (message.author.id === settings.ownerid || settings.ownerid2) permlvl = 4;
  return permlvl;
};


var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.on('message', message => {
if(message.content.includes('discord.gg')){
if(message.channel.name !== 'pub' || message.channel.name !== '✉┇serveurs') {
message.delete()
message.reply("You can make this only on #pub channel !")
}
}
if(message.content.includes('@everyone')){
if(message.author.bot){
let bot = message.author;
message.guild.member(bot).ban()
}}
if(message.content.startsWith(settings.prefix + "test")){
  message.channel.send("~admintest")
}
});

client.on("message", async message => {
    let xpAdd = Math.floor(Math.random() * 7) + 8;
    if(!xp[message.author.username]){
        xp[message.author.username] = {
            messages: 0,
            xp: 0,
            level: 1
        };
    }
    let curmsg = xp[message.author.username].messages;
    let curxp = xp[message.author.username].xp;
    let curlvl = xp[message.author.username].level;
    let nxtlevel = xp[message.author.username].level * 300;
    xp[message.author.username].xp = curxp + xpAdd
    xp[message.author.username].messages = curmsg + 1
    if(nxtlevel <= xp[message.author.username].xp){
        xp[message.author.username].level = curlvl + 1
        message.channel.send(`Congrats ${message.author.username}, you just advanced to ${curlvl + 1} level`).then(msg => {msg.delete(5000)});
    }
    fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
        if(err) console.log(err)
    });
    if(message.content === settings.prefix + "xp"){
        var xp_embed = new Discord.RichEmbed()
        .setColor('RANDOM')
        .setTitle(`Here is xp info of ${message.author.username}`)
        .addField("Total messages sent here :", curmsg)
        .addField("Total xp", curxp)
        .addField("Level", curlvl)
        message.channel.send(xp_embed);
    }
});


client.login(settings.token);
