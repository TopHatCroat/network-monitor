/**
 * Created by antonio on 14/06/17.
 */

function StringSet() {
    var setObj = {}, val = {};

    this.add = function(str) {
        setObj[str] = val;
    };

    this.contains = function(str) {
        return setObj[str] === val;
    };

    this.remove = function(str) {
        delete setObj[str];
    };

    this.values = function() {
        var values = [];
        for (var i in setObj) {
            if (setObj[i] === val) {
                values.push(i);
            }
        }
        return values;
    };
}

function makeHtmlList(array) {
    var list = document.createElement('ul');

    for(var i = 0; i < array.length; i++) {
        var item = document.createElement('li');
        item.appendChild(document.createTextNode(array[i]));
        list.appendChild(item);
    }

    return list;
}

function upTick(array, key) {
    if(!isNaN(key)) {
        key = key.toString();
    }

    var count = array[key];
    if(count != undefined) {
        array[key] = count + 1;
    } else {
        array[key] = 1;
    }
}

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
        // data: data
    }
}

String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


function makePcapTable(pcapData) {
    var result = "";
    var counter = 1;

    $.each(pcapData, function(key, data) {
        result += "<tr onclick=\"onTableRowClicked(" + counter + ")\">"
        result += "<td>" + counter++ + "</td>";
        result += "<td>" + data.sourceIP + "</td>";
        result += "<td>" + data.sourcePort + "</td>";
        result += "<td>" + data.destinationIP + "</td>";
        result += "<td>" + data.destinationPort + "</td>";
        result += "</tr>"
    });

    return result;
}

function makeIpTable(data) {
    var result = "";
    var counter = 1;

    $.each(data.values(), function(key, ip) {
        result += "<tr onclick=\"onTableRowClicked(" + counter + ")\">"
        result += "<td>" + counter++ + "</td>";
        result += "<td>" + ip + "</td>";
        result += "</tr>"
    });

    return result;
}


function onTableRowClicked(row) {
    showStatusInfo("Loading...")
    shodan.host(pcapData[row - 1].sourceIP, 'kpIpMqmM9dG3FdBj2QC2ks3cSK1KlRiW', searchOpts)
        .then(function(res) {


            var result = "";

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">Organization</td>";
            result += "<td class=\"data-title\">" + res.org + "</td>";
            result += "</tr>";
            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">IP</td>";
            result += "<td class=\"data-title\">" + res.ip_str + "</td>";
            result += "</tr>";

            if(res.os != null) {
                result += "<tr class=\"data-row\">";
                result += "<td class=\"data-title\">OS</td>";
                result += "<td class=\"data-title\">" + res.os + "</td>";
                result += "</tr>";
            }

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">Location</td>";
            result += "<td class=\"data-title\">" /*+ res.city + ", "*/ + res.country_name + ", " + res.country_code + "</td>";
            result += "</tr>";

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">IPS</td>";
            result += "<td class=\"data-title\">" + res.isp + "</td>";
            result += "</tr>";

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">Hostnames</td>";
            result += "<td class=\"data-title\">";
            $.each(res.hostnames, function(k2, host) {
                result += host + "</br>";
            });
            result += "</td>";
            result += "</tr>";

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">Ports</td>";
            result += "<td class=\"data-title\">";
            $.each(res.ports, function(k2, port) {
                result += port + "</br>";
            });
            result += "</td>";
            result += "</tr>";

            result += "<tr class=\"data-row\">";
            result += "<td class=\"data-title\">Vulnerabilities</td>";
            result += "<td class=\"data-desc\">";
            $.each(res.vulns, function(k2, vuln) {
                result += vuln.slice(1, vuln.length) + "<a target='_blank' href='https://www.cve.mitre.org/cgi-bin/cvename.cgi?name=" + vuln.slice(1, vuln.length) + "'><span class=\"icon icon-link\"></span></a>" + "</br>";
            });
            result += "</td>";
            result += "</tr>";

            hideStatusInfo();

            var out = $("#shodanCallOutput");
            out.empty();
            out.append(result);


            console.log('Result:');
            console.log(res);
            myConsole.log('Result:');
            myConsole.log(res);
        })
        .catch(function(err) {
            var out = $("#shodanCallOutput");
            out.empty();
            showStatusInfo("No data for IP")
        });
}

function sortTuple(arr) {
    var tuples = [];

    for (var key in arr) tuples.push([key, arr[key]]);

    tuples.sort(function(a, b) {
        a = a[1];
        b = b[1];

        return a < b ? 1 : (a > b ? -1 : 0);
    });
    //
    // for (var i = 0; i < tuples.length; i++) {
    //     var key = tuples[i][0];
    //     var value = tuples[i][1];
    // }

    return tuples;
}

