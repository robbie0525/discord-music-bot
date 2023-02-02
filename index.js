// require dependencies
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

// require prefix, token, and create client
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

// global variables
var connection;
var dispatcher;
// track queue
var queue = [];
// track titles
var titles = [];

// client test
client.once('ready', () => {
  console.log('Ready!');
});

// listen for message
client.on('message', async message => {
  // return if message author is bot or prefix not present
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  // parse args
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  // play command
  if (command === 'play') {
    // return and error if no args
    if (!args.length) {
      return message.channel.send('❌ Too few arguments were provided.');
    }
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    }
    // join voice
	  connection = await message.member.voiceChannel.join();
    // combine args
    // since no other args are needed, we can combine the args
    // this allows us to search queries with more than one word
    const r = await yts(args.join(' '));
    // get first video from search
    const videos = r.videos.slice( 0, 1)
    videos.forEach( function ( v ) {
      // push tracks to next position
      queue.push(v.url);
	    // push track title
      titles.push(v.title);
      message.channel.send('✅ Added "' + v.title + '" to the queue!')
    } )

    // loops until queue is empty
    play();
    function play() {
      // ask if queue empty; if not, repeat
      if (queue.length == 1) {
        // play song
        const stream = ytdl(queue[0], { filter: 'audioonly' });
        dispatcher = connection.playStream(stream);
        message.channel.send('✅ Now playing "' + titles[0] + '"!');
        // once track ends, cycle next track and repeat
        dispatcher.on('end', () => {
          // remove current track from titles list
          titles.shift();
          // remove current track from queue
          queue.shift();
          play();
        });
      }
    }
    // stop command
  } else if (command === 'stop') {
    // return and error if bot not in voice
    if (!message.guild.me.voiceChannel) {
      message.channel.send('❌ I am not in a voice channel.')
    } else 
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    } else {
    connection.disconnect();
    message.channel.send('✅ I have left the voice channel.');
    }
    // pause command
  } else if (command === 'pause') {
    // return and error if bot not in voice
    if (!message.guild.me.voiceChannel) {
      message.channel.send('❌ I am not in a voice channel.')
    } else 
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    } else {
    dispatcher.pause(true);
    message.channel.send('✅ I have paused the stream.');
    }
    // resume command
  } else if (command === 'resume') {
    // return and error if bot not in voice
    if (!message.guild.me.voiceChannel) {
      message.channel.send('❌ I am not in a voice channel.')
    } else
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    } else {
    dispatcher.resume();
    message.channel.send('✅ I have resumed the stream.')
    }
    // volume command
  } else if (command === 'volume') {
    // return and error if bot not in voice
    if (!message.guild.me.voiceChannel) {
      message.channel.send('❌ I am not in a voice channel.')
    } else
    // return and error if no args
    if (!args.length) {
      return message.channel.send('❌ Too few arguments were provided.');
    } else
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    } else 
    // return and error if invalid args given
    if ((args[0] < 0) || (args[0] > 1)) {
      return message.channel.send('❌ Invalid arguments were provided.');
    } else {
    dispatcher.setVolume(args[0]);
    message.channel.send('✅ I have set the stream volume to ' + (args[0] * 100) + '%.');
    }
  } else if (command === 'skip') {
    // return and error if bot not in voice
    if (!message.guild.me.voiceChannel) {
      message.channel.send('❌ I am not in a voice channel.')
    } else
    // return and error if member not in voice
    if (!message.member.voiceChannel) {
      return message.channel.send('❌ You must be in a voice channel to use this.');
    } else {
    // destroy stream, and cycle next queued track
    dispatcher.destroy();
    queue.shift();
    message.channel.send('✅ I have skipped the current track.');
    }
  } else if (command === 'help') {
    message.channel.send('📒 Commands\r  • !play : Plays audio from YouTube\r  • !stop : Disconnects the bot\r  • !pause : Pauses the stream\r  • !resume : Resumes the stream\r  • !volume : Sets the volume, for a value between 0 and 1\r  • !skip : Skips the current track')
  }
});

// initialize bot
client.login(token);
