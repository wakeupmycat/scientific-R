/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    //wait for
    var wt = new waitfor();
    var __id = getQueryString('_id'), _age;
    var PID = getQueryString('pid'); //获取patiend id  from other app link jump
    var __iscase = getQueryString('__iscase');
    var __idcode = getQueryString('idcode');
    if (!__id && (PID || __idcode)) {
        getAllCase(PID, true);
    }
    //limited-uesr
    var patientId;
    var timeLineData = {};
    var drugstat = {};
    var wikiKeys = {};
    var timeLineMap = {
        "emr.admit": "record",
        "emr.discharge": "record",
        "emr.progress": "record",
        "emr.operate": "record",
        "emr.other": "record",
        "vital": "medical-sign",
        "diagnosis": "diagnosis",
        "lab": "chemical",
        "exam": "inspect",
        "order": "advice",
    };
    var _arr = ['diagnosis', 'vital', 'lab', 'exam', 'order', 'admit', 'discharge', 'progress', 'operate', 'other'];//诊断 体征 化验 检查 医嘱 入院记录 出院记录 病程记录 手术操作记录 其它记录
    var timeLineType = ['advice', 'chemical', 'medical-sign', 'inspect', 'diagnosis', 'record']; //医嘱 化验 体征 检查 诊断 记录
    var templateStr = getItemBlockTpl();
    var VitalData = [], MedicineData = [], LabData = [];
    window.emrIframeHtmlMap = {};
    var chartObj = Highcharts.chart('container0', {
        title: {text: null},
        subtitle: {text: null},
        xAxis: {},
        credits: {enabled: false},
        series: [{}]
    });

    toggleRightPanel(false);
    getTimelineData(__id);


    //===============event regist =====================
    $("#detail-filterbar").scrollToFixed();
    $("#rightPanel").scrollToFixed({
        marginTop: 78,
        zIndex: 20
    });
    //check box changer
    $(".bdmd-checker input").on("change", function (e) {
        e = e || window.event;
        var isCheck = $(this).is(":checked");
        var $this = $(this);
        var checkVal = $this.val();
        if (checkVal !== 'all') {
            if (isCheck) {
                $this.parent().removeClass('checked').removeClass('unchecked').addClass('checked');
            } else {
                $this.parent().removeClass('checked').removeClass('unchecked').addClass('unchecked');
            }
            if ($("#detail-filterbar input.subcheck:checked").length == 10) {
                $("#all").prop("checked", true);
                $("#all").parent().removeClass('unchecked');
                $("#all").parent().removeClass('half-checked');
                $("#all").parent().addClass('checked');
            } else if ($("#detail-filterbar input.subcheck:checked").length == 0) {
                $("#all").prop("checked", false);
                $("#all").parent().removeClass('checked');
                $("#all").parent().removeClass('half-checked');
                $("#all").parent().addClass('unchecked');
            } else {
                $("#all").prop("checked", false);
                // $("#all").attr("data-halfcheck",true);
                $("#all").parent().removeClass('checked');
                $("#all").parent().removeClass('unchecked');
                $("#all").parent().addClass('half-checked');
            }
        } else {
            //all
            if (isCheck) {
                $("#all").prop("checked", true);
                // $("#all").attr("data-halfcheck",false);
                $("#all").parent().removeClass('half-checked');
                $("#all").parent().removeClass('unchecked');
                $("#all").parent().addClass('checked');
                $("#detail-filterbar input.subcheck").prop('checked', true);
                $("#detail-filterbar input.subcheck").parent().removeClass('checked').removeClass('unchecked').addClass('checked');
            } else {
                $("#all").prop("checked", false);
                // $("#all").attr("data-halfcheck",false);
                $("#all").parent().removeClass('half-checked');
                $("#all").parent().removeClass('checked');
                $("#all").parent().addClass('unchecked');
                $("#detail-filterbar input.subcheck").prop('checked', false);
                $("#detail-filterbar input.subcheck").parent().removeClass('checked').removeClass('unchecked').addClass('unchecked');
            }
            // $(".subcheck").each(function (i, itm) {
            //     $(itm).trigger('change');
            // })
            //get check box status
            var filterData = getFilterDataFromCheckState();
            wt.show();
            drawTimeline(filterData, wikiKeys, wt)

        }

    });

    $(".container-fluid").on("click", ".show-more", function (e) {
        var tg = $(this).attr('data-target');
        var $this = $(this);
        var isMore = $this.hasClass('more');
        if (tg == "basic") {
            _buildBasicinfo(timeLineData['basic'], !isMore);
            if (isMore) {
                $this.removeClass('more');
                $this.find('.txt').text('展开');
            } else {
                $this.addClass('more');
                $this.find('.txt').text('收起');
            }
        } else {
            var itmBlock = $this.parents(".item-block");
            if (isMore) {
                $this.removeClass('more');
                $this.find('.txt').text('展开');
                $('.timeline-block-infos', itmBlock).hide();
                // $('.timeline-detail-info',itmBlock).show();
                $('.timeline-summary-info', itmBlock).show();
                $('.item-body', itmBlock).css({height: '108px'});

            } else {
                $this.addClass('more');
                $this.find('.txt').text('收起');
                $('.timeline-block-infos', itmBlock).hide();
                $('.timeline-detail-info', itmBlock).show();
                // $('.timeline-summary-info',itmBlock).show();
                $('.item-body', itmBlock).css({height: 'auto', overflow: 'hidden'});
                var hasIframe = $('.timeline-detail-info iframe', itmBlock).length > 0;
                if (hasIframe) {
                    var fm = $('.timeline-detail-info iframe', itmBlock);
                    if (window.attachEvent) {
                        fm.height(fm.get(0).contentWindow.document.documentElement.scrollHeight);
                    } else {
                        fm.height(fm.get(0).contentDocument.body.scrollHeight);
                    }
                }

            }
        }
    });
    $("#closeRightPanel").on("click", function (e) {
        toggleRightPanel(false);
    })
    //button show all
    $("#showAllCase").on("click", function (e) {
        toggleRightPanel(true, '病人全部病历');
        if (patientId) {
            getAllCase(patientId);
        }
    })
    //button show similar
    $("#showSimillar").on("click", function (e) {
        toggleRightPanel(true, '病人相似病历');
        if (__id) {
            getSimilarCase(__id);
        }
    })
    //show chart
    $("#left-medical-records").on("click", ".show-chart", function (e) {
        var $this = $(this);
        var ty = $this.attr('data-type');
        var dt = $this.attr('data-title');
        showChartData(ty, dt);
    });
    //show wiki
    $("#left-medical-records").on("click", ".show-wiki", function (e) {
        var $this = $(this);
        var dt = $this.attr('data-title');
        getWiki(dt)
    });
    //order filter
    $("#left-medical-records").on("change", ".checkfilter", function (e) {
        e = e || window.event;
        var $this = $(this);
        var typ = $this.attr("name");
        var st = $this.is(":checked");
        if (st == true) {
            $this.parents(".detail-info").find(".content tr." + typ).show();
        } else{
            $this.parents(".detail-info").find(".content tr." + typ).hide()
        }
        var isLS = $this.parents(".header-order").find("input[name='ls']").is(":checked");
        if(isLS && st){
            $this.parents(".detail-info").find(".content tr." + typ+".ls").show();
        }else {
            $this.parents(".detail-info").find(".content tr." + typ+".ls").hide();
        }
    })

    $("#left-medical-records").on("change", ".ls-checkfilter", function (e) {
        e = e || window.event;
        var $this = $(this);
        var typ = $this.attr("name");
        var st = $this.is(":checked"); //ls checked
        var pt = $this.parents('.header-order')
        $this.parents(".detail-info").find(".content tr.ls").each(function (idx,itm) {
               var ty = $.trim(itm.className.replace(/ls/g,''));
              var isC= pt.find("input[name='"+ty+"']").is(":checked");
              if(isC && st){
                  $(itm).show()
              }else {
                  $(itm).hide()
              }
        })

    })




    //check box change toggle display
    $(".subcheck").on("change", function (e) {
        e = e || window.event;
        var $this = $(this);
        //wt.show();
        var filterData = getFilterDataFromCheckState();
        wt.show();
        drawTimeline(filterData, wikiKeys, wt)
        // var isChecked = $this.is(":checked");
        // var ty = $this.val();
        // if (isChecked) {
        //     $("body .item-block[data-type-backend='" + ty + "']").show();
        // } else {
        //     $("body .item-block[data-type-backend='" + ty + "']").hide();
        // }
        //
        // $("#timelineContainer>.time-item").each(function (i, itm) {
        //     if ($(".item-block:visible", $(itm)).length == 0) {
        //         $(".time-banner", $(itm)).hide();
        //     } else {
        //         $(".time-banner", $(itm)).show();
        //     }
        // })

    })


    //================function define ==================
    function getFilterDataFromCheckState() {
        var chked = $(".subcheck:checked");
        var keys = [];
        var filterDatas = [];
        if (chked.length == 0) {
            return filterDatas;
        }
        for (var i = 0, len = chked.length; i < len; i++) {
            keys.push($(chked[i]).val());
        }

        for (var j = 0, jlen = timeLineData['timeline'].length; j < jlen; j++) {
            var evts = [], prevEvts = timeLineData['timeline'][j].events;
            for (var k = 0, klen = prevEvts.length; k < klen; k++) {
                var tp = prevEvts[k].type;
                if (keys.indexOf(tp.replace('emr.', '')) >= 0) {
                    evts.push(prevEvts[k])
                }
            }
            if (evts.length > 0) {
                filterDatas.push({events: evts, time: timeLineData['timeline'][j].time});
            }
        }

        return filterDatas;
    }

    function getItemBlockTpl() {
        var tpl = '';
        $.ajax({
            url: '/assets/tpl/itemBlock.html',
            async: false,
            type: 'GET',
            success: function (d) {
                tpl = d;
            }
        });
        return tpl;
    }

    function getTimelineData(_id) {
        if(!_id){
            return false;
        }
        $.ajax({
            type: 'GET',
            // url: '/_/v1/case/timeline?id=' + _id,
            url: '/_/hosp/case/timeline?id=' + _id,
            dataType: 'json',
            beforeSend: function () {
                wt.show();
            },
            success: function (datas) {
                if (datas) {
                    timeLineData = datas;
                    _buildBasicinfo(timeLineData['basic'], false);
                    wikiKeys = timeLineData['wikiKeys'];
                    drugstat = timeLineData['drugstat'];
                    drawTimeline(timeLineData['timeline'], wikiKeys);

                } else {
                    return null;
                }
            },
            error: function (XMLHttpRequest) {
                //alert("error");
                getSimpleNotify('获取病历信息失败')
            },
            complete: function () {
                wt.hide();
            }
        });
    }

    function toggleRightPanel(st, title) {
        if (title) {
            $("#rightTitle").text(title);
        }
        if (st) {
            $("#right-medical-contrast").show();
            $("#left-medical-records").css({width: '680px'});
            $(window).resize();
        } else {
            $("#right-medical-contrast").hide();
            $("#left-medical-records").css({width: '100%'});
        }
    }

    //全部病历
    function getAllCase(_id, notAsync) {
        var params = {
            id: _id,
            size: 2000
        };
        if (__idcode) {
            params['idCode'] = __idcode;
        }
        params = JSON.stringify(params);
        $.ajax({
            type: 'POST',
            async: !notAsync,
            url: '/_/hosp/search/case/patient',
            data: params,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.total > 0 && !notAsync) {
                    _renderAllCaseContent(data);
                } else {
                    __id = data.items[0]["case"].id;
                    __iscase = true;
                }
            }
        });
    }

    function _renderAllCaseContent(data) {
        if (data) {
            var items = data.items;
            var fieldArr = [];
            if (items) {
                for (var i = 0, len = items.length; i < len; i++) {
                    var item = items[i];
                    var _disease = [];
                    var hType = item["case"].visitType.substring(0, 1);
                    var hName = item["case"].hospital;
                    var hTime = new moment(item["case"].admitTime).format('YYYY-MM-DD');
                    var hTitle = "<span class='info-item'>" + (item["case"].gender ? item["case"].gender : ' ') + "</span><span class='info-item'>" + (item["case"].age ? item["case"].age : '') + "岁</span><span class='info-item'>" + (item["case"].admitDepartment ? item["case"].admitDepartment : ' ') + "</span>";
                    if (item.diseases && isArray(item.diseases)) {
                        item.diseases.forEach(function (itm) {
                            _disease.push('<div class="content-item">' + itm + '</div>');
                        })
                    }
                    var url = '/detail?_id=' + item["case"].id;
                    if (__iscase) {
                        url += "&__iscase=true";
                    }
                    fieldArr.push('<a class="result-item" target="_blank" href="' + url + '"><div class="hospital-info"><span class="inhospital-type">' + hType + '</span><div class="inhospital-name">' + hName + '</div><div class="inhospital-time">' + hTime + '</div></div><div class="patient-summary"><span class="info">' + hTitle + '</span></div><div class="content-block"></div></a>');
                }
            }

            $("#rigthPanelBody>div>div").hide();
            $("#allDetailContent").empty().show().append($('<div class="results-container" style="width288px;float: none; padding: 5px;"><div class="results-body" style="padding: 0px">' + fieldArr.join('') + '</div></div>'));

        }
    }

    //相似病历
    function getSimilarCase(_id) {
        var params = {
            id: _id
        };
        params = JSON.stringify(params);
        $.ajax({
            type: 'POST',
            url: '/_/hosp/search/case/similar',
            data: params,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data && data.total) {
                    _renderSimilarContent(data);
                }
            }
        });
    }

    function _renderSimilarContent(data) {
        if (data) {
            var items = data.items;
            var fieldArr = [];
            for (var l = 0, llen = items.length; l < llen; l++) {
                var _diseasesCont = '', _diseases = [], _drugsCont = '', _drugs = [], _symptomsCont = '',
                    _symptoms = [];
                var item = items[l];
                var hType = item["case"].visitType.substring(0, 1);
                var hName = item["case"].hospital;
                var hTime = moment(item["case"].admitTime).format('YYYY-MM-DD');
                var hTitle = "<span class='info-item'>" + (item["case"].gender ? item["case"].gender : '') + "</span><span class='info-item'>" + (item["case"].age ? item["case"].age : '') + "岁</span><span class='info-item'>" + (item["case"].admitDepartment ? item["case"].admitDepartment : '') + "</span>";

                if (item.diseases && isArray(item.diseases)) {
                    item.diseases.forEach(function (disease) {
                        if ($.trim(disease)) {
                            _diseases.push('<span class="inline-block-item">' + disease + '</span>');
                        }
                    })
                    _diseasesCont = '<div class="similar-info"><b>相似的疾病：<br/></b>' + _diseases.join('') + '</div>';
                }
                if (item.drugs && isArray(item.drugs)) {
                    item.drugs.forEach(function (drug) {
                        if ($.trim(drug)) {
                            _drugs.push('<span class="inline-block-item">' + drug + '</span>');
                        }
                    })
                    _drugsCont = '<div class="similar-info"><b>相似的用药：<br/></b>' + _drugs.join('') + '</div>';
                }

                if (item.symptoms && isArray(item.symptoms)) {
                    item.symptoms.forEach(function (symptom) {
                        if ($.trim(symptom)) {
                            _symptoms.push('<span class="inline-block-item">' + symptom + '</span>');
                        }
                    })
                    _symptomsCont = '<div class="similar-info"><b>相似的症状：<br/></b>' + _symptoms.join('') + '</div>';
                }


                var url = '/detail?_id=' + item["case"].id;
                fieldArr.push('<li><a target="_blank" href="' + url + '" class="result-item"><div class="hospital-info"><span class="inhospital-type">' + hType + '</span><div class="inhospital-name">' + hName + '</div><div class="inhospital-time">' + hTime + '</div></div><div class="patient-summary"><span class="info" >' + hTitle + '</span></div>' + _diseasesCont + '' + _drugsCont + '' + _symptomsCont + '<div class="fgx"></div></a></li>');
            }

            $("#rigthPanelBody>div>div").hide();
            $("#similarDetailContent").empty().show().append($('<div class="results-container" style=""><div class="results-body" style="padding: 0px"><ul class="detail-info">' + fieldArr.join('') + '</ul></div></div>'));
        }

    }

    //wiki
    function getWiki(text) {
        $.ajax({
            type: 'GET',
            url: '/_/hosp/case/wiki',
            data: "id=" + encodeURIComponent(text),
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
                    toggleRightPanel(true, data.id);
                    _renderWikiContent(data);
                } else {
                    getSimpleNotify('获取wiki失败，请检查网络')
                }
            },
            error: function () {
                getSimpleNotify('获取wiki失败，请检查网络')
            }
        });
    }

    function _renderWikiContent(data) {
        var _info = [], _document = data.document;
        _document.map(function (item, i) {
            var _text = item.text;
            _text = _text.replace(/\n/g, "<br/>");
            _text = '<b>' + item.title + '：</b>' + _text;
            _info.push('<li key="' + i + '" >' + _text + '</li>');
            //_info.push(<li key={i}><b>{item.title}：</b>{item.text}</li>);
        });
        $("#rigthPanelBody>div>div").hide();
        $("#wikiDetailContent").empty().show().append($('<div class="content"><h3 style="font-size: 16px;margin-top: 0;padding-top: 0;font-weight: bold">药品名称:' + (data.id) + '</h3><ul class="detail-info"><li>基本信息</li>' + (_info.join('')) + '</ul></div>'));
    }

    function _buildBasicinfo(info, isShowAll) {
        var sex = info.gender ? info.gender : '';
        var admitDept = info.admitDept ? info.admitDept : '';
        var age = (info.age >= 0) ? info.age : '';
        _age = age;
        $("#basic_sex").text(sex);
        $("#basic_age").text(age);
        document.title = sex + ' ' + age + ' ' + admitDept + ' ' + '-医疗大数据平台';
        $("#exportRecords").attr("href", '/_/hosp/case/export?id=' + __id);
        // $("#showAllCase").attr("data-patient",info.patientID);
        // $("#showSimillar").attr("data-patient",info.patientID);
        patientId = info.patientID;
        var baseInfo = {
            // hospital 医院名称
            "hospital": {label: "医院名称"},
            // dead time 死亡时间
            "deadTime": {label: "死亡时间", type: 'datetime'},
            // visittype 就诊类型
            "visitType": {label: "就诊类型"},
            // gender 性别
            // "gender": {label: "性别"},
            // age 年龄
            // "age": {label: "年龄"},
            // admitdept 入院科室
            "admitDept": {label: "入院科室"},
            // admittime 入院时间
            "admitTime": {label: "入院时间", type: 'datetime'},
            // inpdays 住院天数
            "inpDays": {label: "住院天数", unit: '天'},
            // totalcosts 总费用
            "totalCosts": {label: "总费用", unit: '（元）'}
        };
        var extendInfo = {
            // matitalstatus 婚姻状态
            "maritalStatus": {label: "婚姻状态"},
            // dischargedept 出院科室
            "dischargeDept": {label: "出院科室"},
            // dischargetime 出院时间
            "dischargeTime": {label: "出院时间", type: 'datetime'},
            // consultingdoctor 门诊医师
            "consultingDoctor": {label: "门诊医师"},
            // inpdoctor 住院医师
            "inpDoctor": {label: "住院医师"},
            // director 科主任
            "director": {label: "科主任"},
            //住院号
            "inpNo": {label: "病案号"},
            // doctorincharge 主治医师
            "doctorInCharge": {label: "主治医师"}
        };
        var doms = [];
        if (!info) return '';

        for (var key in baseInfo) {
            if (info[key]) {
                var tp = baseInfo[key]['type'], unit = baseInfo[key]['unit'];
                var v = info[key];
                if (tp == 'datetime') {
                    // v = new moment(v * 1000).format("YYYY-MM-DD");
                    v = moment(v).format("YYYY-MM-DD");
                }
                if (unit) {
                    v = v + ' ' + unit;
                }
                doms.push('<span class="detail-item" key="_' + key + '">' + baseInfo[key].label + ' : <span class="detail-cnt">' + v + '</span></span>');
            }
        }
        if (isShowAll) {
            for (var key in extendInfo) {
                if (info[key]) {
                    var tp = extendInfo[key]['type'], unit = extendInfo[key]['unit'];
                    var v = info[key];
                    if (tp == 'datetime') {
                        v = new moment(v).format("YYYY-MM-DD");
                    }
                    if (unit) {
                        v = v + ' ' + unit;
                    }
                    doms.push('<span class="detail-item" key="_' + key + '">' + extendInfo[key].label + ' : <span class="detail-cnt">' + v + '</span></span>')
                }
            }
        }

        $("#basic_infos").empty().html(doms.join(''));
        /*
         未用到的字段
         patientID
         hospital
         visitID
         name
         idType
         idCode
         businessPhone
         homePhone
         birthday
         admitTime
         visitStatus
         */
    }

    //获取图表信息
    function showChartData(ty, text) {
        switch (ty) {
            case "vital":
                toggleRightPanel(true, '生命体征 - ' + text);
                drawVitalChart(text);
                break;
            case "order":
                toggleRightPanel(true, '医嘱 - ' + text);
                drawMedicalChart(text);
                break;
            case "lab":
                toggleRightPanel(true, '化验 - ' + text);
                drawLabChart(text);
                break;
        }
        $("#rigthPanelBody>div>div").hide();
        $("#chartDetailContent").show()
    }


    //draw time line
    function drawTimeline(datas, _wikiKeys, wt) {
        var timeItems = [];
        var _timelineData = datas;
        var regX = new RegExp("\\{\\{recordType\\}\\}", "mg");
        var regX_documentName = new RegExp("\\{\\{documentName\\}\\}", "mg");
        var regX_content = new RegExp("\\{\\{timelineContent\\}\\}", "mg");
        var regX_type = new RegExp("\\{\\{backendType\\}\\}", "mg");
        if (_timelineData) {
            for (var i = 0, len = _timelineData.length; i < len; i++) {
                var item = _timelineData[i];
                var compontents = [];
                for (var j = 0, jlen = item.events.length; j < jlen; j++) {
                    var evt = item.events[j];
                    //sb sb sb interface structure refine!!! where is benefits?
                    if (evt.type == 'emr.admit') {
                        //病历
                        if (evt.emrs) {
                            evt.emrs.map(function (tem, z) {
                                /* compontents.push(<EmrAdmitController key={Math.random()} datas={tem}
                                 time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></EmrAdmitController>);*/
                                var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                                t = t.replace(regX_documentName, tem.documentName);
                                t = t.replace(regX_type, evt.type.replace('emr.', ''));
                                t = t.replace(regX_content, drawEmrAdmitContent(tem))
                                compontents.push(t);
                            });
                        }
                    }
                    if (evt.type == 'emr.discharge') {
                        //病历
                        if (evt.emrs) {
                            evt.emrs.map(function (tem, z) {
                                /* compontents.push(<EmrDischargeController key={Math.random()} datas={tem}
                                 time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></EmrDischargeController>);*/
                                var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                                t = t.replace(regX_documentName, tem.documentName);
                                t = t.replace(regX_type, evt.type.replace('emr.', ''));
                                t = t.replace(regX_content, drawEmrAdmitContent(tem));
                                compontents.push(t);
                            });
                        }
                    }
                    if (evt.type == 'emr.progress') {
                        //病历
                        if (evt.emrs) {
                            evt.emrs.map(function (tem, z) {
                                /*compontents.push(<EmrProgressController key={Math.random()} datas={tem}
                                 time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></EmrProgressController>);*/
                                var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                                t = t.replace(regX_documentName, tem.documentName);
                                t = t.replace(regX_type, evt.type.replace('emr.', ''));
                                t = t.replace(regX_content, drawEmrAdmitContent(tem));
                                compontents.push(t);
                            });
                        }
                    }
                    if (evt.type == 'emr.operate') {
                        //病历
                        if (evt.emrs) {
                            evt.emrs.map(function (tem, z) {
                                /*compontents.push(<EmrOperateController key={Math.random()} datas={tem}
                                 time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></EmrOperateController>);*/
                                var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                                t = t.replace(regX_documentName, tem.documentName);
                                t = t.replace(regX_type, evt.type.replace('emr.', ''));
                                t = t.replace(regX_content, drawEmrAdmitContent(tem));
                                compontents.push(t);
                            });
                        }
                    }
                    if (evt.type == 'emr.other') {
                        //病历
                        if (evt.emrs) {
                            evt.emrs.map(function (tem, z) {
                                /*compontents.push(<EmrOtherController key={Math.random()} datas={tem}
                                 time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></EmrOtherController>);*/
                                var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                                t = t.replace(regX_documentName, tem.documentName);
                                t = t.replace(regX_type, evt.type.replace('emr.', ''));
                                t = t.replace(regX_content, drawEmrAdmitContent(tem));
                                compontents.push(t);
                            });
                        }
                    }
                    if (evt.type == 'vital') {
                        //体征
                        evt.vital.map(function (vitalData) {
                            if (vitalData.name == '体温' || vitalData.name == '舒张压' || vitalData.name == '收缩压' || vitalData.name == '呼吸' || vitalData.name == '脉搏' || vitalData.name == '体重') {
                                VitalData.push({
                                    time: item.time,
                                    name: vitalData.name,
                                    result: vitalData.result,
                                    unit: vitalData.unit
                                });
                            }
                        });
                        /*compontents.push(<VitalController key={Math.random()} datas={evt.values}
                         time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></VitalController>);*/
                        var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                        t = t.replace(regX_documentName, '生命体征');
                        t = t.replace(regX_type, evt.type);
                        t = t.replace(regX_content, drawVitalContent(evt.vital));
                        compontents.push(t);
                    }
                    if (evt.type == 'diagnosis') {
                        //诊断
                        /*compontents.push(<DiagnosisController key={Math.random()} datas={evt.values}
                         time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></DiagnosisController>);*/
                        var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                        t = t.replace(regX_documentName, '诊断');
                        t = t.replace(regX_type, evt.type);
                        t = t.replace(regX_content, drawDiagnosisContent(evt.diagnoses));
                        compontents.push(t);
                    }
                    if (evt.type == 'lab') {
                        //化验
                        evt.labs.map(function (labData) {
                            labData.detail.map(function (detail) {
                                if (!isNaN(detail.value)) {
                                    LabData.push({
                                        time: item.time,
                                        name: detail.name.replace(/[\s]+/g, ""),
                                        result: detail.value,
                                        unit: detail.unit
                                    });
                                }
                            });
                        });
                        /* compontents.push(<LabController key={Math.random()} datas={evt.values}
                         time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></LabController>);*/
                        var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                        t = t.replace(regX_documentName, '化验');
                        t = t.replace(regX_type, evt.type);
                        t = t.replace(regX_content, drawLabContent(evt.labs));
                        compontents.push(t);
                    }
                    if (evt.type == 'exam') {
                        //检查
                        /*compontents.push(<ExamController key={Math.random()} datas={evt.values}
                         time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}></ExamController>);*/
                        var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                        t = t.replace(regX_documentName, '检查');
                        t = t.replace(regX_type, evt.type);
                        t = t.replace(regX_content, drawExamContent(evt.exams));
                        compontents.push(t);
                    }
                    if (evt.type == 'order') {
                        //医嘱
                        var arrOld = [], arrNew = [], _orderData = [];
                        evt.orders.map(function (orderData) {
                            if (orderData.categories.in_array('药品')) {
                                _orderData.push(orderData);
                                arrOld.push(orderData.text);
                            }
                        });
                        arrNew = unique(arrOld);
                        if (arrNew) {
                            for (var ia = 0; ia < arrNew.length; ia++) {
                                var _dosage = 0;
                                _orderData.map(function (_item) {
                                    if (_item.text == arrNew[ia]) {
                                        _dosage = _dosage + _item.dosage;
                                    }
                                });
                                MedicineData.push({
                                    time: item.time,
                                    name: arrNew[ia],
                                    dosage: _dosage
                                });
                            }
                        }
                        // console.log(MedicineData);
                        /*compontents.push(<OrderController key={Math.random()} datas={evt.values}
                         time={DSYD.dateFormat(item.time, 'yyyy年MM月dd日')}
                         wikiKeys={_wikiKeys}></OrderController>);*/
                        var t = templateStr.replace(regX, timeLineType[timeLineType.indexOf(timeLineMap[evt.type])]);
                        t = t.replace(regX_documentName, '医嘱');
                        t = t.replace(regX_type, evt.type);
                        t = t.replace(regX_content, drawOrderContent(evt.orders, _wikiKeys));
                        compontents.push(t);
                    }
                }

                if (compontents.length > 0) {
                    //console.log(compontents);
                    timeItems.push('<div class="time-item"><div class="time-banner"><span class="fa fa-flag-o"><span class="flag-text">' + (new moment(item.time).format('YYYY-MM-DD')) + '</span></span></div>' + compontents.join('') + '</div>');
                }
            }

        }
        $("#timelineContainer").empty().append(timeItems.join(''));
        if (wt) {
            wt.hide();
        }
        if (__iscase) {
            $("#showAllCase").click();
        }
    }

    //draw Vital content
    function drawVitalContent(datas) {
        if (datas) {
            var _contentArr = [], _chartArr = [], _chartDetailArr = [];
            var _data = datas;
            _data.map(function (cont, i) {
                if (cont.name == '体温' || cont.name == '体重' || cont.name == '脉搏' || cont.name == '舒张压' || cont.name == '收缩压' || cont.name == '呼吸') {
                    _chartArr.push('<tr key="' + i + '"><td>' + (cont.name ? cont.name : '--') + '</td><td>' + (cont.result ? cont.result : '--') + '</td><td>' + (cont.unit ? cont.unit : '--') + '</td><td>' + (cont.description ? cont.description : '--') + '</td><td><span>' + (cont.nurse ? cont.nurse : '--') + '</span></td></tr>');
                    _chartDetailArr.push('<tr key="' + i + '"><td>' + (cont.name ? cont.name : '--') + '</td><td>' + (cont.result ? cont.result : '--') + '</td><td>' + (cont.unit ? cont.unit : '--') + '</td><td>' + (cont.description ? cont.description : '--') + '</td><td><span>' + (cont.nurse ? cont.nurse : '--') + ' </span></td><td><a class="icon-detail show-chart" data-type="vital" data-title=' + cont.name + '></a></td></tr>');
                } else {
                    _contentArr.push('<tr key="' + i + '"><td>' + (cont.name ? cont.name : '--') + '</td><td>' + (cont.result ? cont.result : '--') + '</td><td>' + (cont.unit ? cont.unit : '--') + '</td><td>' + (cont.description ? cont.description : '--') + '</td><td>' + (cont.nurse ? cont.nurse : '--') + '</td></tr>');
                }
            });

            return '<div class="timeline-block-infos timeline-summary-info"><table  cellPadding="0" cellSpacing="0"><thead><tr><th>检查名称</th><th>检查结果</th><th>检查结果单位</th><th>检查描述</th><th>检查护士</th></tr></thead><tbody>' + (_chartArr.join('')) + '' + (_contentArr.join('')) + '</tbody></table></div><div class="timeline-block-infos timeline-detail-info"><table  cellPadding="0" cellSpacing="0"><thead><tr><th>检查名称</th><th>检查结果</th><th>检查结果单位</th><th>检查描述</th><th>检查护士</th><th></th></tr></thead><tbody>' + (_chartDetailArr.join('')) + '' + (_contentArr.join('')) + '</tbody></table></div>';

        }

    }

    //生命体征图表
    function drawVitalChart(text) {
        var chartTitle = "生命体征曲线图";
        //所有生命体征中要展示成曲线图的数据
        var _VitalData = VitalData;
        var _colors = ['#3D83B8', '#e33b58']
        var _categories = [], _series = [], _time = [], _name = [], _unit = [], _oneArr = [];

        //获取不重复的x轴数据和y轴品类数据
        _VitalData.map(function (item, i) {
            if (text == item.name) {
                // console.log(text);
                _categories.push(item.time);
                _name.push(item.name);
                _unit.push(item.unit);
            }
        });
        _categories = unique(_categories);
        _name = unique(_name);
        _unit = unique(_unit);

        //获取y轴品类的数据并分类存储
        _name.map(function (tem) {
            var _Arr = [];
            _VitalData.map(function (item) {
                if (tem == item.name) {
                    _Arr.push(item);
                }
            });
            _oneArr.push(_Arr);
        });

        //组装y轴的数据
        _oneArr.map(function (item) {
            var _item = item, tem = [];
            //x轴数据与y轴中某类数据进行比较，有值的赋对应的值，没有值的设置为null
            _categories.map(function (time, i) {
                var _val = null;
                for (var z = 0; z < _item.length; z++) {
                    if (time == _item[z].time) {
                        _val = _item[z].result * 1;
                    }
                }
                tem.push(_val);
            });

            _series.push({
                name: _item[0].name,
                data: tem
            });
        });

        //格式化x轴数据
        _categories.map(function (item) {
            _time.push(new moment(item).format('YYYY-MM-DD'));
        })

        chartObj.update({
            chart: {
                type: 'line'
            },
            title: {
                text: null,
            },
            subtitle: {
                text: null,
            },
            xAxis: {
                categories: _time
            },
            yAxis: {
                title: {
                    text: ''
                },
                lineWidth: 1,
                visible: true,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            plotOptions: {
                series: {
                    allowPointSelect: true,
                    connectNulls: true
                }
            },
            tooltip: {
                valueSuffix: ''
            },
            credits: {
                enabled: false
            },

            series: _series
        }, true);
    }

    //药 图表
    function drawMedicalChart(text) {
        //所有药品数据集合
        var _medicineData = MedicineData;
        var _colors = ['#3D83B8', '#e33b58'];
        var _categories = [], _series = [], _time = [], _name = [], _oneArr = [];
        //console.log(_medicineData);
        _medicineData.map(function (item, i) {
            _categories.push(item.time);
            _name.push(item.name);
        });

        //所有x轴和y轴不同数据
        _categories = unique(_categories);
        _name = unique(_name);
        //console.log(_categories);
        //console.log(_name);

        //格式化x轴数据
        _categories.map(function (item) {
            _time.push(new moment(item).format("YYYY-MM-DD"));
        })

        //获取y轴品类的数据并分类存储
        _name.map(function (tem) {
            var _Arr = [];
            _medicineData.map(function (item) {
                if (tem == item.name) {
                    _Arr.push(item);
                }
            });
            _oneArr.push(_Arr);
        });

        _oneArr.map(function (oneArr) {
            if (oneArr[0].name == text) {
                //组装y轴的数据
                var _item = oneArr, tem = [];
                //x轴数据与y轴中某类数据进行比较，有值的赋对应的值，没有值的设置为null
                _categories.map(function (time, i) {
                    var _val = null;
                    for (var z = 0; z < _item.length; z++) {
                        if (time == _item[z].time) {
                            _val = _item[z].dosage * 1;
                        }
                    }
                    tem.push(_val);
                });

                _series.push({
                    name: _item[0].name,
                    color: '#3D83B8',
                    data: tem
                });

                chartObj.update({
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
                        categories: _time
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: ''
                        }
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f} </b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0.2,
                            borderWidth: 0
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: _series
                }, true);
            }
        });
    }

    //化验 图表
    function drawLabChart(text) {
        //所有化验中要展示成曲线图的数据
        var _LabData = LabData;
        var _colors = ['#3D83B8', '#e33b58']
        var _categories = [], _series = [], _time = [], _name = [], _unit = [], _oneArr = [];
        //获取不重复的x轴数据和y轴品类数据
        _LabData.map(function (item, i) {
            if (text == item.name) {
                // console.log(text);
                _categories.push(item.time);
                _name.push(item.name);
                _unit.push(item.unit);
            }

        });
        _categories = unique(_categories);
        _name = unique(_name);
        _unit = unique(_unit);

        //获取y轴品类的数据并分类存储
        _name.map(function (tem) {
            var _Arr = [];
            _LabData.map(function (item) {
                if (tem == item.name) {
                    _Arr.push(item);
                }
            });
            _oneArr.push(_Arr);
        });

        //格式化x轴数据
        _categories.map(function (item) {
            _time.push(new moment(item).format("YYYY-MM-DD"));
        });
        _oneArr.sort(function (a, b) {
            return a[0].result * 1 - b[0].result * 1
        });
        //组装y轴的数据
        for (var i = 0, j = 0; i < _oneArr.length; i = i + 5) {
            drawchart(_oneArr.slice(i, i + 5), j);
            j++;
        }
        function drawchart(oneArr, num) {
            var _series = [];
            oneArr.map(function (item) {
                var _item = item, tem = [];
                //x轴数据与y轴中某类数据进行比较，有值的赋对应的值，没有值的设置为null
                _categories.map(function (time, i) {
                    var _val = null;
                    for (var z = 0; z < _item.length; z++) {
                        if (time == _item[z].time) {
                            _val = _item[z].result * 1;
                        }
                    }
                    tem.push(_val);
                });

                _series.push({
                    name: _item[0].name,
                    data: tem
                });
            });

            chartObj.update({
                title: {
                    text: '',
                },
                subtitle: {
                    text: '',
                },
                xAxis: {
                    categories: _time
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    // lineWidth: 1,
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                plotOptions: {
                    series: {
                        connectNulls: true
                    }
                },
                tooltip: {
                    valueSuffix: ''
                },
                credits: {
                    enabled: false
                },

                series: _series
            }, true)
        }
    }

    //draw order content
    function drawOrderContent(datas, wikiKeys) {
        if (datas) {
            var _data = datas;
            var _wikiKeys = wikiKeys || [];
            var detail_00 = [], detail_00_0 = [], detail_00_1 = [],
                detail_0 = [], detail_0_0 = [], detail_0_1 = [],
                detail_1 = [], detail_1_0 = [], detail_1_1 = [],
                detail_2 = [], detail_2_0 = [], detail_2_1 = [],
                detail_3 = [], detail_3_0 = [], detail_3_1 = [],
                detail_4 = [], detail_4_0 = [], detail_4_1 = [];
            var _arrTitle = ['药品', '手术', '检查', '化验', '其它'];

            //repeatIndicator

            _data.map(function (item, i) {
                var categories = item.categories;
                if (categories.in_array(_arrTitle[0])) {
                    if (item.repeatIndicator) {
                        detail_00_0.push('<tr class="yp"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + new moment(item.date).format("HH:mm:ss") + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    } else {
                        detail_00_1.push('<tr class="yp ls"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + new moment(item.date).format("HH:mm:ss") + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    }

                    if (item.text) {
                        var _orderWiki = item.text, _ionDetail = "--";
                        if(isArray(_wikiKeys) &&_wikiKeys.map){
                            _wikiKeys.map(function (wiki, i) {
                                if (_orderWiki == wiki) {
                                    _orderWiki = '<a class="open-wiki show-wiki" data-title="' + wiki + '" title="' + wiki + '">' + _orderWiki + '</a>';
                                    _ionDetail = '<a class="icon-detail show-chart" data-type="order" title="' + wiki + '" data-title="' + wiki + '"></a>';
                                }
                            });
                        }
                    }

                    if (item.repeatIndicator) {
                        detail_0_0.push('<tr class="yp"><td class="width50">' + (_orderWiki) + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td><td>' + (_ionDetail) + '</td></tr>');
                    } else {
                        detail_0_1.push('<tr class="yp ls"><td class="width50">' + (_orderWiki) + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td><td>' + (_ionDetail) + '</td></tr>');
                    }


                } else if (categories.in_array(_arrTitle[1])) {
                    if (item.repeatIndicator) {
                        detail_1_0.push('<tr class="ss"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    } else {
                        detail_1_1.push('<tr class="ss ls"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    }

                } else if (categories.in_array(_arrTitle[2])) {

                    if (item.repeatIndicator) {
                        detail_2_0.push('<tr class="jc"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    } else {
                        detail_2_1.push('<tr class="jc ls"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    }


                } else if (categories.in_array(_arrTitle[3])) {
                    if (item.repeatIndicator) {
                        detail_3_0.push('<tr class="hy"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    } else {
                        detail_3_1.push('<tr class="hy ls"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    }


                } else {
                    if (item.repeatIndicator) {
                        detail_4_0.push('<tr class="qt"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    } else {
                        detail_4_1.push('<tr class="qt ls"><td class="width50">' + (item.text ? item.text : '--') + '</td><td>' + (new moment(item.date).format("HH:mm:ss")) + '</td><td>' + (item.dosage ? item.dosage : '--') + '</td><td>' + (item.frequency ? item.frequency : '--') + '</td><td><span>' + (item.administration ? item.administration : '--') + '</span></td></tr>');
                    }

                }
            });

            if (true) { //临时
                detail_00 = detail_00.concat(detail_00_1);
                detail_0 = detail_0.concat(detail_0_1);
                detail_1 = detail_1.concat(detail_1_1);
                detail_2 = detail_2.concat(detail_2_1);
                detail_3 = detail_3.concat(detail_3_1);
                detail_4 = detail_4.concat(detail_4_1);
            }
            detail_00 = detail_00.concat(detail_00_0);
            detail_0 = detail_0.concat(detail_0_0);
            detail_1 = detail_1.concat(detail_1_0);
            detail_2 = detail_2.concat(detail_2_0);
            detail_3 = detail_3.concat(detail_3_0);
            detail_4 = detail_4.concat(detail_4_0);

            if (detail_00.length > 0) {
                detail_00.unshift('<tr><td class="tr-title yp" colSpan="5">药品</td></tr>');
            }
            if (detail_0.length > 0) {
                detail_0.unshift('<tr class="yp"><td class="tr-title" colSpan="5">药品</td></tr>');
            }
            if (detail_1.length > 0) {
                detail_1.unshift('<tr class="ss"><td class="tr-title" colSpan="5">手术</td></tr>');
            }
            if (detail_2.length > 0) {
                detail_2.unshift('<tr class="jc"><td class="tr-title" colSpan="5">检查</td></tr>');
            }
            if (detail_3.length > 0) {
                detail_3.unshift('<tr class="hy"><td class="tr-title" colSpan="5">化验</td></tr>');
            }
            if (detail_4.length > 0) {
                detail_4.unshift('<tr class="qt"><td class="tr-title" colSpan="5">其他</td></tr>');
            }


            return '<div class="timeline-block-infos timeline-summary-info"><div class="detail-info"><table cellPadding="0" cellSpacing="0"><thead><tr><th width="30%">医嘱内容</th><th width="20%">下医嘱时间</th><th width="10%">剂量</th><th width="5%">频次</th><th>使用方法</th></tr></thead><tbody>' + (detail_00.join('') ) + '' + (detail_1.join('')) + '' + (detail_2.join('')) + '' + (detail_3.join('') ) + '' + (detail_4.join('')) + '</tbody></table></div></div><div class="timeline-block-infos timeline-detail-info"><div class="detail-info"><div class="header-order"><p class="checkbox-left "><label><input class="checkfilter" type="checkbox" name="yp" checked /> 药品 </label><label><input type="checkbox" class="checkfilter"  name="ss" checked /> 手术 </label><label><input type="checkbox" class="checkfilter"  name="jc" checked /> 检查 </label><label><input type="checkbox" name="hy" class="checkfilter"  checked /> 化验 </label><label><input type="checkbox" name="qt" class="checkfilter"  checked /> 其他 </label></p><p class="checkbox-right"><label><input type="checkbox" name="ls" class="ls-checkfilter"  checked /> 包含临时医嘱 </label></p></div><div class="content"><table cellPadding="0" cellSpacing="0"><thead><tr><th width="30%">医嘱内容</th><th width="20%">下医嘱时间</th><th width="15%">剂量</th><th width="15%">频次</th><th>使用方法</th><th></th></tr></thead><tbody>' + (detail_0.join('')) + '' + (detail_1.join('')) + '' + (detail_2.join('')) + '' + (detail_3.join('')) + '' + (detail_4.join('')) + '</tbody></table></div></div></div>';

        }
    }

    //draw Exam content
    function drawExamContent(datas) {
        if (datas) {
            var _data = datas;
            var len = _data.length;
            var category = [], detail = [];
            _data.map(function (item, i) {
                category.push('<span key="' + i + '">' + item.name + '</span>');
                var detailHeader = '', detailTable = '';
                detailHeader = '<div class="title"><h4 style="font-size: 14px">名称：' + (item.name ? item.name : '') + '</h4><div><p>请求科室：' + (item.reqDeptName ? item.reqDeptName : '') + ' </p><p>请求医生：' + (item.reqDoctor ? item.reqDoctor : '') + '</p></div><div><p>检查类型：' + (item.category ? item.category : '') + '</p><p>执行科室：' + (item.execDeptName ? item.execDeptName : '') + '</p></div><div><h4 style="font-size: 14px">检查结果：<b>' + (item.result ? item.result : '') + '</b></h4></div><div><div>描述：' + (item.description ? item.description : '') + '</div></div></div>';
                var detailTr = [];
                if (item.detail && isArray(item.detail)) {
                    item.detail.map(function (cont, i) {

                        detailTr.push('<tr><td class="textcenter">' + (i + 1) + '</td><td>' + (cont.name ? cont.name : '--') + '</td><td>' + (cont.value ? cont.value : '--') + '</td><td>' + (cont.unit ? cont.unit : '--') + '</td></tr>')

                    });
                }
                if (detailTr.length > 0) {
                    detailTable = ('<table cellPadding="0" cellSpacing="0"><thead><tr><th>#序列</th><th>细项名称</th><th>值</th><th>单位</th></tr></thead><tbody>' + (detailTr) + '</tbody></table>');
                }
                detail.push('<div>' + (detailHeader) + '' + (detailTable) + '</div>');
            });


            return '<div class="timeline-block-infos timeline-summary-info"><div class="structure-block"><div class="title"><h3>检查类别 <span>(共 ' + (len) + ' 项)</span></h3></div><div class="category">' + (category.join('')) + '</div></div></div><div class="timeline-block-infos timeline-detail-info"><div class="content">' + (detail.join('')) + '</div></div>';
        }
    }

    //draw diagnosis content
    function drawDiagnosisContent(datas) {
        if (datas) {
            var _contentArr = [];
            var _data = datas;

            _data.map(function (cont, i) {
                _contentArr.push('<tr key="' + (i) + '"><td>' + (cont.type ? cont.type : '--') + '</td><td>' + (cont.no ? cont.no : '--') + '</td><td>' + (cont.text ? cont.text : '--') + '</td><td>' + (cont.code ? cont.code : '--') + '</td><td>' + (cont.doctor ? cont.doctor : '--') + '</td><td>' + (cont.deptName ? cont.deptName : '--') + '</td></tr>');
            });


            return '<div class="timeline-block-infos timeline-summary-info"><table cellPadding="0" cellSpacing="0"><thead><tr><th class="width-12-percent">诊断类型</th><th class="width-10-percent">诊断序号</th><th>诊断内容</th><th>诊断编码</th><th>诊断医生</th><th>科室名称</th></tr></thead><tbody>' + (_contentArr.join('')) + '</tbody></table></div><div class="timeline-block-infos timeline-detail-info"><table cellPadding="0" cellSpacing="0"><thead><tr><th class="width-12-percent">诊断类型</th><th class="width-10-percent">诊断序号</th><th>诊断内容</th><th>诊断编码</th><th>诊断医生</th><th>科室名称</th></tr></thead><tbody>' + (_contentArr.join('')) + '</tbody></table></div>';
        }
    }

    //draw lab content
    function drawLabContent(datas) {
        if (datas) {
            var _data = datas;
            var len = _data.length;
            var category = [], detail = [], labConent = "";
            _data.map(function (item, i) {
                category.push('<span key="' + i + '">' + (item.name ? item.name : '') + '</span>');
                var detailHeader = '', detailTable = '';
                detailHeader = ('<div class="title"><h4 style="font-weight: bold;font-size: 14px">套餐名称：' + (item.name ? item.name : '') + '</h4><div><p>请求科室：' + (item.reqDeptName ? item.reqDeptName : '') + '</p><p>请求医生：' + (item.reqDoctor ? item.reqDoctor : '') + '</p></div></div>');
                var detailTr = [];
                item.detail.map(function (cont, j) {
                    var _ionDetail = "";
                    if (!isNaN(cont.value)) {
                        _ionDetail = '<a class="icon-detail show-chart" data-type="lab" data-title=' + cont.name.replace(/[\s]+/g, "") + '></a>';
                    } else {
                        _ionDetail = '--'
                    }

                    if (cont.isAbnormal) {
                        detailTr.push('<tr key="' + (j) + '"><td class="bgcolor textcenter">' + (j + 1) + '</td><td class="bgcolor">' + (cont.name ? cont.name : '--') + '</td><td class="bgcolor">' + (cont.value ? cont.value : '--') + '</td><td class="bgcolor">' + (cont.unit ? cont.unit : '--') + '</td><td class="bgcolor">' + (cont.isAbnormal ? cont.abnormalFlag : '--') + '</td><td class="bgcolor">' + (cont.range ? cont.range : '--') + '</td><td><span> </span>' + (_ionDetail) + '</td></tr>');
                    } else {
                        detailTr.push('<tr key="' + (j) + '"><td class="textcenter">' + (j + 1) + '</td><td>' + (cont.name ? cont.name : '--') + '</td><td>' + (cont.value ? cont.value : '--') + '</td><td>' + (cont.unit ? cont.unit : '--') + '</td><td>' + (cont.isAbnormal ? cont.isAbnormal : '--') + '</td><td>' + (cont.range ? cont.range : '--') + '</td><td>' + (_ionDetail) + '</td></tr>');
                    }

                });

                detailTable = ('<table cellPadding="0" cellSpacing="0"><thead><tr><th class="width-8-percent">#序号</th><th>化验项目</th><th>结果</th><th>结果单位</th><th>是否异常</th><th>正常值范围</th><th></th></tr></thead><tbody>' + (detailTr.join('')) + '</tbody></table>');

                detail.push('<div>' + (detailHeader) + '' + (detailTable) + '</div>');
            });


            return '<div class="timeline-block-infos timeline-summary-info"><div class="structure-block"><div class="title"><h3>化验类别名称 <span>(共 ' + (len) + ' 项)</span></h3></div><div class="category">' + (category.join('')) + '</div></div></div><div class="timeline-block-infos timeline-detail-info"><div class="structure-block"><div class="title"><h3>化验类别名称 <span>(共 ' + (len) + ' 项)</span></h3></div><div class="category">' + (category.join('')) + '</div><div class="fgx"></div></div><div class="detail-info"><div class="content">' + (detail.join('')) + '</div></div></div>'
        }
    }

    //draw emr admin
    function drawEmrAdmitContent(datas) {
        if (datas) {
            var _contentArr = [], _sympArr = [];
            var _data = datas;
            var _documentName = _data.documentName;
            var _doctor = "", _deptName = "", _header = "";
            if (_data.doctor) {
                _doctor = '<p>撰写医生：' + _data.doctor + '</p>';
            }

            if (_data.deptName) {
                _deptName = '<p>撰写科室：' + _data.deptName + '</p>';
            }

            if ((_doctor || _deptName) && _data.htmlContent == null) {
                _header = '<div class="header-order">' + (_doctor) + '' + (_deptName) + '</div>';
            }


            if (_data.content && _data.htmlContent == null) {
                _data.content.map(function (cont, i) {
                    _contentArr.push('<h3 key="' + (i) + '">' + (cont.title) + '</h3>');
                    _contentArr.push('<p>' + (cont.text) + '</p>');
                });
            }

            if (_data.symptom) {
                _data.symptom.map(function (symp, j) {

                    var _temValue = "";
                    if (symp.position) {
                        _temValue = symp.position + '-';
                    }
                    if (symp.entity) {
                        _temValue = _temValue + symp.entity;
                    }
                    if (symp.status) {
                        _temValue = _temValue + '-' + symp.status;
                    }

                    if (symp.isNormal) {
                        if ($.trim(_temValue) != "") {
                            _sympArr.push('<span key="' + j + '" class="default-border">' + _temValue + '</span>');
                        }
                    } else {
                        if ($.trim(_temValue) != "") {
                            _sympArr.push('<span key="' + (j + 1000) + '" class="red-border">' + (_temValue) + '</span>');
                        }
                    }

                });
            }
            var _sympArrStr = '';
            var iframeId = "emr_ifr_" + (new moment()) + '_' + (Math.random() * 1000 + 999).toFixed(0);

            window.emrIframeHtmlMap[iframeId] = encodeURIComponent(datas.htmlContent); //encodeURIComponent(datas.html_content);
            window.emrIframeHtmlMap[iframeId + "_detail"] = encodeURIComponent(datas.htmlContent);//encodeURIComponent(datas.html_content);
            var iframe = '<iframe id="' + iframeId + '" name="' + iframeId + '" style="width: 100%;height:100%;border: none;box-shadow: none" frameborder="no" border="0″ marginwidth="0″ marginheight="0″ scrolling="no" allowtransparency="yes" src="/assets/tpl/blank_iframe.html?ifrId=' + iframeId + '"></iframe>';
            var iframe_detail = '<iframe id="' + iframeId + '_detail" name="' + iframeId + '_detail" style="width: 100%;height:100%;border: none;box-shadow: none" frameborder="no" border="0″ marginwidth="0″ marginheight="0″ scrolling="no" allowtransparency="yes" src="/assets/tpl/blank_iframe.html?ifrId=' + iframeId + '_detail"></iframe>';
            if (_sympArr.length) {
                _sympArrStr = '<div class="single-info">' + (_sympArr.join('')) + '</div>'
            } else {
                _sympArrStr = '<div>' + (_header) + '<div class="detail-info">' + _contentArr.join('').replace(/undefined/g, '') + '</div></div>';
            }

            return '<div class="timeline-block-infos timeline-summary-info">' + _sympArrStr + '<div style="margin-top: 10px;"></div><div class="detail-info" ref="container">' + (datas.htmlContent ? iframe : '') + '</div></div><div class="timeline-block-infos timeline-detail-info">' + (_sympArr.join('')) + '<div class="fgx" style="margin-top: 10px;margin-bottom: 10px"></div>' + _header + '<div class="content">' + _contentArr.join('').replace(/undefined/g, '') + '</div><div class="detail-info" ref="container">' + (datas.htmlContent ? iframe_detail : '') + '</div>' + '</div>'.replace(/undefined/g, '')

        }
    }


})