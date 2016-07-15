/**
 *
 * rules-engine adapter
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var fs =      require('fs');
var Blockly = require('node-blockly/js');

var objects =           {};
var states =            {};
var isEnums =          false; // If some subscription wants enum
var subscriptions =    [];
var adapterSubs =      {};
var cacheObjectEnums = {};
var enums =            [];
var channels =         null;
var devices =          null;
var scripts =          {};

var listeneraddresses = {};
var script = "";

var rules       = {};

function getData(callback) {
    var statesReady;
    var objectsReady;

    // TODO: Create an entry, to reload all Thermostats on every monday 00:01
    if(adapter.config.forceInit == true) {
        // If forceInit, we must reinit all known Thermostats
        adapter.config.initThermostat = true;
        adapter.objects.getObjectList({startkey: 'rules-engine.' + adapter.instance, endkey: 'rules-engine.' + adapter.instance + '\u9999'}, function (err, res) {
            res = res.rows;
            for (var i = 0; i < res.length; i++) {
                var id = res[i].doc.common.name;

                if (id == "color") {
                    id = res[i].id;
                }
                adapter.log.debug('Remove ' + id + ': ' + id);

                adapter.delObject(id, function (res, err) {
                    if (res != undefined && res != "Not exists") adapter.log.error("res from delObject: " + res);
                    if (err != undefined) adapter.log.error("err from delObject: " + err);
                });
                adapter.deleteState(id, function (res, err) {
                    if (res != undefined && res != "Not exists") adapter.log.error("res from deleteState: " + res);
                    if (err != undefined) adapter.log.error("err from deleteState: " + err);
                });
            }
        });
        adapter.extendForeignObject('system.adapter.' + adapter.namespace, {native: {forceInit: false}});
    }

    adapter.log.debug('requesting all states');
    adapter.getForeignStates('*', function (err, res) {
        states = res;
        statesReady = true;
        adapter.log.debug('received all states');
        if (objectsReady && typeof callback === 'function') callback();
    });
    adapter.log.debug('requesting all objects');

    adapter.objects.getObjectList({include_docs: false}, function (err, res) {
        res = res.rows;
        objects = {};
        for (var i = 0; i < res.length; i++) {
            objects[res[i].doc._id] = res[i].doc;
        }

        objectsReady = true;
        adapter.log.debug('received all objects');
        if (statesReady && typeof callback === 'function') callback();
    });
}

var adapter = utils.adapter({
    name: 'rules-engine',

    ready: function () {
        getData(function () {
            adapter.subscribeForeignObjects('*');
            adapter.subscribeForeignStates('*');

            adapter.log.debug("run main()");

            main();
        });

    },

    objectChange: function (id, object) {
        adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(object));
        if (id.indexOf("rules.0") == 0) {
            if (object == null) {
                adapter.log.info("Cancel jobs for " + id);
            } else {
                getData(function () {
                    script = object.native.name;
                    if (states[id].val === true) {
                        stop(id);
                        evaluateRule(object.native.script);
                    }
                    adapter.log.info("Read in all Objects/States cause of objectChange");
                });
            }
        }
    },
    stateChange: function (id, state) {
        if (id.indexOf("rules.0") == 0) {
            adapter.log.info("stateChange " + id + " = " + JSON.stringify(state));

            if (state !== null && state.val) {
                var object = objects[id];
                evaluateRule(object.native.script);
            } else {
                adapter.log.info("stateChange " + id + ", unload Script");
                stop(id);
            }
        } else {
            var oldState = states[id] || {};

            if (id.indexOf("rules-engine.0") === 0) {
                adapter.log.info("true");
            }

            if (state.val === undefined || state.val === null) {
                adapter.log.info("stateChange " + id + ", nothing todo");
                return;
            }
            var eventObj = {
                id: id,
                //name: name,
                //common: common,
                //native: nativeObj,
                //channelId: channelId,
                //channelName: channelName,
                //deviceId: deviceId,
                //deviceName: deviceName,
                //enumIds: enumIds,       // Array of Strings
                //enumNames: enumNames,     // Array of Strings
                newState: {
                    val:  state.val,
                    ts:   state.ts,
                    ack:  state.ack,
                    lc:   state.lc,
                    from: state.from
                },
                oldState: {
                    val:  oldState.val,
                    ts:   oldState.ts,
                    ack:  oldState.ack,
                    lc:   oldState.lc,
                    from: oldState.from
                }
            };
            eventObj.state = eventObj.newState;

            if (isEnums) {
                getObjectEnums(id, function (enumIds, enumNames) {
                    eventObj.enumIds   = enumIds;
                    eventObj.enumNames = enumNames;
                    checkPatterns(eventObj);
                });
            } else {
                checkPatterns(eventObj);
            }
        }
    },
    unload: function (callback) {
        try {
            adapter.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }
});

function checkPatterns(eventObj) {
    // if this state matchs any subscriptions
    var matched = false;
    var subs = [];
    for (var i = 0, l = subscriptions.length; i < l; i++) {
        var pattern = subscriptions[i].pattern;
        // possible matches
        //    pattern.name
        //    pattern.channelId
        //    pattern.channelName
        //    pattern.deviceId
        //    pattern.deviceName
        //    pattern.enumId
        //    pattern.enumName
        if (!matched) {
            if (eventObj.name === undefined && pattern.name) {
                eventObj.common = objects[eventObj.id] ? objects[eventObj.id].common : {};
                eventObj.native = objects[eventObj.id] ? objects[eventObj.id].native : {};
                eventObj.name   = eventObj.common ? eventObj.common.name : null;
            }

            if (eventObj.channelId === undefined && (pattern.deviceId || pattern.deviceName || pattern.channelId || pattern.channelName)) {
                var _pos = eventObj.id.lastIndexOf('.');
                if (_pos !== -1) eventObj.channelId = eventObj.id.substring(0, _pos);
                if (!objects[eventObj.channelId]) eventObj.channelId = null;
            }

            if (eventObj.channelName === undefined && pattern.channelName) {
                if (eventObj.channelId && objects[eventObj.channelId]) {
                    eventObj.channelName = objects[eventObj.channelId].common ? objects[eventObj.channelId].common.name : null;
                } else {
                    eventObj.channelName = null;
                }
            }

            if (eventObj.deviceId === undefined && (pattern.deviceId || pattern.deviceName)) {
                if (!eventObj.channelId) {
                    eventObj.deviceId   = null;
                    eventObj.deviceName = null;
                } else {
                    var pos = eventObj.channelId.lastIndexOf('.');
                    if (pos != -1) {
                        eventObj.deviceId = eventObj.channelId.substring(0, pos);
                        if (!objects[eventObj.deviceId]) {
                            eventObj.deviceId   = null;
                            eventObj.deviceName = null;
                        }
                    }
                }
            }
            if (eventObj.deviceName === undefined && pattern.deviceName) {
                eventObj.deviceName = objects[eventObj.deviceId] && objects[eventObj.deviceId].common ? objects[eventObj.deviceId].common.name : null;
            }
        }

        if (patternMatching(eventObj, subscriptions[i].pattern)) {
            if (!matched) {
                matched = true;
                if (eventObj.name === undefined) {
                    eventObj.common = objects[eventObj.id] ? objects[eventObj.id].common : {};
                    eventObj.native = objects[eventObj.id] ? objects[eventObj.id].native : {};
                    eventObj.name   = eventObj.common ? eventObj.common.name : null;
                }

                if (eventObj.channelId === undefined) {
                    var __pos = eventObj.id.lastIndexOf('.');
                    if (__pos !== -1) eventObj.channelId = eventObj.id.substring(0, __pos);
                    if (!objects[eventObj.channelId]) eventObj.channelId = null;
                }

                if (eventObj.channelName === undefined) {
                    if (eventObj.channelId && objects[eventObj.channelId]) {
                        eventObj.channelName = objects[eventObj.channelId].common ? objects[eventObj.channelId].common.name : null;
                    } else {
                        eventObj.channelName = null;
                    }
                }

                if (eventObj.deviceId === undefined) {
                    if (!eventObj.channelId) {
                        eventObj.deviceId   = null;
                        eventObj.deviceName = null;
                    } else {
                        var pos_ = eventObj.channelId.lastIndexOf('.');
                        if (pos_ != -1) {
                            eventObj.deviceId = eventObj.channelId.substring(0, pos_);
                            if (!objects[eventObj.deviceId]) {
                                eventObj.deviceId   = null;
                                eventObj.deviceName = null;
                            }
                        }
                    }
                }
                if (eventObj.deviceName === undefined) {
                    eventObj.deviceName = objects[eventObj.deviceId] && objects[eventObj.deviceId].common ? objects[eventObj.deviceId].common.name : null;
                }
            }
            subs.push(i);
        }
    }

    if (matched) {
        if (eventObj.enumIds === undefined) {
            getObjectEnums(eventObj.id, function (enumIds, enumNames) {
                eventObj.enumIds   = enumIds;
                eventObj.enumNames = enumNames;
                for (var i = 0, l = subs.length; i < l; i++) {
                    subscriptions[subs[i]].callback(eventObj);
                }
            });
        } else {
            for (var ii = 0, ll = subs.length; ii < ll; ii++) {
                subscriptions[subs[ii]].callback(eventObj);
            }
        }
    }
}

function getObjectEnums(idObj, callback, enumIds, enumNames) {
    if (!enumIds)   enumIds   = [];
    if (!enumNames) enumNames = [];

    if (cacheObjectEnums[idObj]) {
        if (typeof callback === 'function') {
            for (var j = 0; j < cacheObjectEnums[idObj].enumIds.length; j++) {
                if (enumIds.indexOf(cacheObjectEnums[idObj].enumIds[j]) == -1) enumIds.push(cacheObjectEnums[idObj].enumIds[j]);
            }
            for (j = 0; j < cacheObjectEnums[idObj].enumNames.length; j++) {
                if (enumNames.indexOf(cacheObjectEnums[idObj].enumNames[j]) == -1) enumNames.push(cacheObjectEnums[idObj].enumNames[j]);
            }

            callback(cacheObjectEnums[idObj].enumIds, cacheObjectEnums[idObj].enumNames);
        }
        return;
    }

    for (var i = 0, l = enums.length; i < l; i++) {
        if (objects[enums[i]] &&
            objects[enums[i]].common &&
            objects[enums[i]].common.members &&
            objects[enums[i]].common.members.indexOf(idObj) !== -1) {
            if (enumIds.indexOf(enums[i]) == -1) enumIds.push(enums[i]);
            if (enumNames.indexOf(objects[enums[i]].common.name) == -1) enumNames.push(objects[enums[i]].common.name);
        }
    }
    if (objects[idObj]) {
        var pos = idObj.lastIndexOf('.');
        if (pos != -1) {
            var parent = idObj.substring(0, pos);
            if (parent && objects[parent]) {
                return getObjectEnums(parent, callback, enumIds, enumNames);
            }
        }
    }

    cacheObjectEnums[idObj] = {enumIds: enumIds, enumNames: enumNames};
    if (typeof callback === 'function') callback(enumIds, enumNames);
}

function getObjectEnumsSync(idObj, enumIds, enumNames) {
    if (!enumIds)   enumIds   = [];
    if (!enumNames) enumNames = [];

    if (cacheObjectEnums[idObj]) {
        for (var j = 0; j < cacheObjectEnums[idObj].enumIds.length; j++) {
            if (enumIds.indexOf(cacheObjectEnums[idObj].enumIds[j]) == -1) enumIds.push(cacheObjectEnums[idObj].enumIds[j]);
        }
        for (j = 0; j < cacheObjectEnums[idObj].enumNames.length; j++) {
            if (enumNames.indexOf(cacheObjectEnums[idObj].enumNames[j]) == -1) enumNames.push(cacheObjectEnums[idObj].enumNames[j]);
        }
        return {enumIds: enumIds, enumNames: enumNames};
    }


    for (var i = 0, l = enums.length; i < l; i++) {
        if (objects[enums[i]] &&
            objects[enums[i]].common &&
            objects[enums[i]].common.members &&
            objects[enums[i]].common.members.indexOf(idObj) !== -1) {
            if (enumIds.indexOf(enums[i]) == -1) enumIds.push(enums[i]);
            if (enumNames.indexOf(objects[enums[i]].common.name) == -1) enumNames.push(objects[enums[i]].common.name);
        }
    }

    if (objects[idObj]) {
        var pos = idObj.lastIndexOf('.');
        if (pos != -1) {
            var parent = idObj.substring(0, pos);
            if (parent && objects[parent]) {
                return getObjectEnumsSync(parent, enumIds, enumNames);
            }
        }
    }

    cacheObjectEnums[idObj] = {enumIds: enumIds, enumNames: enumNames};
    return cacheObjectEnums[idObj];
}

function patternMatching(event, pattern) {

    if (!pattern.logic) {
        pattern.logic = 'and';
    }

    var matched = false;

    // state id matching
    if (pattern.id) {
        if (pattern.id instanceof RegExp || pattern.id.source) {
            if (event.id && event.id.match(pattern.id)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.id && pattern.id === event.id) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // state name matching
    if (pattern.name) {
        if (pattern.name instanceof RegExp || pattern.name.source) {
            if (event.common.name && event.common.name.match(pattern.name)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.common.name && pattern.name === event.common.name) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // todo anchestor name matching

    // change matching
    if (pattern.change) {
        switch (pattern.change) {
            case "eq":
                if (event.newState.val === event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            case "ne":
                if (event.newState.val !== event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            case "gt":
                if (event.newState.val > event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            case "ge":
                if (event.newState.val >= event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            case "lt":
                if (event.newState.val < event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            case "le":
                if (event.newState.val <= event.oldState.val) {
                    if (pattern.logic === 'or') return true;
                    matched = true;
                } else {
                    if (pattern.logic === 'and') return false;
                }
                break;
            default:
                // on any other logic, just signal about message
                if (pattern.logic === 'or') return true;
                matched = true;
                break;
        }
    }

    // Ack Matching
    if (pattern.ack !== undefined) {
        if (((pattern.ack === 'true'  || pattern.ack === true)  && (event.newState.ack === true  || event.newState.ack === 'true')) ||
            ((pattern.ack === 'false' || pattern.ack === false) && (event.newState.ack === false || event.newState.ack === 'false'))) {
            if (pattern.logic === 'or') return true;
            matched = true;
        } else {
            if (pattern.logic === 'and') return false;
        }
    }

    // oldAck Matching
    if (pattern.oldAck !== undefined) {
        if (((pattern.oldAck === 'true'  || pattern.oldAck === true)  && (event.oldState.ack === true  || event.oldState.ack === 'true')) ||
            ((pattern.oldAck === 'false' || pattern.oldAck === false) && (event.oldState.ack === false || event.oldState.ack === 'false'))) {
            if (pattern.logic === 'or') return true;
            matched = true;
        } else {
            if (pattern.logic === 'and') return false;
        }
    }

    // Value Matching
    if (pattern.val !== undefined && pattern.val === event.newState.val) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.val !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.valGt !== undefined && event.newState.val > pattern.valGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.valGt !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.valGe !== undefined && event.newState.val >= pattern.valGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.valGe !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.valLt !== undefined && event.newState.val < pattern.valLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.valLt !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.valLe !== undefined && event.newState.val <= pattern.valLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.valLe !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.valNe !== undefined && event.newState.val !== pattern.valNe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.valNe !== undefined) {
        if (pattern.logic === 'and') return false;
    }

    // Old-Value matching
    if (pattern.oldVal !== undefined && pattern.oldVal === event.oldState.val) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldVal !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldValGt !== undefined && event.oldState.val > pattern.oldValGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldValGt !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldValGe !== undefined && event.oldState.val >= pattern.oldValGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldValGe !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldValLt !== undefined && event.oldState.val < pattern.oldValLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldValLt !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldValLe !== undefined && event.oldState.val <= pattern.oldValLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldValLe !== undefined) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldValNe !== undefined && event.oldState.val !== pattern.oldValNe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldValNe !== undefined) {
        if (pattern.logic === 'and') return false;
    }

    // newState.ts matching
    if (pattern.ts && pattern.ts === event.newState.ts) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.ts) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.tsGt && event.newState.ts > pattern.tsGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.tsGt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.tsGe && event.newState.ts >= pattern.tsGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.tsGe) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.tsLt && event.newState.ts < pattern.tsLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.tsLt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.tsLe && event.newState.ts <= pattern.tsLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.tsLe) {
        if (pattern.logic === 'and') return false;
    }

    // oldState.ts matching
    if (pattern.oldTs && pattern.oldTs === event.oldState.ts) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldTs) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldTsGt && event.oldState.ts > pattern.oldTsGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldTsGt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldTsGe && event.oldState.ts >= pattern.oldTsGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldTsGe) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldTsLt && event.oldState.ts < pattern.oldTsLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldTsLt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldTsLe && event.oldState.ts <= pattern.oldTsLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldTsLe) {
        if (pattern.logic === 'and') return false;
    }

    // newState.lc matching
    if (pattern.lc && pattern.lc === event.newState.lc) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.lc) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.lcGt && event.newState.lc > pattern.lcGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.lcGt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.lcGe && event.newState.lc >= pattern.lcGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.lcGe) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.lcLt && event.newState.lc < pattern.lcLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.lcLt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.lcLe && event.newState.lc <= pattern.lcLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.lcLe) {
        if (pattern.logic === 'and') return false;
    }

    // oldState.lc matching
    if (pattern.oldLc && pattern.oldLc === event.oldState.lc) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldLc) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldLcGt && event.oldState.lc > pattern.oldLcGt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldLcGt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldLcGe && event.oldState.lc >= pattern.oldLcGe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldLcGe) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldLcLt && event.oldState.lc < pattern.oldLcLt) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldLcLt) {
        if (pattern.logic === 'and') return false;
    }
    if (pattern.oldLcLe && event.oldState.lc <= pattern.oldLcLe) {
        if (pattern.logic === 'or') return true;
        matched = true;
    } else if (pattern.oldLcLe) {
        if (pattern.logic === 'and') return false;
    }

    // newState.from matching
    if (pattern.from && pattern.from === event.newState.from) {
        if (pattern.logic == 'or') return true;
        matched = true;
    } else if (pattern.from) {
        if (pattern.logic == 'and') return false;
    }

    if (pattern.fromNe && pattern.fromNe !== event.newState.from) {
        if (pattern.logic == 'or') return true;
        matched = true;
    } else if (pattern.fromNe) {
        if (pattern.logic == 'and') return false;
    }

    // oldState.from matching
    if (pattern.oldFrom && pattern.oldFrom === event.oldState.from) {
        if (pattern.logic == 'or') return true;
        matched = true;
    } else if (pattern.oldFrom) {
        if (pattern.logic == 'and') return false;
    }

    if (pattern.oldFromNe && pattern.oldFromNe !== event.oldState.from) {
        if (pattern.logic == 'or') return true;
        matched = true;
    } else if (pattern.oldFromNe) {
        if (pattern.logic == 'and') return false;
    }

    // channelId matching
    if (pattern.channelId) {
        if (pattern.channelId instanceof RegExp) {
            if (event.channelId && event.channelId.match(pattern.channelId)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.channelId && pattern.channelId === event.channelId) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // channelName matching
    if (pattern.channelName) {
        if (pattern.channelName instanceof RegExp) {
            if (event.channelName && event.channelName.match(pattern.channelName)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.channelName && pattern.channelName === event.channelName) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // deviceId matching
    if (pattern.deviceId) {
        if (pattern.deviceId instanceof RegExp) {
            if (event.deviceId && event.deviceId.match(pattern.deviceId)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.deviceId && pattern.deviceId === event.deviceId) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // deviceName matching
    if (pattern.deviceName) {
        if (pattern.deviceName instanceof RegExp) {
            if (event.deviceName && event.deviceName.match(pattern.deviceName)) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.deviceName && pattern.deviceName === event.deviceName) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }
    var subMatched;

    // enumIds matching
    if (pattern.enumId) {
        if (pattern.enumId instanceof RegExp) {
            subMatched = false;
            for (var i = 0; i < event.enumIds.length; i++) {
                if (event.enumIds[i].match(pattern.enumId)) {
                    subMatched = true;
                    break;
                }
            }
            if (subMatched) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.enumIds && event.enumIds.indexOf(pattern.enumId) !== -1) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    // enumNames matching
    if (pattern.enumName) {
        if (pattern.enumName instanceof RegExp) {
            subMatched = false;
            for (var j = 0; j < event.enumNames.length; j++) {
                if (event.enumNames[j].match(pattern.enumName)) {
                    subMatched = true;
                    break;
                }
            }
            if (subMatched) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        } else {
            if (event.enumNames && event.enumNames.indexOf(pattern.enumName) !== -1) {
                if (pattern.logic === 'or') return true;
                matched = true;
            } else {
                if (pattern.logic === 'and') return false;
            }
        }
    }

    return matched;
}

function main() {
    var _ = require('lodash');
    Blockly.Blocks = _.extend(Blockly.Blocks, require('./blocks_iobroker')(Blockly));

    // Read all rules
    adapter.getForeignObjects('rules.0.*', 'state', function (err, scripts) {
        if (scripts) {
            for (var id in scripts) {
                // ignore if no script available
                if (!scripts[id].native || !scripts[id].native.script || !scripts[id].native.script.length) continue;
                //ignore if scene is disabled
                adapter.log.error("id: " + id + " = " + states[id].val);
                if (states[id].val === true) {
                    rules[id] = scripts[id];
                    script = scripts[id].native.name;

                    // Get all Variables for listening
                    evaluateRule(scripts[id].native.script);
                }
//                if (!scripts[id].native.enabled) continue;

            }
        }
        initRules();
    });

}

function evaluateRule(command) {
    // TODO: Remove all listeners for this script
    if (listeneraddresses[script] != undefined) {
        delete listeneraddresses[script];
    }
    try {
        var xml = Blockly.Xml.textToDom(command);
    } catch (e) {
        console.log(e);
        return ''
    }

    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(workspace, xml);
    var code = Blockly.JavaScript.workspaceToCode(workspace);

    adapter.log.error("\n" + code);
    // Todo: eval is not the best way to execute
    // eval(code);

    var name = script;

    adapter.log.info('Start javascript ' + name);
    scripts[name] = compile(code, name);
    if (scripts[name]) execute(scripts[name], name);
}

var mods = {
    'vm':               require('vm'),
    'fs':               require('fs'),
    'dgram':            require('dgram'),
    'crypto':           require('crypto'),
    'dns':              require('dns'),
    'events':           require('events'),
    'http':             require('http'),
    'https':            require('https'),
    'net':              require('net'),
    'os':               require('os'),
    'path':             require('path'),
    'util':             require('util'),
    'child_process':    require('child_process'),

    'node-schedule':    require('node-schedule'),
    'suncalc':          require('suncalc'),
    'request':          require('request'),
    'wake_on_lan':      require('wake_on_lan')
};

function compile(source, name) {
    // console.log(source);
    source += "\n;\nlog('registered ' + __engine.__subscriptions + ' subscription' + (__engine.__subscriptions === 1 ? '' : 's' ) + ' and ' + __engine.__schedules + ' schedule' + (__engine.__schedules === 1 ? '' : 's' ));\n";
    try {
        return mods.vm.createScript(source, name);
    } catch (e) {
        // todo
        adapter.log.error(name + ' compile failed: ' + e);
        return false;
    }
}

function execute(script, name) {
    script.intervals = [];
    script.timeouts = [];
    script.schedules = [];
    script.name = name;
    script._id = Math.floor(Math.random() * 0xFFFFFFFF);

    var sandbox = {
        mods: mods,
        _id: script._id,
        name: name,
        instance: adapter.instance,
        states: states,
        require: function (md) {
            if (mods[md]) return mods[md];
            try {
                mods[md] = require(__dirname + '/node_modules/' + md);
                return mods[md];
            } catch (e) {
                var lines = e.stack.split('\n');
                var stack = [];
                for (var i = 6; i < lines.length; i++) {
                    if (lines[i].match(/runInNewContext/)) break;
                    stack.push(lines[i]);
                }
                adapter.log.error(name + ': ' + e.message + '\n' + stack);

            }
        },
        Buffer: Buffer,
        __engine: {
            __subscriptions: 0,
            __schedules: 0
        },
        $: function(selector) {
            // following is supported
            // 'type[commonAttr=something]', 'id[commonAttr=something]', id(enumName="something")', id{nativeName="something"}
            // Type can be state, channel or device
            // Attr can be any of the common attributes and can have wildcards *
            // E.g. "state[id='hm-rpc.0.*]" or "hm-rpc.0.*" returns all states of adapter instance hm-rpc.0
            // channel(room="Living room") => all states in room "Living room"
            // channel{TYPE=BLIND}[state.id=*.LEVEL]
            // Switch all states with .STATE of channels with role "switch" in "Wohnzimmer" to false
            // $('channel[role=switch][state.id=*.STATE](rooms=Wohnzimmer)').setState(false);
            //
            // Following functions are possible, setValue, getValue (only from first), on, each

            // Todo CACHE!!!

            var result    = {};

            var name      = '';
            var commons   = [];
            var _enums    = [];
            var natives   = [];
            var isName    = true;
            var isCommons = false;
            var isEnums   = false;
            var isNatives = false;
            var common    = '';
            var native    = '';
            var _enum     = '';
            var parts;
            var len;

            // parse string
            for (var i = 0; i < selector.length; i++) {
                if (selector[i] == '{') {
                    isName = false;
                    if (isCommons || isEnums || isNatives) {
                        // Error
                        return [];
                    }
                    isNatives = true;
                } else
                if (selector[i] == '}') {
                    isNatives = false;
                    natives.push(native);
                    native = '';
                } else
                if (selector[i] == '[') {
                    isName = false;
                    if (isCommons || isEnums || isNatives) {
                        // Error
                        return [];
                    }
                    isCommons = true;
                } else
                if (selector[i] == ']') {
                    isCommons = false;
                    commons.push(common);
                    common = '';
                }else
                if (selector[i] == '(') {
                    isName = false;
                    if (isCommons || isEnums || isNatives) {
                        // Error
                        return [];
                    }
                    isEnums = true;
                } else
                if (selector[i] == ')') {
                    isEnums = false;
                    _enums.push(_enum);
                    _enum = '';
                } else
                if (isName)    {
                    name    += selector[i];
                } else
                if (isCommons) {
                    common  += selector[i];
                } else
                if (isEnums)  {
                    _enum += selector[i];
                } else
                if (isNatives) {
                    native  += selector[i];
                } //else {
                // some error
                //}
            }

            // If some error in the selector
            if (isEnums || isCommons || isNatives) {
                result.length = 0;
                result.each = function () {
                    return this;
                };
                result.getState = function () {
                    return null;
                };
                result.setState = function () {
                    return this;
                };
                result.on = function () {
                };
            }

            if (isEnums) {
                adapter.log.warn('Invalid selector: enum close bracket cannot be found in "' + selector + '"');
                result.error = 'Invalid selector: enum close bracket cannot be found';
                return result;
            } else if (isCommons) {
                adapter.log.warn('Invalid selector: common close bracket cannot be found in "' + selector + '"');
                result.error = 'Invalid selector: common close bracket cannot be found';
                return result;
            } else if (isNatives) {
                adapter.log.warn('Invalid selector: native close bracket cannot be found in "' + selector + '"');
                result.error = 'Invalid selector: native close bracket cannot be found';
                return result;
            }

            var filterStates = [];

            for (i = 0; i < commons.length; i++) {
                parts = commons[i].split('=', 2);
                if (parts[1] && parts[1][0] == '"') {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == '"') parts[1] = parts[1].substring(0, len - 1);
                }
                if (parts[1] && parts[1][0] == "'") {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == "'") parts[1] = parts[1].substring(0, len - 1);
                }

                if (parts[1]) parts[1] = parts[1].trim();
                parts[0] = parts[0].trim();

                if (parts[0] == 'state.id') {
                    filterStates.push({attr: parts[0], value: parts[1].trim()});
                    commons[i] = null;
                } else {
                    commons[i] = {attr: parts[0], value: parts[1].trim()};
                }
            }

            for (i = 0; i < natives.length; i++) {
                parts = natives[i].split('=', 2);
                if (parts[1] && parts[1][0] == '"') {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == '"') parts[1] = parts[1].substring(0, len - 1);
                }
                if (parts[1] && parts[1][0] == "'") {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == "'") parts[1] = parts[1].substring(0, len - 1);
                }

                if (parts[1]) parts[1] = parts[1].trim();
                parts[0] = parts[0].trim();
                if (parts[0] == 'state.id') {
                    filterStates.push({attr: parts[0], value: parts[1].trim()});
                    natives[i] = null;
                } else {
                    natives[i] = {attr: parts[0].trim(), value: parts[1].trim()};
                }
            }

            for (i = 0; i < _enums.length; i++) {
                parts = _enums[i].split('=', 2);
                if (parts[1] && parts[1][0] == '"') {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == '"') parts[1] = parts[1].substring(0, len - 1);
                }
                if (parts[1] && parts[1][0] == "'") {
                    parts[1] = parts[1].substring(1);
                    len = parts[1].length;
                    if (parts[1] && parts[1][len - 1] == "'") parts[1] = parts[1].substring(0, len - 1);
                }

                if (parts[1]) parts[1] = parts[1].trim();
                parts[0] = parts[0].trim();
                if (parts[0] == 'state.id') {
                    filterStates.push({attr: parts[0], value: parts[1].trim()});
                    _enums[i] = null;
                } else {
                    _enums[i] = 'enum.' + parts[0].trim() + '.' + parts[1].trim();
                }
            }

            name = name.trim();
            if (name == 'channel' || name == 'device') {
                // Fill channels
                if (!channels || !devices) {
                    channels = {};
                    devices  = {};
                    for (var _id in objects) {
                        if (objects[_id].type == 'state') {
                            parts = _id.split('.');
                            parts.pop();
                            var chn = parts.join('.');

                            parts.pop();
                            var dev =  parts.join('.');

                            devices[dev] = devices[dev] || [];
                            devices[dev].push(_id);

                            channels[chn] = channels[chn] || [];
                            channels[chn].push(_id);
                        }
                    }
                }
            }

            var res = [];
            var resIndex = 0;
            var id;
            var s;
            var pass;
            if (name == 'channel') {
                for (id in channels) {
                    if (!objects[id]) {
                        continue;
                    }
                    pass = true;
                    for (var c = 0; c < commons.length; c++) {
                        if (!commons[c]) continue;
                        if (commons[c].attr == 'id') {
                            if (!commons[c].r && commons[c].value) commons[c].r = new RegExp('^' + commons[c].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                            if (!commons[c].r || commons[c].r.test(id)) continue;
                        } else if (objects[id].common) {
                            if (commons[c].value === undefined && objects[id].common[commons[c].attr] !== undefined) continue;
                            if (objects[id].common[commons[c].attr] == commons[c].value) continue;
                        }
                        pass = false;
                        break;
                    }
                    if (!pass) continue;
                    for (var n = 0; n < natives.length; n++) {
                        if (!natives[n]) continue;
                        if (natives[n].attr == 'id') {
                            if (!natives[n].r && natives[n].value) natives[n].r = new RegExp('^' + natives[n].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                            if (!natives[n].r || natives[n].r.test(id)) continue;
                        } else if (objects[id].native) {
                            if (natives[n].value === undefined && objects[id].native[natives[n].attr] !== undefined) continue;
                            if (objects[id].native[natives[n].attr] == natives[n].value) continue;
                        }
                        pass = false;
                        break;
                    }
                    if (!pass) continue;

                    if (_enums.length) {
                        var enumIds = [];
                        getObjectEnumsSync(id, enumIds);

                        for (var m = 0; m < _enums.length; m++) {
                            if (!_enums[m]) continue;
                            if (enumIds.indexOf(_enums[m]) != -1) continue;
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }

                    // Add all states of this channel to list
                    for (s = 0; s < channels[id].length; s++) {
                        if (filterStates.length) {
                            pass = true;
                            for (var st = 0; st < filterStates.length; st++) {
                                if (!filterStates[st].r && filterStates[st].value) {
                                    if (filterStates[st].value[0] == '*') {
                                        filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                                    } else if (filterStates[st].value[filterStates[st].value - 1] == '*') {
                                        filterStates[st].r = new RegExp('^' + filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                    } else {
                                        filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                    }
                                }
                                if (!filterStates[st].r || filterStates[st].r.test(channels[id][s])) continue;
                                pass = false;
                                break;
                            }
                            if (!pass) continue;
                        }
                        res.push(channels[id][s]);
                    }
                }
            } else if (name == 'device') {
                for (id in devices) {
                    if (!objects[id]) {
                        console.log(id);
                        continue;
                    }
                    pass = true;
                    for (var _c = 0; _c < commons.length; _c++) {
                        if (!commons[_c]) continue;
                        if (commons[_c].attr == 'id') {
                            if (!commons[_c].r && commons[_c].value) commons[_c].r = new RegExp('^' + commons[_c].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                            if (!commons[_c].r || commons[_c].r.test(id)) continue;
                        } else if (objects[id].common) {
                            if (commons[_c].value === undefined && objects[id].common[commons[_c].attr] !== undefined) continue;
                            if (objects[id].common[commons[_c].attr] == commons[_c].value) continue;
                        }
                        pass = false;
                        break;
                    }
                    if (!pass) continue;
                    for (var n = 0; n < natives.length; n++) {
                        if (!natives[n]) continue;
                        if (natives[n].attr == 'id') {
                            if (!natives[n].r && natives[n].value) natives[n].r = new RegExp('^' + natives[n].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                            if (!natives[n].r || natives[n].r.test(id)) continue;
                        } else if (objects[id].native) {
                            if (natives[n].value === undefined && objects[id].native[natives[n].attr] !== undefined) continue;
                            if (objects[i].native[natives[n].attr] == natives[n].value) continue;
                        }
                        pass = false;
                        break;
                    }
                    if (!pass) continue;

                    if (_enums.length) {
                        var enumIds = [];
                        getObjectEnumsSync(id, enumIds);

                        for (var n = 0; n < _enums.length; n++) {
                            if (!_enums[n]) continue;
                            if (enumIds.indexOf(_enums[n]) != -1) continue;
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }

                    // Add all states of this channel to list
                    for (s = 0; s < devices[id].length; s++) {
                        if (filterStates.length) {
                            pass = true;
                            for (var st = 0; st < filterStates.length; st++) {
                                if (!filterStates[st].r && filterStates[st].value) {
                                    if (filterStates[st].value[0] == '*') {
                                        filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                                    } else if (filterStates[st].value[filterStates[st].value - 1] == '*') {
                                        filterStates[st].r = new RegExp('^' + filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                    } else {
                                        filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                    }
                                }
                                if (!filterStates[st].r || filterStates[st].r.test(devices[id][s])) continue;
                                pass = false;
                                break;
                            }
                            if (!pass) continue;
                        }
                        res.push(devices[id][s]);
                    }
                }
            } else {
                var r = (name && name != 'state') ? new RegExp('^' + name.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$') : null;

                // state
                for (id in states) {
                    if (r && !r.test(id)) continue;
                    pass = true;

                    if (commons.length) {
                        for (var c = 0; c < commons.length; c++) {
                            if (!commons[c]) continue;
                            if (commons[c].attr == 'id') {
                                if (!commons[c].r && commons[c].value) commons[c].r = new RegExp(commons[c].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                if (!commons[c].r || commons[c].r.test(id)) continue;
                            } else if (objects[id].common) {
                                if (commons[c].value === undefined && objects[id].common[commons[c].attr] !== undefined) continue;
                                if (objects[id].common[commons[c].attr] == commons[c].value) continue;
                            }
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }
                    if (natives.length) {
                        for (var n = 0; n < natives.length; n++) {
                            if (!natives[n]) continue;
                            if (natives[n].attr == 'id') {
                                if (!natives[n].r && natives[n].value) natives[id].r = new RegExp(natives[n].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                if (!natives[n].r || natives[n].r.test(id)) continue;
                            } else if (objects[id].native) {
                                if (natives[n].value === undefined && objects[id].native[natives[n].attr] !== undefined) continue;
                                if (objects[id].native[natives[n].attr] == natives[n].value) continue;
                            }
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }

                    if (filterStates.length) {
                        for (var st = 0; st < filterStates.length; st++) {
                            if (!filterStates[st].r && filterStates[st].value) {
                                if (filterStates[st].value[0] == '*') {
                                    filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                                } else if (filterStates[st].value[filterStates[st].value - 1] == '*') {
                                    filterStates[st].r = new RegExp('^' + filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                } else {
                                    filterStates[st].r = new RegExp(filterStates[st].value.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                                }
                            }
                            if (!filterStates[st].r || filterStates[st].r.test(id)) continue;
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }

                    if (_enums.length) {
                        var enumIds = [];
                        getObjectEnumsSync(id, enumIds);

                        for (var n = 0; n < _enums.length; n++) {
                            if (!_enums[n]) continue;
                            if (enumIds.indexOf(_enums[n]) != -1) continue;
                            pass = false;
                            break;
                        }
                        if (!pass) continue;
                    }
                    // Add all states of this channel to list
                    res.push(id);
                }

                // Now filter away by name
            }

            for (i = 0; i < res.length; i++) {
                result[i] = res[i];
            }
            result.length = res.length;
            result.each = function (callback) {
                if (typeof callback == 'function') {
                    var r;
                    for (var i = 0; i < this.length; i++) {
                        r = callback(result[i], i);
                        if (r === false) break;
                    }
                }
                return this;
            };
            result.getState = function () {
                if (this[0]) return states[this[0]];

                return null;
            };
            result.setState = function (state, isAck, callback) {
                if (typeof isAck == 'function') {
                    callback = isAck;
                    isAck = undefined;
                }

                if (isAck === true || isAck === false || isAck === 'true' || isAck === 'false') {
                    if (typeof state == 'object') {
                        state.ack = isAck;
                    } else {
                        state = {val: state, ack: isAck};
                    }
                }
                var cnt = 0;
                for (var i = 0; i < this.length; i++) {
                    cnt++;
                    adapter.setForeignState(this[i], state, function () {
                        if (!--cnt && typeof callback === 'function') callback();
                    });
                }
                return this;
            };
            result.on = function (callbackOrId, value) {
                for (var i = 0; i < this.length; i++) {
                    sandbox.subscribe(this[i], callbackOrId, value);
                }
                return this;
            };
            return result;
        }, createState: function (name, initValue, forceCreation, common, native, callback) {
            if (typeof native === 'function') {
                callback  = native;
                native = {};
            }
            if (typeof common === 'function') {
                callback  = common;
                common = undefined;
            }
            if (typeof initValue === 'function') {
                callback  = initValue;
                initValue = undefined;
            }
            if (typeof forceCreation === 'function') {
                callback  = forceCreation;
                forceCreation = undefined;
            }
            if (typeof initValue === 'object') {
                common = initValue;
                native = forceCreation;
                forceCreation = undefined;
                initValue = undefined;
            }
            if (typeof forceCreation === 'object') {
                common = forceCreation;
                native = common;
                forceCreation = undefined;
            }
            common = common || {};
            common.name = common.name || name;
            common.role = common.role || 'javascript';

            // TODO: Always create type boolean
            // common.type = common.type || 'mixed';
            common.type = 'boolean';

            if (initValue === undefined) initValue = common.def;

            native = native || {};

            if (forceCreation) {
                adapter.setObject(name, {
                    common: common,
                    native: native,
                    type:   'state'
                }, function () {
                    if (initValue !== undefined) {
                        adapter.setState(name, initValue, callback);
                    } else {
                        if (callback) callback(name);
                    }
                });
            } else {
                adapter.getObject(name, function (err, obj) {
                    if (err || !obj) {
                        adapter.setObject(name, {
                            common: common,
                            native: native,
                            type:   'state'
                        }, function () {
                            if (initValue !== undefined) {
                                adapter.setState(name, initValue, callback);
                            } else {
                                adapter.setState(name, null,      callback);
                            }
                        });
                    } else {
                        // state yet exists
                        if (callback) callback(name);
                    }
                });
            }
        }, log: function (msg, sev) {
            if (!sev) sev = 'info';
            if (!adapter.log[sev]) {
                msg = 'Unknown severity level "' + sev + '" by log of [' + msg + ']';
                sev = 'warn';
            }
            adapter.log[sev](name + ': ' + msg);
        }, setStateFromIO: function(address, value) {
            console.log("setStateFromIO for " + address + ", value = " + value);
            adapter.setForeignState(address, {val: value, ack: false});
        }, getStateFromIO: function(address) {
            var value = states[address].val;
            console.log(address + " is " + value);

            if (listeneraddresses[address] == undefined) {
                listeneraddresses[address] = [script];
            } else {
                if(!script in listeneraddresses[address]) {
                    // Check if this is already added
                    listeneraddresses[address].push(script);
                }
            }

            if (listeneraddresses[script] == undefined) {
                listeneraddresses[script] = [address];
            } else {
                if(!address in listeneraddresses[script]) {
                    // Check if this is already added
                    listeneraddresses[script].push(address);
                }

            }
            return value;
        }, on: function (pattern, callbackOrId, value) {
            return sandbox.subscribe(pattern, callbackOrId, value);
        }, subscribe: function (pattern, callbackOrId, value) {
            if (typeof pattern == 'object') {
                if (pattern.astro) {
                    return sandbox.schedule(pattern, callbackOrId, value);
                } else if (pattern.time) {
                    return sandbox.schedule(pattern.time, callbackOrId, value);
                }
            }

            var callback;

            sandbox.__engine.__subscriptions += 1;

            if (typeof pattern !== 'object' || pattern instanceof RegExp || pattern.source) {
                pattern = {id: pattern, change: 'ne'};
            }

            if (pattern.id !== undefined && !pattern.id) {
                adapter.log.error('Error by subscription: empty ID defined. All states matched.');
                return;
            }

            // add adapter namespace if nothing given
            if (pattern.id && typeof pattern.id == 'string' && pattern.id.indexOf('.') == -1) {
                pattern.id = adapter.namespace + '.' + pattern.id;
            }

            if (typeof callbackOrId === 'function') {
                callback = callbackOrId;
            } else {
                var that = this;
                if (typeof value === 'undefined') {
                    callback = function (obj) {
                        that.setState(callbackOrId, obj.newState.val);
                    };
                } else {
                    callback = function (obj) {
                        that.setState(callbackOrId, value);
                    };
                }
            }

            var subs = {
                pattern:  pattern,
                callback: function (obj) {
                    if (callback) callback.call(sandbox, obj);
                },
                name:     name
            };

            // try to extract adapter
            if (pattern.id && typeof pattern.id === 'string') {
                var parts = pattern.id.split('.');
                var a = parts[0] + '.' + parts[1];
                var _adapter = 'system.adapter.' + a;
                if (objects[_adapter] && objects[_adapter].common && objects[_adapter].common.subscribable) {
                    var alive = 'system.adapter.' + a + '.alive';
                    adapterSubs[alive] = adapterSubs[alive] || [];
                    adapterSubs[alive].push(pattern.id);
                    adapter.sendTo(a, 'subscribe', pattern.id);
                }
            }

            subscriptions.push(subs);
            if (pattern.enumName || pattern.enumId) isEnums = true;
            return subs;
        }, setState: function (id, state, isAck, callback) {
            if (typeof isAck == 'function') {
                callback = isAck;
                isAck = undefined;
            }

            if (isAck === true || isAck === false || isAck === 'true' || isAck === 'false') {
                if (typeof state == 'object') {
                    state.ack = isAck;
                } else {
                    state = {val: state, ack: isAck};
                }
            }

            if (states[id]) {
                adapter.setForeignState(id, state, function () {
                    if (typeof callback === 'function') callback();
                });
            } else if (states[adapter.namespace + '.' + id]) {
                adapter.setState(id, state, function () {
                    if (typeof callback === 'function') callback();
                });
            } else {
                if (objects[id]) {
                    if (objects[id].type == 'state') {
                        adapter.setForeignState(id, state, function () {
                            if (typeof callback === 'function') callback();
                        });
                    } else {
                        adapter.log.warn('Cannot set value of non-state object "' + id + '"');
                        if (typeof callback === 'function') callback('Cannot set value of non-state object "' + id + '"');
                    }
                } else if (objects[adapter.namespace + '.' + id]) {
                    if (objects[adapter.namespace + '.' + id].type == 'state') {
                        adapter.setState(id, state, function () {
                            if (typeof callback === 'function') callback();
                        });
                    } else {
                        adapter.log.warn('Cannot set value of non-state object "' + adapter.namespace + '.' + id + '"');
                        if (typeof callback === 'function') callback('Cannot set value of non-state object "' + adapter.namespace + '.' + id + '"');
                    }
                } else {
                    adapter.log.warn('State "' + id + '" not found');
                    if (typeof callback === 'function') callback('State "' + id + '" not found');
                }
            }
        }, getState: function (id) {
            if (states[id]) return states[id];
            if (states[adapter.namespace + '.' + id]) return states[adapter.namespace + '.' + id];
            adapter.log.warn('State "' + id + '" not found');
            return null;
        }, tonumber: function(number) {
            return parseInt(number);
        }, getVariable: function(variable) {
            console.log("getVariable: " + variable);
            var value = states[variable];
            if (value.val != undefined) {
                return value.val;
            } else {
                return "";
            }
        }, setVariable: function(variable, value) {
            console.log("setVariable: " + variable + " = "  + value);
        }, pause: function(seconds) {
            var date = Date.now();
            var curDate = null;
            var millis = seconds * 1000;
            do {
                curDate = Date.now();
            } while (curDate - date < millis);
        }, scheduler: function(pattern, callback) {
            /* pattern for node-schedule
             *    *    *    *    *    *
             ┬    ┬    ┬    ┬    ┬    ┬
             │    │    │    │    │    |
             │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
             │    │    │    │    └───── month (1 - 12)
             │    │    │    └────────── day of month (1 - 31)
             │    │    └─────────────── hour (0 - 23)
             │    └──────────────────── minute (0 - 59)
             └───────────────────────── second (0 - 59, OPTIONAL)

             var schedule = require('node-schedule');

             var j = schedule.scheduleJob('42 * * * *', function(){
             console.log('The answer to life, the universe, and everything!');
             });

             var schedule = mods['node-schedule'].scheduleJob(pattern, function () {
             callback.call(sandbox);
             });
             */
            var schedule = mods['node-schedule'].scheduleJob(pattern, function () {
                callback.call(sandbox);
            });

        }, getTime: function(operand, time) {
            console.log("operand = " + operand + ", time = " + time);

            var splitter = time.split(":");
            var hour = splitter[0];
            var min = splitter[1];
            var newDate = new Date().setHours(hour,min,0);
            var now = new Date();
            console.log("---> " + new Date(now.getTime()).toLocaleString());
            console.log("---> " + new Date(newDate).toLocaleString());
            console.log("New Date: " + newDate.toString());
            console.log("Now     : " + now.getTime());


            switch (operand) {
                case "==":
                    break;
                case "!=":
                    break;
                case "<":
                    break;
                case "<=":
                    break;
                case ">":
                    break;
                case ">=":
                    break;
                default:
                    break;
            }

        }, schedule: function(boolean, callback) {
            console.log("boolean = " + boolean + ", callback = " + callback);
            if (typeof callback !== 'function') {
                adapter.log.error(name + ': schedule callback missing');
                return;
            }
            if (boolean) {
                callback.call(sandbox);
            }
        }
    };

    try {
        script.runInNewContext(sandbox);
    } catch (e) {
        var lines = e.stack.split('\n');
        var stack = [];
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].match(/runInNewContext/)) break;
            stack.push(lines[i]);
        }
        adapter.log.error(name + ': ' + stack.join('\n'));
    }
    //console.log(util.inspect(sandbox));

}

function stop(name, callback) {
    adapter.log.info('Stop script ' + name);

    adapter.setState('scriptEnabled.' + name.substring('script.js.'.length), false, true);

    if (scripts[name]) {
        // Remove from subscriptions
        isEnums = false;
        for (var i = subscriptions.length - 1; i >= 0 ; i--) {
            if (subscriptions[i].name == name) {
                subscriptions.splice(i, 1);
            } else {
                if (!isEnums && subscriptions[i].pattern.enumName || subscriptions[i].pattern.enumId) isEnums = true;
            }
        }
        // Stop all timeouts
        for (i = 0; i < scripts[name].timeouts.length; i++) {
            clearTimeout(scripts[name].timeouts[i]);
        }
        // Stop all intervals
        for (i = 0; i < scripts[name].intervals.length; i++) {
            clearInterval(scripts[name].intervals[i]);
        }
        // Stop all scheduled jobs
        for (i = 0; i < scripts[name].schedules.length; i++) {
            if (scripts[name].schedules[i]) {
                var _name = scripts[name].schedules[i].name;
                if (!mods['node-schedule'].cancelJob(scripts[name].schedules[i])) {
                    adapter.log.error('Error by canceling scheduled job "' + _name + '"');
                }
            }
        }
        delete scripts[name];
        if (callback) callback(true, name);
    } else {
        if (callback) callback(false, name);
    }
}

const util = require('util');

function initRules() {}

function getStateFromIO(address) {}

function setStateFromIO(address, value) {}

function tonumber() {}

function getVariable() {}

function setVariable() {}

function pause() {}

function log() {}

function getTime(operand, time) {}

function schedule(boolean, callback) {}

function scheduler(pattern, callback) {}

function on(pattern, callbackOrId, value) {}

function createState(name, initValue, forceCreation, common, native, callback) {}