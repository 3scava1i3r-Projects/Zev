const { executionAsyncResource } = require('async_hooks');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');

//const config = require("./config.json");
const fetch = require("node-fetch");
const glitchyPing = require("glitchy-ping");


const { YTSearcher } = require('ytsearcher');
 
const searcher = new YTSearcher({
    key: process.env.ytkey,
    revealed: true
});

var http = require("http");
http
  .createServer(function (req, res) {
    res.write("I'm alive");
    res.end();
  })
  .listen(8080);

const client = new Discord.Client();
const queue = new Map();
 
client.on("ready", () => {
    console.log("I am online!");
})
 
client.on("message", async(message) => {
    const prefix = 'z';
 
    const serverQueue = queue.get(message.guild.id);
 
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const name = message.content.length

    const extraarg = message.content.slice(5, message.content.length).trim();
    switch(command){
        case 'play':
            execute(message, serverQueue);
            break;
        case 'stop':
            stop(message, serverQueue);
            break;
        case 'skip':
            skip(message, serverQueue);
            break;
        case 'pause':
            pause(serverQueue);
            break;
        case 'resume':
            resume(serverQueue);
            break;
        case 'playlist':
            playlist(serverQueue);
            break;
        case 'saveq':
            saveq(serverQueue);
            break;
        case 'info':
            info();
            break;
        case 'loadq':
            loadq(name);
            break;
        case 'valo' :
            
            
            valo(extraarg)
        default:
            
                          
    }
 
    async function execute(message, serverQueue){
        let vc = message.member.voice.channel;
        if(!vc){
            return message.channel.send("Please join a voice chat first");
        }else{
            let result = await searcher.search(args.join(" "), { type: "video" })
            const songInfo = await ytdl.getInfo(result.first.url)
 
            let song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };
 
            if(!serverQueue){
                const queueConstructor = {
                    txtChannel: message.channel,
                    vChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 10,
                    playing: true
                };
                queue.set(message.guild.id, queueConstructor);
 
                queueConstructor.songs.push(song);
 
                try{
                    let connection = await vc.join();
                    queueConstructor.connection = connection;
                    play(message.guild, queueConstructor.songs[0]);
                }catch (err){
                    console.error(err);
                    queue.delete(message.guild.id);
                    return message.channel.send(`Unable to join the voice chat ${err}`)
                }
            }else{
                serverQueue.songs.push(song);
                return message.channel.send(`The song has been added ${song.url}`);
            }
        }
    }
    function play(guild, song){
        const serverQueue = queue.get(guild.id);
        if(!song){
            serverQueue.vChannel.leave();
            queue.delete(guild.id);
            return;
        }
        const dispatcher = serverQueue.connection
            .play(ytdl(song.url))
            .on('finish', () =>{
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            serverQueue.txtChannel.send(`Now playing ${serverQueue.songs[0].url}`)
    }
    function stop (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first!")
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
    function skip (message, serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first");
        if(!serverQueue)
            return message.channel.send("There is nothing to skip!");
        serverQueue.connection.dispatcher.end();
    }
    function pause (serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first");
        if(!serverQueue.connection)
            return message.channel.send("There is no songs being played");
        if(serverQueue.connection.dispatcher.paused){
            return message.channel.send("already paused!"); 
        }     
        serverQueue.connection.dispatcher.pause();    
        message.channel.send("Paused the current song!");
    }
    function resume (serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first");
        if(!serverQueue.connection)
            return message.channel.send("There is no songs being played");
        if(serverQueue.connection.dispatcher.resumed){
            return message.channel.send("already resume!"); 
        }     
        serverQueue.connection.dispatcher.resume();    
        message.channel.send("Resuming the current song!");
    }
    function playlist (serverQueue){
        if(!message.member.voice.channel)
            return message.channel.send("You need to join the voice chat first");
        if(!serverQueue){
            return message.channel.send("nothing to save! add a song first");
        }else{

            const qembed  = new Discord.MessageEmbed();
            qembed.setColor('#add8e6');
            for(let i = 0; i< serverQueue.songs.length ; i++){
                //console.log(serverQueue.songs[i]);
                qembed.addField(`Song-[${i+1}]` , serverQueue.songs[i].title );
            }
            message.channel.send(qembed);
             
        }    
    }
    function info() {
        const infoembed = new Discord.MessageEmbed();
        infoembed
          .setColor("#add8e6")
          .setTitle("Some info on Zev Commands ", "\u200B")
          .addField("Play any song - zplay <song name>", "\u200B")
          .addField("Pause the current track - zpause", "\u200B")
          .addField("Resume the current track - zresume", "\u200B")
          .addField("Skip the currnt track - zskip", "\u200B")
          .addField("Get the queue of songs - zplaylist", "\u200B")
          .addField("Get information about your selected agent - zvalo <agent name>", "\u200B");
        

        message.channel.send(infoembed);
    }
    function saveq (serverQueue){

        const saveembed  = new Discord.MessageEmbed()
            .setColor('#add8e6')
            .setAuthor(`${message.channel.author}`)
            for(let i = 0; i< serverQueue.songs.length ; i++){
                saveembed.addField(`Song-[${i+1}]` , serverQueue.songs[i].title );
            }

        //const json = {saveembed};

        

    }

    function loadq (name){}

    function valo(name){

        fetch("https://valorant-api.com/v1/agents")
          .then((response) => response.json())
          .then((data) => {
              const valoembed = new Discord.MessageEmbed();
              valoembed
                .setColor("#add8e6")
                .setTitle(`Some info on selected Valorant Agent`, "\u200B")
                .setThumbnail(
                  "https://cdn.dribbble.com/users/2348/screenshots/10696082/valorant_1_4x.png"
                );
            for (let i = 0 ; i< data.data.length ; i++){
                
                if (name == data.data[i].displayName.toLowerCase())
                    {
                    console.log("i am free");

                    valoembed
                      .addField(`Agent Number: ${i}`, "\u200B")
                      .setImage(`${data.data[i].displayIcon}`)
                      .addField(`Name: ${data.data[i].displayName}`, "\u200B")
                      .addField(
                        `Description: ${data.data[i].description}`,
                        "\u200B"
                      )
                      .addField(
                        `${data.data[i].role.displayName}: ${data.data[i].role.description}`,
                        "\u200B"
                      );
                    }       
                }
              console.log("---")

              message.channel.send(valoembed);
        });
    }
})
//let gg;

//if(gg === 5){
//  gg = 0;
//}
//setInterval(async () => {
//  await fetch("https://paint-functional-mistake.glitch.me").then(gg++)
//},240000)

glitchyPing.pingURL("https://paint-functional-mistake.glitch.me", 180000); // 180000ms == 180s == 3min


 
<<<<<<< HEAD
/* setInterval(async () => {
  await fetch("https://paint-functional-mistake.glitch.me").then(
    console.log("pinged!")
  );
}, 240000);
 */  // for pinging in glitch

client.login(process.env.dskey);


// check uptimerobot pls for uptiming bot also glitch for deploying
=======
client.login(process.env.dskey);
>>>>>>> b1420f3388f2bcc3129e5e13f64bab1d1803c48a
