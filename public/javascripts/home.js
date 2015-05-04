$(document).ready(function() {
    
    //$('#vmDetails').leanModal();
    //$('#deployVM').leanModal();

    getVMList();
    $('.modal-trigger').leanModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      ready: function() { 
            alert('Ready');
            console.log('Ready');
            $("#ismodalopen").val("true"); 
        }, // Callback for Modal open
      complete: function() { alert("Hello");$("#ismodalopen").val("false");  } // Callback for Modal close
    });
});


function getVMList() {
    $("#vmList tbody").empty();
    $.get("vm/list", function(res) {
        if (!res.type) {
            return;
        } else {

            res.data.forEach(function(thisdata) {

                var tr = "<tr id=\"" + thisdata.name + "\" + class=\"modal-trigger\" onclick=\"openVmDetails(\'" + thisdata.name + "\') \">";
                tr += "<td>" + thisdata.name + "</td>";
                tr += "<td>" + thisdata.type + "</td>";
                tr += "<td>" + thisdata.ipaddress + "</td>";
                tr += "<td>" + thisdata.status + "</td>";
                tr += "</tr>";
                $("#vmList tbody").append(tr);
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


function getVmStatistics(vmName){
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
    
}

function openVmDetails(vmName) {
    console.log("openVmDetails(" + vmName + ")");
    getVmStats(vmName);

}

function getVmStats(vmName) {
    console.log("getting vm stats");
    url = "/vm/" + vmName + "/vmStats";
    $.get(url, function(res) {
        //console.log(res.data);
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
            //getGraphs(thisinstance.ipaddress);
             $("#vmip").val(thisinstance.ipaddress);
             openGraphwithmodal();
        }
    });
}

function getGraphs() {
    var ip =  $("#vmip").val();
    var graphSize = $("#graphSize").val();
    console.log("Geeting graphs for vm: " + ip);
    ip = "130.65.133.45"; //static ip need to remove
    console.log("getting vm graphs");
    url = "/vm";

    $.ajax({
        type: "POST",
        url: url,
        data: {
            ip:  ip,
            size: graphSize
        },
        crossDomain: true,
        dataType: "json",
        success: function(res) {
           if (!res.type) {
            alert(res.data);
            return;
        } else {
            graphData = res.data;
            console.log(graphData.logtime.length);
            console.log(graphData.logtime);
            generateCpuGraph(graphData.logtime, graphData.cpu);
            generateMemoryGraph(graphData.logtime, graphData.memtotal, graphData.memused);
            generateNetworkGraph(graphData.logtime, graphData.networkIn, graphData.networkOut);
            generateDiskGraph(graphData.logtime, graphData.disktotal, graphData.diskused);
            generateIOGraph(graphData.logtime, graphData.diskIORead, graphData.diskIOWrite);
        }
        setTimeout(function(){ 
            if($("#ismodalopen").val()=="true")
                getGraphs();
        }, 5000);

        },
        error: function(request, status, err) {
            if (status == "timeout") {
                //gotoDir(pmcat_id, pcat_id);
                console.log("Timeout");
            }
        }
    });
    
}

function openGraphwithmodal() {
    $('#vmDetails').openModal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        in_duration: 300, // Transition in duration
        out_duration: 200, // Transition out duration
        ready: function() {
            //alert('Ready');
            //console.log('Ready');
            $("#ismodalopen").val("true");
            getGraphs();
        }, // Callback for Modal open
        complete: function() {
                //alert("Close");
                //console.log('Close');
                $("#ismodalopen").val("false");
            } // Callback for Modal close
    });
}

function closeVMDetailsModal(){
    console.log("closing VM Details Modal");
    $('#vmDetails').closeModal();
    $("#ismodalopen").val("false"); 
}


function sleep(millis)
 {
  var date = new Date();
  var curDate = null;
  do { curDate = new Date(); }
  while(curDate-date < millis);
}


function generateCpuGraph(time, cpu) {
    //console.log("cpu: " + cpu);

    $('#graph-cpu').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy',
            borderWidth: 1
        },

        title: {
            text: 'CPU',
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

function generateMemoryGraph(time, memTotal, memUsed) {
    // console.log("memTotal: " + memTotal);
    // console.log("memUsed: " + memUsed);

    $('#graph-memory').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy',
            borderWidth: 1
        },
        title: {
            text: 'Memory (MB)'
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'Memory Total(MB)',
            data: memTotal
        }, {
            name: 'Memory Used(MB)',
            data: memUsed
        }]
    });
}

function generateDiskGraph(time, diskTotal, diskUsed) {
    // console.log("diskTotal: " + diskTotal);
    // console.log("diskUsed: " + diskUsed);
    $('#graph-disk').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy',
            borderWidth: 1
        },
        title: {
            text: 'Disk IO'
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'Disk Total',
            data: diskTotal
        },{
            name: 'Disk Used',
            data: diskUsed
        }]
    });
}

function generateNetworkGraph(time, netIn, netOut) {
    // console.log("netIn: " + netIn);
    // console.log("netOut: " + netOut);

    $('#graph-network').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy',
            borderWidth: 1
        },
        title: {
            text: 'Network',
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'Network In',
            data: netIn
        }, {
            name: 'Network Out',
            data: netOut
        }]
    });
}

function generateIOGraph(time, ioRead, ioWrite) {
    // console.log("ioRead: " + ioRead);
    // console.log("ioWrite: " + ioWrite);

    $('#graph-io').highcharts({
        chart: {
            //height: 300,
            zoomType: 'xy',
            borderWidth: 1
        },
        title: {
            text: 'IO'
        },
        xAxis: {
            categories: time
        },
        yAxis: {

        },
        series: [{
            name: 'IO Read',
            data: ioRead
        }, {
            name: 'IO Write',
            data: ioWrite
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