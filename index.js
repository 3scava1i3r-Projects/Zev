const { executionAsyncResource } = require('async_hooks');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db');
//const config = require("./config.json");


const { YTSearcher } = require('ytsearcher');
 
const searcher = new YTSearcher({
    key: process.env.ytkey,
    revealed: true
});
 
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
            for(i = 0; i< serverQueue.songs.length ; i++){
                //console.log(serverQueue.songs[i]);
                qembed.addField(`Song-[${i+1}]` , serverQueue.songs[i].title );
            }
            message.channel.send(qembed);
             
        }    
    }
    function info() {
        const infoembed = new Discord.MessageEmbed();
        infoembed.setColor('#add8e6')
        .setTitle('Some info on Zev Commands ','\u200B')
        .addField('Play any song - zplay <song name>','\u200B')
        .addField('Pause the current track - zpause','\u200B')
        .addField('Resume the current track - zresume','\u200B')
        .addField('Skip the currnt track - zskip','\u200B')
        .addField('Get the queue of songs - zplaylist','\u200B')
        // .addField('Save queue for future playing - zsaveq (working under progress might break the bot)','\u200B')

        message.channel.send(infoembed);
    }
    function saveq (serverQueue){

        const saveembed  = new Discord.MessageEmbed()
            .setColor('#add8e6')
            .setAuthor(`${message.channel.author}`)
            for(i = 0; i< serverQueue.songs.length ; i++){
                saveembed.addField(`Song-[${i+1}]` , serverQueue.songs[i].title );
            }

        //const json = {saveembed};

        async function qu () {
        
        const ipfsOptions = {
            EXPERIMENTAL: {
                pubsub: true
            }
        }
    
        const ipfs = await IPFS.create(ipfsOptions) 
        const orbitdb = await OrbitDB.createInstance(ipfs)
        const db = await orbitdb.keyvalue('songsq')
        console.log(db.address.toString())


        
        const options = {
            // Give write access to everyone
            accessController: {
              write: ['*']
            }
          }

        //const db = await orbitdb.keyvalue('songsq')
        await db.put(`${message.channel.author}`, {saveembed})
        const value = db.get(`${message.channel.author}`)
        console.log(value.fields)
        console.log(value)
        ipfs.stop().catch(err => console.error(err))
        }
        qu()

    }

    function loadq (name){}
    
})
 
client.login(process.env.dskey)