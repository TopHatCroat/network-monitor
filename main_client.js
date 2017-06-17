/**
 * Created by root on 14.06.17..
 */

var shodan = require('shodan-client');
var pcapp = require('pcap-parser');

var currentWindow;
var currentNavOption;
var selectedFile = "";

var ipSet = new StringSet();
var pcapData = [];
var analyisis = {};

const searchOpts = {};

function inputFileChangeHandler(path){
    var parser = pcapp.parse(path);
    pcapData = [];
    ipSet = new StringSet();

    parser.on('packet', function(packet) {
        var data = parsePcapData(packet.data);
        if(data != null) {
            ipSet.add(data.sourceIP);
            ipSet.add(data.destinationIP);
            pcapData.push(data)
        }
    });
}

function loadIpInfo() {
    $.getJSON( "https://api.ipify.org?format=json", function( ipResult ) {

        $.getJSON( "http://ip-api.com/json/" + ipResult.ip, function( infoResult ) {
            $("#infoLocation").text(infoResult.city + ", " + infoResult.country + ", " + infoResult.countryCode);
            $("#infoIsp").text(infoResult.isp);
            $("#mainInfoOutput").css("display", "block");
        });

        $( "<p/>", {
            "class": "ip-view",
            html: ipResult.ip
        }).appendTo( "#checkIpOutput" );
    });
}

//loadData logic
function loadData(fromHistory){
    if(!fromHistory)
        var startTime = (new Date()).getMilliseconds();

    var parser = pcapp.parse(selectedFile.path);
    pcapData = [];
    ipSet = new StringSet();

    parser.on('packet', function(packet) {
        var data = parsePcapData(packet.data);
        if(data != null) {
            ipSet.add(data.sourceIP);
            ipSet.add(data.destinationIP);
            pcapData.push(data)
        }
    });

    parser.on('end', function (end) {
        var out = $("#ipListOutput");
        out.empty();
        ipSet.remove("0.0.0.0");
        ipSet.remove("255.255.255.255");
        out.append(makeIpTable(ipSet));

        var ipFrequency = [];
        var portFrequency = [];
        var ipDstFrequency = [];
        var portDstFrequency = [];

        analyisis = {};

        $.each(pcapData, function(key, val) {
            upTick(ipFrequency, val.sourceIP);
            upTick(ipDstFrequency, val.destinationIP);
            upTick(portFrequency, val.sourcePort);
            upTick(portDstFrequency, val.destinationPort);
        });

        analyisis["ipFreq"] = sortTuple(ipFrequency);
        analyisis["ipDstFreq"] = sortTuple(ipDstFrequency);
        analyisis["portFreq"] = sortTuple(portFrequency)
        analyisis["portDstFreq"] = sortTuple(portDstFrequency);
        if(!fromHistory)
            writeHistory(
                selectedFile.path,
                selectedFile.size,
                (new Date()).getMilliseconds() - startTime,
                pcapData.length
            );
    });

}

function viewFromHistory(path){
    selectedFile = {path:path, size:0};
    loadData(true);
}

$(document).ready(function(){

    readHistory();

    loadIpInfo();

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

    $("#inputFile").click(function(event){
        event.target.value=null;
    }).change(function(event){
        selectedFile = event.target.files[0];
        myConsole.log(event.target.files[0].path);
    });

    $("#sourceIpGraphBtn").click(function(event) {
        generateChartOutput("srcIp");
    });
    $("#destinationIpGraphBtn").click(function(event) {
        generateChartOutput("destIp");
    });
    $("#sourcePortGraphBtn").click(function(event) {
        generateChartOutput("srcPort");
    });
    $("#destinationPortGraphBtn").click(function(event) {
        generateChartOutput("destPort");
    });

    $("#loadIpListBtn").click(function(event){
        loadData(false);
    });
});

function generateChartOutput(type) {
    $("#chartCanvas").empty();
    switch(type) {
        case "destIp": {
            createChart($("#chartCanvas")[0].getContext('2d'), "IP", analyisis["ipDstFreq"])
            break;
        }
        case "srcIp": {
            createChart($("#chartCanvas")[0].getContext('2d'), "IP", analyisis["ipFreq"])
            break;
        }
        case "destPort": {
            createChart($("#chartCanvas")[0].getContext('2d'), "Port", analyisis["portDstFreq"])
            break;
        }
        case "srcPort": {
            createChart($("#chartCanvas")[0].getContext('2d'), "Port", analyisis["portFreq"])
            break;
        }
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
    viewFromHistory(filePath);
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

function hideStatusInfo() {
    $("#ipInfoStatusOutout").text("");
    $("#ipInfoStatusOutout").css("display", "gone");
}

function showStatusInfo(text) {
    $("#ipInfoStatusOutout").text(text);
    $("#ipInfoStatusOutout").css("display", "block");
}
