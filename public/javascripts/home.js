$(document).ready(function() {
    $('.modal-trigger').leanModal();
    getVMList();
});


function getVMList() {
    $("#vmList tbody").empty();
    $.get("vm/list", function(res) {
        if (!res.type) {
            return;
        } else {

            res.data.forEach(function(thisdata) {

                var tr = "<tr id=\"" + thisdata.name + "\" onclick=\"openVmDetails(\'" + thisdata.name + "\') \">";
                tr += "<td>" + thisdata.name + "</td>";
                tr += "<td>" + thisdata.type + "</td>";
                tr += "<td>" + thisdata.ipaddress + "</td>";
                tr += "<td>" + thisdata.status + "</td>";
                tr += "</tr>";
                $("#vmList tbody").append(tr);

                // var tab = document.getElementById("vmList");
                // var row = tab.insertRow();

                // var cell1 = row.insertCell(0);
                // var cell2 = row.insertCell(1);
                // var cell3 = row.insertCell(2);
                // cell1.innerHTML = thisdata.name;
                // cell2.innerHTML = thisdata.type;
                // cell3.innerHTML = thisdata.status;
            });
            sessionStorage.removeItem("instances");
            sessionStorage.setItem("instances", JSON.stringify(res.data));
        }
    });
}

function signOut() {

    console.log("signout");

    $.post("/signout").done(function(res) {
        if (!res.type) {
            console.log("Please try again.");
        } else {
            window.location.href = "/";
        }
    });
}

function openVmDetails(vmName) {
    console.log("openVmDetails(" + vmName + ")");
    // var instances = JSON.parse(sessionStorage.getItem("instances"));
    console.log('/vm/' + vmName + '/statistics');
    $.ajax({
        url: '/vm/' + vmName + '/statistics',
        type: 'GET',
        async: true,
        crossDomain: true, // enable this
        dataType: "json",
        cache: false,
        success: function(res) {
            console.log(res.data);
            visitorData(res.data);
        }
    });
    // instances.forEach(function(thisinstance) {
    //     if (thisinstance.name == vmName) {
    //         console.log(thisinstance);
    //         $('#vmDetailsHeading').text(thisinstance.name);
    //         $('#vmDetailsType').text(thisinstance.type);
    //         $('#vmDetailsRam').text(thisinstance.ram);
    //         $('#vmDetailsCPU').text(thisinstance.cpu);
    //         $('#vmDetailsStatus').text(thisinstance.status);
    //     } else {
    //         return;
    //     }
    // });

    getVmStats(vmName);

}

function getVmStats(vmName) {
    console.log("getting vm stats");
    url = "/vm/" + vmName + "/vmStats";
    $.get(url, function(res) {
        console.log(res.data);
        if (!res.type) {
            alert(res.data);
            return;
        } else {
            thisinstance = res.data;
            $('#vmDetailsHeading').text(thisinstance.name);
            $('#vmDetailsType').text(thisinstance.type);
            $('#vmDetailsRam').text(thisinstance.ram);
            $('#vmDetailsCPU').text(thisinstance.cpu);
            $('#vmDetailsStatus').text(thisinstance.status);
            $('#vmDetailsIpAddress').text(thisinstance.ipaddress);
            $('#alarm-CpuUtilizationValue').val(res.data.alarmCpu.value);
            $('#alarm-CpuUtilizationStatus').prop("checked", res.data.alarmCpu.flag);
            $('#alarm-MemoryUtilizationValue').val(res.data.alarmMemory.value);
            $('#alarm-MemoryUtilizationStatus').prop("checked", res.data.alarmMemory.flag);
            $('#alarm-DiskUtilizationValue').val(res.data.alarmDisk.value);
            $('#alarm-DiskUtilizationStatus').prop("checked", res.data.alarmDisk.flag);
            getGraphs(thisinstance.ipaddress);
        }
    });
}

function getGraphs(ip) {
    console.log("Geeting graphs for vm: " + ip);
    ip = "100.100.100.100"; //static ip need to remove
    console.log("getting vm graphs");
    url = "/vm";
    $.post(url, {
        ip: ip
    }, function(res) {
        if (!res.type) {
            alert(res.data);
            return;
        } else {
            graphData = res.data;
            generateCpuGraph(graphData.time, graphData.cpu);
            generateMemoryGraph(graphData.time, graphData.mem);
            generateNetworkGraph(graphData.time, graphData.net);
            generateDiskGraph(graphData.time, graphData.disk);
        }
    });

    $('#vmDetails').openModal();
}


function generateCpuGraph(time, cpu) {
    console.log("cpu: " + cpu);

    $('#graph-cpu').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy'
        },

        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'CPU',
            x: -20
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'CPU (MHz)',
            data: cpu
        }]
    });
}

function generateMemoryGraph(time, mem) {
    console.log("mem: " + mem);

    $('#graph-memory').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy'
        },
        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'Memory',
            x: -20
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'Memory(MB)',
            data: mem
        }]
    });
}

function generateDiskGraph(time, disk) {
    console.log("disk: " + disk);

    $('#graph-disk').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy'
        },
        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'CPU & Memory',
            x: -20
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'CPU (MHz)',
            data: disk
        }]
    });
}

function generateNetworkGraph(time, net) {
    console.log("net: " + net);

    $('#graph-network').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy'
        },
        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'Network',
            x: -20
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'Network',
            data: net
        }]
    });
}

function generateIOGraph(time, io) {
    console.log("io: " + io);

    $('#graph-io').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy'
        },
        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'IO',
            x: -20
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'IO',
            data: io
        }]
    });
}

function openModal(templateName) {
    console.log(templateName);
    templatenameglobal = templateName;
    $('#deployVM').openModal();
}

function createVM() {
    console.log(templatenameglobal);
    var vmName = $('#vmName').val();
    console.log(vmName);

    if (vmName != "") {
        var url = "/vm/" + templatenameglobal + "/create";

        $.ajax({
            type: "POST",
            url: url,
            data: {
                vmName: vmName
            },
            dataType: "json",
            timeout: 900000, // in milliseconds
            success: function(res) {
                if (!res.type) {
                    alert(res.data);
                    return;
                } else {
                    console.log("VM added successfully.");
                    alert("VM: " + vmName + " successfully created.");
                    getVMList();
                }

            },
            error: function(request, status, err) {
                if (status == "timeout") {
                    //gotoDir(pmcat_id, pcat_id);
                    console.log("Timeout");
                }
            }
        });

        console.log("Adding a VM. It may take a while.");
    }
}

function startStopVM() {
    var url;
    vmName = $('#vmDetailsHeading').html();
    vmStatus = $('#vmDetailsStatus').html();
    console.log(vmName);
    console.log(vmStatus);
    if (vmStatus == 'poweredOn') {
        console.log("Stopping - " + vmName);
        url = "/vm/" + vmName + "/stop";
        $.get(url, function(res) {
            if (!res.type) {
                return;
            } else {
                console.log("VM Stopping. Wait for a while......");
                getVMList();
            }
        });
    } else {
        console.log("Starting - " + vmName);
        url = "/vm/" + vmName + "/start";
        $.get(url, function(res) {
            if (!res.type) {
                return;
            } else {
                console.log("VM Starting. Wait for a while......");
                getVMList();
            }
        });
    }
}

$('#updateAlarm').click(function() {
    console.log("Updating Alarm");
    vmName = $('#vmDetailsHeading').html();

    alarmCpuValue = $('#alarm-CpuUtilizationValue').val();
    alarmCpuFlag = $('#alarm-CpuUtilizationStatus').prop("checked");
    alarmMemoryValue = $('#alarm-MemoryUtilizationValue').val();
    alarmMemoryFlag = $('#alarm-MemoryUtilizationStatus').prop("checked");
    alarmDiskValue = $('#alarm-DiskUtilizationValue').val();
    alarmDiskFlag = $('#alarm-DiskUtilizationStatus').prop("checked");
    req = {
        alarmCpuValue: alarmCpuValue,
        alarmCpuFlag: alarmCpuFlag,
        alarmMemoryValue: alarmMemoryValue,
        alarmMemoryFlag: alarmMemoryFlag,
        alarmDiskValue: alarmDiskValue,
        alarmDiskFlag: alarmDiskFlag
    };

    url = "/vm/" + vmName + "/alarm/update";
    $.post(url, req, function(res) {
        console.log(res);
        if (!res.type) {
            //console.log(res);
            alert(res.data);
        } else {
            alert("Alarm Updated");
            $('#vmDetails').closeModal();
        }
    });
});

function visitorData(data) {
    // console.log(data[0]);
    // console.log(data[1]);
    // console.log(data[2]);
    //console.log(data[3]);

    $('#vmStatsChart').highcharts({

        title: {
            text: 'VM Stats'
        },
        subtitle: {
            text: 'CPU & Memory',
            x: -20
        },
        xAxis: {
            categories: data[0]
        },
        yAxis: {

        },
        series: [{
            name: 'CPU (MHz)',
            data: data[1]
        }, {
            name: 'Memory (MB)',
            data: data[2]
        }]
    });
}