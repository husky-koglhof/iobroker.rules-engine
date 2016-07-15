var objects = [];
var states = [];
var temperature = [];
var humidity = [];
var switches = [];
var weather = [];
var alarm = [];
var instances = [];
var scripts = [];
var setpoint = [];

var saveName = "untitled";
var sSaved = "";
var defaultWorkspace = '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="controls_if" id="C2cniFl[?cWd?f~gk!s~" x="13" y="12"><value name="IF0"><block type="logic_compare" id="ukBnNm`^C3K6;Nf/2o;/"><field name="OP">EQ</field><value name="A"><block type="variables_get" id="o8dv1*@DxfkD)tJB?nrv"><field name="VAR">item</field></block></value><value name="B"><block type="text" id="512bs;ynVwTE[^~K=8w9"><field name="TEXT"></field></block></value></block></value><statement name="DO0"><block type="variables_set" id="kDOM7|8lvhid5}p=GS#("><field name="VAR">item</field><value name="VALUE"><block type="text" id="J.f1)3WRD%mgqHC^V8NG"><field name="TEXT"></field></block></value></block></statement></block></xml>';

document.head.parentElement.setAttribute('lang', 'en');

window.BlocklyRulesControl = {
    weather: [], alarm: [], switches: [], temperature: [], humidity: [], journalUuid: "123-456-789", setpoint: [], scripts: [],
    init: function () {
        this.alarm = alarm || [];
        this.weather = weather || [];
        this.switches = switches || [];
        this.temperature = temperature || [];
        this.humidity = humidity || [];
        this.scripts = scripts || [];
        this.setpoint = setpoint || [];
    }, getScript: function(a) {
        var b = "";
        for (var d = 0; d < this.scripts.length; d++) {
            var c = this.scripts[d];
            var x = "blockly_" + a;
            if (c.name === x) {
                if (c.script !== undefined) {
                    b = c.script;
                } else {
                    b = "";
                }
            }
        }
        return b;
    }, getScriptState: function(a) {
        var b = "";
        for (var d = 0; d < this.scripts.length; d++) {
            var c = this.scripts[d];
            var x = "blockly_" + a;
            if (c.name === x) {
                if (c.script !== undefined) {
                    b = c.enabled;
                } else {
                    b = false;
                }
            }
        }
        return b;

    }, getAllScripts: function(a) {
        var b = [];
        for (var d = 0; d < this.scripts.length; d++) {
            var c = this.scripts[d];
            if (c.name !== undefined && (0 < c.name.length || 0 === c.name.length)) {
                b.push({name: c.name, enabled: c.enabled});
            } else {
                b.push({name: c.id, enabled: c.enabled});
            }
        }
        return b.sort();
    }, getWeather: function (a) {

    }, getAlarm: function (a) {

    }, getSetpoint: function (a) {
        var b = [];
        for (var d = 0; d < this.setpoint.length; d++) {
            var c = this.setpoint[d];
            if (c.name !== undefined && (0 < c.name.length || 0 === c.name.length)) {
                b.push([c.name, c.id]);
            } else {
                b.push([c.id, c.id]);
            }
        }
        return b.sort();
    }, getAllObjects: function (a) {
        var temperature = this.getTemperature();
        var switches = this.getSwitch();
        var humidity = this.getHumidity();

        var allValues = [];
        for (var t in temperature) {
            allValues.push(temperature[t]);
        }
        for (var s in switches) {
            allValues.push(switches[s]);
        }
        for (var h in humidity) {
            allValues.push(humidity[h]);
        }
        return allValues;
    }, getTemperature: function (a) {
        var b = [];
        for (var d = 0; d < this.temperature.length; d++) {
            var c = this.temperature[d];
            if (c.name !== undefined && (0 < c.name.length || 0 === c.name.length)) {
                b.push([c.name, c.id]);
            } else {
                b.push([c.id, c.id]);
            }
        }
        return b.sort();
    }, getSwitch: function (a) {
        var b = [];
        for (var d = 0; d < this.switches.length; d++) {
            var c = this.switches[d];
            if (c.name !== undefined && (0 < c.name.length || 0 === c.name.length)) {
                b.push([c.name, c.id]);
            } else {
                b.push([c.id, c.id]);
            }
        }
        return b.sort();
    }, getHumidity: function (a) {
        var b = [];
        for (var d = 0; d < this.humidity.length; d++) {
            var c = this.humidity[d];
            if (c.name !== undefined && (0 < c.name.length || 0 === c.name.length)) {
                b.push([c.name, c.id]);
            } else {
                b.push([c.id, c.id]);
            }
        }
        return b.sort();
    }, getVariables: function (a) {
        // TODO: Get all ioBroker System Variables
        var a = [];
        a.push(["javascript", "javascript"]);
        a.push(["homekit", "homekit"]);
        a.push(["rules", "rules"]);

        a.push(["day", "day"]);
        a.push(["hour", "hour"]);
        a.push(["housemode", "housemode"]);
        a.push(["isDaytime", "isDaytime"]);
        a.push(["minute", "minute"]);
        a.push(["month", "month"]);
        a.push(["weekday", "weekday"]);

        return a;
    }, getDefaultPhone: function (a) {
        // TODO: Set Default Phone from ioBroker
    }, getDefaultEMail: function (a) {
        // TODO: Set Default Email from ioBroker
    }, getAllValues: function (a) {
        // TODO: Get all relevant Values from ioBroker
        var a = [];
        a.push(["mediastate", "mediastate"]);
        return a;
    }, getValue: function (a) {
        // TODO: Get all relevant Values from ioBroker
        // TODO: Not working
        var b = {
            "mediastate": {
                "description": "media device media state",
                "name": "media state",
                "options": ["playing", "stopped", "paused", "streaming"],
                "type": "option"
            }
        };
        return b;
    }, getDeviceTypes: function (a) {
        // TODO: ???
        var b = [];
        for (var i = 0; i < instances.length; i++) {
            b.push([instances[i].name, instances[i].name]);
        }
        return b.sort();
    }, getDeviceUuids: function (a) {
        // TODO: ???
        return this.getDeviceTypes();
    }, getDeviceCommands: function (a) {
        // TODO: ???
        // set global variable                             value to set            name of the variable
        // delete global variable                          name of the variable

        // get data from datalogger                        uuid of the device to fetch logger data from        end date        environment         start date
        // get environments for device from datalogger
        // create new event                                uuid for the new event      event map
        // get event                                       uuid for the event to fetch
        // delete event                                    uuid for the event to delete

        // get list of scripts
        // get script                                      name of the script to get
        // set a script                                    name of the script to set       script content
        // delete a script                                 name of the script to delete

        // run (scenario)                                  <scenario name>

        // create scenario                                 uuid for the new scenario           scenario map
        // get scenario                                    uuid for the scenario to fetch
        // delete scenario                                 uuid for the scenario to delete

        // gets the active house mode
        // set the house mode                              house mode          security pin
        // trigger security zone                           zone to trigger
        // define zones                                    security pin        zone to housemode mapping
        // cancel operation

        // get process list
        // get system status
        // set processes to monitor                        process list
        // set memory threshold                            memory threshold
        return [];
    }, clearAllBlocks: function (a) {
        if (void 0 !== a) {
            void 0 === a.fieldRow && console.warn("Warning: specified container is not an Input. Unable to clear blocks within.");
            for (var b, c = a.fieldRow.length - 1; 0 <= c; c--)b = a.fieldRow[c],
                b.dispose(), a.fieldRow.splice(c, 1);
            a.sourceBlock_.rendered && (a.sourceBlock_.render(), a.sourceBlock_.bumpNeighbours_())
        }
    }
};

function pattern2RegEx(pattern) {
    if (pattern != '*') {
        if (pattern[0] == '*' && pattern[pattern.length - 1] != '*') pattern += '$';
        if (pattern[0] != '*' && pattern[pattern.length - 1] == '*') pattern = '^' + pattern;
    }
    pattern = pattern.replace(/\./g, '\\.');
    pattern = pattern.replace(/\*/g, '.*');
    return pattern;
}

function getData(callback) {
    var objectsReady;
    var statesReady;

    servConn.getStates('*', function (err, res) {
        states = res;
        statesReady = true;

        if (objectsReady && typeof callback === 'function') callback();
    });

    servConn.getObjects(function (err, res) {
        objects = res;
        for (var object in objects) {
            if (objects[object]._id == "system.adapter.occ.0") {
                config = objects[object].native;
            }
        }

        servConn._socket.emit('getObjectView', 'script', 'javascript', {}, function (err, res) {
            var rows = res.rows;
            for (var i = 0; i < rows.length; i++) {
                objects["script.js." + rows[i].id] = rows[i];
            }
        });

        objectsReady = true;
        if (statesReady && typeof callback === 'function') callback();
    });
}

/* MENU */
/* When the user clicks on the button,
 toggle between hiding and showing the dropdown content */
function open_menu() {
    document.getElementById("menuitems").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

$(document).ready(function () {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = "Initialization in progress, please wait...";
    setTimeout(function () {
        x.className = x.className.replace("show", "");
    }, 20000);

    $('.close').click(function(id, parent, dialog) {
        var dlg = id.currentTarget.id.replace("btn_", "");
        $('#' + dlg).hide();
    });

    initButtons();

    servConn.init(null, {
        onConnChange: function (isConnected) {
            reloadData();
        }
    });
});

function createBlocks() {
    Blockly.Blocks.iobroker_sendMessage = {
        init: function () {
            this.lastCommand = this.lastDevice = this.lastType = this.commands = void 0;
            this.customFields = [];
            this.customBlocks = [];
            var a = window.BlocklyRulesControl.getDeviceTypes();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no device. This block is unusable.")) : this.setWarningText(null);
            this.setColour(290);
            this.appendDummyInput().appendField("sendMessage");
            this.container = this.appendDummyInput().appendField("to instance").appendField(new Blockly.FieldDropdown(a), "TYPE").appendField(new Blockly.FieldDropdown([["", ""]]), "DEVICE");
            this.containerCommand = this.appendDummyInput().appendField("command").setAlign(Blockly.ALIGN_RIGHT).appendField(new Blockly.FieldDropdown([["", ""]]), "COMMAND");
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Send a message to execute a command on ioBroker")
        }, mutationToDom: function () {
            var a = document.createElement("mutation");
            a.setAttribute("currenttype", this.lastType);
            a.setAttribute("currentdevice", this.lastDevice);
            a.setAttribute("currentcommand", this.lastCommand);
            a.setAttribute("duplicated", 0 === this.customBlocks.length ? !1 : !0);
            return a
        }, domToMutation: function (a) {
            var b = a.getAttribute("currenttype"), c = a.getAttribute("currentdevice"), d = a.getAttribute("currentcommand");
            a = a.getAttribute("duplicated");
            this._generateContent(b, c, d, a)
        }, getFields: function () {
            for (var a = {}, b = 0; b < this.customFields.length; b++)a["CUSTOM_" + this.customFields[b]] = this.customFields[b];
            return a
        }, _addCustomField: function (a, b, c, d, e) {
            e ? d.dispose() : d.initSvg();
            c = this.appendValueInput("CUSTOM_" + a).setAlign(Blockly.ALIGN_RIGHT).setCheck(c);
            this.customFields.push(a);
            void 0 !== b && 0 < b.length ? c.appendField("- " + b) : c.appendField("- " + a);
            e || (d.outputConnection.connect(c.connection), d.render(), this.customBlocks.push(d))
        }, _clearCustomFields: function () {
            for (var a = 0; a < this.customFields.length; a++) {
                var b = this.getInput("CUSTOM_" + this.customFields[a]);
                void 0 !== b && (null !== b.connection && b.connection.targetConnection.sourceBlock_.dispose(), this.removeInput("CUSTOM_" + this.customFields[a]))
            }
            for (; 0 < this.customFields.length;)this.customFields.pop();
            for (; 0 < this.customBlocks.length;)this.customBlocks.pop().dispose()
        }, _generateContent: function (a, b, c, d) {
            a || (a = this.getFieldValue("TYPE"));
            if (this.lastType != a) {
                this.lastType = a;
                var e = window.BlocklyRulesControl.getDeviceUuids(a);
                0 === e.length ? (e.push(["", ""]), this.setWarningText("There is no device for selected device type. Please choose another one.")) : this.setWarningText(null);
                this.container.removeField("DEVICE");
                this.container.appendField(new Blockly.FieldDropdown(e), "DEVICE")
            }
            b || (b = this.getFieldValue("DEVICE"));
            if (this.lastDevice != b) {
                this.lastDevice = b;
                e = [];
                if (0 < b.length) {
                    this.commands = window.BlocklyRulesControl.getDeviceCommands(a);
                    for (var f in this.commands)e.push([this.commands[f].name, this.commands[f].id]);
                    0 === e.length ? (e.push(["", ""]), this.setWarningText("There is no command for selected device type. Please choose another one.")) : this.setWarningText(null)
                } else e.push(["", ""]), this.setWarningText("Please select an instance.");
                window.BlocklyRulesControl.clearAllBlocks(this.containerCommand);
                this.containerCommand.appendField("command");
                this.containerCommand.appendField(new Blockly.FieldDropdown(e), "COMMAND")
            }
            c || (c = this.getFieldValue("COMMAND"));
            if (this.lastCommand != c && (this.lastCommand = c, this._clearCustomFields(), 0 < c.length && void 0 !== this.commands[c] && void 0 !== this.commands[c].parameters)) {
                b = a = null;
                for (var g in this.commands[c].parameters) {
                    if (void 0 !== this.commands[c].parameters[g].type)switch (this.commands[c].parameters[g].type) {
                        case "integer":
                        case "number":
                            b = "Number";
                            a = this.workspace.newBlock("math_number");
                            break;
                        case "string":
                            b = "String";
                            a = this.workspace.newBlock("text");
                            break;
                        case "boolean":
                            b = "Boolean";
                            a = this.workspace.newBlock("logic_boolean");
                            break;
                        case "option":
                            b = "String";
                            a = this.workspace.newBlock("agocontrol_fixedItemsList");
                            f = [];
                            if (void 0 !== this.commands[c].parameters[g].options)for (e = 0; e < this.commands[c].parameters[g].options.length; e++)f.push([this.commands[c].parameters[g].options[e], this.commands[c].parameters[g].options[e]]);
                            a.setItems(f);
                            break;
                        case "email":
                            b = "Email";
                            a = this.workspace.newBlock("agocontrol_email");
                            break;
                        case "color":
                        case "colour":
                            b = "Colour";
                            a = this.workspace.newBlock("colour_picker");
                            break;
                        case "phone":
                            b = "Phone";
                            a = this.workspace.newBlock("agocontrol_phoneNumber");
                            break;
                        case "uuid":
                            b = "Device";
                            a = this.workspace.newBlock("agocontrol_device");
                            break;
                        default:
                            b = "String", a = this.workspace.newBlock("text")
                    } else b = "String", a = this.workspace.newBlock("text");
                    this._addCustomField(g, this.commands[c].parameters[g].name, b, a, d)
                }
            }
        }, onchange: function () {
            this.workspace && this._generateContent(null, null, null, !1)
        }
    };
    Blockly.JavaScript.iobroker_sendMessage = function (a) {
        var b = "", c;
        c = a.getFieldValue("COMMAND") || "nil";
        var d = a.getFieldValue("DEVICE") || "nil", e = a.getFields(), b = b + ("'command=" + c + "', 'uuid=" + d + "' "), f;
        for (f in e)c = Blockly.JavaScript.valueToCode(a, f, Blockly.JavaScript.ORDER_NONE) || "", b += ", '" + e[f] + "=' .. " + c;
        return "sendMessage(" + b + ")\n"
    };


    Blockly.Blocks.iobroker_journal = {
        init: function () {
            this.setColour(290);
            this.appendValueInput("MSG").setCheck("String").appendField("journalize").appendField(new Blockly.FieldDropdown([["info", "info"], ["warning", "warning"], ["error", "error"], ["debug", "debug"]]), "TYPE").appendField("message");
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Add message to journal")
        }, getJournalUuid: function () {
            return window.BlocklyRulesControl.journalUuid
        }
    };
    Blockly.JavaScript.iobroker_journal = function (a) {
        var b = Blockly.JavaScript.valueToCode(a, "MSG", Blockly.JavaScript.ORDER_ATOMIC) || "", c = a.getFieldValue("TYPE");
        a = a.getJournalUuid();
        return null !== a ? "sendMessage('command=addmessage', 'uuid=" + a + "' , 'message=' .. " + b + ", 'type=" + c + "')\n" : "print('No journal available!')\n"
    };

    Blockly.Blocks.text_format = {
        init: function () {
            this.setColour(160);
            this.appendValueInput("ITEM").appendField("format");
            this.appendValueInput("FORMAT").setCheck("String").appendField("to");
            this.setInputsInline(!0);
            this.setOutput(!0, "String");
            this.setTooltip("Format input to specified format")
        }
    };
    Blockly.JavaScript.text_format = function (a) {
        return ["string.format(" + Blockly.JavaScript.valueToCode(a, "FORMAT", Blockly.JavaScript.ORDER_ATOMIC) + "," + Blockly.JavaScript.valueToCode(a, "ITEM", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_valueOptions = {
        init: function () {
            this.currentValue = null;
            var a = window.BlocklyRulesControl.getAllValues(!0);
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no value. This block is unusable.")) : this.setWarningText(null);
            this.setColour(160);
            this.setOutput(!0, "String");
            this.container = this.appendDummyInput().appendField(new Blockly.FieldDropdown(a), "VALUE").appendField(new Blockly.FieldDropdown([["", ""]]), "OPTIONS");
            this.setTooltip("Return selected value option")
        }, onchange: function () {
            if (this.workspace) {
                var a =
                    this.getFieldValue("VALUE");
                if (this.currentValue != a) {
                    this.currentValue = a;
                    var a = window.BlocklyRulesControl.getValue(a), b = [];
                    if (null !== a.type && "option" === a.type && null !== a.options && 0 < a.options.length)for (var c = 0; c < a.options.length; c++)b.push([a.options[c], a.options[c]]);
                    0 === b.length ? (b.push(["", ""]), this.setWarningText("There is no option for selected value. Please choose another one.")) : this.setWarningText(null);
                    this.container.removeField("OPTIONS");
                    this.container.appendField(new Blockly.FieldDropdown(b),
                        "OPTIONS")
                }
            }
        }, getSelectedOption: function () {
            return this.getFieldValue("OPTIONS") || ""
        }
    };
    Blockly.JavaScript.iobroker_valueOptions = function (a) {
        return ["'" + a.getSelectedOption() + "'", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_weekday = {
        init: function () {
            this.appendValueInput("WEEKDAY").setCheck("String");
            this.appendDummyInput().appendField("is").appendField(new Blockly.FieldDropdown([["weekday", "-2"], ["weekend", "-1"], ["monday", "1"], ["tuesday", "2"], ["wednesday", "3"], ["thursday", "4"], ["friday", "5"], ["saturday", "6"], ["sunday", "7"]]), "TYPE");
            this.setInputsInline(!0);
            this.setOutput(!0, "Boolean");
            this.setColour(20);
            this.setTooltip("Return true if specified day is corresponding to selected option")
        }
    };
    Blockly.JavaScript.iobroker_weekday = function (a) {
        var b = Blockly.JavaScript.valueToCode(a, "WEEKDAY", Blockly.JavaScript.ORDER_ATOMIC) || "";
        a = a.getFieldValue("TYPE");
        return [-2 == a ? "tonumber(" + b + ") <= 5" : -1 == a ? "tonumber(" + b + ") >= 6" : "tonumber(" + b + ") == " + a, Blockly.JavaScript.ORDER_RELATIONAL]
    };

    Blockly.Blocks.datetime = {};
    Blockly.JavaScript.datetime = {};

    Blockly.Blocks.datetime_timestamp = {
        init: function () {
            this.setColour(20);
            this.appendDummyInput().appendField("timestamp");
            this.setOutput(!0, "Number");
            this.setTooltip("Return current timestamp")
        }
    };
    Blockly.JavaScript.datetime_timestamp = function (a) {
        return ["os.time()", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.datetime_totimestamp = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("DATETIME").setCheck("String").appendField("datetime");
            this.appendValueInput("PATTERN").setCheck("String").appendField("with pattern");
            this.setInputsInline(!0);
            this.setOutput(!0, "Number");
            this.setTooltip("Convert datetime to timestamp according to specified datetime pattern")
        }
    };
    Blockly.JavaScript.datetime_totimestamp = function (a) {
        if (!Blockly.JavaScript.definitions_.datetimeToTimestamp) {
            var b;
            b = "function datetimeToTimestamp(adatetime, apattern)\nlocal runyear, runmonth, runday, runhour, runminute, runseconds = adatetime:match(apattern)\nreturn os.time({year = runyear, month = runmonth, day = runday, hour = runhour, min = runminute, sec = runseconds})";
            b += "end\n";
            c = Blockly.JavaScript.scrub_(a, b);
            Blockly.JavaScript.definitions_.datetimeToTimestamp = c
        }
        b = Blockly.JavaScript.valueToCode(a, "PATTERN", Blockly.JavaScript.ORDER_ATOMIC);
        b = b.replace("\\", "");
        var c;
        c = "datetimeToTimestamp(" + Blockly.JavaScript.valueToCode(a, "DATETIME", Blockly.JavaScript.ORDER_ATOMIC);
        c = c + "," + b;
        c += ")";
        return [c, Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.datetime_currentdate = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("FORMAT").setCheck("String").appendField("format date to");
            this.setInputsInline(!0);
            this.setOutput(!0, "String");
            this.setTooltip("Format current date to specified format")
        }
    };
    Blockly.JavaScript.datetime_currentdate = function (a) {
        a = Blockly.JavaScript.valueToCode(a, "FORMAT", Blockly.JavaScript.ORDER_ATOMIC);
        a = a.replace("\\", "");
        return ["os.date(" + a + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.datetime_specificdate = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("TIMESTAMP").setCheck("Number").appendField("format timestamp");
            this.appendValueInput("FORMAT").setCheck("String").appendField("to");
            this.setInputsInline(!0);
            this.setOutput(!0, "String");
            this.setTooltip("Format timestamp to specified format")
        }
    };
    Blockly.JavaScript.datetime_specificdate = function (a) {
        var b = Blockly.JavaScript.valueToCode(a, "FORMAT", Blockly.JavaScript.ORDER_ATOMIC), b = b.replace("\\", "");
        return ["os.date(" + b + "," + Blockly.JavaScript.valueToCode(a, "TIMESTAMP", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };


    Blockly.Blocks.common = {};
    Blockly.JavaScript.common = {};
    Blockly.Blocks.common_tonumber = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("VALUE").appendField("toNumber");
            this.setOutput(!0, "Number");
            this.setTooltip("Cast input to number")
        }
    };
    Blockly.JavaScript.common_tonumber = function (a) {
        return ["tonumber(" + Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.common_tostring = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("VALUE").appendField("toString");
            this.setOutput(!0, "String");
            this.setTooltip("Cast input to string")
        }
    };
    Blockly.JavaScript.common_tostring = function (a) {
        return ["tostring(" + Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.common_type = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("ITEM").appendField("type of");
            this.setOutput(!0, "String");
            this.setTooltip("Returns type of input")
        }
    };
    Blockly.JavaScript.common_type = function (a) {
        return ["type(" + Blockly.JavaScript.valueToCode(a, "ITEM", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.common_execute = {
        init: function () {
            this.setColour(20);
            this.appendValueInput("CMD").setCheck("String").appendField("execute");
            this.setPreviousStatement(!0);
            this.setNextStatement(!0);
            this.setTooltip("Execute command")
        }
    };
    Blockly.JavaScript.common_execute = function (a) {
        return "os.execute(" + Blockly.JavaScript.valueToCode(a, "CMD", Blockly.JavaScript.ORDER_ATOMIC) + ")\n"
    };

    Blockly.Blocks.iobroker_defaultEmail = {
        init: function () {
            var a = window.BlocklyRulesControl.getDefaultEMail();
            this.email = "";
            var b = "<not configured>";
            a && a.email && 0 < a.email.length && (b = this.email = a.email);
            this.setColour(330);
            this.appendDummyInput().appendField('default email "' + b + '"');
            this.setOutput(!0, "String");
            this.setTooltip("Default email configured in system")
        }, getEmail: function () {
            return this.email
        }
    };
    Blockly.JavaScript.iobroker_defaultEmail = function (a) {
        return ["'" + a.getEmail() + "'", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_defaultPhoneNumber = {
        init: function () {
            var a = window.BlocklyRulesControl.getDefaultPhone();
            this.phone = "";
            var b = "<not configured>";
            a && a.phone && 0 < a.phone.length && (b = this.phone = a.phone);
            this.setColour(330);
            this.appendDummyInput().appendField('default phone number "' + b + '"');
            this.setOutput(!0, "String");
            this.setTooltip("Default phone number configured in system")
        }, getPhoneNumber: function () {
            return this.phone
        }
    };
    Blockly.JavaScript.iobroker_defaultPhoneNumber = function (a) {
        return ["'" + a.getPhoneNumber() + "'", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_getVariable = {
        init: function () {
            var a = window.BlocklyRulesControl.getVariables();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "String");
            this.setTooltip("Return iobroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_getVariable = function (a) {
        return ['getVariable("' + a.getVariable() + '")', Blockly.JavaScript.ORDER_NONE]
    };

    Blockly.Blocks.iobroker_createVariable = {
        init: function () {
            var a = window.BlocklyRulesControl.getVariables();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendValueInput("VALUE").setCheck(null).appendField("set").appendField(new Blockly.FieldVariable(), "VARIABLE").appendField("to");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Set iobroker variable value")
        },
        getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    }
    Blockly.JavaScript.iobroker_createVariable = function (a) {
        var b = "", b = a.getVariable();
        b = b.split(" ").join("_").split(".").join("_");
        // TODO: Remove this hardcoded Value
        b = "rules-engine.0." + b;
        return 0 < b.length ? (b = "createState('" + b + "'," + (Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "nil"), b += ")\n") : ""
    };

    Blockly.Blocks.iobroker_setVariable = {
        init: function () {
            var a = window.BlocklyRulesControl.getVariables();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendValueInput("VALUE").setCheck("String").appendField("set").appendField(new Blockly.FieldDropdown(a), "VARIABLE").appendField("to").appendField(new Blockly.FieldVariable());
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Set iobroker variable value")
        },
        getVariable: function () {
            // return ['getVariable("' + this.getFieldValue("VARIABLE") || "" + '")', Blockly.JavaScript.ORDER_NONE];
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_setVariable = function (a) {
        var b = "", b = a.getVariable();
        return 0 < b.length ? (b = "setVariable('" + b + "'," + (Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "nil"), b += ")\n") : ""
    };

    Blockly.Blocks.iobroker_email = {
        init: function () {
            this.setColour(160);
            this.appendDummyInput().appendField(new Blockly.FieldTextInput("husky.koglhof@icloud.com", Blockly.FieldTextInput.emailValidator), "EMAIL");
            this.setOutput(!0, "Email");
            this.setTooltip("An email")
        }
    };
    Blockly.FieldTextInput.emailValidator = function (a) {
        return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(a) ? a : null
    };
    Blockly.JavaScript.iobroker_email = function (a) {
        return [Blockly.JavaScript.quote_(a.getFieldValue("EMAIL")), Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_phoneNumber = {
        init: function () {
            this.setHelpUrl("http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements");
            this.setColour(160);
            this.appendDummyInput().appendField(new Blockly.FieldTextInput("at*123 456 789", Blockly.FieldTextInput.phoneNumberValidator), "PHONE");
            this.setOutput(!0, "Phone");
            this.setTooltip("A phone number <Alpha-2 code>*<real phone number>")
        }
    };
    Blockly.FieldTextInput.phoneNumberValidator = function (a) {
        return /^[a-z]{2}\*[0-9\s]*$/i.test(a) ? (a = a.split("*"), a = phoneNumberParser(a[1], a[0]), !1 === a.result ? null : a.phone) : null
    };
    Blockly.JavaScript.iobroker_phoneNumber = function (a) {
        return [Blockly.JavaScript.quote_(a.getFieldValue("PHONE")), Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.degrees = {};
    Blockly.Blocks.degrees.HUE = 230;
    Blockly.Blocks.iobroker_getDegrees = {
        init: function () {
            this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
            this.setColour(Blockly.Blocks.math.HUE);
            this.appendDummyInput().appendField(new Blockly.FieldTextInput("0", Blockly.FieldTextInput.numberValidator), "NUM").appendField("° Celsius");
            this.setOutput(!0, "Number");
            var a = this;
            this.setTooltip(function () {
                var b = a.getParent();
                return b && b.tooltip || Blockly.Msg.MATH_NUMBER_TOOLTIP
            })
        }
    };
    Blockly.JavaScript.degrees = {};
    Blockly.JavaScript.iobroker_getDegrees = function (a) {
        a = parseFloat(a.getFieldValue("NUM"));
        return [a, 0 > a ? Blockly.JavaScript.ORDER_UNARY : Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_getPercent = {
        init: function () {
            this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
            this.setColour(Blockly.Blocks.math.HUE);
            this.appendDummyInput().appendField(new Blockly.FieldTextInput("0", Blockly.FieldTextInput.numberValidator), "NUM").appendField("%");
            this.setOutput(!0, "Number");
            var a = this;
            this.setTooltip(function () {
                var b = a.getParent();
                return b && b.tooltip || Blockly.Msg.MATH_NUMBER_TOOLTIP
            })
        }
    };
    Blockly.JavaScript.iobroker_getPercent = function (a) {
        a = parseFloat(a.getFieldValue("NUM"));
        return [a, 0 > a ? Blockly.JavaScript.ORDER_UNARY : Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_State = {
        init: function () {
            var a = window.BlocklyRulesControl.getSwitch();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "Boolean");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_State = function (a) {
        return [a.getFieldValue("VARIABLE"), Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_Number = {
        init: function () {
            var a = window.BlocklyRulesControl.getAllObjects();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(1, "Number");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_Number = function (a) {
        return [a.getFieldValue("VARIABLE"), Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_getSwitch = {
        init: function () {
            var a = window.BlocklyRulesControl.getSwitch();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "Boolean");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_getSwitch = function (a) {
        return ["getStateFromIO('" + a.getFieldValue("VARIABLE") + "')", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_setSwitch = {
        init: function () {
            var a = window.BlocklyRulesControl.getSwitch();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendValueInput("VALUE").setCheck("Boolean").appendField("set").appendField(new Blockly.FieldDropdown(a), "VARIABLE").appendField("to");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Set ioBroker variable value")
        },
        getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_setSwitch = function (a) {
        var b = "", b = a.getVariable();
        return 0 < b.length ? (b = "setStateFromIO('" + b + "'," + (Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "nil"), b += ")\n") : ""
    };

    Blockly.Blocks.iobroker_getTemperature = {
        init: function () {
            var a = window.BlocklyRulesControl.getTemperature();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField("Temperature").appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "Number");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_getTemperature = function (a) {
        return ["getStateFromIO('" + a.getFieldValue("VARIABLE") + "')", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_setTemperature = {
        init: function () {
            var a = window.BlocklyRulesControl.getTemperature();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendValueInput("VALUE").setCheck("Number").appendField("set Temperature").appendField(new Blockly.FieldDropdown(a), "VARIABLE").appendField("to");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Set ioBroker variable value")
        },
        getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_setTemperature = function (a) {
        var b = "", b = a.getVariable();
        return 0 < b.length ? (b = "setStateFromIO('" + b + "'," + (Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "nil"), b += ")\n") : ""
    };

    Blockly.Blocks.iobroker_sleep = {
        init: function () {
            this.setColour(290);
            this.appendValueInput("DURATION").setCheck("Number").appendField("sleep during");
            this.appendDummyInput().appendField("seconds");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Sleep during specified amount of seconds (be carefull it will defer other script!)")
        }
    };
    Blockly.JavaScript.iobroker_sleep = function (a) {
        // var b = "", b = "local time_to = os.time() + " + (Blockly.Lua.valueToCode(a, "DURATION", Blockly.Lua.ORDER_NONE) || 1) + "\n";
        // return b + "while os.time() < time_to do end\n"
        return "pause(" + (Blockly.JavaScript.valueToCode(a, "DURATION", Blockly.JavaScript.ORDER_NONE) || 60) + ");\n";
    };
    Blockly.Blocks.iobroker_log = {
        init: function () {
            this.setColour(160);
            this.appendValueInput("VARIABLE").setCheck("String").appendField("log");
            this.appendDummyInput().appendField("to ioBroker");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Log content to ioBroker Logfile")
        },
        getVariable: function (a) {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_log = function (a) {
        return "log(" + (Blockly.JavaScript.valueToCode(a, "VARIABLE", Blockly.JavaScript.ORDER_NONE) || "") + ");\n";
    };

    Blockly.Blocks.iobroker_getHumidity = {
        init: function () {
            var a = window.BlocklyRulesControl.getHumidity();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField("Humidity").appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "Number");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_getHumidity = function (a) {
        return ["getStateFromIO('" + a.getFieldValue("VARIABLE") + "')", Blockly.JavaScript.ORDER_ATOMIC]
    };
    Blockly.Blocks.iobroker_getSetpoint = {
        init: function () {
            var a = window.BlocklyRulesControl.getSetpoint();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendDummyInput().appendField("Setpoint").appendField(new Blockly.FieldDropdown(a), "VARIABLE");
            this.setOutput(!0, "Number");
            this.setTooltip("Return ioBroker variable value (string format!)")
        }, getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_getSetpoint = function (a) {
        return ["getStateFromIO('" + a.getFieldValue("VARIABLE") + "')", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.iobroker_setSetpoint = {
        init: function () {
            var a = window.BlocklyRulesControl.getSetpoint();
            0 === a.length ? (a.push(["", ""]), this.setWarningText("There is no variable. This block is unusable.")) : this.setWarningText(null);
            this.setColour(330);
            this.appendValueInput("VALUE").setCheck("Number").appendField("set Setpoint").appendField(new Blockly.FieldDropdown(a), "VARIABLE").appendField("to");
            this.setInputsInline(!0);
            this.setPreviousStatement(!0, "null");
            this.setNextStatement(!0, "null");
            this.setTooltip("Set ioBroker variable value")
        },
        getVariable: function () {
            return this.getFieldValue("VARIABLE") || ""
        }
    };
    Blockly.JavaScript.iobroker_setSetpoint = function (a) {
        var b = "", b = a.getVariable();
        return 0 < b.length ? (b = "setStateFromIO('" + b + "'," + (Blockly.JavaScript.valueToCode(a, "VALUE", Blockly.JavaScript.ORDER_NONE) || "nil"), b += ")\n") : ""
    };

    Blockly.Blocks.logic_switch = {
        init: function () {
            this.jsonInit({
                message0: "%1",
                args0: [{
                    type: "field_dropdown",
                    name: "BOOL",
                    options: [["On", "On"], ["Off", "Off"]]
                }],
                output: "Boolean",
                colour: Blockly.Blocks.logic.HUE,
                tooltip: Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP,
                helpUrl: Blockly.Msg.LOGIC_BOOLEAN_HELPURL
            })
        }
    };
    Blockly.JavaScript.logic_switch = function (a) {
        return ["On" == a.getFieldValue("BOOL") ? "true" : "false", Blockly.JavaScript.ORDER_ATOMIC]
    };

    /************************************************************************************************/
    Blockly.Blocks.logic_timeofday = {
        // Comparison operator.
        init: function() {
            this.setColour(Blockly.Blocks.math.HUE);
            this.setOutput(true, null);
            this.appendValueInput("Time")
                .appendField("Time:")
                .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP');
            this.setInputsInline(true);
            var thisBlock = this;
            this.setTooltip(function() {
                var op = thisBlock.getTitleValue('OP');
                return thisBlock.TOOLTIPS[op];
            });
        }
    };
    Blockly.JavaScript.logic_timeofday = function (a) {
        return ["getTime('" + a.getFieldValue("OP") + "', " + Blockly.JavaScript.valueToCode(a, "Time", Blockly.JavaScript.ORDER_ATOMIC) + ")", Blockly.JavaScript.ORDER_ATOMIC]
    };

    Blockly.Blocks.logic_timeofday.OPERATORS =
        [['=', '=='],
            ['\u2260', '!='],
            ['<', '<'],
            ['\u2264', '<='],
            ['>', '>'],
            ['\u2265', '>=']];

    Blockly.Blocks.logic_timeofday.TOOLTIPS = {
        EQ: 'Return true if both inputs equal each other.',
        NEQ: 'Return true if both inputs are not equal to each other.',
        LT: 'Return true if the first input is smaller\n' +
        'than the second input.',
        LTE: 'Return true if the first input is smaller\n' +
        'than or equal to the second input.',
        GT: 'Return true if the first input is greater\n' +
        'than the second input.',
        GTE: 'Return true if the first input is greater\n' +
        'than the second input.'
    };

    Blockly.Blocks.logic_timevalue = {
        init: function() {
            this.setColour(Blockly.Blocks.math.HUE);
            this.appendDummyInput()
                .appendField(new Blockly.FieldTextInput('00:00',
                    this.TimeValidator), 'TEXT');
            this.setOutput(true, 'String');
            this.setTooltip('Enter a valid time in 24 hour format, e.g. 23:59');
        }
    };
    Blockly.Blocks.logic_timevalue.TimeValidator = function(text) {
        if (text.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]/)) return text;
        return "00:00";
    };
    Blockly.JavaScript.logic_timevalue = function (a) {
        return ["'" + a.getFieldValue("TEXT") + "'", Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.Blocks.logic_sunrisesunset = {
        init: function() {
            this.setOutput(true, null);
            this.setColour(Blockly.Blocks.math.HUE);
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown(this.VALUES), 'SunriseSunset')
                .appendField(" ");
            this.setTooltip('Use this block to check against sunrise/sunset time as specified in the ioBroker preferences.');
        }
    };
    Blockly.JavaScript.logic_sunrisesunset = function (a) {
        return ["sunSet('" + this.getFieldValue("SunriseSunset") + "')" || "", Blockly.JavaScript.ORDER_ATOMIC];
    };

    Blockly.Blocks.logic_sunrisesunset.VALUES =
        [["Sunrise", 'Sunrise'],
            ["Sunset",'Sunset']];
    /************************************************************************************************/
    Blockly.Blocks.iobroker_repeat = {
        init: function() {
            this.appendDummyInput()
                .appendField("Scheduler, on time")
                .appendField(new Blockly.FieldDropdown(Blockly.Blocks.logic_timeofday.OPERATORS), 'OP')
                .appendField(new Blockly.FieldDropdown(Blockly.Blocks.logic_sunrisesunset.VALUES), 'SUNSET')
            this.appendStatementInput("NAME").appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip('');
        }
    };

    Blockly.JavaScript.iobroker_repeat = function(a) {
        var time = a.getFieldValue('SUNSET');
        var operand = a.getFieldValue("OP");
        var c = Blockly.JavaScript.statementToCode(a, "NAME"), c = Blockly.JavaScript.addLoopTrap(c, a.id);
        return "schedule(getTime('" + operand + "', '" + time + "'), function() {\n" + c + "});\n";
    };


    Blockly.Blocks.iobroker_repeat_ext = {
        init: function() {
            this.appendDummyInput()
                .appendField("Scheduler, on time")
                .appendField(new Blockly.FieldDropdown(Blockly.Blocks.logic_timeofday.OPERATORS), 'OP')
                .appendField(new Blockly.FieldTextInput('00:00', Blockly.Blocks.logic_timevalue.TimeValidator), 'TEXT');
            this.appendStatementInput("NAME").appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip('');
        }
    };

    Blockly.JavaScript.iobroker_repeat_ext = function(a) {
        var time = a.getFieldValue('TEXT');
        var operand = a.getFieldValue("OP");
        var c = Blockly.JavaScript.statementToCode(a, "NAME"), c = Blockly.JavaScript.addLoopTrap(c, a.id);
        return "schedule(getTime('" + operand + "', '" + time + "'), function() {\n" + c + "});\n";
    };


    Blockly.Blocks.iobroker_scheduler = {
        init: function() {
            this.appendDummyInput()
                .appendField("Scheduler, on time")
                .appendField("Day of Week").appendField(new Blockly.FieldTextInput("*"), 'DAYOFWEEK')
                .appendField("Month").appendField(new Blockly.FieldTextInput("*"), 'MONTH')
                .appendField("Day of Month").appendField(new Blockly.FieldTextInput("*"), 'DAYOFMONTH')
                .appendField("Hour").appendField(new Blockly.FieldTextInput("*"), 'HOUR')
                .appendField("Minute").appendField(new Blockly.FieldTextInput("*"), 'MINUTE')
            this.appendStatementInput("NAME").appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip('');
        }
    };

    Blockly.JavaScript.iobroker_scheduler = function(a) {
        var dow = a.getFieldValue('DAYOFWEEK');
        var month = a.getFieldValue('MONTH');
        var dom = a.getFieldValue('DAYOFMONTH');
        var hour = a.getFieldValue('HOUR');
        var min = a.getFieldValue('MINUTE');
        var c = Blockly.JavaScript.statementToCode(a, "NAME"), c = Blockly.JavaScript.addLoopTrap(c, a.id);
        return "scheduler('" + min + " " + hour + " " + dom + " " + month + " " + dow + "', function() {\n" + c + "});\n";

    };

    Blockly.Blocks.iobroker_onState = {
        init: function() {
            this.appendValueInput("VALUE").appendField("on change of");
            this.container = this.appendStatementInput("REPEATER").appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);

            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(120);
            this.setTooltip('');
        }
    };
    Blockly.JavaScript.iobroker_onState = function(a) {
        var val = Blockly.JavaScript.valueToCode(a, "VALUE");
        var c = Blockly.JavaScript.statementToCode(a, "REPEATER"), c = Blockly.JavaScript.addLoopTrap(c, a.id);

        var splitter = val.split(" ");
        var id = splitter[0];
        var logic = splitter[1] || undefined;
        var value = splitter[2] || undefined;
        var check;
        if (logic !== undefined && value !== undefined) {
            // TODO: Remove this hardcoded Value
            if (id.indexOf(".") < 0) {
                id = "rules-engine.0." + id;
            }
            logic = Blockly.Blocks.iobroker_onState.OPERATORS[logic];
            // check = "id: '" + id + "', val: '" + value + "', change: '" + logic + "'";
            if (value !== "true" && value !== false) value = "'" + value + "'";
            check = "id: '" + id + "', " + logic + ": " + value;
        } else {
            // TODO: Remove this hardcoded Value
            if (val.indexOf(".") < 0) {
                val = "rules-engine.0." + val;
            }
            check = "id: '" + val + "', change: 'any'";
        }
        return "on({" + check + "}, function (data) {\n" + c + "});\n";
    };

    Blockly.Blocks.iobroker_onState.OPERATORS = {
        'any': 'any',
        '==': 'val',
        '!=': 'valNe',
        '<': 'valLt',
        '<=': 'valLe',
        '>': 'valGt',
        '>=': 'valGt'
    };
}

function initButtons() {
    self.scriptName = function (id) {
        saveName = id;
        return (saveName);
    };
    self.scriptSaved = function (id) {
        sSaved = id;
    };

    //view javascript source code
    self.viewjavascript = function () {
        //check code first
        if (!self.checkBlocks(false))
            return;

        //fill dialog content
        var content = document.getElementById('luaContent');
        //var code = self.getJavaScript();
        //content.textContent = code;
        var code = "";
        try {
            code = Blockly.JavaScript.workspaceToCode(self.workspace);
        } catch (e) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = e;
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
            console.log(e);
            return;
        }
        content.textContent = code;
        if (typeof prettyPrintOne == 'function') {
            code = content.innerHTML;
            code = prettyPrintOne(code, 'js');
            content.innerHTML = code;
        }

        //open dialog
        showDialog('scriptDialog');
    };
    //check blocks
    self.checkBlocks = function (notifySuccess) {
        var warningText;
        if (self.workspace.getAllBlocks().length === 0) {
            //nothing to save
            // notif.info('#nb');
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = "Nothing todo";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
            return;
        }
        var badBlock = self.getUnconnectedBlock();
        if (badBlock) {
            warningText = 'This block is not properly connected to other blocks.';
        }
        else {
            badBlock = self.getBlockWithWarning();
            if (badBlock) {
                warningText = 'Please fix the warning on this block.';
            }
        }

        if (badBlock) {
            // notif.error(warningText);
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = warningText;
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);

            self.blinkBlock(badBlock);
            return false;
        }

        if (notifySuccess) {
            // notif.success('All blocks seems to be valid');
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = "All blocks seems to be valid";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
        }

        return true;
    };
    //get unconnected block
    self.getUnconnectedBlock = function () {
        var blocks = self.workspace.getAllBlocks();
        for (var i = 0, block; block = blocks[i]; i++) {
            var connections = block.getConnections_(true);
            for (var j = 0, conn; conn = connections[j]; j++) {
                if (!conn.sourceBlock_ || (conn.type == Blockly.INPUT_VALUE || conn.type == Blockly.OUTPUT_VALUE) && !conn.targetConnection) {
                    return block;
                }
            }
        }
        return null;
    };
    //get block with warning
    self.getBlockWithWarning = function () {
        var blocks = self.workspace.getAllBlocks();
        for (var i = 0, block; block = blocks[i]; i++) {
            if (block.warning) {
                return block;
            }
        }
        return null;
    };
    //return javascript code of blocks
    self.getJavaScript = function () {
        return Blockly.JavaScript.workspaceToCode(self.workspace);
    };

    //set workspace
    self.setWorkspace = function (workspace) {
        self.workspace = workspace;
        //add listener
        self.workspace.addChangeListener(self.onWorkspaceChanged);
    };
    //clear button
    self.clearWorkspace = function () {
        var exec = false;
        if (self.workspace.getAllBlocks().length > 3) {
            if (window.confirm("Start new script?")) {
                exec = true;
            }
        } else {
            exec = true;
        }

        if (exec) {
            self.workspace.clear();
            // self.scriptName('untitled');
            saveName = "untitled";

            self.scriptSaved(true);
            self.addDefaultBlocks();
        }
    };
    //Add default blocks
    self.addDefaultBlocks = function () {
        var xml = Blockly.Xml.textToDom(self.defaultWorkspace);
        Blockly.Xml.domToWorkspace(self.workspace, xml);
    };
    //save button
    self.save = function () {
        //check code
        if (!self.checkBlocks(false)) {
            //TODO allow script saving event if there are errors
            return;
        }

        //request script filename if necessary
        // if( self.scriptName()==='untitled' )
        if (saveName === "untitled") {
            // $("#saveasDialog").modal('show');
            showDialog("saveasDialog");
        }
        else {
            //script name already specified, save script
            self.saveScript();
        }
    };
    self.saveScript = function () {
        // var scriptName = self.scriptName();
        var scriptName = saveName;
        //replace all whitespaces
        scriptName = scriptName.replace(/\s/g, "_");

        //replace all dot's
        scriptName = scriptName.replace(/\./g, "_");

        //append blockly_ prefix if necessary
        if (scriptName.indexOf('blockly_') !== 0) {
            scriptName = 'blockly_' + scriptName;
        }

        var state = window.BlocklyRulesControl.getScriptState(saveName);
        alert("state = " + state);
        if (state === "") {
            state = false;
        }
        var content = {
            name: scriptName,
            script: self.mergeXmlAndJavaScript(self.getXml(), self.getJavaScript()),
            enabled: state
        };

        var objectName = "rules.0." + scriptName;
        var ruleObj = {
            common: {
                name: objectName,
                read: true,
                write: true,
                type: 'state',
                role: 'meta.config',
                update: true
            },
            native: content,
            type: 'state'
        };

        servConn._socket.emit('setObject', objectName, ruleObj);
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = "Save was successful";
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 3000);
    };
    //save dialog ok button
    self.saveOk = function () {
        // self.scriptName( $.trim(self.scriptName()) );
        saveName = $('#scriptName').val();

        saveName = $.trim(saveName);
        // if( self.scriptName().length===0 || self.scriptName()==='untitled' )
        if (saveName.length === 0 || saveName === 'untitled') {
            //invalid script name
            // notif.warning('#sn');
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = "Invalid Script Name";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);

            // self.scriptName('untitled');
            saveName = 'untitled';
        }
        else {
            //save script
            self.saveScript();
        }
        //$("#saveasDialog").modal('hide');
        $("#saveasDialog").hide();
    };

    //save dialog cancel button
    self.saveCancel = function () {
        // notif.info('#ns');
        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = "Script not saved";
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 3000);

        // $("#saveasDialog").modal('hide');
        $("#saveasDialog").hide();
    };
    //return xml code of blocks
    self.getXml = function () {
        var dom = Blockly.Xml.workspaceToDom(self.workspace);
        return Blockly.Xml.domToText(dom);
    };
    //merge specified xml and lua code
    self.mergeXmlAndJavaScript = function (xml, js) {
        //var out = '-- /!\\ Javascript code generated by iobroker.rules. Do not edit manually.\n';
        //out += '--[[\n' + xml + '\n]]\n';
        //out += js;
        // return out;
        return xml;
    };
    //saveas button
    self.saveas = function () {
        //check code
        if (!self.checkBlocks(false)) {
            //TODO allow script saving event if there are errors
            return;
        }

        //request script filename if necessary
        // $("#saveasDialog").modal('show');
        showDialog("saveasDialog");
    };
    //load script
    self.load = function () {
        self.loadScripts(function () {
            //open script dialog
            // $("#loadDialog").modal('show');
            showDialog("loadDialog");
        });
    };
    //load scripts
    self.loadScripts = function (callback) {
        //get scripts
        var scripts = window.BlocklyRulesControl.getAllScripts();
        console.log(scripts);
        var availableScripts = ([]);
        for (var i = 0; i < scripts.length; i++) {
            //only keep created scripts
            if (scripts[i].name.indexOf('blockly_') === 0) {
                availableScripts.push({
                    'name': scripts[i].name.replace('blockly_', ''),
                    'enabled': scripts[i].enabled
                });
            }
        }
        var newContent = "";
        for (var s = 0; s < availableScripts.length; s++) {
            newContent += '<tr>';
            newContent += '<td data-oldname=' + availableScripts[s].name + '" class="rename_script">' + availableScripts[s].name + '</td>';
            newContent += '<td data-translateable="true" id="state_' + availableScripts[s].name + '">' + availableScripts[s].enabled + '</td>';
            newContent += '<td>';
            newContent += '<div class="btn-group">';
            newContent += '<button xml:lang="de" type="button" data-translateable="true" onClick="uiLoadScript(\'' + availableScripts[s].name + '\')" class="btn btn-primary btn-xs" title="Laden" alt="Laden">';
            newContent += '<span class="en-doc-text"></span>';
            newContent += '</button>';
            newContent += '<button xml:lang="de" type="button" data-translateable="true" onClick="uiDeleteScript(\'' + availableScripts[s].name + '\')" class="btn btn-primary btn-xs" title="Löschen" alt="Löschen">';
            newContent += '<span class="en-cancel"></span>';
            newContent += '</button>';
            newContent += '<button xml:lang="de" type="button" data-translateable="true" onClick="uiExportScript(\'' + availableScripts[s].name + '\')" class="btn btn-primary btn-xs" title="Exportieren" alt="Exportieren">';
            newContent += '<span class="en-up"></span>';
            newContent += '</button>';
            newContent += '<button xml:lang="de" type="button" data-translateable="true" onClick="uiEnableScript(\'' + availableScripts[s].name + '\')" class="btn btn-primary btn-xs" title="Enable/disable script" alt="Enable/disable script">';
            var spanClass = availableScripts[s].enabled ? 'en-lock-open' : 'en-lock';
            newContent += '<span id="spanClass_' + availableScripts[s].name + '" class="' + spanClass + '"></span>';
            newContent += '</button>';
            newContent += '</div>';
            newContent += '</td>';
            newContent += '</tr>';
        }
        $("#scriptTable").empty().append(newContent);

        //callback
        if (callback !== undefined)
            callback();
    };

    self.uiLoadScript = function (scriptName) {
        self.workspace.clear();
        saveName = scriptName;

        var allScripts = window.BlocklyRulesControl.getAllScripts();
        var scriptValue = window.BlocklyRulesControl.getScript(scriptName);

        try {
            var xml = Blockly.Xml.textToDom(scriptValue);
            Blockly.Xml.domToWorkspace(self.workspace, xml);
        } catch (e) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = e;
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
            console.log(e);
            return;
        }
        $("#loadDialog").hide();
    };

    self.uiExportScript = function(scriptName) {
        var xmlContent = window.BlocklyRulesControl.getScript(scriptName);
        download(xmlContent, scriptName + ".xml", "utf-8");

        // var export_workspace = Blockly.inject('exportDiv', {toolbox: document.getElementById('toolbox')});
        // Blockly.Xml.domToWorkspace(export_workspace, xml);
        // var script = Blockly.JavaScript.workspaceToCode(export_workspace);
        // download(script, scriptName + ".js.txt", "text/plain");
    }
    self.uiEnableScript = function(scriptName) {
        var state = window.BlocklyRulesControl.getScriptState(scriptName);
        var objectName = "rules.0.blockly_" + scriptName;

        servConn._socket.emit("setState", objectName, {val: !state, ack: true});

        // Change Button Enable/Disable
        var item = document.getElementById("spanClass_" + scriptName);
        item.className = !state ? 'en-lock-open' : 'en-lock';
        item.setAttribute('class', !state ? 'en-lock-open' : 'en-lock');

        // Update Mask
        var scripts = window.BlocklyRulesControl.scripts;
        for (var i = 0; i < scripts.length; i++) {
            if (("blockly_" + scriptName) === scripts[i].name) {
                window.BlocklyRulesControl.scripts[i].enabled = !state;
            }
        }

        var state_script = document.getElementById("state_" + scriptName);
        state_script.innerHTML = !state;

        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = "Update was successful, Script " + scriptName + " is " + (state ? " disabled" : " enabled");
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 3000);

        // TODO: Reload Data from ioBroker
        reloadData();
    }

    self.uiDeleteScript = function(scriptName) {
        var objectName = "rules.0.blockly_" + scriptName;
        // TODO: Not Working
        servConn._socket.emit("delObject", objectName, function(err) {
            alert(objectName);

            if (err) {
                console.log(err);
            }

            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = "Removed Script " + scriptName;
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);

            // TODO: Reload Data from ioBroker
            reloadData();
        });
    }
    //check button
    self.check = function () {
        self.checkBlocks(true);
    };
    //blink specified block
    self.blinkBlock = function (block) {
        for (var i = 300; i < 3000; i = i + 300) {
            setTimeout(function () {
                block.select();
            }, i);
            setTimeout(function () {
                block.unselect();
            }, i + 150);
        }
    };

    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate.toLocaleDateString(), '</li>');

            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var scriptValue = e.target.result;
                    var scriptName = theFile.name;
                    scriptName = scriptName.split(".")[0];

                    self.workspace.clear();
                    saveName = scriptName;

                    try {
                        // TODO: Load Javascript Files too
                        //self.workspace.getTopBlocks().forEach(function (el) {
                        //    el.dispose();
                        //});
                        //var javascript_code = scriptValue;
                        //var xmlDom = Blocklify.JavaScript.importer.codeToDom(javascript_code, 'atomic');
                        var xmlDom = Blockly.Xml.textToDom(scriptValue);
                        Blockly.Xml.domToWorkspace(xmlDom, self.workspace);
                        self.saveScript();

                        var x = document.getElementById("snackbar");
                        x.className = "show";
                        x.innerHTML = "Script saved as '" + scriptName + "', state disabled";
                        setTimeout(function () {
                            x.className = x.className.replace("show", "");
                        }, 3000);

                    } catch (e) {
                        var x = document.getElementById("snackbar");
                        x.className = "show";
                        x.innerHTML = e;
                        setTimeout(function () {
                            x.className = x.className.replace("show", "");
                        }, 3000);
                        return;
                    }
                    $("#importDialog").hide();
                    reloadData();

                };
            })(f);

            reader.readAsBinaryString(f);
        }
    }
    document.getElementById('files').addEventListener('change', handleFileSelect, false);

    self.importScript = function () {

        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = "Great success! All the File APIs are supported.";
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
        } else {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = 'The File APIs are not fully supported in this browser.';
            setTimeout(function () {
                x.className = x.className.replace("show", "");
            }, 3000);
        }
        showDialog("importDialog");
    };

}

function reloadData() {
    getData(function () {
        states.getKeys = function (pattern, callback, dontModify) {
            // special case because of simulation of redis
            if (pattern.substring(0, 3) == 'io.') pattern = pattern.substring(3);

            var r = new RegExp(pattern2RegEx(pattern));
            var result = [];
            for (var id in states) {
                if (r.test(id)) result.push(id);
            }
            if (typeof callback === 'function') callback(null, result);
        };

        states.getStates = function (keys, callback, dontModify) {
            if (!keys) {
                if (callback) callback('no keys', null);
                return;
            }
            if (!keys.length) {
                if (callback) callback(null, []);
                return;
            }
            var result = [];
            for (var i = 0; i < keys.length; i++) {
                result.push(states[keys[i]]);
            }
            if (typeof callback === 'function') callback(null, result);
        };

        temperature = [];
        states.getKeys('*.TEMPERATURE', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    temperature.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     temperature = obj;
                // });
            }
        });
        states.getKeys('*.ACTUAL_TEMPERATURE', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    temperature.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     temperature = obj;
                // });
            }
        });

        humidity = [];
        states.getKeys('*.HUMIDITY', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    humidity.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     humidity = obj;
                // });
            }
        });

        setpoint = [];
        states.getKeys('*.SETPOINT', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    setpoint.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     humidity = obj;
                // });
            }
        });

        states.getKeys('*.SET_TEMPERATURE', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    setpoint.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     humidity = obj;
                // });
            }
        });

        switches = [];
        states.getKeys('*.STATE', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    switches.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     switches = obj;
                // });
            }
        });

        weather = [];
        states.getKeys('weatherunderground.0.current.*', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = obj.common.name;
                    var tObject = {name: name, id: keys[k]};
                    weather.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     switches = obj;
                // });
            }
        });

        instances = [];
        states.getKeys('system.adapter.*.connected', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = (obj.common.name).replace("system.adapter.", "").replace(".connected", "");
                    var tObject = {name: name, id: keys[k]};
                    instances.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     switches = obj;
                // });
            }
        });

        scripts = [];
        states.getKeys('rules.0.*', function (err, keys) {
            if (keys && keys.length) {
                // Check if key has a name
                for (var k = 0; k < keys.length; k++) {
                    var obj = objects[keys[k]];
                    var name = (obj.common.name).replace("rules.0.", "");
                    var state = states[obj._id].val == undefined ? false : states[obj._id].val;
                    // var tObject = {name: name, id: keys[k], script: obj.native.script, enabled: obj.native.enabled};
                    var tObject = {name: name, id: keys[k], script: obj.native.script, enabled: state};
                    scripts.push(tObject);
                }
                // states.getStates(keys, function (err, obj) {
                //     switches = obj;
                // });
            }
        });

        window.BlocklyRulesControl.init();
        createBlocks();

        var x = document.getElementById("snackbar");
        x.className = "show";
        x.innerHTML = "...Initialization done";
        setTimeout(function () {
            x.className = x.className.replace("show", "");
        }, 3000);

    });
}

function showDialog(dlg) {
    $('#' + dlg).show();
}

// Dialog Closer Methods
function modalClose(dlg) {
    $(dlg).hide();
}

// Handle ESC key (key code 27)
document.addEventListener('keyup', function(e) {
    if (e.keyCode == 27) {
        modalClose("#importDialog");
        modalClose("#debugDialog");
        modalClose("#detailsModal");
        modalClose("#saveasDialog");
        modalClose("#loadDialog");
        modalClose("#scriptDialog");
    }
});
