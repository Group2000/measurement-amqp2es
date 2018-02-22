//index.js

'use strict';
var config = require('./config/config');
var amqp = require('amqplib');
var logger = require('./utils/logger');
var esClient = require('./config/elasticsearch').esClient;
var esIndex=require('./config/elasticsearch').indexName;
var request=require('request');

var reccounter=0;
var errorcounter=0;
var wificounter=0;

//TEMP SOLUTION FOR SELF_SIGNED CERTIFICATE
process.env['NODE_TLS_REJECT_UNAUTHORIZED']='0';

function bail(err){
  console.log(err);
  logger.log("error",err);
  process.exit(1);
}

function handleError(error,response){
    errorcounter+=1;
    if(!response || !response.statusCode){
        logger.log('error',error);
    }else{
        if(response.statusCode == 400){
            logger.log('error',JSON.stringify(response.body));
            if(config.debug)
              process.exit(0);
        }
        else if(response.statusCode==404){
            logger.log('error','404 - Service Down?');
            if(config.debug){
                console.log(config.webservice.uri);
                if(config.debug)
                    process.exit(0);
            }

        }
        else{
            logger.log('error',response.statusCode)
            logger.log('error',JSON.stringify(response));
            if(config.debug)
                process.exit(0);
        }
    }
}


var recursive = function () {
	logger.log("info",reccounter + " measurements posted");
	logger.log("info",wificounter +" Wifi measurements posted");
	logger.log("info",errorcounter + " errors");
	setTimeout(recursive,config.logging.interval);
}
recursive();

// when something breaks, exit, and restart
process.on('unhandledRejection', function(reason, p) {
  logger.log("error",'possibly unhandled rejection in: promise '+ p + ' reason: ' + reason);
  process.exit(0);
});

// create deadletter
amqp.connect(config.amqp.uri).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertExchange(config.amqp.deadletter, 'topic', {durable: true});
    ok = ok.then(function() {
       return ch.assertQueue(config.amqp.deadletter, {durable: true, deadLetterExchange: config.amqp.deadletter});
    });

    ok = ok.then(function() {
      return ch.bindQueue(config.amqp.deadletter, config.amqp.deadletter, '*');
    });
  });
}, function (err) {
  logger.log('error', 'couldn\'t connect, restarting');
  process.exit(0);
}).then(null, function (err) {
  logger.log('error', 'couldn\'t connect, restarting');
  process.exit(0);
});


amqp.connect(config.amqp.uri).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    var ok = ch.assertExchange(config.amqp.queue, 'direct', {durable: true});
    ok = ok.then(function() {
       logger.log("status", 'Exchange checked ');
       return ch.assertQueue(config.amqp.queue, {durable: true, deadLetterExchange: config.amqp.deadletter});
    });

    ok = ok.then(function() {
      logger.log("status", 'queue checked');
      return ch.bindQueue(config.amqp.queue, config.amqp.queue, 'cell');
    });

    ok = ok.then(function() {
    	logger.log("status", 'Queue bound to exchange');
    	ch.prefetch(100)}
    );
    ok = ok.then(function(queue) {
      return ch.consume(queue, handleEvent);
    });
    return ok;

    function handleEvent(msg) {

        var measurement=JSON.parse(msg.content.toString());

        if(measurement.measurement!==false){
            measurement.measurement=true;
        }

        var options={
            uri:config.webservice.uri,
            method:'POST',
            json:measurement
        }
        request(options,function(error,response,body){
            if(!error && response.statusCode == 200){
                ch.ack(msg);
                reccounter+=1;
                if(config.debug && reccounter==100){
                     process.exit(0);
                }
            }
            else {
                ch.nack(msg, false, false);
                handleError(error,response);
            }
        });
     }
  });
}).then(null, console.warn);


amqp.connect(config.amqp.uri).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {

    var wifiok = ch.assertExchange(config.amqp.queue, 'direct', {durable: true});

    wifiok = wifiok.then(function() {
	logger.log("status", 'Exchange checked in wifi part');
    	ch.assertQueue(config.amqp.wifiqueue, {durable: true});
    });

    wifiok = wifiok.then(function() {
      logger.log("status", 'wifi queue checked');
      return ch.bindQueue(config.amqp.wifiqueue, config.amqp.queue, 'WIFI', {'x-dead-letter-exchange': config.amqp.deadletter});
    });

    wifiok = wifiok.then(function() {
      logger.log("status", 'Connected to wifi amqp queue');
      ch.prefetch(100)}
    );
    wifiok = wifiok.then(function(queue) {
      return ch.consume(queue, handleWifiEvent);
    });
    return wifiok;

    function handleWifiEvent(msg){
        var measurement=JSON.parse(msg.content.toString());
        measurement.measurement=true;

        var options={
            uri:config.webservice.wifiuri,
            method:'POST',
            json:measurement
        }
        request(options,function(error,response,body){
            if(!error && response.statusCode == 200){
                wificounter+=1;
                ch.ack(msg);
            }
            else{
                handleError(error,response);
                ch.nack(msg, false, false);
            }
        });
    }
  });
}).then(null, console.warn);
