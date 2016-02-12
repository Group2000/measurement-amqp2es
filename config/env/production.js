//production Configuration
"use strict";
var config={};

config.logging={
	colour:false,
	timestamp:false,
	interval:120000
};

config.service={
	name:"measurement-amqp2es"
};

config.webservice={
	uri:'https://localhost/v1/cellmeasurements',
	wifiuri:'https://localhost/v1/wifimeasurements'
}

config.amqp={
	uri: 'amqp://guest:guest@localhost',
	queue: 'measurements',
	wifiqueue:'measurements-wifi'
};


config.elasticsearch={
	hosts:[
      'localhost:9200'
    ],
    cell:{
	    index:'cell_measurements_v1',
	    type:'measurement',
		mapping:{
			measurement:{
				properties:{
					radio:{
						type:"string",
						index: "not_analyzed"
					},
					mcc:{type:"integer"},
					net:{type:"integer"},
					area:{type:"integer"},
					cell:{type:"integer"},
					uuid:{
						type:"string",
						index: "not_analyzed"
					},
					unit:{type:"integer"},
					signal:{type:"float"},
					azimuth:{type:"integer"},
					beamwidth:{type:"integer"},
					band:{type:"integer"},
					channel:{type:"integer"},
					hdop:{type:"float"},
					sattellites:{type:"integer"},
					serving:{type:"boolean"},
					altitude:{type:"integer"},
					source:{
						type:"string",
						index: "not_analyzed"
					},

					measurement:{type:"boolean"},
					timestamp:{
						format: "dateOptionalTime",
						type:"date",
					},
					location:{
						type:"geo_point",
						geohash:true,
						geohash_prefix:true
					}
				}
			}
	    },
	    createIndex:true,
	    deleteIndex:false
	},
	wifi:{
		index:'wifi_measurements_v1',
	    type:'measurement',
		mapping:{
			measurement:{
				properties:{
					bssid:{
						type:"string",
						index: "not_analyzed"
					},
					ssid:{
						type:"string",
						index: "not_analyzed"
					},
					frequency:{type:"long"},
					channel:{type:"integer"},
					mode:{
						type:"string",
						index: "not_analyzed"
					},
					encryption:{type:"boolean"},
					encryptiontype:{
						type:"string",
						index: "not_analyzed"
					},
					authenticationtype:{
						type:"string",
						index: "not_analyzed"
					},
					quality:{
						type:"string",
						index: "not_analyzed"
					},
					hdop:{type:"float"},
					sattellites:{type:"integer"},
					altitude:{type:"integer"},
					source:{
						type:"string",
						index: "not_analyzed"
					},
					measurement:{type:"boolean"},
					timestamp:{
						format: "dateOptionalTime",
						type:"date",
					},
					location:{
						type:"geo_point",
						geohash:true,
						geohash_prefix:true
					}
				}
			}
	    },
	    createIndex:true,
	    deleteIndex:false
	}
};

module.exports=config;