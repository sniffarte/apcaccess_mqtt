'use strict';
require('dotenv').config();
var mqtt = require('mqtt');
var ApcAccess = require('apcaccess');
var client = new ApcAccess();
const apcServer = process.env.APC_SERVER || 'localhost';
const mqttServer = process.env.MQTT_SERVER || 'localhost';
const mqttTopic = process.env.MQTT_TOPIC || 'apc_office/TELE/STATE';
    setInterval(() => {
            client.connect(apcServer, 3551)
            .then(function() {
                      return client.getStatusJson()
                })
            .then(function(result) {
                console.log(result)
                const client_mqtt = mqtt.connect(mqttServer)
                client_mqtt.on('connect', function () {
                    client_mqtt.publish(mqttTopic, JSON.stringify(result));
                })
                return client.disconnect();
            })
            .then(function() {
                console.log('Disconnected');
            })
            .catch(function(err) {
                console.log(err);
                console.log("Finish");
            })
    }, 10000);

function remUnits(obj) {
    obj.forEach(element => {
        
    });
}