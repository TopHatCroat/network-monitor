/**
 * Created by root on 14.06.17..
 */

var shodan = require('shodan-client');
var pcapp = require('pcap-parser');

var currentWindow;
var currentNavOption;



var ipSet = new StringSet();

const searchOpts = {};

function inputFileChangeHandler(path){
    var parser = pcapp.parse(path);
    parser.on('packet', function(packet) {
        // do your packet processing
        var data = parsePcapData(packet.data);
        myConsole.log("parse: "+data);
        if(data != null) {
            ipSet.add(data.sourceIP);
            ipSet.add(data.destinationIP);
        }
    });
}

$(document).ready(function(){
    readHistory();
    $("#div-history").mouseleave(function(event){
        $("#div-history-description").empty();
    });

	//alert("text") - fora
	currentWindow = $("#home-window");
	currentNavOption = $("#home-nav-item");
	$("#navigation>span").click(function (event) {
		myConsole.log("kliknuo na :" + event.target.id);
		changeWindow($(event.target));
	});
    myConsole.log("TEST");
    $("#inputFile").click(function(event){
        event.target.value=null;
    }).change(function(event){
        inputFileChangeHandler(event.target.files[0].path);
        myConsole.log(event.target.files[0].path);
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
                    myConsole.log('Result:');
                    myConsole.log(res);
                })
                .catch(function(err) {
                    myConsole.log('Error:');
                    myConsole.log(err);
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
	newOption.toggleClass("active", true);
	newOption.toggleClass("main-active", true);
	currentNavOption = newOption;
	currentWindow.toggleClass("main-current-window", false);
	currentWindow.toggleClass("main-hidden-window", true);
	
	switch (newOption.attr("id")) {
		case "home-nav-item":
			currentWindow = $("#home-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("Home");
            //writeHistory("/neka_putanja/haha/some_file.pcap", 94426, 845, 16);
			break;
		case "analysis-nav-item":
			currentWindow = $("#analysis-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("Analysis");
			break;
		case "history-nav-item":
			currentWindow = $("#history-window").toggleClass("main-current-window", true).toggleClass("main-hidden-window", false);
			$("#header-h1").text("History");
			genHistory();
			break;
	}
}


function setDescription(id){
    var divDesc = $("#div-history-description");
    divDesc.empty();
    $.each(historyData, function(key, val){
        if(val.id==id){
            divDesc.append("<hr/><span style='width:210px; word-wrap:break-word; display:inline-block;'>File path: "+val.filePath+"</span>");
            divDesc.append("<hr/>File size: "+val.fileSize+"");
            divDesc.append("<hr/>Processing time: "+val.processingTime+"");
            divDesc.append("<hr/>Security problems: "+val.securityProblems+"");
            divDesc.append("<hr/>Date: "+val.date+"<hr>");
            return false;
        }
    });
}

function openHistoryFile(id){
    var filePath;
    $.each(historyData, function(key, val){
        if(val.id==id){
            filePath = val.filePath;
            return false;
        }
    });
    inputFileChangeHandler(filePath);
    changeWindow($("#analysis-nav-item"));
}

function genHistory(){
    divHistory = $("#div-history");
    divHistory.empty();
    let d =JSON.parse(JSON.stringify(historyData));
    d.reverse();

    $.each(historyData, function(key, val){
        divHistory.append("<div id='"+val.id+"' class='history-item'>"+val.date+" | "+val.filePath.split("/").pop(-1)+"</div>");
        var lastDiv = $("#div-history div:last-child");
        lastDiv.mouseenter(function(event){
            setDescription(event.target.id);
        }).click(function(event){
            openHistoryFile(event.target.id);
        });
    });
}
