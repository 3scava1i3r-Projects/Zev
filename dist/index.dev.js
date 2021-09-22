"use strict";

var _require = require('async_hooks'),
    executionAsyncResource = _require.executionAsyncResource;

var Discord = require('discord.js');

var ytdl = require('ytdl-core');

var IPFS = require('ipfs');

var OrbitDB = require('orbit-db'); //const config = require("./config.json");


var fetch = require("node-fetch");

var _require2 = require('ytsearcher'),
    YTSearcher = _require2.YTSearcher;

var searcher = new YTSearcher({
  key: process.env.ytkey,
  revealed: true
});

var http = require("http");

http.createServer(function (req, res) {
  res.write("I'm alive");
  res.end();
}).listen(8080);
var client = new Discord.Client();
var queue = new Map();
client.on("ready", function () {
  console.log("I am online!");
});
client.on("message", function _callee(message) {
  var prefix, serverQueue, args, command, name, extraarg, execute, play, stop, skip, pause, resume, playlist, info, saveq, loadq, valo;
  return regeneratorRuntime.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          valo = function _ref11(name) {
            fetch("https://valorant-api.com/v1/agents").then(function (response) {
              return response.json();
            }).then(function (data) {
              var valoembed = new Discord.MessageEmbed();
              valoembed.setColor("#add8e6").setTitle("Some info on selected Valorant Agent", "\u200B").setThumbnail("https://cdn.dribbble.com/users/2348/screenshots/10696082/valorant_1_4x.png");

              for (i = 0; i < data.data.length; i++) {
                if (name == data.data[i].displayName.toLowerCase()) {
                  console.log("i am free");
                  valoembed.addField("Agent Number: ".concat(i), "\u200B").setImage("".concat(data.data[i].displayIcon)).addField("Name: ".concat(data.data[i].displayName), "\u200B").addField("Description: ".concat(data.data[i].description), "\u200B").addField("".concat(data.data[i].role.displayName, ": ").concat(data.data[i].role.description), "\u200B");
                }
              }

              console.log("---");
              message.channel.send(valoembed);
            });
          };

          loadq = function _ref10(name) {};

          saveq = function _ref9(serverQueue) {
            var saveembed = new Discord.MessageEmbed().setColor('#add8e6').setAuthor("".concat(message.channel.author));

            for (i = 0; i < serverQueue.songs.length; i++) {
              saveembed.addField("Song-[".concat(i + 1, "]"), serverQueue.songs[i].title);
            } //const json = {saveembed};


            function qu() {
              var ipfsOptions, ipfs, orbitdb, db, options, value;
              return regeneratorRuntime.async(function qu$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      ipfsOptions = {
                        EXPERIMENTAL: {
                          pubsub: true
                        }
                      };
                      _context2.next = 3;
                      return regeneratorRuntime.awrap(IPFS.create(ipfsOptions));

                    case 3:
                      ipfs = _context2.sent;
                      _context2.next = 6;
                      return regeneratorRuntime.awrap(OrbitDB.createInstance(ipfs));

                    case 6:
                      orbitdb = _context2.sent;
                      _context2.next = 9;
                      return regeneratorRuntime.awrap(orbitdb.keyvalue('songsq'));

                    case 9:
                      db = _context2.sent;
                      console.log(db.address.toString());
                      options = {
                        // Give write access to everyone
                        accessController: {
                          write: ['*']
                        }
                      }; //const db = await orbitdb.keyvalue('songsq')

                      _context2.next = 14;
                      return regeneratorRuntime.awrap(db.put("".concat(message.channel.author), {
                        saveembed: saveembed
                      }));

                    case 14:
                      value = db.get("".concat(message.channel.author));
                      console.log(value.fields);
                      console.log(value);
                      ipfs.stop()["catch"](function (err) {
                        return console.error(err);
                      });

                    case 18:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }

            qu();
          };

          info = function _ref8() {
            var infoembed = new Discord.MessageEmbed();
            infoembed.setColor("#add8e6").setTitle("Some info on Zev Commands ", "\u200B").addField("Play any song - zplay <song name>", "\u200B").addField("Pause the current track - zpause", "\u200B").addField("Resume the current track - zresume", "\u200B").addField("Skip the currnt track - zskip", "\u200B").addField("Get the queue of songs - zplaylist", "\u200B").addField("Get information about your selected agent - zvalo <agent name>", "\u200B");
            message.channel.send(infoembed);
          };

          playlist = function _ref7(serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You need to join the voice chat first");

            if (!serverQueue) {
              return message.channel.send("nothing to save! add a song first");
            } else {
              var qembed = new Discord.MessageEmbed();
              qembed.setColor('#add8e6');

              for (i = 0; i < serverQueue.songs.length; i++) {
                //console.log(serverQueue.songs[i]);
                qembed.addField("Song-[".concat(i + 1, "]"), serverQueue.songs[i].title);
              }

              message.channel.send(qembed);
            }
          };

          resume = function _ref6(serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You need to join the voice chat first");
            if (!serverQueue.connection) return message.channel.send("There is no songs being played");

            if (serverQueue.connection.dispatcher.resumed) {
              return message.channel.send("already resume!");
            }

            serverQueue.connection.dispatcher.resume();
            message.channel.send("Resuming the current song!");
          };

          pause = function _ref5(serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You need to join the voice chat first");
            if (!serverQueue.connection) return message.channel.send("There is no songs being played");

            if (serverQueue.connection.dispatcher.paused) {
              return message.channel.send("already paused!");
            }

            serverQueue.connection.dispatcher.pause();
            message.channel.send("Paused the current song!");
          };

          skip = function _ref4(message, serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You need to join the voice chat first");
            if (!serverQueue) return message.channel.send("There is nothing to skip!");
            serverQueue.connection.dispatcher.end();
          };

          stop = function _ref3(message, serverQueue) {
            if (!message.member.voice.channel) return message.channel.send("You need to join the voice chat first!");
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end();
          };

          play = function _ref2(guild, song) {
            var serverQueue = queue.get(guild.id);

            if (!song) {
              serverQueue.vChannel.leave();
              queue["delete"](guild.id);
              return;
            }

            var dispatcher = serverQueue.connection.play(ytdl(song.url)).on('finish', function () {
              serverQueue.songs.shift();
              play(guild, serverQueue.songs[0]);
            });
            serverQueue.txtChannel.send("Now playing ".concat(serverQueue.songs[0].url));
          };

          execute = function _ref(message, serverQueue) {
            var vc, result, songInfo, song, queueConstructor, connection;
            return regeneratorRuntime.async(function execute$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    vc = message.member.voice.channel;

                    if (vc) {
                      _context.next = 5;
                      break;
                    }

                    return _context.abrupt("return", message.channel.send("Please join a voice chat first"));

                  case 5:
                    _context.next = 7;
                    return regeneratorRuntime.awrap(searcher.search(args.join(" "), {
                      type: "video"
                    }));

                  case 7:
                    result = _context.sent;
                    _context.next = 10;
                    return regeneratorRuntime.awrap(ytdl.getInfo(result.first.url));

                  case 10:
                    songInfo = _context.sent;
                    song = {
                      title: songInfo.videoDetails.title,
                      url: songInfo.videoDetails.video_url
                    };

                    if (serverQueue) {
                      _context.next = 31;
                      break;
                    }

                    queueConstructor = {
                      txtChannel: message.channel,
                      vChannel: vc,
                      connection: null,
                      songs: [],
                      volume: 10,
                      playing: true
                    };
                    queue.set(message.guild.id, queueConstructor);
                    queueConstructor.songs.push(song);
                    _context.prev = 16;
                    _context.next = 19;
                    return regeneratorRuntime.awrap(vc.join());

                  case 19:
                    connection = _context.sent;
                    queueConstructor.connection = connection;
                    play(message.guild, queueConstructor.songs[0]);
                    _context.next = 29;
                    break;

                  case 24:
                    _context.prev = 24;
                    _context.t0 = _context["catch"](16);
                    console.error(_context.t0);
                    queue["delete"](message.guild.id);
                    return _context.abrupt("return", message.channel.send("Unable to join the voice chat ".concat(_context.t0)));

                  case 29:
                    _context.next = 33;
                    break;

                  case 31:
                    serverQueue.songs.push(song);
                    return _context.abrupt("return", message.channel.send("The song has been added ".concat(song.url)));

                  case 33:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, null, [[16, 24]]);
          };

          prefix = 'z';
          serverQueue = queue.get(message.guild.id);
          args = message.content.slice(prefix.length).trim().split(/ +/g);
          command = args.shift().toLowerCase();
          name = message.content.length;
          extraarg = message.content.slice(5, message.content.length).trim();
          _context3.t0 = command;
          _context3.next = _context3.t0 === 'play' ? 20 : _context3.t0 === 'stop' ? 22 : _context3.t0 === 'skip' ? 24 : _context3.t0 === 'pause' ? 26 : _context3.t0 === 'resume' ? 28 : _context3.t0 === 'playlist' ? 30 : _context3.t0 === 'saveq' ? 32 : _context3.t0 === 'info' ? 34 : _context3.t0 === 'loadq' ? 36 : _context3.t0 === 'valo' ? 38 : 41;
          break;

        case 20:
          execute(message, serverQueue);
          return _context3.abrupt("break", 41);

        case 22:
          stop(message, serverQueue);
          return _context3.abrupt("break", 41);

        case 24:
          skip(message, serverQueue);
          return _context3.abrupt("break", 41);

        case 26:
          pause(serverQueue);
          return _context3.abrupt("break", 41);

        case 28:
          resume(serverQueue);
          return _context3.abrupt("break", 41);

        case 30:
          playlist(serverQueue);
          return _context3.abrupt("break", 41);

        case 32:
          saveq(serverQueue);
          return _context3.abrupt("break", 41);

        case 34:
          info();
          return _context3.abrupt("break", 41);

        case 36:
          loadq(name);
          return _context3.abrupt("break", 41);

        case 38:
          console.log(name);
          console.log(extraarg);
          valo(extraarg);

        case 41:
        case "end":
          return _context3.stop();
      }
    }
  });
});
client.login(process.env.dskey);