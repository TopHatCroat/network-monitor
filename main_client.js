/**
 * Created by root on 14.06.17..
 */

var shodan = require('shodan-client');
var pcapp = require('pcap-parser');

var currentWindow;
var currentNavOption;



var ipSet = new StringSet();

const searchOpts = {};

$(document).ready(function(){
	//alert("text") - fora
	currentWindow = $("#home-window");
	currentNavOption = $("#home-nav-item");
	$("#navigation>span").click(function (event) {
		myConsole.log("kliknuo na :" + event.target.id);
		changeWindow(event.target);
	});
    myConsole.log("TEST");
    $("#inputFile").click(function(event){
        event.target.value=null;
    }).change(function(event){
        console.log(event.target.files[0].path);
        var parser = pcapp.parse(event.target.files[0].path);
        parser.on('packet', function(packet) {
            // do your packet processing
            var data = parsePcapData(packet.data);
            if(data != null) {
                ipSet.add(data.sourceIP);
                ipSet.add(data.destinationIP);
            }
        });
    });

    $("#loadIpListBtn").click(function(event){
        var out = $("#loadIpListBtn");
        out.empty();
        ipSet.remove("0.0.0.0");
        ipSet.remove("255.255.255.255");
        out.append(makeHtmlList(ipSet.values()))
    });

    $("#shodanBtn").click(function(event){
        ipSet.values().forEach(function(item) {
            shodan.host(item, 'kpIpMqmM9dG3FdBj2QC2ks3cSK1KlRiW', searchOpts)
                .then(function(res) {
                    console.log('Result:');
                    console.log(res);
                })
                .catch(function(err) {
                    console.log('Error:');
                    console.log(err);
                });
        });

    });
	
});

function parsePcapData(buffer) {
    if (buffer.length <= 0x35) {
        return null;
    }

    // Is it TCP Version 4?
    if (buffer.readUInt8(14) != 0x45) {
        return null;
    }

    // Read Source IP
    var sourceIP = buffer.readUInt8(0x1A).toString() + '.' +
        buffer.readUInt8(0x1B).toString() + '.' +
        buffer.readUInt8(0x1C).toString() + '.' +
        buffer.readUInt8(0x1D).toString();

    var destinationIP = buffer.readUInt8(0x1E).toString() + '.' +
        buffer.readUInt8(0x1F).toString() + '.' +
        buffer.readUInt8(0x20).toString() + '.' +
        buffer.readUInt8(0x21).toString();

    var sourcePort = buffer.readUInt16BE(0x22);
    var destinationPort = buffer.readUInt16BE(0x24);

    var data = buffer.slice(0x36);

    return {
        sourceIP: sourceIP,
        destinationIP: destinationIP,
        sourcePort: sourcePort,
        destinationPort: destinationPort,
        data: data
    }
}

function changeWindow(newOption) {
	currentNavOption.toggleClass("active", false);
	currentNavOption.toggleClass("main-active", false);
	$(newOption).toggleClass("active", true);
	$(newOption).toggleClass("main-active", true);
	currentNavOption = $(newOption);
	currentWindow.toggleClass("main-current-window", false);
	currentWindow.toggleClass("main-hidden-window", true);
	
	
	
	switch (newOption.id) {
		case "home-nav-item":
			currentWindow = $("#home-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("Home");
			break;
		case "analysis-nav-item":
			currentWindow = $("#analysis-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("Analysis");
			break;
		case "history-nav-item":
			currentWindow = $("#history-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("History");
			break;
	}
}
