
// redis-test.js  
var redis = require("redis");
var client = redis.createClient(6380, "192.168.3.254");  

client.on("error", function(err){  
    console.log("Error: " + err);  
});  

client.get("123", function(err, reply){  
    console.log(reply);
});
// start server();
//sleep(100);
client.set("123", "456", function(err, reply){  
    console.log(reply.toString());
});  
client.get("123", function(err, reply){  
    console.log(reply.toString());
    //client.end();
});

/*
client.send_command("lpush", ["orderQ", 10001], function(err, reply) {
    console.log(reply.toString());
});


client.send_command("rpop", ["orderQ"], function(err, reply) {
    if (reply != null)
        console.log(reply.toString());
});
*/

client.get("4OzSEl3-_RSd9am94aUIXQxj_OfcPTD6", function(err, reply){  
    console.log(reply);
    //client.end();
});
client.send_command("get", "4OzSEl3-_RSd9am94aUIXQxj_OfcPTD6", function(err, reply) {
    if (reply != null)
        console.log(reply.toString());
    console.dir(reply);
});
/* execute the command directly
for (var i = 0; i < 4; i++)
{
    console.log(i + "\n");
    client.send_command("rpoplpush", ["orderQ", "tmp"], function(err, reply) {
        if (reply != null)
            console.log(reply.toString());
        console.dir(reply);
    });
}
*/
console.log("end\n");  
/*
var redis = require("redis"),
    client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() {  });

client.on("error", function (err) {
    console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});



redis.set('foo', 'bar');
redis.get('foo', function (err, result) {
  console.log(result);
});
*/