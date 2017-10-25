/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    moment().locale("zh-cn");
    $('#biFixBar').scrollToFixed();

    var activeID = $("#biNavBar").find("li.active>a").attr("data-link");
    showPanelById(activeID);

    //导出菜单
    var menuOpt = {
        navigation: {
            menuItemHoverStyle: {
                "backgroundColor": "#3D83B8"
            }
        },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: true,
                    menuItems: [{
                        text: '放大查看',
                        onclick: function (e) {
                            e = e || window.event;
                            var tg = e.target || e.srcElement;
                            var target = $(tg);
                            var key = target.parents('.chartContent').attr("id");
                            dialog4Chart.opt['openkey'] = key;
                            dialog4Chart.open();
                        }
                    }, {
                        text: '表格视图',
                        onclick: function (e) {
                            e = e || window.event;
                            var tg = e.target || e.srcElement;
                            var target = $(tg);
                            var key = target.parents('.chartContent').attr("id");
                            dialog4Grid.opt['openkey'] = key;
                            dialog4Grid.open();
                        },
                        separator: false
                    }]
                }
            }
        }
    };
    //导出图片
    var exportImg = {
        navigation: {
            menuItemHoverStyle: {
                "backgroundColor": "#3D83B8"
            }
        },
        lang: {
            exportTitle: "导出PNG"
        },
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                },
                exportButton: {
                    text: '导出PNG',
                    _titleKey: 'exportTitle',
                    onclick: function () {
                        this.exportChartLocal({type: 'application/png', sourceWidth: 800, sourceHeight: 450});
                    }
                }
            }
        }
    };


    //chart object map
    var chartMapObj = {
        //门急诊 病历
        "outPatient_Case": {
            // chartDOM:$("#outPatientClinic_Case"),
            domID: 'outPatient_Case',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"1",
            pId: "1",
            ctitle: '门急诊病历统计',
            chart: null
        },
        //住院病历统计
        "inHosp_Case": {
            // chartDOM:$("#outPatientClinic_Case"),
            domID: 'inHosp_Case',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"2",
            pId: "1",
            ctitle: '住院病历统计',
            chart: null
        },
        //门诊综合信息
        "clinicalInfos": {
            domID: 'clinicalInfos',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '临床记录统计',
            chart: null
        },
        //门急诊次数
        "outPatientsTimes": {
            domID: 'outPatientsTimes',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '',
            chart: null
        },
        //住院次数分布
        "inHospitalTimes": {
            domID: 'inHospitalTimes',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '',
            chart: null
        },
        //门急诊患者年龄分布
        "outPatientsAgeR": {
            domID: 'outPatientsAgeR',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '门急诊年龄分布',
            chart: null
        },
        //住院患者年龄分布
        "InHospitalAgeR": {
            domID: 'InHospitalAgeR',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '住院年龄分布',
            chart: null
        },
        //门诊患者性别分布
        "outPatientsSex": {
            domID: 'outPatientsSex',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '门急诊性别分布',
            chart: null
        },
        //住院患者性别分布
        "InHospitalSex": {
            domID: 'InHospitalSex',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            pId: "1",
            ctitle: '住院性别分布',
            chart: null
        },
        //    panel2
        //门急诊疾病
        "top10chart_0": {
            domID: 'top10chart_0',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"1",
            pId: "2",
            ctitle: '门急诊疾病人次',
            chart: null
        },
        //住院病症
        "top10chart_1": {
            domID: 'top10chart_1',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"2",
            pId: "2",
            ctitle: '住院疾病人次',
            chart: null
        },
        //门急用药（人次）
        "top10chart_2": {
            domID: 'top10chart_2',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"3",
            pId: "2",
            ctitle: '门急诊用药人次',
            chart: null
        },
        //住院用药（人次）
        "top10chart_3": {
            domID: 'top10chart_3',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"4",
            pId: "2",
            ctitle: '住院用药人次',
            chart: null
        },
        //门急诊化验（人次）
        "top10chart_4": {
            domID: 'top10chart_4',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"5",
            pId: "2",
            ctitle: '门急诊化验人次',
            chart: null
        },
        //住院化验（人次）
        "top10chart_5": {
            domID: 'top10chart_5',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"6",
            pId: "2",
            ctitle: '住院化验人次',
            chart: null
        },
        //门急诊医技（人次）
        "top10chart_6": {
            domID: 'top10chart_6',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            indicatorsKey:"7",
            originalDataObj: null,
            pId: "2",
            ctitle: '门急诊医技人次',
            chart: null
        },
        //住院医技（人次）
        "top10chart_7": {
            domID: 'top10chart_7',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"8",
            pId: "2",
            ctitle: '住院医技人次',
            chart: null
        },
        //手术（人次）
        "top10chart_8": {
            domID: 'top10chart_8',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            indicatorsKey:"9",
            type: 'bar1',
            pId: "2",
            ctitle: '手术人次',
            chart: null
        },
        //门急诊（人次）
        "outPatientsTotalTimes": {
            domID: 'outPatientsTotalTimes',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "3",
            ctitle: '门急诊人次',
            chart: null
        },
        //门急诊（收入）
        "outPatientsTotalIncome": {
            domID: 'outPatientsTotalIncome',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "3",
            ctitle: '门急诊收入',
            chart: null
        },
        //门急诊次均费用
        "outPatientsCostPerTimes": {
            domID: 'outPatientsCostPerTimes',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "3",
            ctitle: '门急诊次均费用',
            chart: null
        }
        ,
        //出院（人次）
        "inhospitalTotalTimes": {
            domID: 'inhospitalTotalTimes',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "4",
            ctitle: '出院人次',
            chart: null
        }
        ,
        //出院（收入）
        "inhospitalTotalIncome": {
            domID: 'inhospitalTotalIncome',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "4",
            ctitle: '出院费用',
            chart: null
        }
        ,
        //出院次均费用
        "costsPerOutOfHospital": {
            domID: 'costsPerOutOfHospital',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar1',
            pId: "4",
            ctitle: '出院次均费用',
            chart: null
        }

        //panel5
        //CT医技人次
        , "CT_times": {
            domID: 'CT_times',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'line',
            pId: "5",
            ctitle: 'CT人次',
            chart: null
        }
        //核磁医技人次
        , "NMR_times": {
            domID: 'NMR_times',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'line',
            pId: "5",
            ctitle: '核磁人次',
            chart: null
        }
        //B超医技人次
        , "B_times": {
            domID: 'B_times',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'line',
            pId: "5",
            ctitle: 'B超人次',
            chart: null
        }
        //化验人次
        , "lab_times": {
            domID: 'lab_times',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'line',
            pId: "5",
            ctitle: '化验人次',
            chart: null
        },
        //手术人数，手术占比
        "operateNumPercent": {
            domID: 'operateNumPercent',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: '2y',
            pId: "6",
            ctitle: '手术人数/占比',
            chart: null
        }
        //手术分级（占比）
        , "operateLevel": {
            domID: 'operateLevel',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'pie',
            pId: "6",
            ctitle: '手术分级',
            chart: null
        }
        //手术切口（占比）
        , "operateIncision": {
            domID: 'operateIncision',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'pie',
            pId: "6",
            ctitle: '手术切口',
            chart: null
        }
        //平均住院日
        , "p7_1": {
            domID: 'p7_1',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: 'bar2',
            pId: "7",
            ctitle: '平均住院日',
            chart: null
        }
        //平均>30天人次，占比
        , "p7_2": {
            domID: 'p7_2',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: '2y',
            pId: "7",
            ctitle: '住院>30人次/占比',
            chart: null
        }
        //7日内再入院人次、占比
        , "p7_3": {
            domID: 'p7_3',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: '2y',
            pId: "7",
            ctitle: '7日内再入院人次/占比',
            chart: null
        }
        //住院死亡人数、死亡率
        , "p7_4": {
            domID: 'p7_4',
            chartDataModel: null,
            chartOption: null,
            conditionObj: null,
            originalDataObj: null,
            type: '2y',
            pId: "7",
            ctitle: '住院死亡人数/死亡率',
            chart: null
        }

    };
    //click search link to map function
    var panelFunctionMap = {
        "picker-1-1": {
            functionNames: {
                "getCaseStatistic": getCaseStatistic
            }
        },
        "picker-1-2": {
            functionNames: {
                "getCaseDetailStatistic": getCaseDetailStatistic
            }
        },
        "picker-1-3": {
            functionNames: {
                "getAgeDistributeStatistic": getAgeDistributeStatistic
            }
        },
        "picker-2-1": {
            functionNames: {
                "getTop10Statistic": getTop10Statistic
            }
        },
        "picker-3-1": {
            functionNames: {
                "getOutPatientsStatistic": getOutPatientsStatistic
            }
        },
        "picker-3-2": {
            functionNames: {
                "getOutPatientsChartStatistic": getOutPatientsChartStatistic
            }
        },
        "picker-4-1": {
            functionNames: {
                "getInHospitalStatistic": getInHospitalStatistic
            }
        },
        "picker-4-2": {
            functionNames: {
                "getInHospitalChartStatistic": getInHospitalChartStatistic
            }
        },
        "picker-5-1": {
            functionNames: {
                "getMedicalTeachStatistic": getMedicalTeachStatistic
            }
        },
        "picker-5-2": {
            functionNames: {
                "getMedicalTeachChartStatistic": getMedicalTeachChartStatistic
            }
        },
        "picker-6-1": {
            functionNames: {
                "getOperateStatistic": getOperateStatistic
            }
        },
        "picker-6-2": {
            functionNames: {
                "getOperateChartStatistic": getOperateChartStatistic
            }
        },
        "picker-7-1": {
            functionNames: {
                "getQualityChartStatistic": getQualityChartStatistic
            }
        },

    };

    var defaultStart = "1999/02/01";
    var commonEndDay = new moment().subtract(1, "d");
    var defaultEnd = commonEndDay.format("YYYY/MM/DD");

    $("#picker-1-1-start").val(defaultStart);
    $("#picker-1-1-end").val(defaultEnd);
    var p1_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p1_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-1-1-end"), p1_1_end);
        }
    };
    var p1_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p1_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-1-1-start").jeDate(p1_1_start);
    $("#picker-1-1-end").jeDate(p1_1_end);
    getCaseStatistic.call({"panel": $(".bi-panel-block[data-block='picker-1-1']")}, new moment($("#picker-1-1-start").val() + " 00:00:00", "YYYY/MM/DD HH:mm:ss").format(), new moment($("#picker-1-1-end").val() + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format());


    $("#picker-1-2-start").val(defaultStart);
    $("#picker-1-2-end").val(defaultEnd);
    var p1_2_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p1_2_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-1-2-end"), p1_2_end);
        }
    };
    var p1_2_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p1_2_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-1-2-start").jeDate(p1_2_start);
    $("#picker-1-2-end").jeDate(p1_2_end);
    getCaseDetailStatistic.call({"panel": $(".bi-panel-block[data-block='picker-1-2']")}, new moment($("#picker-1-2-start").val() + " 00:00:00", "YYYY/MM/DD HH:mm:ss").format(), new moment($("#picker-1-2-end").val() + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format());


    $("#picker-1-3-start").val(defaultStart);
    $("#picker-1-3-end").val(defaultEnd);
    var p1_3_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p1_3_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-1-3-end"), p1_3_end);
        }
    };
    var p1_3_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p1_3_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-1-3-start").jeDate(p1_3_start);
    $("#picker-1-3-end").jeDate(p1_3_end);
    getAgeDistributeStatistic.call({"panel": $(".bi-panel-block[data-block='picker-1-3']")}, new moment($("#picker-1-3-start").val() + " 00:00:00", "YYYY/MM/DD HH:mm:ss").format(), new moment($("#picker-1-3-end").val() + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format());


    //panel2
    var p2_1_start_date = new moment().subtract(1, "day").subtract(30, "day");
    var p2_1_end_date = new moment().subtract(1, "day");
    // var p2_1_start = p2_1_start_date.format("YYYY/MM/DD");
    // var p2_1_end = p2_1_end_date.format("YYYY/MM/DD");
    $("#picker-2-1-start").val(defaultStart);
    $("#picker-2-1-end").val(defaultEnd);
    var p2_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p2_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-2-1-end"), p2_1_end);
        }
    };
    var p2_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p2_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-2-1-start").jeDate(p2_1_start);
    $("#picker-2-1-end").jeDate(p2_1_end);
    getTop10Statistic.call({"panel": $(".bi-panel-block[data-block='picker-2-1']")}, new moment($("#picker-2-1-start").val() + " 00:00:00", "YYYY/MM/DD HH:mm:ss").format(), new moment($("#picker-2-1-end").val() + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format());

    //panel3
    var p3_1_date = new moment().subtract(1, "d");
    var p3_1_start_date = new moment(p3_1_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p3_1_end_date = new moment(p3_1_date.format("YYYY-MM-DD"+" 23:59:59"),"YYYY-MM-DD HH:mm:ss");
    var p3_1_start = p3_1_start_date.format("YYYY/MM/DD");
    var p3_1_end = p3_1_end_date.format("YYYY/MM/DD");
    $("#picker-3-1-start").val(p3_1_start);
    $("#picker-3-1-end").val(p3_1_end);
    var p3_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p3_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-3-1-end"), p3_1_end);
        }
    };
    var p3_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p3_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-3-1-start").jeDate(p3_1_start);
    $("#picker-3-1-end").jeDate(p3_1_end);
    getOutPatientsStatistic.call({panel: $(".bi-panel-block[data-block='picker-3-1']")}, p3_1_start_date.format(), p3_1_end_date.format());

    var p3_2_date = new moment().subtract(1, "d");
    var p3_2_start_date = new moment(p3_2_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p3_2_end_date = new moment(p3_2_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");

    var p3_2_start = p3_2_start_date.format("YYYY/MM");
    $("#picker-3-2-start").val(p3_2_start);
    var p3_2_start = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {}
    };
    $("#picker-3-2-start").jeDate(p3_2_start);

    getOutPatientsChartStatistic.call({panel: $(".bi-panel-block[data-block='picker-3-2']")}, p3_2_start_date.format(), p3_2_end_date.format());


    //panel4
    var p4_1_date = new moment().subtract(1, "M");
    var p4_1_start_date = new moment(p4_1_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    //console.log(p4_1_date.format("YYYY-MM")+"-"+p4_1_date.endOf("month").get("date")+" 23:59:59");
    var p4_1_end_date = new moment(p4_1_date.format("YYYY-MM") + "-" + p4_1_date.endOf("month").get("date") + " 23:59:59", "YYYY-MM-DD HH:mm:ss");
    var p4_1_start = p4_1_start_date.format("YYYY/MM/DD");
    var p4_1_end = p4_1_end_date.format("YYYY/MM/DD")
    $("#picker-4-1-start").val(p4_1_start);
    $("#picker-4-1-end").val(p4_1_end);
    var p4_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: p4_1_end, //最大日期
        choosefun: function (elem, val, date) {
            p4_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-4-1-end"), p4_1_end);
        }
    };
    var p4_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p4_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-4-1-start").jeDate(p4_1_start);
    $("#picker-4-1-end").jeDate(p4_1_end);
    getInHospitalStatistic.call({panel: $(".bi-panel-block[data-block='picker-4-1']")}, p4_1_start_date.format(), p4_1_end_date.format());

    var p4_2_date = new moment().subtract(1, "d");
    var p4_2_start_date = new moment(p4_2_date.format("YYYY") + "-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p4_2_end_date = new moment(p4_2_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");
    var p4_2_start = p4_2_start_date.format("YYYY/MM");
    var p4_2_end = p4_2_end_date.format("YYYY/MM");
    $("#picker-4-2-start").val(p4_2_start);
    $("#picker-4-2-end").val(p4_2_end);
    var p4_2_start = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: p4_2_end_date.format("YYYY/MM/DD"), //最大日期
        choosefun: function (elem, val, date) {

            p4_2_end.minDate = val + "/01"; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-4-2-end"), p4_2_end);
        }
    };
    var p4_2_end = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            var lastDay = __getLastDayByMMDD(val);
            p4_2_start.maxDate = val +"/"+lastDay; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-4-2-start").jeDate(p4_2_start);
    $("#picker-4-2-end").jeDate(p4_2_end);
    getInHospitalChartStatistic.call({panel: $(".bi-panel-block[data-block='picker-4-2']")}, p4_2_start_date.format(), p4_2_end_date.format());


    //panel5
    var p5_1_date = new moment().subtract(1, "d");
    var p5_1_start_date = new moment(p5_1_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p5_1_end_date = new moment(p5_1_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");
    var p5_1_start = p5_1_start_date.format("YYYY/MM/DD");
    var p5_1_end = p5_1_end_date.format("YYYY/MM/DD");
    $("#picker-5-1-start").val(p5_1_start);
    $("#picker-5-1-end").val(p5_1_end);
    var p5_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {
            p5_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-5-1-end"), p5_1_end);
        }
    };
    var p5_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p5_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-5-1-start").jeDate(p5_1_start);
    $("#picker-5-1-end").jeDate(p5_1_end);
    getMedicalTeachStatistic.call({panel: $(".bi-panel-block[data-block='picker-5-1']")}, p5_1_start_date.format(), p5_1_end_date.format());

    var p5_2_date = new moment().subtract(1, "d");
    var p5_2_start_date = new moment(p5_2_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p5_2_end_date = new moment(p5_2_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");

    var p5_2_start = p5_2_start_date.format("YYYY/MM");
    $("#picker-5-2-start").val(p5_2_start);
    var p5_2_start = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: defaultEnd, //最大日期
        choosefun: function (elem, val, date) {

        }
    };
    $("#picker-5-2-start").jeDate(p5_2_start);
    getMedicalTeachChartStatistic.call({panel: $(".bi-panel-block[data-block='picker-5-2']")}, p5_2_start_date.format(), p5_2_end_date.format());

    //panel6
    var p6_1_date = new moment().subtract(1, "M");
    var p6_1_start_date = new moment(p6_1_date.format("YYYY-MM") + "01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    //console.log(p6_1_date.format("YYYY-MM")+"-"+p6_1_date.endOf("month").get("date")+" 23:59:59");
    var p6_1_end_date = new moment(p6_1_date.format("YYYY-MM") + "-" + p6_1_date.endOf("month").get("date") + " 23:59:59", "YYYY-MM-DD HH:mm:ss");
    var p6_1_start = p6_1_start_date.format("YYYY/MM/DD");
    var p6_1_end = p6_1_end_date.format("YYYY/MM/DD")
    $("#picker-6-1-start").val(p6_1_start);
    $("#picker-6-1-end").val(p6_1_end);
    var p6_1_start = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: p6_1_end, //最大日期
        choosefun: function (elem, val, date) {
            p6_1_end.minDate = date; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-6-1-end"), p6_1_end);
        }
    };
    var p6_1_end = {
        format: 'YYYY/MM/DD',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p6_1_start.maxDate = date; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-6-1-start").jeDate(p6_1_start);
    $("#picker-6-1-end").jeDate(p6_1_end);
    getOperateStatistic.call({panel: $(".bi-panel-block[data-block='picker-6-1']")}, p6_1_start_date.format(), p6_1_end_date.format());

    var p6_2_date = new moment().subtract(1, "d");
    var p6_2_start_date = new moment(p6_2_date.format("YYYY") + "-01-01 00:00:00", "YYYY-MM-DD HH:mm:ss");
    var p6_2_end_date = new moment(p6_2_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");
    var p6_2_start = p6_2_start_date.format("YYYY/MM");
    var p6_2_end = p6_2_end_date.format("YYYY/MM");
    $("#picker-6-2-start").val(p6_2_start);
    $("#picker-6-2-end").val(p6_2_end);
    var p6_2_start = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: p6_2_end_date.format("YYYY/MM/DD"), //最大日期
        choosefun: function (elem, val, date) {
            p6_2_end.minDate = val + "/01"; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-6-2-end"), p6_2_end);
        }
    };
    var p6_2_end = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            p6_2_start.maxDate = val + "/01"; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-6-2-start").jeDate(p6_2_start);
    $("#picker-6-2-end").jeDate(p6_2_end);
    getOperateChartStatistic.call({panel: $(".bi-panel-block[data-block='picker-6-2']")}, p6_2_start_date.format(), p6_2_end_date.format());


    //panel7
    var p7_1_date = new moment().subtract(1,"day");
    var p7_1_start_date = new moment().subtract(12, "months");
    var p7_1_end_date = new moment(p7_1_date.format("YYYY-MM-DD")+" 23:59:59","YYYY-MM-DD HH:mm:ss");
    var p7_1_start = p7_1_start_date.format("YYYY/MM");
    var p7_1_end = p7_1_end_date.format("YYYY/MM");
    $("#picker-7-1-start").val(p7_1_start);
    $("#picker-7-1-end").val(p7_1_end);
    var p7_1_start = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: p7_1_end_date.format("YYYY/MM/DD"), //最大日期
        choosefun: function (elem, val, date) {
            p7_1_end.minDate = val + "/01"; //开始日选好后，重置结束日的最小日期
            endDates($("#picker-7-1-end"), p7_1_end);
        }
    };
    var p7_1_end = {
        format: 'YYYY/MM',
        isinitVal: true,
        ishmsVal: false,
        isClear: false,
        isToday: false,
        isok: false,
        minDate: defaultStart, //设定最小日期为当前日期
        maxDate: commonEndDay.format('YYYY/MM/DD'), //最大日期
        choosefun: function (elem, val, date) {
            var lastDay = __getLastDayByMMDD(val);
            p7_1_start.maxDate = val + "/"+lastDay; //将结束日的初始值设定为开始日的最大日期
        }
    };
    $("#picker-7-1-start").jeDate(p7_1_start);
    $("#picker-7-1-end").jeDate(p7_1_end);
    getQualityChartStatistic.call({panel: $(".bi-panel-block[data-block='picker-7-1']")}, p7_1_start_date.format(), p7_1_end_date.format());




    //dialog
    var dialog4Chart = new commonDlg();
    dialog4Chart.init({
        dlgTitle: ' ',
        dlgSize: 'modal-lg', //modal-sm modal-md modal-lg
        content: '/assets/tpl/conditions.html',
        cancelText: '关闭',
        okText: '确定',
        okBtnBgColor: '#41b8b0',
        beforeShow: function () {
            if (chartMapObj[this.opt.openkey]) {
                this.dlgDOM.find(".modal-header .modal-title").css({textAlign: "left"}).text(chartMapObj[this.opt.openkey].ctitle);
            }
        },
        afterInit: function () {
            this.dlgDOM.attr("data-backdrop", true);
            this.dlgDOM.find(".modal-footer").hide();
            this.dlgDOM.find(".modal-dialog[role='document']").css({width: "85%", marginTop: "90px"});
            this.dlgDOM.find(".modal-body").append($("<div style='height: 500px;' id='bigChartContainer' class='chart-container'></div>"));
        },
        afterShow: function () {
            var popChartOpt = $.extend(true, {}, chartMapObj[this.opt.openkey].chartOption);
            popChartOpt["exporting"] = {};
            if(IEVersion()>=10 || navigator.userAgent.indexOf('Edge/')>-1 || isIE()<0){
                $.extend(true, popChartOpt, exportImg);
            }else {
                popChartOpt["exporting"]["enabled"]=false;
            }
            popChartOpt["chart"]["renderTo"] = this.dlgDOM.find("#bigChartContainer").get(0);
            this.opt.chart = new Highcharts.Chart(popChartOpt);
        },
        okCallback: function () {
        },
        afterHidden: function () {
            this.opt.openkey = null;
            if (this.opt && this.opt.chart) {
                this.opt.chart.destroy();
                this.opt.chart = null;
            }
            this.dlgDOM.find(".modal-header .modal-title").text("");
        }
    });

    var dialog4Grid = new commonDlg();
    dialog4Grid.init({
        dlgTitle: ' ',
        dlgSize: 'modal-lg', //modal-sm modal-md modal-lg
        content: '/assets/tpl/conditions.html',
        cancelText: '关闭',
        okText: '确定',
        okBtnBgColor: '#41b8b0',
        beforeShow: function () {
            if (chartMapObj[this.opt.openkey]) {
                var filter = chartMapObj[this.opt.openkey]["conditionObj"]["filter"];
                var preFixStr = (new moment(filter.startTime).format("YYYY/MM/DD")) + "~" + (new moment(filter.endTime).format("YYYY/MM/DD"));
                this.dlgDOM.find(".modal-header .modal-title").css({textAlign: "left"}).text(chartMapObj[this.opt.openkey].ctitle + "【数据表 " + preFixStr + "】");
            }
        },
        afterInit: function () {
            this.dlgDOM.attr("data-backdrop", true);
            this.dlgDOM.find(".modal-footer").hide();
            this.dlgDOM.find(".modal-dialog[role='document']").css({width: "85%", marginTop: "90px"});
            this.dlgDOM.find(".modal-body").append($("<div class='row'><div class='col-xs-12' style='text-align: right;padding-bottom: 10px;'><a href='javascript:void(0)' class='export-csv'  style='font-size: 14px;'>导出CSV</a></div></div>" +
                "<div class='row'><div class='col-xs-12 chart-container' style='height: 350px;overflow-y:auto;overflow-x: hidden' id='datagridContainer'></div></div>"));
        },
        afterShow: function () {
            //draw table
            var tbStr = '<table class="table table-bordered table-hover table-condensed">';
            tbStr += getTableDataByKey(this.opt.openkey);
            tbStr += '</table>';
            this.dlgDOM.find("a.export-csv").attr("data-target",this.opt.openkey);
            this.dlgDOM.find("#datagridContainer").append(tbStr);
        },
        okCallback: function () {
        },
        afterHidden: function () {
            this.opt.openkey = null;
            this.dlgDOM.find("#datagridContainer").empty();
            this.dlgDOM.find(".modal-header .modal-title").text("");
        }
    });


    //=============regist event=====================

    $(".bi-btnSearch").on("click", function (e) {
        var $this = $(this);
        var parentBlock = $this.parents(".bi-panel-block");
        var targetPanel = parentBlock.attr("data-block");
        if (panelFunctionMap[targetPanel]) {
            var st, ed;
            if (parentBlock.attr("data-picker-num") == "2") {
                st = new moment(parentBlock.find("input.start").val() + " 00:00:00", "YYYY/MM/DD HH:mm:ss").format();
                ed = new moment(parentBlock.find("input.end").val() + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format();
            } else if (parentBlock.attr("data-picker-num") == "1") {
                var startDate = new moment(parentBlock.find("input.start").val() + "/01 00:00:00", "YYYY/MM/DD HH:mm:ss");
                st = startDate.format();
                //本月 非本月
                if ((startDate.get("month") == new moment().get("month")) && (startDate.get("year")==new moment().get("year"))) { //本年本月
                    //本月
                    ed = new moment().subtract(1,"day").hours(23).minutes(59).seconds(59).format();
                } else {
                    ed = new moment(startDate.format("YYYY/MM") + "/" + startDate.endOf("month").get("date") + " 23:59:59", "YYYY/MM/DD HH:mm:ss").format();
                }
            } else if (parentBlock.attr("data-picker-num") == "3") {
                //data format YYYY/MM
                var startDate = new moment(parentBlock.find("input.start").val() + "/01 00:00:00", "YYYY/MM/DD HH:mm:ss");
                var endDate = new moment(parentBlock.find("input.end").val()+__getLastDayByMMDD(parentBlock.find("input.end").val())+ " 23:59:59", "YYYY/MM/DD HH:mm:ss");
                st = startDate.format();
                ed = endDate.format();
            }
            for (var key in panelFunctionMap[targetPanel].functionNames) {
                if (key) {
                    var f = panelFunctionMap[targetPanel].functionNames[key];
                    f.call({"panel": parentBlock}, st, ed);
                }
            }
        }
    });

    $("#biFixBar").on("click", "a", function (e) {
        var $this = $(this);
        var parentLI = $this.parent();
        var isActive = parentLI.hasClass("active");
        if (isActive) {
            return false;
        }
        var pId = $this.attr("data-link");
        $("#biFixBar").find("li").removeClass("active");
        parentLI.addClass("active");
        showPanelById(pId);

    });

    $("#statisticsBody").on("click","a.export-csv",function (e) {
        e = e || window.event;
        var key = $(this).attr("data-target");
        exportCSV(key);
    })





    //=============functions=====================
    //显示对应的面板内容
    function showPanelById(pId) {

        if (pId != "") {
            activeID = pId;
            $("#bi-panel-container>div").each(function (i,itm) {
                // $(itm).css({"display":"none"});
                itm.style.display = "none";
            });
            // $("#bi-panel-"+pId).get(0).css({"display":"block"});
           document.getElementById("bi-panel-"+pId).style.display="block";
            // reflowChart(pId);
        }
    }

    //重绘图表
    function reflowChart(pId) {
        for (var key in chartMapObj) {
            if (pId && chartMapObj[key]["pId"] == pId && chartMapObj[key]["chart"]) {
                chartMapObj[key]["chart"].reflow();
            }
        }
    }

    //获取图表基本配置
    function getChartBasicOption(type) {
        switch (type) {
            //折线区域
            case "area":

                return $.extend(true, {}, {
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        // text: document.ontouchstart === undefined ?
                        //     '鼠标拖动可以进行缩放' : '手势操作进行缩放'
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    tooltip: {
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%Y-%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    yAxis: {
                        min: 0,
                        allowDecimals: false,
                        title: {
                            text: ''
                        }
                    },
                    legend: {
                        enabled: false,
                        verticalAlign: "top",
                        align: "center"
                    },
                    plotOptions: {
                        area: {
                            fillColor: {
                                linearGradient: {
                                    x1: 0,
                                    y1: 0,
                                    x2: 0,
                                    y2: 1
                                },
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    // [0, "#FF0000"],
                                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                ]
                            },
                            marker: {
                                enabled: false
                                // radius: 2
                            },
                            lineWidth: 1,
                            states: {
                                hover: {
                                    lineWidth: 1
                                }
                            },
                            threshold: null
                        }
                    },
                    series: [{
                        type: 'area',
                        name: '',
                        data: []
                    }]
                })
            //折线
            case "line":
                return $.extend(true, {}, {
                    title: {
                        text: ''
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {},
                    yAxis: {
                        title: {
                            text: ''
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#9EC1DB'
                        }]
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'top',
                        borderWidth: 0
                    },
                    series: []
                })
            //柱状
            case "bar":
                return $.extend(true, {}, {
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        categories: [],
                        title: {
                            text: null
                        },

                        labels: {
                            style: {
                                width: "100px",
                                whiteSpace: 'nowrap',
                                overflow: "hidden",
                            },
                            formatter: function () {
                                if (this.value.length > 6) {
                                    return this.value.substring(0, 10) + '...';
                                } else {
                                    var len = 6 - this.value.length;
                                    for (var i = 0; i < len - 1; i++) {
                                        this.value = "　" + this.value;
                                    }
                                }
                                return this.value;
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: '',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        },
                        lineWidth: 1,
                        visible: true,
                        showEmpty: true
                    },
                    tooltip: {
                        valueSuffix: ' '
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true,
                                allowOverlap: true
                            }
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: []
                })
            //PIE 3D
            case "pie3d":
                return $.extend(true, {}, {
                    chart: {
                        type: 'pie',
                        options3d: {
                            enabled: true,
                            alpha: 45
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    plotOptions: {
                        pie: {
                            innerSize: 160,
                            depth: 45
                        }
                    },
                    tooltip: {
                        formatter: function () {

                            return (this.y * 100).toFixed(2) + "%";
                        }
                    },
                    legend: {
                        enabled: true,
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top'
                    },
                    series: [{
                        name: '',
                        data: []
                    }]
                })
            //bar
            case "column":
                return $.extend(true, {}, {
                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: '',
                        margin: 40
                    },
                    subtitle: {
                        text: ''
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'category',
                        labels: {
                            rotation: -45,
                            style: {
                                fontSize: '13px',
                                fontFamily: 'Verdana, sans-serif'
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        allowDecimals: false,
                        title: {
                            text: ''
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    tooltip: {},
                    series: []
                })

            case "2y":
                return $.extend(true, {}, {
                    chart: {
                        zoomType: 'xy'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    legend: {
                        enabled: true,
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'top',
                        borderWidth: 0,
                        y: 30
                    },
                    yAxis: [{ // Primary yAxis
                        labels: {
                            format: '',
                            style: {
                                // color: Highcharts.getOptions().colors[0]
                            }
                        },
                        title: {
                            text: '',
                            style: {
                                // color: Highcharts.getOptions().colors[0]
                            }
                        }
                    }, { // Secondary yAxis
                        title: {
                            text: '',
                            style: {
                                // color: Highcharts.getOptions().colors[1]
                            }
                        },
                        labels: {
                            format: '',
                            style: {
                                // color: Highcharts.getOptions().colors[1]
                            }
                        },
                        opposite: true
                    }],
                    series: []
                })
            case "datetimeline":
                return $.extend(true, {}, {
                    chart: {
                        type: 'spline'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        type: 'datetime',
                        title: {
                            text: ''
                        },
                        dateTimeLabelFormats: {
                            millisecond: '%H:%M:%S.%L',
                            second: '%H:%M:%S',
                            minute: '%H:%M',
                            hour: '%H:%M',
                            day: '%m-%d',
                            week: '%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        }
                    },
                    yAxis: {
                        title: {
                            text: ''
                        },
                        min: 0
                    },
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br /><b>{point.key}</b><br>',
                        xDateFormat: '%Y-%m-%d',
                    },
                    legend: {
                        enabled: false,
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'top',
                        borderWidth: 0,
                        y: 30
                    },
                    plotOptions: {
                        spline: {
                            marker: {
                                // enabled: true
                            }
                        }
                    },

                    series: []
                })

        }
    }

    //病历数，门诊 住院
    function getCaseStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "basic.case",
                    "filter": {
                        "visitType": ["门诊","急诊"]
                    }
                },
                "2": {
                    "name": "basic.case",
                    "filter": {
                        "visitType": ["住院"]
                    }
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                var totalCase = 0;
                var total1 = (data["indicators"] && data["indicators"]["1"].value) ? data["indicators"]["1"].value : 0;
                var total2 = (data["indicators"] && data["indicators"]["2"].value) ? data["indicators"]["2"].value : 0;
                totalCase = total1 + total2;
                $("#totalCaseNum").text(formatNum(totalCase));
                $("#outPatientsCaseNum").text(formatNum(total1));
                $("#inHospCaseNum").text(formatNum(total2));
                //chart
                var charData1 = prepareCaseNumChartData(data["indicators"]["1"].values);
                var charData2 = prepareCaseNumChartData(data["indicators"]["2"].values);

                var chartObj1 = getChartBasicOption("area");
                var chartObj2 = getChartBasicOption("area");
                $.extend(true, chartObj1, menuOpt);
                $.extend(true, chartObj2, menuOpt);
                chartObj1["yAxis"]["title"]["text"] = "单位:人";
                chartObj2["yAxis"]["title"]["text"] = "单位:人";
                // chartObj1["title"]["text"] = "门急诊病历统计";
                chartObj1["title"]["text"] = "门急诊就诊记录";
                // chartObj2["title"]["text"] = "住院病历统计";
                chartObj2["title"]["text"] = "住院就诊记录";
                // charData1["color"] = "#2776B1";
                // charData2["color"] = "#F19B37";
                var color1 = "#2776B1";
                var color2 = "#F19B37";
                chartObj1["series"] = [{type: "area", color: color1, name: '门急诊病历统计', data: charData1}];
                chartObj2["series"] = [{type: "area", color: color2, name: '住院病历统计', data: charData2}];
                chartObj1["plotOptions"]["area"]["fillColor"]["stops"] = [[0, color1], [1, Highcharts.Color(color1).setOpacity(0).get('rgba')]];
                chartObj2["plotOptions"]["area"]["fillColor"]["stops"] = [[0, color2], [1, Highcharts.Color(color2).setOpacity(0).get('rgba')]];
                chartMapObj["outPatient_Case"]["indicatorsKey"]=["1"];
                chartMapObj["inHosp_Case"]["indicatorsKey"]=["2"];
                drawChart('outPatient_Case', chartObj1, queryObj, data["indicators"]["1"].values || []);
                drawChart('inHosp_Case', chartObj2, queryObj, data["indicators"]["2"].values || []);
            },
            error: function () {

            }
        })
    }

    function prepareCaseNumChartData(values) {
        //MLGB prepare data
        var pData = [];
        if (values && isArray(values)) {
            values.forEach(function (itm) {
                if (itm.d[0]) {
                    var arr = itm.d[0].split('-');
                    if (!arr[2]) {
                        arr[2] = 1;
                    }

                    var d = Date.UTC(arr[0] * 1, (arr[1] * 1 - 1), arr[2] * 1);
                    var v = itm.v ? itm.v : 0;
                    pData.push([d, v]);
                }
            })
        }
        return pData;
    }

    function drawChart(id, chartOpt, searchCondition, originalData) {
        chartMapObj[id].chartOption = chartOpt;
        chartMapObj[id].conditionObj = searchCondition;
        chartMapObj[id].originalDataObj = originalData;
       chartMapObj[id].chart = new Highcharts.Chart(id, chartOpt);

    }

    //病历详细分类数， emr 医嘱 化验单 医技报告 体温单
    function getCaseDetailStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            // dimensions:{
            //     "field":"Datetime",
            //     "interval": "month"
            // },
            indicators: {
                "1": {
                    "name": "basic.emr",
                },
                "2": {
                    "name": "basic.order",
                },
                "3": {
                    "name": "basic.lab",
                },
                "4": {
                    "name": "basic.exam",
                },
                "5": {
                    "name": "basic.vital",
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                var totalCase = 0;
                var total1 = (data["indicators"] && data["indicators"]["1"].value) ? data["indicators"]["1"].value : 0; //emr
                var total2 = (data["indicators"] && data["indicators"]["2"].value) ? data["indicators"]["2"].value : 0; //order
                var total3 = (data["indicators"] && data["indicators"]["3"].value) ? data["indicators"]["3"].value : 0; //lab
                var total4 = (data["indicators"] && data["indicators"]["4"].value) ? data["indicators"]["4"].value : 0; //report
                var total5 = (data["indicators"] && data["indicators"]["5"].value) ? data["indicators"]["5"].value : 0; //temperature
                totalCase = total1 + total2 + total3 + total4 + total5;
                $("#caseDetailTotal").html(formatNum(totalCase));
                $("#caseDetailEMR").html(formatNum(total1));
                $("#caseDetailOrder").html(formatNum(total2));
                $("#caseDetailLab").html(formatNum(total3));
                $("#caseDetailReport").html(formatNum(total4));
                $("#caseDetailTemperature").html(formatNum(total5));
                var chartObj = getChartBasicOption("datetimeline");
                $.extend(true, chartObj, menuOpt);
                var charData = [prepareCaseNumChartData(data["indicators"]["1"].values), prepareCaseNumChartData(data["indicators"]["2"].values), prepareCaseNumChartData(data["indicators"]["3"].values), prepareCaseNumChartData(data["indicators"]["4"].values), prepareCaseNumChartData(data["indicators"]["5"].values)];
                chartObj["title"]["text"] = "临床记录统计";
                chartObj["yAxis"]["title"]["text"] = "记录 (条)";
                // chartObj["yAxis"]["title"]["rotation"] = 0;
                chartObj["series"] = [];
                var colors = ["#0096FE", "#F19B37", "#604EF4", "#32BF74", "#ED728B", "#FF0044"];
                var arr = ["EMR", "医嘱", "化验单", "检查报告", "体温单"];
                for (var i = 0; i < 5; i++) {
                    chartObj["series"].push({
                        name: arr[i],
                        color: colors[i],
                        data: charData[i]
                    })
                }
                chartObj["legend"]["enabled"] = true;
                chartMapObj["clinicalInfos"]["indicatorsKey"]=["1","2","3","4","5"];
                drawChart('clinicalInfos', chartObj, queryObj, data["indicators"]);

            },
            error: function () {

            }
        })
    }

    //门急诊 住院 年龄分部情况
    function getAgeDistributeStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "basic.age",
                    "filter": {
                        "visitType":  ["门诊","急诊"]
                    }
                },
                "2": {
                    "name": "basic.age",
                    "filter": {
                        "visitType": ["住院"]
                    }
                },
                "3": {
                    "name": "basic.gender",
                    "filter": {
                        "visitType": ["门诊"]
                    }
                },
                "4": {
                    "name": "basic.gender",
                    "filter": {
                        "visitType": ["住院"]
                    }
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if (data && data.indicators) {
                    if(data && !data["indicators"]){
                        return false
                    }
                    var colors = ["#9EC1DB", "#F19B37"];
                    var data1 = data.indicators['1'].values;
                    var data2 = data.indicators['2'].values;
                    var chartData1 = {
                        name: '门急诊年龄分布',
                        data: []
                    };
                    var chartData2 = {
                        name: '住院年龄分布',
                        data: []
                    };
                    data1.forEach(function (itm) {
                        var n = itm["d"][0];
                        var v = itm["v"] ? itm["v"] : 0;
                        chartData1.data.push([
                            n, v
                        ])
                    });
                    data2.forEach(function (itm) {
                        var n = itm["d"][0];
                        var v = itm["v"] ? itm["v"] : 0;
                        chartData2.data.push([
                            n, v
                        ])
                    });

                    var chartOpt1 = getChartBasicOption('column');
                    var chartOpt2 = getChartBasicOption('column');
                    $.extend(true, chartOpt1, menuOpt);
                    $.extend(true, chartOpt2, menuOpt);
                    chartOpt1.title.text = "门急诊年龄分布";
                    chartOpt2.title.text = "住院年龄分布";
                    chartOpt1.series = [chartData1];
                    chartOpt2.series = [chartData2];
                    chartOpt1.colors = colors;
                    chartOpt2.colors = colors;
                    chartMapObj["outPatientsAgeR"]["indicatorsKey"]=["1"];
                    chartMapObj["InHospitalAgeR"]["indicatorsKey"]=["2"];
                    drawChart('outPatientsAgeR', chartOpt1, queryObj, data1);
                    drawChart('InHospitalAgeR', chartOpt2, queryObj, data2);


                    var chartOpt3 = getChartBasicOption('pie3d');
                    var chartOpt4 = getChartBasicOption('pie3d');
                    $.extend(true, chartOpt3, menuOpt);
                    $.extend(true, chartOpt4, menuOpt);
                    chartOpt3.title.text = "门急诊性别分布";
                    chartOpt4.title.text = "住院性别分布";

                    var data3 = data.indicators['3'].values || [];
                    var data4 = data.indicators['4'].values || [];
                    var chartData3 = {
                        name: '门急诊性别分布',
                        data: []
                    };
                    var chartData4 = {
                        name: '住院性别分布',
                        data: []
                    };
                    data3.forEach(function (itm) {
                        var k = itm['d'][0];
                        var v = itm['v'] ? itm['v'] : 0;
                        chartData3.data.push([k, v]);
                    });
                    data4.forEach(function (itm) {
                        var k = itm['d'][0];
                        var v = itm['v'] ? itm['v'] : 0;
                        chartData4.data.push([k, v]);
                    });
                    chartOpt3.colors = colors;
                    chartOpt4.colors = colors;
                    chartOpt3.series = [chartData3];
                    chartOpt4.series = [chartData4];
                    chartMapObj["outPatientsSex"]["indicatorsKey"]=["3"];
                    chartMapObj["InHospitalSex"]["indicatorsKey"]=["4"];
                    drawChart('outPatientsSex', chartOpt3, queryObj, data3);
                    drawChart('InHospitalSex', chartOpt4, queryObj, data4);

                }
            },
            error: function () {

            }
        })
    }

    function getTop10Statistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                //         top.disease ,top.symptom ,top.drug,top.lab,top.operation,top.exam
                //疾病
                "1": {
                    "name": "top.disease",
                    "filter": {
                        "visitType":  ["门诊","急诊"]
                    }
                },
                "2": {
                    "name": "top.disease",
                    "filter": {
                        "visitType": ["住院"]
                    }
                },//用药
                "3": {
                    "name": "top.drug",
                    "filter": {
                        "visitType":  ["门诊","急诊"]
                    }
                },
                "4": {
                    "name": "top.drug",
                    "filter": {
                        "visitType": ["住院"]
                    }
                }, //化验
                "5": {
                    "name": "top.lab",
                    "filter": {
                        "visitType":  ["门诊","急诊"]
                    }
                },
                "6": {
                    "name": "top.lab",
                    "filter": {
                        "visitType": ["住院"]
                    }
                }, //医技
                "7": {
                    "name": "top.exam",
                    "filter": {
                        "visitType":  ["门诊","急诊"]
                    }
                },
                "8": {
                    "name": "top.exam",
                    "filter": {
                        "visitType": ["住院"]
                    }
                },
                "9": {
                    "name": "top.operation"
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    var titles = ["门急诊疾病人次", "住院疾病人次", "门急诊用药人次", "住院用药人次", "门急诊化验人次", "住院化验人次", "门急诊检查人次", "住院检查人次", "住院手术人次"];
                    var i = 0;
                    for (var k in data.indicators) {
                        var chartOption = getChartBasicOption('bar');
                        $.extend(true, chartOption, menuOpt);
                        chartOption.title.text = titles[i];
                        chartOption.colors = colors;

                        var datas = data.indicators[k].values || [];
                        var dt = [], cate = [];

                        datas.forEach(function (itm) {
                            var k = itm["d"][0];
                            var v = itm["v"] ? itm["v"] : 0;
                            dt.push(v);
                            cate.push(k);
                        });
                        chartOption["xAxis"]["categories"] = cate;
                        if (dt.length == 0) {
                            chartOption["series"] = [{name: titles[i], data: [{}]}];
                        } else {
                            chartOption["series"] = [{name: titles[i], data: dt}];
                        }
                        chartMapObj["top10chart_"+i]["indicatorsKey"]=[(i+1)+""];
                        drawChart('top10chart_' + i, chartOption, queryObj, datas);
                        i++;

                    }


                }
            },
            error: function () {

            }
        })
    }

    //panel3 infos
    function getOutPatientsStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "门急诊人次"
                },
                "2": {
                    "name": "日均门急诊量"
                },
                "3": {
                    "name": "门急诊收入"
                },
                "4": {
                    "name": "门急诊日均费用"
                },
                "5": {
                    "name": "门急诊次均费用"
                }
                //inHospitalDays  住院天数
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var d1 = data.indicators['1'].value || "0";
                    var d2 = data.indicators['2'].value || "0";
                    var d3 = data.indicators['3'].value || "0";
                    var d4 = data.indicators['4'].value || "0";
                    var d5 = data.indicators['5'].value || "0";
                    //住院天数
                    $("#totalOutpatientCount").html(formatNum(d1));
                    $("#dayAverageCount").html((d2 * 1).toFixed(2));
                    $("#totalOutpatientIncome").html((d3*1/10000).toFixed(2)+"<span style='font-size: 13px;color: #a0a9b4;padding-left: 8px;'>(万元)</span>");
                    $("#dayAverageCost").html((d4 * 1).toFixed(2));
                    $("#timesAverageCost").html((d5*1).toFixed(2));
                    //住院天数
                    $("#inHospitalDays").html(0)
                }
            },
            error: function () {

            }
        })
    }

    function getOutPatientsChartStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "门急诊人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                },
                "2": {
                    "name": "门急诊收入",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                }
            //    次均费用
                ,
                "3": {
                    "name": "门急诊次均费用",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    // var titles = ["门急诊人次", "门急诊收入"];

                    var v1 = (data["indicators"]["1"] &&data["indicators"]["1"].values) || [];
                    var v2 = (data["indicators"]["2"] && data["indicators"]["2"].values) || [];
                    var v3 = (data["indicators"]["3"] &&data["indicators"]["3"].values) || [];
                    var chartObj1 = getChartBasicOption("datetimeline");
                    var chartObj2 = getChartBasicOption("datetimeline");
                    var chartObj3 = getChartBasicOption("datetimeline");

                    $.extend(true, chartObj1, menuOpt);
                    $.extend(true, chartObj2, menuOpt);
                    $.extend(true, chartObj3, menuOpt);

                    chartObj1["title"]["text"] = "门急诊人次";
                    chartObj2["title"]["text"] = "门急诊收入";
                    chartObj3["title"]["text"] = "门急诊次均费用";

                    chartObj1.colors = colors;
                    chartObj2.colors = colors;
                    chartObj3.colors = colors;

                    chartObj1["series"] = [{
                        name: "门急诊人次",
                        data: prepareCaseNumChartData(v1)
                    }];
                    chartObj2["series"] = [{
                        name: "门急诊收入",
                        data: prepareCaseNumChartData(v2)
                    }];
                    chartObj3["series"] = [{
                        name: "门急诊次均费用",
                        data: prepareCaseNumChartData(v3)
                    }];
                    chartMapObj["outPatientsTotalTimes"]["indicatorsKey"]=["1"];
                    chartMapObj["outPatientsTotalIncome"]["indicatorsKey"]=["2"];
                    chartMapObj["outPatientsCostPerTimes"]["indicatorsKey"]=["3"];

                    drawChart('outPatientsTotalTimes', chartObj1, queryObj, v1);
                    drawChart('outPatientsTotalIncome', chartObj2, queryObj, v2);
                    drawChart('outPatientsCostPerTimes', chartObj3, queryObj, v3);
                }
            },
            error: function () {

            }
        })
    }

    //panel4 infos
    function getInHospitalStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "出院人次"
                },
                "2": {
                    "name": "日均出院人次"
                },
                "3": {
                    "name": "出院收入"
                },
                "4": {
                    "name": "出院日均费用"
                },
                "5": {
                    "name": "出院次均费用"
                },
                "6": {
                    "name": "住院天数"
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var d1 = data.indicators['1'].value || "0";
                    var d2 = data.indicators['2'].value || "0";
                    var d3 = data.indicators['3'].value || "0";
                    var d4 = data.indicators['4'].value || "0";
                    var d5 = data.indicators['5'].value || "0";
                    var d6 = data.indicators['6'].value || "0";
                    $("#totalLeaveHospCount").html(formatNum(d1));
                    $("#dayLeaveHospCount").html((d2 * 1).toFixed(2));
                    $("#totalInHospitalIncome").html((d3*1/10000).toFixed(2)+"<span style='font-size: 13px;color: #a0a9b4;padding-left: 8px'>(万元)</span>");
                    $("#dayAverageInHospitalCost").html((d4 * 1).toFixed(2));
                    $("#timesAverageInHospitalCost").html((d5 * 1).toFixed(2));
                    $("#inHospitalDays").html(formatNum(d6 * 1));
                }
            },
            error: function () {

            }
        })
    }

    function getInHospitalChartStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "出院人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "2": {
                    "name": "出院收入",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "3": {
                    "name": "出院次均费用",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    var v1 = (data["indicators"]["1"] && data["indicators"]["1"].values) || [];
                    var v2 = (data["indicators"]["2"] && data["indicators"]["2"].values) || [];
                    var v3 = (data["indicators"]["3"] && data["indicators"]["3"].values) || [];
                    var chartObj1 = getChartBasicOption("datetimeline");
                    var chartObj2 = getChartBasicOption("datetimeline");
                    var chartObj3 = getChartBasicOption("datetimeline");
                    $.extend(true, chartObj1, menuOpt);
                    $.extend(true, chartObj2, menuOpt);
                    $.extend(true, chartObj3, menuOpt);

                    chartObj1["title"]["text"] = "出院人次";
                    chartObj2["title"]["text"] = "出院费用";
                    chartObj3["title"]["text"] = "出院次均费用";

                    chartObj1.colors = colors;
                    chartObj2.colors = colors;
                    chartObj3.colors = colors;
                    chartObj1["series"] = [{
                        name: "出院人次",
                        data: prepareCaseNumChartData(v1)
                    }];
                    chartObj1["tooltip"] = {
                        headerFormat: '<b>{series.name}</b><br /><b>{point.key}</b><br>',
                        xDateFormat: '%Y-%m',
                    };
                    chartObj2["series"] = [{
                        name: "出院费用",
                        data: prepareCaseNumChartData(v2)
                    }];
                    chartObj2["tooltip"] = {
                        headerFormat: '<b>{series.name}</b><br /><b>{point.key}</b><br>',
                        xDateFormat: '%Y-%m',
                    };
                    chartObj3["series"] = [{
                        name: "出院次均费用",
                        data: prepareCaseNumChartData(v3)
                    }];
                    chartObj3["tooltip"] = {
                        headerFormat: '<b>{series.name}</b><br /><b>{point.key}</b><br>',
                        xDateFormat: '%Y-%m',
                    };
                    chartMapObj["inhospitalTotalTimes"]["indicatorsKey"]=["1"];
                    chartMapObj["inhospitalTotalIncome"]["indicatorsKey"]=["2"];
                    drawChart('inhospitalTotalTimes', chartObj1, queryObj, v1);
                    drawChart('inhospitalTotalIncome', chartObj2, queryObj, v2);
                    drawChart('costsPerOutOfHospital', chartObj3, queryObj, v3);
                }
            },
            error: function () {

            }
        })
    }

    //医技
    function getMedicalTeachStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "CT人次"
                },
                "2": {
                    "name": "核磁人次"
                },
                "3": {
                    "name": "B超人次"
                },
                "4": {
                    "name": "化验人次"
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var d1 = data.indicators['1'].value || "0";
                    var d2 = data.indicators['2'].value || "0";
                    var d3 = data.indicators['3'].value || "0";
                    var d4 = data.indicators['4'].value || "0";
                    $("#CTTotalCount").html(formatNum(d1));
                    $("#NMRCount").html(formatNum(d2));
                    $("#BCount").html(formatNum(d3));
                    $("#labCount").html(formatNum(d4));
                }
            },
            error: function () {

            }
        })
    }

    function getMedicalTeachChartStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "CT人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                },
                "2": {
                    "name": "核磁人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                },
                "3": {
                    "name": "B超人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                },
                "4": {
                    "name": "化验人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "day"
                        }
                    ]
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    var v1 = data["indicators"]["1"].values || [];
                    var v2 = data["indicators"]["2"].values || [];
                    var v3 = data["indicators"]["2"].values || [];
                    var v4 = data["indicators"]["2"].values || [];
                    var chartObj1 = getChartBasicOption("datetimeline");
                    var chartObj2 = getChartBasicOption("datetimeline");
                    var chartObj3 = getChartBasicOption("datetimeline");
                    var chartObj4 = getChartBasicOption("datetimeline");
                    $.extend(true, chartObj1, menuOpt);
                    $.extend(true, chartObj2, menuOpt);
                    $.extend(true, chartObj3, menuOpt);
                    $.extend(true, chartObj4, menuOpt);
                    chartObj1["title"]["text"] = "CT人次";
                    chartObj2["title"]["text"] = "核磁人次";
                    chartObj3["title"]["text"] = "B超人次";
                    chartObj4["title"]["text"] = "化验人次";
                    chartObj1.colors = colors;
                    chartObj2.colors = colors;
                    chartObj3.colors = colors;
                    chartObj4.colors = colors;
                    chartObj1["series"] = [{
                        name: "CT医技人次",
                        data: prepareCaseNumChartData(v1)
                    }];
                    chartObj2["series"] = [{
                        name: "核磁医技人次",
                        data: prepareCaseNumChartData(v2)
                    }];
                    chartObj3["series"] = [{
                        name: "B超医技人次",
                        data: prepareCaseNumChartData(v3)
                    }];
                    chartObj4["series"] = [{
                        name: "化验人次",
                        data: prepareCaseNumChartData(v4)
                    }];
                    chartMapObj["CT_times"]["indicatorsKey"]=["1"];
                    chartMapObj["NMR_times"]["indicatorsKey"]=["2"];
                    chartMapObj["B_times"]["indicatorsKey"]=["3"];
                    chartMapObj["lab_times"]["indicatorsKey"]=["4"];

                    drawChart('CT_times', chartObj1, queryObj, v1);
                    drawChart('NMR_times', chartObj2, queryObj, v2);
                    drawChart('B_times', chartObj3, queryObj, v3);
                    drawChart('lab_times', chartObj4, queryObj, v4);
                }
            },
            error: function () {

            }
        })
    }

    //手术
    function getOperateStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "手术人数"
                },
                "2": {
                    "name": "手术占比"
                },
                "3": {
                    "name": "出院人次"
                },
                "4": {
                    "name": "手术人次"
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var d1 = data.indicators['1'].value || "0";
                    var d2 = data.indicators['2'].value || "0";
                    var d3 = data.indicators['3'].value || "0";
                    var d4 = data.indicators['4'].value || "0";
                    $("#totalOperateCount").html(formatNum(d1));
                    $("#operatePercent").html((d2 * 100).toFixed(2) + "%");
                    $("#timesOperate").html(formatNum(d4));
                    $("#counts4OutOfHospital").html(formatNum(d3));
                }
            },
            error: function () {

            }
        })
    }

    function getOperateChartStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "手术人数",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "2": {
                    "name": "手术占比",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "3": {
                    "name": "手术级别人次",
                    "dimensions": [
                        {
                            "field": "Entity"
                        }
                    ]
                },
                "4": {
                    "name": "手术切口人次",
                    "dimensions": [
                        {
                            "field": "Entity"
                        }
                    ]
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    var v1 = data["indicators"]["1"].values || [];
                    var v2 = data["indicators"]["2"].values || [];
                    var v3 = data["indicators"]["3"].values || [];
                    var v4 = data["indicators"]["4"].values || [];
                    var chartObj1 = getChartBasicOption("2y");
                    var chartObj2 = getChartBasicOption("pie3d");
                    var chartObj3 = getChartBasicOption("pie3d");
                    $.extend(true, chartObj1, menuOpt);
                    $.extend(true, chartObj2, menuOpt);
                    $.extend(true, chartObj3, menuOpt);
                    chartObj1["title"]["text"] = "手术人数/占比";
                    chartObj2["title"]["text"] = "手术分级";
                    chartObj3["title"]["text"] = "手术切口";
                    chartObj2["tooltip"]["formatter"] = function () {
                        return this.y;
                    };
                    chartObj3["tooltip"]["formatter"] = function () {
                        return this.y;
                    };
                    chartObj1.colors = ["#9EC1DB", "#F19B37"];
                    chartObj2.colors = colors;
                    chartObj3.colors = colors;
                    chartObj1["series"] = [
                        {
                            name: "手术人数",
                            type: "column",
                            yAxis: 1,
                            data: prepareCaseNumChartData(v1),
                            tooltip: {
                                xDateFormat: '%Y-%m',
                            }
                        },
                        {

                            name: "手术占比",
                            data: prepareCaseNumChartData(v2),
                            tooltip: {
                                pointFormatter: function () {
                                    return this.series.name + ":" + (this.y * 100).toFixed(2) + "%"
                                },
                                xDateFormat: '%Y-%m',
                            }
                        }];
                    chartObj1["yAxis"] = [{ // Primary yAxis
                        labels: {
                            style: {},
                            formatter: function () {
                                return (this.value * 100).toFixed(2) + "%"
                            }
                        },
                        title: {
                            text: '手术占比',
                            style: {}
                        },
                        opposite: true
                    }, { // Secondary yAxis
                        title: {
                            text: '手术人次',
                            style: {}
                        },
                        labels: {
                            format: '{value}',
                            style: {}
                        },
                    }];

                    var sV3 = {
                        name: "手术分级",
                        data: []
                    };
                    v3.forEach(function (itm) {
                        var k, v;
                        k = itm['d'][0];
                        v = itm['v'] ? itm['v'] : 0;
                        sV3["data"].push([k, v]);
                    });
                    var sV4 = {
                        name: "手术切口",
                        data: []
                    }

                    v4.forEach(function (itm) {
                        var k, v;
                        k = itm['d'][0];
                        v = itm['v'] ? itm['v'] : 0;
                        sV4["data"].push([k, v]);
                    });
                    chartObj2["series"] = [sV3];
                    chartObj3["series"] = [sV4];
                    chartMapObj["operateNumPercent"]["indicatorsKey"]=["1","2"];
                    chartMapObj["operateLevel"]["indicatorsKey"]=["3"];
                    chartMapObj["operateIncision"]["indicatorsKey"]=["4"];

                    drawChart('operateNumPercent', chartObj1, queryObj, [v1, v2]);
                    drawChart('operateLevel', chartObj2, queryObj, v3);
                    drawChart('operateIncision', chartObj3, queryObj, v4);
                }
            },
            error: function () {

            }
        })
    }

    //医疗质量
    function getQualityChartStatistic(st, ed) {
        var that = this;
        var queryObj = {
            filter: {
                startTime: st,
                endTime: ed
            },
            indicators: {
                "1": {
                    "name": "平均住院日",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "2": {
                    "name": "住院大于30天人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "3": {
                    "name": "住院大于30天人次占比",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "4": {
                    "name": "7日内再入院人次",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "5": {
                    "name": "7日内再入院人次占比",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "6": {
                    "name": "死亡人数",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                },
                "7": {
                    "name": "死亡率",
                    "dimensions": [
                        {
                            "field": "Datetime",
                            "interval": "month"
                        }
                    ]
                }
            }
        };
        $.ajax({
            url: "/_/hosp/bi/stats/indicator/batch",
            type: "POST",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(queryObj),
            beforeSend: function () {
                if (that && that.panel) {
                    biShowWatting(that.panel);
                }
            },
            complete: function () {
                if (that && that.panel) {
                    biHideWatting(that.panel);
                }
            },
            success: function (data) {
                if(data && !data["indicators"]){
                    return false
                }
                if (data && data.indicators) {
                    var colors = ["#9EC1DB", "#F19B37", "#604EF4", "#32BF74", "#FF0044", "#ed8261", "#64c8b2", "#c97bc0", "#93cb6b", "#7caade"];
                    var v1 = data["indicators"]["1"].values || [];

                    var v2 = data["indicators"]["2"].values || [];
                    var v3 = data["indicators"]["3"].values || [];

                    var v4 = data["indicators"]["4"].values || [];
                    var v5 = data["indicators"]["5"].values || [];

                    var v6 = data["indicators"]["6"].values || [];
                    var v7 = data["indicators"]["7"].values || [];

                    var chartObj1 = getChartBasicOption("datetimeline");
                    var chartObj2 = getChartBasicOption("2y");
                    var chartObj3 = getChartBasicOption("2y");
                    var chartObj4 = getChartBasicOption("2y");
                    $.extend(true, chartObj1, menuOpt);
                    $.extend(true, chartObj2, menuOpt);
                    $.extend(true, chartObj3, menuOpt);
                    $.extend(true, chartObj4, menuOpt);

                    chartObj1["title"]["text"] = "平均住院日";
                    chartObj2["title"]["text"] = "住院>30天人次/占比";
                    chartObj3["title"]["text"] = "7日内再入院人次/占比";
                    chartObj4["title"]["text"] = "住院死亡人数/死亡率";
                    chartObj1.colors = colors;
                    chartObj2.colors = ["#9EC1DB", "#F19B37"];
                    chartObj3.colors = ["#9EC1DB", "#F19B37"];
                    chartObj4.colors = ["#9EC1DB", "#F19B37"];

                    chartObj1["series"] = [{
                        name: "平均住院日",
                        data: prepareCaseNumChartData(v1)
                    }];
                    chartObj1["tooltip"] = {
                        headerFormat: '<b>{series.name}</b><br /><b>{point.key}</b><br>',
                        xDateFormat: '%Y-%m',
                    };
                    chartObj2["series"] = [
                        {
                            type: "column",
                            name: "住院>30天人次",
                            tooltip: {
                                xDateFormat: '%Y-%m',
                            },
                            data: prepareCaseNumChartData(v2)
                        },
                        {

                            name: "住院>30天占比",
                            yAxis: 1,
                            data: prepareCaseNumChartData(v3),
                            tooltip: {
                                pointFormatter: function () {
                                    return this.series.name + ":" + (this.y * 100).toFixed(2) + "%"
                                },
                                xDateFormat: '%Y-%m',
                            }
                        }
                    ];
                    chartObj2["yAxis"] = [{ // Primary yAxis
                        title: {
                            text: '住院>30天人次',
                            style: {}
                        },
                        labels: {
                            format: '{value}',
                            style: {}
                        }
                    }, { // Secondary yAxis
                        labels: {
                            style: {},
                            formatter: function () {
                                return (this.value * 100).toFixed(2) + "%"
                            }
                        },
                        title: {
                            text: '住院>30天占比',
                            style: {}
                        },
                        opposite: true
                    }];
                    chartObj3["series"] = [
                        {
                            type: "column",
                            name: "7日内再入院人次",
                            tooltip: {
                                xDateFormat: '%Y-%m',
                            },
                            data: prepareCaseNumChartData(v4)
                        },
                        {

                            name: "7日内再入院人次占比",
                            yAxis: 1,
                            data: prepareCaseNumChartData(v5),
                            tooltip: {
                                pointFormatter: function () {
                                    return this.series.name + ":" + (this.y * 100).toFixed(2) + "%"
                                },
                                xDateFormat: '%Y-%m',
                            }
                        }
                    ];
                    chartObj3["yAxis"] = [{ // Primary yAxis
                        title: {
                            text: '7日内再入院人次',
                            style: {}
                        },
                        labels: {
                            format: '{value}',
                            style: {}
                        }
                    }, { // Secondary yAxis
                        labels: {
                            style: {},
                            formatter: function () {
                                return (this.value * 100).toFixed(2) + "%"
                            }
                        },
                        title: {
                            text: '7日内再入院人次占比',
                            style: {}
                        },
                        opposite: true
                    }];
                    chartObj4["series"] = [
                        {
                            type: "column",
                            name: "死亡人数",
                            tooltip: {
                                xDateFormat: '%Y-%m',
                            },
                            data: prepareCaseNumChartData(v6)
                        },
                        {

                            name: "死亡率",
                            yAxis: 1,
                            data: prepareCaseNumChartData(v7),
                            tooltip: {
                                pointFormatter: function () {
                                    return this.series.name + ":" + (this.y * 100).toFixed(2) + "%"
                                },
                                xDateFormat: '%Y-%m',
                            }
                        }
                    ];
                    chartObj4["yAxis"] = [{ // Primary yAxis
                        title: {
                            text: '死亡人数',
                            style: {}
                        },
                        labels: {
                            format: '{value}',
                            style: {}
                        }
                    }, { // Secondary yAxis
                        labels: {
                            style: {},
                            formatter: function () {
                                return (this.value * 100).toFixed(2) + "%"
                            }
                        },
                        title: {
                            text: '死亡率',
                            style: {}
                        },
                        opposite: true
                    }];

                    chartMapObj["p7_1"]["indicatorsKey"]=["1"];
                    chartMapObj["p7_2"]["indicatorsKey"]=["2","3"];
                    chartMapObj["p7_3"]["indicatorsKey"]=["4","5"];
                    chartMapObj["p7_4"]["indicatorsKey"]=["6","7"];

                    drawChart('p7_1', chartObj1, queryObj, v1);
                    drawChart('p7_2', chartObj2, queryObj, [v2, v3]);
                    drawChart('p7_3', chartObj3, queryObj, [v4, v5]);
                    drawChart('p7_4', chartObj4, queryObj, [v6, v7]);
                }
            },
            error: function () {

            }
        })
    }

    function biShowWatting(block) {
        block.find(".bi-panel-wattingfor-mask").show();
        block.find(".bi-panel-wattingfor").show();
    }

    function biHideWatting(block) {
        block.find(".bi-panel-wattingfor-mask").hide();
        block.find(".bi-panel-wattingfor").hide();
    }

    //这里是日期联动的关键
    function endDates(input, end) {
        //将结束日期的事件改成 false 即可
        end.trigger = false;
        input.jeDate(end);
    }

    function getTableDataByKey(key) {
        var tbody = '';
        var datas = chartMapObj[key]["originalDataObj"];
        switch (key) {
            case "outPatient_Case":
            case "inHosp_Case":

            case "outPatientsTotalTimes":
            case "outPatientsTotalIncome":

            case "inhospitalTotalTimes":
            case "inhospitalTotalIncome":

            case "CT_times":
            case "NMR_times":
            case "B_times":
            case "lab_times":

            case "p7_1":


                tbody += "<tr><th style='text-align: center'>时间</th><th style='text-align: center'>值</th></tr>"
                for (var i = 0, len = datas.length; i < len; i++) {
                    tbody += "<tr><td>" + datas[i]["d"][0] + "</td><td>" + (datas[i]["v"] ? datas[i]["v"] : 0) + "</td></tr>";
                }
                return tbody;
            case "clinicalInfos":
                tbody += "<tr><th style='text-align: center'>时间</th>" + (function () {
                        var arr = ["EMR", "医嘱", "化验单", "检查报告", "体温单"];
                        var thArr = [];
                        arr.forEach(function (itm) {
                            thArr.push("<th style='text-align: center'>" + itm + "</th>");
                        });
                        return thArr.join("");
                    })() + "</tr>";
                var datas = chartMapObj[key]["originalDataObj"];
                for (var i = 0, len = datas["1"]["values"].length; i < len; i++) {
                    tbody += "<tr>";
                    for (var j = 0; j < 6; j++) {
                        if (j == 0) {
                            tbody += "<td>" + datas["1"]["values"][i]["d"][0] + "</td>";
                        } else {
                            tbody += "<td>" + (datas[j]["values"][i].v ? datas[j]["values"][i].v : 0) + "</td>";
                        }

                    }
                    tbody += "</tr>";
                }

                return tbody;
            case "outPatientsAgeR":
            case "InHospitalAgeR":
            case "outPatientsSex":
            case "InHospitalSex":

            case "operateLevel":
            case "operateIncision":

                tbody += "<tr><th style='text-align: center'>分类</th><th style='text-align: center'>值</th></tr>";
                var datas = chartMapObj[key]["originalDataObj"];
                for (var i = 0, len = datas.length; i < len; i++) {
                    tbody += "<tr><td>" + datas[i]["d"][0] + "</td><td>" + (datas[i]["v"] ? datas[i]["v"] : "0") + "</td></tr>";
                }
                return tbody;
            case "top10chart_0":
            case "top10chart_1":
            case "top10chart_2":
            case "top10chart_3":
            case "top10chart_4":
            case "top10chart_5":
            case "top10chart_6":
            case "top10chart_7":
            case "top10chart_8":
                var datas = chartMapObj[key]["originalDataObj"];
                tbody+="<tr><th style='text-align: center'>分类</th><th style='text-align: center'>值</th></tr>";
                for (var i = 0, len = datas.length; i < len; i++) {
                    tbody += "<tr><td>" + datas[i]["d"][0] + "</td><td>" + (datas[i]["v"] ? datas[i]["v"] : "0") + "</td></tr>";
                }
                return tbody;
            case "operateNumPercent":
            case "p7_2":
            case "p7_3":
            case "p7_4":
                var datas = chartMapObj[key]["originalDataObj"];
                tbody += "<tr><th style='text-align: center'>日期</th><th style='text-align: center'>数量</th><th style='text-align: center'>占比</th></tr>";
                for (var i = 0, len = datas[0].length; i < len; i++) {
                    // tbody+="<tr><td>"+datas[0][i]["d"][0]+"</td><td>"+(datas[0][i]["v"]?datas[0][i]["v"]:"0")+"</td><td>"+(datas[1][i]["v"]?(datas[1][i]["v"]*100).toFixed(2):"0")+"%</td></tr>";
                    tbody += "<tr><td>" + datas[0][i]["d"][0] + "</td><td>" + (datas[0][i]["v"] ? datas[0][i]["v"] : "0") + "</td><td>" + (datas[1][i]["v"] ? (datas[1][i]["v"]) : "0") + "</td></tr>";
                }
                return tbody;

        }
        return '<tr><td>无数据</td></tr>'
    }

    function exportCSV(key) {
        var queryObj  ={
            "indicators":{}
        };
        $.extend(true,queryObj,{filter:chartMapObj[key]["conditionObj"].filter});
        var indicatorsKey = chartMapObj[key]["indicatorsKey"];
        if(indicatorsKey && isArray(indicatorsKey) && indicatorsKey.length>0){
            for(var i=0,len=indicatorsKey.length;i<len;i++){
                queryObj["indicators"][indicatorsKey[i]] = chartMapObj[key]["conditionObj"]["indicators"][indicatorsKey[i]];
            }
        }
        $("#formJsonData").val(JSON.stringify(queryObj));
        document.forms["downloadForm"].submit();
    }

    function __getLastDayByMMDD(val) {
        var month = (val.match(/\/\d+$/g))[0].replace('/',"")*1;
        var year = (val.match(/^\d{4}/g))[0].replace('/',"")*1;
        var lastDay;
        var today = new moment();
        if(today.get("month")+1==month && year==today.get("year")){
            lastDay = today.subtract(1,"day").get("date");
        }else {
            lastDay = new moment(val,"YYYY/MM").endOf("month").get("date");
        }
        return lastDay;
    }

})