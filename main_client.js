/**
 * Created by root on 14.06.17..
 */

var shodan = require('shodan-client');
var pcapp = require('pcap-parser');

var ipSet = new StringSet();
var pcapData = [];
var analyisis = {};


const searchOpts = {};

$(document).ready(function(){
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
                pcapData.push(data)
            }
        });
    });

    $("#analyzePcapBtn").click(function(event) {

        var ipFrequency = [];
        var portFrequency = [];

        analyisis = {}

        $.each(pcapData, function(key, val) {
            upTick(ipFrequency, val.sourceIP)
            upTick(portFrequency, val.sourcePort)
        });

        analyisis["ipFreq"] = ipFrequency;
        analyisis["portFreq"] = portFrequency;

        createChart($("#chartCanvas")[0].getContext('2d'), "IP", analyisis["ipFreq"])

    });

    $("#chechIpBtn").click(function(event){
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