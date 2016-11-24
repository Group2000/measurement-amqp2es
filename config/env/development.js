//dev Configuration
"use strict";
var config={};

config.debug=false;

config.logging={
	colour:true,
	timestamp:true,
	interval:5000
};

config.service={
	name:"measurement-amqp2es-dev"
};

config.webservice={
	uri:'https://localhost:3001/v1/cellmeasurements-dev',
	wifiuri:'https://localhost:3002/v1/wifimeasurements-dev'
}

config.amqp={
	uri: 'amqp://guest:guest@localhost',
	queue: 'measurements-dev',
	wifiqueue:'measurements-wifi-dev'
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
					provider:{
						type:"string",
						index: "not_analyzed"
					},
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
						format: "dateOptionalTime||epoch_millis",
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
		index:'wifi_measurements_v1-dev',
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
						format: "dateOptionalTime||epoch_millis",
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
