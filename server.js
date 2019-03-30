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
            .then(function(obj) {
                //console.log(JSON.stringify(obj));
                const power = Math.round((parseFloat(obj.NOMPOWER.split(' ')[0])* parseFloat(obj.LOADPCT.split(' ')[0])) / 100.0)
                obj['POWER'] = power.toString();
                const client_mqtt = mqtt.connect('mqtt://' + mqttServer);
                client_mqtt.on('connect', function () {
                    client_mqtt.publish(mqttTopic, JSON.stringify(remUnits(obj)));
                })
                return client.disconnect();
            })
            .then(function() {
                //console.log('Disconnected from apcupsd');
            })
            .catch(function(err) {
                console.log(err);
                client.disconnect();
                //console.log("Finish");
            })
    }, 10000);

function remUnits(obj) {

    const i = (value) => {
        const integer = value && parseInt(value)
        if (!isNaN(integer)) return integer
    }

    const p = (value) => {
        const percentage = value && parseFloat(value.split(' ')[0])

        if ((!isNaN(percentage)) && (0 <= percentage) && (percentage <= 100)) return percentage
    }

    const r = (value) => {
        const real = value && parseFloat(value.split(' ')[0])

        if (!isNaN(real)) return real
    }

    const s = (value) => {
        return value.split('/').join(' ')
    }

    const d = (value) => {
        const date = value.split(' ')[0] + 'T' + value.split(' ')[1];

        return date;
    }

    const t = (value) => {
        const integer = value && parseInt(value.split(' ')[0])

        if(!isNaN(integer)) return integer;
    }

    const z = {
        BATTV: r,
        BCHARGE: p,
        FIRMWARE: s,
        LINEV: r,
        LOADPCT: p,
        MODEL: s,
        NOMPOWER: r,
        STATFLAG: i,
        SERIALNO: s,
        UPSNAME: s,
        MAXTIME: t,
        MINTIMEL: t,
        ALARMDEL: t,
        CUMONBATT: t,
        TIMELEFT: t,
        TONBATT: t,
        DATE: d,
        STARTTIME: d,
        XOFFBATT: d,
        XONBATT: d

    }
    const status = {}
    for (let key in z) {
        let value = obj && obj[key] && obj[key].trim()

        if ((!z.hasOwnProperty(key)) || (value === undefined)) continue

        value = z[key](value)
        if (value !== undefined) obj[key] = value
    }

    return obj

}