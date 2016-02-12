//elasticsearch.js
'use strict';
var elasticsearch=require("elasticsearch");
var config = require('./config');
var logger = require('../utils/logger');

var  esClient = new elasticsearch.Client({
	hosts:config.elasticsearch.hosts
});

function checkEsServer(esClient){
	esClient.ping({
		requestTimeout:1000,
		hello:"es Check"
	}).then(function(response){
		logger.log('status',"Connected to Elasticsearch cluster");

		esClient.indices.exists({index:config.elasticsearch.cell.index},function(err,response,status){
			if(response===true){
				if(config.elasticsearch.cell.deleteIndex){
					console.log('deleting cell index');
					deleteIndex('cell');
				}
			}
			else
			{
				if(config.elasticsearch.cell.createIndex){
					console.log('creating cell index');
					createIndex('cell');
				}
			}

		})

		esClient.indices.exists({index:config.elasticsearch.wifi.index},function(err,response,status){
			if(response===true){
				if(config.elasticsearch.wifi.deleteIndex){
					deleteIndex('wifi');
				}
			}
			else
			{
				if(config.elasticsearch.wifi.createIndex){
					createIndex('wifi');
				}
			}

		})

	},function(error){
		console.log("ES cluster down");
		process.exit(0);
	});
}

function deleteIndex(type){
	
	esClient.indices.delete({index: config.elasticsearch[type].index}, function(err,response,status){
		if(!err){
			logger.log('info',"Index "+ config.elasticsearch[type].index +" deleted");
			if(config.elasticsearch[type].createIndex){
				createIndex(type);
			}		
		}
    });
	
	
}

function createIndex(type){
    esClient.indices.create({index: config.elasticsearch[type].index}, function(err,response,status){
		logger.log('info', "Index " +config.elasticsearch[type].index + " created");
		esClient.indices.putMapping({
			index:config.elasticsearch[type].index,
			type:config.elasticsearch[type].type,
			body:config.elasticsearch[type].mapping,
			},function(err,response,status){
				logger.log('info', "Mapping created for " + config.elasticsearch[type].type)
				
		});
  	});
     
}


checkEsServer(esClient);
exports.indexName=config.elasticsearch.cell.index;
exports.Type=config.elasticsearch.cell.index;
exports.wifiIndexName=config.elasticsearch.wifi.index;
exports.wifiType=config.elasticsearch.wifi.index;
exports.elasticsearch = elasticsearch;
exports.esClient = esClient;
