/**
 * Created by antonio on 15/06/17.
 */

var chart;

function genChartData(title, arr) {
    var keys = [];
    var data = [];

    for(var i = 0; i < arr.length; i++) {
        keys.push(arr[i][0]);
        data.push(arr[i][1]);
    }

    return {
        labels: keys,
        datasets: [{
            label: title,
            backgroundColor: "#DDEEDD",
            borderColor: "#77778A",
            borderWidth: 1,
            data: data
        }]
    }
}

function createChart(ctx, title, arr) {
    if(chart != undefined) {
        chart.destroy()
    }

    this.chart = new Chart(ctx, {
        type: 'bar',
        data: genChartData(title, arr),
        options: {
            responsive: true,
            legend: {
                position: 'top',
            }
            // ,
            // title: {
            //     display: true,
            //     text: 'Chart.js Bar Chart'
            // }
        }
    });

    return chart;
}