/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    var t = getQueryString('t'); //parts['t'];
    var sVal = getQueryString('sVal');//parts['sVal'];
    var _start = 0;
    var _pageSize = 10;
    moment().locale("zh-cn");
    var seriesName = ['疾病', '症状', '化验', '检查', '药品', '性别', '年龄'];
    var keyNames = ['disease', 'symptom', 'labSet', 'exam', 'drug', 'gender', 'age'];
    var charQueryParam = {
        "query":{
            "text":{"text":sVal}
        },
        "assets":{
            "queryModel":sVal,
            "modelText":sVal
        },
    };

    var chartModel = {
        disease: {},
        symptom: {},
        labSet: {},
        exam: {},
        drug: {},
        gender: {},
        age: {}
    };

    if (sVal) {
        $("#searchInput").val(sVal);
    }
    //waitfor
    var wt = new waitfor();
    // wt.show();
    //current page HTML template
    var templates = {};
    $.ajax({
        url: '/assets/tpl/searchResultTemplate.html',
        type: 'GET',
        async: false,
        success: function (data) {
            templates['sRSTpl'] = data;

        },
        error: function () {

        }
    });

    var tabChart = Highcharts.chart('chartContainer', {
        chart: {
            type: 'bar'
        },
        title: {
            text: '',
            style: {
                display: 'none'
            }
        },
        subtitle: {
            text: '',
            style: {
                display: 'none'
            }
        },
        series: [{}]

    });

    getResults();
    getCharts();


    //===============event regist =====================
    $("#btnGetSearch").on("click", function (e) {
        e = e || window.event;
        var sIpt = $("#searchInput");
        var sIptVal = sIpt.val();
        // alert(sIptVal);
        if (!sIptVal) {
            getSimpleNotify('请输入搜索关键词');
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;
            return false
        }
        triggerNewSearch(sIptVal);

    })

    $("#searchInput").on('keyup', function (e) {
        var sIptVal = $(this).val();
        var keyCode = e.keyCode;
        if (keyCode == 13) {
            // window.open(url)
            if (!sIptVal) {
                getSimpleNotify('请输入搜索关键词');
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                return false
            }
            triggerNewSearch(sIptVal);
        }
    })

    $('#fixedSearchBar').scrollToFixed();
    $('.medical-knowledge-reference').scrollToFixed({
        zIndex: 20,
        marginTop: 20
    });

    $("#tabChart").on("click", ".tab-link", function (e) {
        if ($(this).hasClass("active")) return
        $("#tabChart .tab-link").removeClass('active');
        $(this).addClass("active");
        var activeKey = $("#tabChart").find('.tab-link.active').attr("data-type");
        tabChart.update(chartModel[activeKey]);
    })


    //$("#waitfor").modal({keyboard:false})
    //================function define ==================
    function getResults() {
        //简单查询
        $.ajax({
            type: 'get',
            // url: '/_/v1/search/global?text=' + encodeURIComponent(sVal) + '&start=' + _start+'&size'+_pageSize,
            url: '/_/hosp/search/global?text=' + encodeURIComponent(sVal) + '&start=' + _start+'&size='+_pageSize,
            // url:"/_/hosp/search/science/global",
            dataType: 'json',
            // data:{"text":sVal,"type":"patient","start": _start,"size":_pageSize},
            beforeSend: function () {
                document.title = sVal + '-医疗大数据平台';
                wt.show();
            },
            success: function (data) {
                if (data && data.items) {
                    console.log(data);
                    _buildRSByData(data);
                    _buildPagination(data);
                    $(window).scrollTop(0);
                    $(".medical-knowledge-reference").show();
                } else {
                    //getSimpleNotify('获取查询数据失败')
                }

            },
            error: function (XMLHttpRequest) {
                getSimpleNotify('获取查询数据失败')
            },
            complete: function () {
                wt.hide();
            }
        });
    }

    function _buildRSByData(data) {
        if (data) {
            var caseNum = data.total || "0";
            $(".summary-num").text(caseNum);
            var keys = [];
            var matchKeys = templates["sRSTpl"].match(/\{\{\w+\}\}/g); //fuck sb ie
            for (var sbIe = 0, sbLen = matchKeys.length; sbIe < sbLen; sbIe++) {
                keys.push(matchKeys[sbIe].replace(/\{+|\}+/g, ""))
            }
            /* ().forEach(function (i) {
             keys.push(i.replace(/\{+|\}+/g,""))
             });*/
            var tpls = [];
            if (!data.items) return;
            for (var i = 0, len = data.items.length; i < len; i++) {
                var tp = templates['sRSTpl'];
                var item = data.items[i]["case"];
                var cont = data.items[i].highlights;
                for (var j = 0, jlen = keys.length; j < jlen; j++) {
                    var keyV = item[keys[j]];
                    if(keys[j]=='id'){
                        keyV = '/detail?_id='+keyV;
                    }
                    if (keys[j] == 'visitType') {
                        keyV = keyV.substring(0, 1);
                    }
                    if (keys[j] == 'admitTime') {
                        keyV = moment(keyV).format(('YYYY-MM-DD'))
                    }
                    if (keys[j] == 'content') {
                        var ct = [];
                        if (cont && cont.length > 0) {
                            for (var k = 0, klen = cont.length; k < klen; k++) {
                                if(k>2)break; //only show three
                                ct.push('<div class="content-item">' + cont[k].title+':'+cont[k].text + '</div>');
                            }
                            keyV = ct.join('');
                        }
                    }
                    if (!keyV) {
                        keyV = "";
                    }
                    var reg = new RegExp("\\{\\{" + keys[j] + "\\}\\}", "gim");
                    // console.log(reg);
                    // console.log(keyV);
                    // console.log(tp);
                    tp = tp.replace(reg, keyV);
                }
                tpls.push(tp);
            }
            $("#searchResults").empty().append(tpls);


        }
    }

    function _buildPagination(data) {
        if (data) {
            $("#pagination4rs").empty().pagination({
                dataSource: function (done) {
                    var result = [];
                    for (var i = 0; i < data.total; i++) {
                        result.push(i);
                    }
                    done(result);
                },
                locator: function () {
                    return 'items'
                },
                showLastOnEllipsisShow: false,
                triggerPagingOnInit: false,
                totalNumber: data.total,
                pageSize: _pageSize,
                callback: function (data, pagination) {
                    _start = (pagination.pageNumber - 1) * _pageSize;
                   // var url = '/_/v1/search/global?text=' + encodeURIComponent(sVal) + '&start=' + _start+'&size='+_pageSize;
                    var url= '/_/hosp/search/global?text=' + encodeURIComponent(sVal) + '&start=' + _start+'&size='+_pageSize;
                   //  var url="/_/hosp/search/science/global"
                    $.ajax({
                        url: url,
                        type: 'get',
                        // data:{"text":sVal,"type":"patient","start": _start,"size":_pageSize},
                        dataType: 'json',
                        beforeSend: function () {
                            wt.show();
                            // $("#searchResults").empty();
                        },
                        success: function (data) {
                            if (data && data.total) {
                                _buildRSByData(data);
                                $(window).scrollTop(0);
                            }
                        },
                        complete: function () {
                            wt.hide();
                        }
                    })
                }
            })
        }
    }

    //get page chart data
    function getCharts() {
        getDiseaseData();
        getDrugData();
        getSymptomData();
        getLabsetData();
        getExamData();
        getGenderData();
        getAgeData();
    }

    //医疗图谱数据 disease\drug\symptom\labset\exam
    function getDiseaseData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/disease',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.diseases) {
                    updateChartModel('disease', data.diseases)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getDrugData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/drug',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data && data.drugs) {
                    updateChartModel('drug', data.drugs)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getSymptomData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/symptom',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data && data.symptoms) {
                    updateChartModel('symptom', data.symptoms)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getLabsetData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/labset',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.labItems) {
                    updateChartModel('labSet', data.labItems)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getExamData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/exam',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.exams) {
                    updateChartModel('exam', data.exams)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getGenderData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/gender',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.gender) {
                    updateChartModel('gender', data.gender)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function getAgeData() {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/stats/case/age',
            data: JSON.stringify(charQueryParam),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data && data.age) {
                    updateChartModel('age', data.age)
                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
            }
        });
    }

    function updateChartModel(key, data) {
        if (data.length > 0) {
            var chartOpts = {
                chart: {
                    type: 'bar'
                },
                xAxis: {
                    categories: [],
                    title: {
                        text: null
                    },
                    labels: {
                        formatter: function () {
                            var v = this.value;
                            if (v && v.length > 8) {
                                v = v.substring(0, 8) + "..."
                            }
                            return v;
                        }
                    },
                    visible:true
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: false
                        }
                    }
                },
                series: [],
                yAxis: {
                    min: 0,
                    title: {
                        text: '占比 (%)',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' %'
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                }
            };
            //fuck you ie sb [].indexOf =>undefined
            var sName = seriesName[$.inArray(key, keyNames)];
            var serie = {
                "colors": ['#9ec1db'],
                "name": sName,//seriesName[keyNames.indexOf(key)],
                "data": []
            };
            if(key=='gender'){
                chartOpts = {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            showInLegend: true,
                            size:"45%",
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    width:"40px",
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    legend: {
                        enabled: true,
                        layout: 'horizontal',
                        backgroundColor: '#FFFFFF',
                        floating: true,
                        align: 'left',
                        verticalAlign: 'top',
                        // x: 90,
                        // y: 45,
                        labelFormatter: function () {
                            return this.name + ' ('+this.percentage.toFixed(2)+'%)';
                        }
                    },
                    xAxis:{
                        visible:false
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: '占比 (%)',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: []
                }
                serie['colorByPoint']=true;
                serie['colors']=["#9ec1db","#DB9EA2"];
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var dt = data[i];
                var ct = dt.name;
                var ctData = dt.percent;

                if(key=='gender'){
                    serie.data.push({name:ct,y:(ctData * 100).toFixed(2) * 1})
                }else{
                    chartOpts.xAxis.categories.push(ct);
                    serie.data.push((ctData * 100).toFixed(2) * 1)
                }
            }
            chartOpts.series.push(serie);
            chartModel[key] = chartOpts;
        }
        var activeKey = $("#tabChart").find('.tab-link.active').attr("data-type");
        if (activeKey == key) {
            tabChart.update(chartModel[activeKey]);
            tabChart.reflow(); //redraw
        }
    }

    //trigger new search
    function triggerNewSearch(v) {
        sVal = v;
        _start = 0;
        charQueryParam = {
            "query":{
                "text":{"text":sVal}
            },
            "assets":{
                "queryModel":sVal,
                "modelText":sVal
            },
        };
        getResults();
        getCharts();
    }


})