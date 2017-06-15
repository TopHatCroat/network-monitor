/**
 * Created by antonio on 15/06/17.
 */


function genChartData(title, arr) {
    return {
        labels: Object.keys(arr),
        datasets: [{
            label: title,
            backgroundColor: "#DDEEDD",
            borderColor: "#77778A",
            borderWidth: 1,
            data: Object.values(arr)
        }]
    }
}

function createChart(ctx, title, arr) {
    return new Chart(ctx, {
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
}