var loopback = require('loopback');
var redis = require("redis");
var client = redis.createClient({
  "host": "pub-redis-14969.us-east-1-3.7.ec2.redislabs.com",
  "port": 14969,
  "auth_pass": "contra5.Cero"
});

client.on("error", function(err) {
  console.log("Error " + err);
});

module.exports = function(Person) {
  Person.sendCoord = function(coord, room, cb) {
    Person.app.io.to(room).emit('coord', {
      coord: coord,
      room: room
    });
    //
    cb(null, {
      result: true
    });
  };
  //
  Person.getLastRoomMsgs = function(room, limit, cb) {
      //GET in REDIS
      var roomKey = "room:" + room + "";
      client.lrange([
        roomKey, 0, limit
      ], function(error, data) {
        console.log(error, data);
        cb(null, {
          msgs: data
        });
      }, redis.print);
      //
    }
    //
  Person.greet = function(msg, room, cb) {

      var ctx = loopback.getCurrentContext();
      var currentUser = ctx && ctx.get('currentUser');
      console.log('currentUser.firstname: ', currentUser.firstname);
      console.log(msg, room);
      //SAVE in REDIS
      client.lpush("room:" + room + "", JSON.stringify({
        "username": currentUser.firstname,
        "msg": msg
      }), redis.print);
      //
      Person.app.io.to(room).emit('message', {
        msg: msg,
        room: room,
        username: currentUser.firstname
      });

      /*Person.app.socket.emit('message', {
        name: 'name 1'
      });*/
      cb();

      /*
          var redis = require("redis"),
            client1 = redis.createClient(),
            client2 = redis.createClient(),
            msg_count = 0;

          client1.on("subscribe", function(channel, count) {
            client2.publish("a nice channel", "I am sending a message.");
            client2.publish("a nice channel", "I am sending a second message.");
            client2.publish("a nice channel", "I am sending my last message.");
          });

          client1.on("message", function(channel, message) {
            console.log("client1 channel " + channel + ": " + message);


            //cb(null, 'Greetings... ' + message);


            msg_count += 1;
            if (msg_count === 3) {
              client1.unsubscribe();
              client1.end();
              client2.end();
            }
          });

          client1.subscribe("a nice channel");
      */
    }
    //
  Person.remoteMethod(
    'sendCoord', {
      accepts: [{
        arg: 'coord',
        type: 'object'
      }, {
        arg: 'room',
        type: 'string'
      }],
      returns: {
        arg: 'result',
        type: 'boolean'
      }
    }
  );
  //
  Person.remoteMethod(
    'greet', {
      accepts: [{
        arg: 'msg',
        type: 'string'
      }, {
        arg: 'room',
        type: 'string'
      }],
      returns: {
        arg: 'greeting',
        type: 'string'
      }
    }
  );
  //
  Person.remoteMethod(
    'getLastRoomMsgs', {
      accepts: [{
        arg: 'room',
        type: 'string'
      }, {
        arg: 'limit',
        type: 'number'
      }],
      returns: {
        arg: 'msgs',
        type: 'object'
      }
    }
  );

};
