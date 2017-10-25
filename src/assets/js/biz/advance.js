/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    // get Node Template str
    var nodeStr = "";
    var __currentElementObj;
    var __globalSearchParam;
    //nodeType 1或,2与,4 leafNode
    var opType = ['', '或者', '并且'];
    var wt = new waitfor();
    var conf = new confirmDlg({
        okBtnText: '确认',
        okBtnBgColor: '#41b8b0',
        cancelBtnText: '取消'
    });
    var _sId = getQueryString('_sId');//parts['sVal'];

    //============查询结果初始化=============
    var templates = {};
    $.ajax({
        url: '/assets/tpl/advSearchResultTemplate.html',
        type: 'GET',
        async: false,
        success: function (data) {
            templates['sRSTpl'] = data;

        },
        error: function () {

        }
    });
    var _start = 0;
    var _pageSize = 10;
    moment().locale("zh-cn");
    var seriesName = ['疾病', '症状', '化验', '检查', '药品', '性别', '年龄'];
    var keyNames = ['disease', 'symptom', 'labSet', 'exam', 'drug', 'gender', 'age'];
    var chartModel = {
        disease: {},
        symptom: {},
        labSet: {},
        exam: {},
        drug: {},
        gender: {},
        age: {}
    };
    //===========End 查询结果初始化==============

    var basicInfoObj, hospitalInfoObj, basicInfoConditions = {}, basicInfoChoice = {}, vitalObj, vitalConditions = {};
    var diseaseObj = {};
    var labObject = {}, labLevel3Map = {};
    var dialog4Condition = new commonDlg();
    dialog4Condition.init({
        dlgTitle: ' ',
        dlgSize: 'modal-lg', //modal-sm modal-md modal-lg
        content: '/assets/tpl/conditions.html',
        cancelText: '取消',
        okText: '确定',
        okBtnBgColor: '#41b8b0',
        beforeShow: function () {
            this.dlgDOM.find(".condition-title a.active").removeClass("active");
            this.dlgDOM.find(".modal-body .condition-tab-panel").removeClass("active");
            this.dlgDOM.find(".condition-title a[data-target='" + __currentElementObj.panelID + "']").addClass("active");
            this.dlgDOM.find(".modal-body .condition-tab-panel[data-index='" + __currentElementObj.panelID + "']").addClass("active");
            var obj = getPanelTemplate(__currentElementObj.panelID)
            obj.updatePanel.call(this, __currentElementObj);
        },
        afterInit: function () {
            var titleBars = ["患者信息", "疾病", "症状", "药品", "手术", "化验指标", "生命体征", "检查报告"];
            var titleStr = "<div class='condition-title'>";
            var contentStr = '';
            for (var i = 0, len = titleBars.length; i < len; i++) {
                if (i == 0) {
                    titleStr += '<a class="condition-title-bar active" href="javascript:void(0)" data-target="' + (i + 1) + '">' + titleBars[i] + '<div class="bottom-line"></div></a>';
                    contentStr += '<div class="condition-tab-panel active" data-index="' + (i + 1) + '"><div class="condition-content-block" id="content_block_' + (i + 1) + '">' + getPanelTemplate(i + 1) + '</div></div>';
                } else {
                    titleStr += '<a class="condition-title-bar" href="javascript:void(0)" data-target="' + (i + 1) + '">' + titleBars[i] + '<div class="bottom-line"></div></a>';
                    contentStr += '<div class="condition-tab-panel" data-index="' + (i + 1) + '"><div class="condition-content-block" id="content_block_' + (i + 1) + '">' + getPanelTemplate(i + 1) + '</div></div>';
                }
            }
            titleStr += "<div style='clear: both'></div></div>";
            this.dlgDOM.find(".modal-header").css("padding-bottom", "0px");
            this.dlgDOM.find("h4.modal-title").replaceWith($(titleStr));
            this.dlgDOM.find(".modal-body").empty().append(contentStr);
            var that = this;
            this.dlgDOM.on("click", ".condition-title a.condition-title-bar", function (e) {
                var $this = $(this);
                $this.parent().find("a.active").removeClass("active");
                $this.addClass("active");
                var activeId = $this.attr("data-target");
                that.dlgDOM.find('.modal-body>.active').removeClass("active");
                that.dlgDOM.find('.modal-body>.condition-tab-panel[data-index="' + activeId + '"]').addClass("active");
                // getPanelTemplate(activeId).updatePanel({});
                getPanelTemplate(activeId);
            })
            //regist events
            this.dlgDOM.find('.condition-tab-panel').each(function (idx, itm) {
                var $this = $(this);
                var dataIdx = $this.attr('data-index');
                getPanelTemplate(dataIdx).renderPanel($this);
            })
        },
        okCallback: function () {
            var dataIndex = $(this.dlgDOM.find(".condition-title-bar.active").get(0)).attr("data-target");
            var st = saveDialogData(dataIndex);
            if (st) {
                this.close();
            }
        }
    });

    var menuStr = '<ul class="sub-menu sub"><li class="sub text-logic"><a href="javascript:void (0)" class="sub logic" data-value="and" data-type="2">并且</a></li><li class="sub text-logic"><a href="javascript:void (0)" class="sub logic" data-value="or" data-type="1">或者</a></li><li class="sub text-edit"><a href="javascript:void (0)" class="sub add-child">添加子句</a></li><li class="sub text-edit"><a href="javascript:void (0)" class="sub delete-nodes">删除</a></li></ul>';

    updateHeight($("#mindNodeMain"));
    if (_sId) {
        getMindByHistory(_sId);
    }


    //===============event regist =====================
    $("#boxMind").on("click", "a.branch", function (e) {
        var e = e || window.event;
        var $this = $(this);
        var elementBlock = $this.parents('.element-block');
        var elementDataObj = {
            dataValue: elementBlock.attr("data-value"),
            dataText: elementBlock.attr("data-text"),
            dataPanel: elementBlock.attr("data-panel")
        };
        if (elementBlock.attr("data-params")) {
            elementDataObj["dataParams"] = elementBlock.attr("data-params");
        }
        changeToParentNode(elementBlock);
        addBranchNode(elementBlock, elementDataObj);
        updateMind(elementBlock)
    });
    //trigger dialog
    $("#boxMind").on("click", ".trigger-condition", function (e) {
        var $this = $(this);
        var elementBlock = $this.parents('.element-block');
        var panelID = elementBlock.attr("data-panel");
        var dataText = decodeURIComponent(elementBlock.attr("data-text"));
        var dataValue = decodeURIComponent(elementBlock.attr("data-value"));
        var custom = elementBlock.attr("data-custom");
        __currentElementObj = {
            domID: elementBlock.attr("id"),
            panelID: panelID,
            dataText: dataText,
            dataValue: dataValue
        };
        if (custom) {
            __currentElementObj["dataCustom"] = JSON.parse(decodeURIComponent(custom));
        }
        dialog4Condition.open();
    })

    //sub menu
    $("#boxMind").on("click", ".has-child .trigger-logic", function (e) {
        var $this = $(this);
        var elementDOM = $this.parents('.element-block');
        var subMenu = elementDOM.find(".sub-menu");
        if (subMenu.length > 0) {
            subMenu.show();
        } else {
            elementDOM.append($(menuStr));
        }
        elementDOM.find("li").hide();
        elementDOM.find("li.text-logic").show();
    })

    $("#boxMind").on("click", ".has-child .edit", function (e) {
        var $this = $(this);
        var elementDOM = $this.parents('.element-block');
        var subMenu = elementDOM.find(".sub-menu");
        if (subMenu.length > 0) {
            subMenu.show();
        } else {
            elementDOM.append($(menuStr));
        }
        elementDOM.find("li").hide();
        elementDOM.find("li.text-edit").show();
    })
    //delete icon
    $("#boxMind").on("click", ".delete", function (e) {
        var that = this;
        var elemBlk = $(this).parents(".element-block");
        if (elemBlk.attr("id") == 'mindNodeMain') {
            conf.open({'cf_title': '确认清除脑图吗', 'cf_content': '数据清除后将无法恢复', 'okcallback': clearMindNode})
        } else {
            conf.open({
                'cf_title': '  确认删除该结点吗 ?', 'cf_content': '删除后无法恢复', 'okcallback': function () {
                    this.close();
                    deleteCallback.call(that, elemBlk)
                }
            })
        }

    })
    //delete sub delete-nodes
    $("#boxMind").on("click", ".sub.delete-nodes", function (e) {
        var that = this;
        var elemBlk = $(this).parents(".element-block");
        if (elemBlk.attr("id") == 'mindNodeMain') {
            conf.open({'cf_title': '确认清除脑图吗', 'cf_content': '数据清除后将无法恢复', 'okcallback': clearMindNode})
        } else {
            conf.open({
                'cf_title': '确认删除该结点吗', 'cf_content': '删除后无法恢复', 'okcallback': function () {
                    this.close();
                    deleteCallback.call(that, elemBlk)
                }
            })
        }

    })


    //sb ie is document ,other browser is window
    $(document).on("click", function (e) {
        e = e || window.event;
        if (!$(e.target).hasClass('sub')) {
            $(".sub-menu:visible").remove()
        }
    });
    //sub menu item click
    $("#boxMind").on("click", ".text-logic a.logic", function (e) {
        var $this = $(this);
        var elementDOM = $this.parents('.element-block');
        $("a.element-text", elementDOM).text($this.text());
        elementDOM.find(".sub-menu").hide();
        elementDOM.attr("data-type", $this.attr("data-type"))
    })
    //sub menu item click
    $("#boxMind").on("click", ".text-edit a.add-child", function (e) {
        var $this = $(this);
        var elementDOM = $this.parents('.element-block');
        elementDOM.find(".sub-menu").hide();
        addNode(elementDOM);
        updateMind(elementDOM)
    })

    $("#btnMindClear").on("click", function (e) {
        conf.open({'cf_title': '确认清除脑图吗', 'cf_content': '数据清除后将无法恢复', 'okcallback': clearMindNode})
    })

    //提交查询结果
    $("#btnMindSubmit").on("click", function (e) {
        if (!isConditionComplete()) {
            getSimpleNotify('请输入完整查询条件')
            return false;
        }
        //clear chart data
        clearPrevChartData();


        var qData = buildUpQueryData();
        var dataModel = __getDataModelByNode($("#mindRoot"))
        var personLanguage = renderToPersonLanguage(dataModel)

        var qParam = {
            filters: [],
            query: qData.query,
            assets: {
                queryModel: JSON.stringify(dataModel),
                modelText: personLanguage
            }
        };
        qParam = JSON.stringify(qParam);
        $("#searchInput").val(personLanguage.replace(/<[^>]+>/g, "")).attr("title", personLanguage.replace(/<[^>]+>/g, ""));
        __globalSearchParam = qParam;
        getRSByCondition(qParam);

    })

    //返回查询结果
    $("#btnRtnSearch").on("click", function (e) {
        //switch panel
        $("#boxMind").show();
        $("#buttons").show();
        $("#mainSearchResult").hide();
        $("#fixedSearchBar").hide();
        _start = 0;
        $("#searchResults").empty();
        $("#advanceContent .header").css({"position": "static", "height": "60"});
        // $("#advanceContent .header").scrollToFixed()
        // $("#advanceSearch").css({"marginTop": "60px"});
        $(window).resize();
        updateMind($("#mindNodeMain"))
    })


    //================function define ==================
    function changeToParentNode(dom) {
        dom.addClass('has-child');
        dom.attr('data-type', '2');
        dom.removeAttr("data-value");
        dom.removeAttr("data-text");
        dom.removeAttr("data-panel");
        dom.find('.element-text').text('并且').removeClass('trigger-condition').addClass('trigger-logic');
    }

    function changeToElement(dom, model) {
        if (model == null) {
            model = {};
        }
        dom.removeClass('has-child');
        dom.attr("data-type", "4");
        dom.attr("data-value", model.dataValue ? model.dataValue : "");
        dom.attr("data-text", model.dataText ? model.dataText : "");
        dom.attr("data-panel", model.dataPanel ? model.dataPanel : "1");
        var t = model.dataText ? decodeURIComponent(model.dataText) : '点击输入搜索条件';
        if (model.dataCustom) {
            $("#mindNodeMain").attr("data-custom", model.dataCustom);
        }
        dom.find('.element-text').text(t).removeClass('trigger-logic').addClass('trigger-condition');
    }


    //add new branch node
    function addBranchNode(dom, elementDataObj) {
        var currentDOMID = dom.attr("id");
        var childNodeId = currentDOMID + "-child";
        if ($("#" + childNodeId).length == 0) {
            //如果是根结点mindRoot，非根结点.child
            var pDOM = dom.parent();
            var pPos = pDOM.offset(); // {left: pDOM.get(0).offsetLeft, top: pDOM.get(0).offsetTop};
            var s = 0;
            if (currentDOMID == 'mindNodeMain') {
                s = 16;
            }
            var leftPos = pPos.left + pDOM.outerWidth() + 41 - s, topPos = pPos.top - 60 - 85 - 34; //header+buttons height 再减15+19 (padding+height)/2
            var positionCSS = "left:" + leftPos + "px;top:" + topPos + "px";
            var childStr = '<div class="child" id="' + childNodeId + '" style="' + positionCSS + '"><span class="child-before"></span><span class="child-after"></span></div>';
            $("#boxMind").append(childStr);
            addNode(dom, elementDataObj);
            addNode(dom);

        }
    }

    /*
     * 分支里添加子元素
     * */
    function addNode(dom, dataObj) {
        var domId = dom.attr("id");
        var childDOM = $("#" + domId + "-child");
        if (childDOM.length == 0) {
            return false
        }
        var ids = [];
        var wrapDOMs = childDOM.find(".wrap");
        $.each(wrapDOMs, function (idx, item) {
            var num = ~~($(item).find(".element-block").attr("id").replace(domId + "-", ""));
            ids.push(num);
        });
        var id = ids.length ? Math.max.apply(null, ids) : 0;
        var newID = domId + '-' + (++id);
        var domStr = '<div class="wrap"><span class="wrap-before"></span><span class="wrap-after"></span><div class="element-block" id="' + newID + '" data-type="4" data-value="" data-text="" data-panel="1"><div class="before"></div><div class="after"></div><a class="element-icon icon-left branch" href="javascript:void (0)"></a><a class="element-text trigger-condition sub" href="javascript:void (0)">点击输入搜索条件</a><a class="element-icon icon-right delete" href="javascript:void (0)"></a><a class="element-icon icon-right edit sub" href="javascript:void (0)"></a></div></div>';
        if (dataObj && dataObj.dataValue) {
            domStr = '<div class="wrap"><span class="wrap-before"></span><span class="wrap-after"></span><div class="element-block" id="' + newID + '" data-type="4" data-value="' + (dataObj.dataValue != "" ? dataObj.dataValue : '') + '" data-text="' + (dataObj.dataText != "" ? dataObj.dataText : '') + '" data-panel="' + (dataObj.dataPanel != "" ? dataObj.dataPanel : '') + '" data-params="' + (dataObj.dataParams ? dataObj.dataParams : '') + '"><div class="before"></div><div class="after"></div><a class="element-icon icon-left branch" href="javascript:void (0)"></a><a class="element-text trigger-condition sub" href="javascript:void (0)">' + decodeURIComponent(dataObj.dataText) + '</a><a class="element-icon icon-right delete" href="javascript:void (0)"></a><a class="element-icon icon-right edit sub" href="javascript:void (0)"></a></div></div>';
        }
        childDOM.append(domStr);

        return newID;
    }

    //when add child node adjust  its parents height 递归更新高度
    function updateHeight(dom) {
        var node = dom;
        var id = node.attr("id");
        var height = $("#" + id + "-child").outerHeight();
        if (height < 70) {
            height = 72;
        }
        if (node.parent().attr("id") !== "mindRoot") {
            node.css({
                "marginTop": (height - 30) / 2,
                "marginBottom": (height - 30) / 2
            });
            id = node.attr("id").replace(/\-\d+$/, "");
            if ($("#" + id).length) {
                updateHeight($("#" + id));
            }
        }

        var boxHeight = $("#boxMind").height();
        var rootHeight = $("#mindRoot").outerHeight();
        var rootChildHeight = $("#mindNodeMain-child").outerHeight();
        // if (rootHeight - rootChildHeight < 20) {
        //     boxHeight = boxHeight + 20;
        //     $("#boxMind").height(boxHeight)
        // }
        boxHeight = rootChildHeight + 110;
        $("#boxMind").height(boxHeight)

        $("#mindRoot").css("top", +(boxHeight - rootHeight) / 2 + "px");
        $("#mindNodeMain-child").css("top", (boxHeight - rootChildHeight) / 2 + "px")
    }


    function updatePos() {
        var boxWidth = $("#boxMind").width();
        var maxOffsetLefts = 0;
        $(".child").each(function (idx, _child) {
            if ($(_child).offset().left > maxOffsetLefts) {
                maxOffsetLefts = $(_child).offset().left;
            }
            $(".element-block", _child).each(function (eIdx, eBlock) {
                var elemPos = $(eBlock).offset();
                var eleID = $(eBlock).attr("id");
                var eleChild = $("#" + eleID + "-child");
                if (eleChild.length > 0) {
                    var t = (elemPos.top - 130 - eleChild.outerHeight() / 2) + 'px';
                    eleChild.css({top: t})
                }
            })
        })

        //更新宽度
        $("#boxMind").width(maxOffsetLefts + 350);
        /* if (boxWidth - $(_child).offset().left - 340 < 0) {
         $("#boxMind").width(boxWidth + 300);
         }*/

    }

    //sb ie8 css issue
    function updateCSSForIE() {
        if (window.fuckIE) {
            var children = $("#boxMind .child");
            $(".fuck-ie-before", children).removeClass("fuck-ie-before");
            $(".fuck-ie-after", children).removeClass("fuck-ie-after");
            children.each(function (idx, itm) {
                var wraps = $(".wrap", itm);
                if (wraps.length > 0) {
                    $(".wrap-before", $(wraps[0])).addClass('fuck-ie-before');
                    $(".wrap-before", $(wraps[wraps.length - 1])).addClass('fuck-ie-after');
                }

            })
        }
    }

    //delete callback
    function deleteCallback(elementBlock) {
        var elementID = elementBlock.attr("id");
        var parentID = elementID.replace(/\-\d+$/, "");
        var childNum = $("#" + parentID + '-child .wrap').length;
        if (childNum == 2) {
            var siblingWrap = elementBlock.parents(".wrap").siblings(".wrap");
            var siblingBlock = siblingWrap.find(".element-block");
            var siblingModel = __getDataModelByNode(siblingWrap);
            __delNode(elementBlock);
            __delNode(siblingBlock);

            //清除该容器结点
            $("#" + parentID + "-child").remove().after(function () {
                // var n = document.getElementById(parentID + "-child");
                // if(n && n.parentNode){
                //     var p = n.parentNode;
                //      p.removeChild(n);
                // }

                $("#" + parentID + "-child").remove();
                addNodeByModel($('#' + parentID), siblingModel);
                $("#" + parentID + "-child").remove();
            }); //delete from dom but do not remove from jQuery object


        } else if (childNum > 2) {
            __delNode(elementBlock);
        }
        // updateMind($("#"+parentID))
        updateHeight($("#" + parentID));
        updateMind($("#mindNodeMain"));
    }

    function __delNode(nodeElement) {
        var id = nodeElement.attr("id");
        nodeElement.parents('.wrap').remove();
        //if()
        if ($("#" + id + "-child").length > 0) {
            $("#" + id + "-child .element-block").each(function (idx, itm) {
                __delNode($(itm));
            })
            $("#" + id + "-child").remove();
        }

    }

    function clearMindNode() {
        this.close();
        $(".child").remove();
        changeToElement($("#mindNodeMain"));
    }

    //不否自定义标签
    function isCustom(val, dataCustom) {
        for (var k = 0, klen = dataCustom.length; k < klen; k++) {
            if (dataCustom[k].val == val) {
                return true;
            }
        }
        return false
    }

    /*
     * get panel content template
     * */
    function getPanelTemplate(id) {
        var _id = "t_" + id;
        var templatObj = {
            "t_1": {
                id: 'content_block_1',
                str: '<div class="row">' +
                '<div class="col-xs-3"><div class="select-block "><select class="patient-infos-1" style="width: 100%"></select></div></div><div class="col-xs-1 text-center">--</div>' +
                '<div class="col-xs-2"><div class="select-block "><select class="patient-infos-2" style="width: 100%"></select></div></div><div class="col-xs-1 text-center" id="deadgg">--</div>' +
                '<div class="col-xs-2 condition-col-3">' +
                '<div class="select-block select" data-type="select"><select class="patient-infos-3 " style="width: 100%"></select></div>' +
                '<div class="select-block text" data-type="text"><input class="patient-infos-3 form-control " placeholder="请输入" /></div>' +
                '<div class="select-block number" data-type="number"><input class="patient-infos-3 form-control " value="0" /></div>' +
                '<div class="select-block date" data-type="date"><input class="patient-infos-3 form-control" readonly value="" id="conditionDate" style="cursor: pointer" placeholder="请选择日期" /></div>' +
                '</div>' +
                '<div class="col-xs-1"><span class="basic-gg">~</span></div>' +
                '<div class="col-xs-2 condition-col-3">' +
                '<div class="select-block number" data-type="number" id="n2" style="display: none"><input class="patient-infos-3 form-control " value="1" /></div>' +
                '<div class="select-block date" data-type="date" id="d2" style="display: none"><input class="patient-infos-3 form-control" readonly value="" id="conditionDate2" style="cursor: pointer" placeholder="请选择日期" /></div>' +
                '</div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event basic info
                    $(".patient-infos-1", container).select2({minimumResultsForSearch: -1});
                    $(".patient-infos-2", container).on("change", function (e) {
                        var $this = $(this);
                        var val = $(this).val();
                        var val1 = $(".patient-infos-1", container).select2("val");

                        if (val == "bw") {
                            switch (val1) {
                                case "basic.inp.days":
                                case "basic.age":
                                case "basic.totalCost":
                                    $("#n2").show();
                                    $(".basic-gg").show();
                                    break;
                                case "basic.admit.time":
                                case "basic.discharge.time":
                                    $("#d2").show();
                                    $(".basic-gg").show();
                                    break;
                            }
                        } else {
                            $("#n2").hide();
                            $("#d2").hide();
                            $(".basic-gg").hide();

                        }
                    }).select2({minimumResultsForSearch: -1});
                    $(".select select.patient-infos-3", container).select2({minimumResultsForSearch: -1});
                    $('#conditionDate', container).datepicker({
                        language: 'zh-CN',
                        format: "yyyy/mm/dd",//"yyyy-mm-dd",
                        endDate: "0d",
                        autoclose: true,
                        todayHighlight: true
                    });
                    $('#conditionDate2', container).datepicker({
                        language: 'zh-CN',
                        format: "yyyy/mm/dd",//"yyyy-mm-dd",
                        endDate: "0d",
                        autoclose: true,
                        todayHighlight: true
                    });
                    $(".select select.patient-infos-3", container).select2({minimumResultsForSearch: -1});

                    $(".condition-col-3", container).on("keyup", '.number>input', function () {
                        var v = $(this).val();
                        if (/^\d+\.?\d*$/.test(v) == false) {
                            v = ""
                        }
                        $(this).val(v);
                    }).on("paste", '.number>input', function () {
                        var v = $(this).val();
                        if (/^\d+\.?\d*$/.test(v) == false) {
                            v = ""
                        }
                        $(this).val(v);
                    });
                    $(".condition-col-3 .number>input", container).css("ime-mode", "disabled");
                    $(".patient-infos-1", container).on('change', function (e) {
                        renderConditionValueByType($(this).val());
                    })
                    getBasicInfo();
                },
                updatePanel: function (elementObj) {
                    //update panel 1
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        var key = $(".patient-infos-1").find("option:first-child").attr("value");
                        $(".patient-infos-1").select2("val", key);
                        $(".patient-infos-1").trigger("change")
                    } else {
                        dataValues = JSON.parse(dataValues);
                        if (dataValues.length > 0) {
                            $(".patient-infos-1").select2("val", dataValues[0]);
                            $(".patient-infos-1").trigger("change");
                            $(".patient-infos-2").select2("val", dataValues[1]);
                            $(".patient-infos-2").trigger("change");
                            if (dataValues[2]) {
                                setSl3ValBySl1(dataValues[0], dataValues[2], dataValues[3]);
                            }
                        }
                    }
                }
            },
            "t_2": {
                id: 'content_block_2',
                str: '<div class="row" style="margin-bottom: 8px;">' +
                '<div class="col-xs-12"><div class="disease-tag-container" id="diseaseAddedTag"></div></div>' + //疾病标签
                '</div>' +
                '<div class="row">' + //查询
                '<div class="col-xs-9"><div class="disease-search-container"><input class="form-control search-input" placeholder="请输入查找关键词"><div class="dropdown-tip t"></div></div></div>' +
                '<div class="col-xs-3" style="padding: 8px;background-color: #ffffff"><div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default active" data-value="eq">包含</button><button type="button" class="btn btn-default" data-value="ne">不包含</button></div></div>' +
                '</div>' +
                '<div class="row" style="background-color: #ffffff;margin-top: 10px">' +
                '<div class="col-xs-3"><div class="disease-list-container" ><div class="disease-list-block" id="diseaseLeftMenu"></div></div></div>' +
                '<div class="col-xs-9"><div class="disease-tags-main"><div id="diseaseMainTag"></div></div></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    //疾病
                    getDiseaseMainKind();
                    //event regist
                    $(".btn-group", container).on("click", "button", function (e) {
                        var $this = $(this);
                        $this.parents('.btn-group').find("button").removeClass("active");
                        $this.addClass("active");
                    });
                    $(container).on("click", "a.disease-kind-link", function (e) {
                        $(container).find("a.disease-kind-link").removeClass("active");
                        $(this).addClass("active");
                        getTagsByDiseaseName({text: "", category: $(this).text()});
                    })
                    $(container).on("click", "span.disease-tag-item", function (e) {
                        var $this = $(this);
                        if ($this.hasClass("active") == false) {
                            addDiseaseTags({text: $this.text(), value: $this.attr("data-value"), isCustom: 'no'});
                            $this.addClass("active")
                        } else {
                            $this.removeClass("active");
                            $(".added-tag[data-value='" + $this.attr("data-value") + "']").remove();
                        }
                    })
                    $(container).on("click", "a.delete-tag", function (e) {
                        var $this = $(this);
                        var tag = $this.parents(".added-tag");
                        var dataVal = tag.attr("data-value");
                        tag.remove();
                        $(container).find("span.disease-tag-item[data-value='" + dataVal + "']").removeClass("active");
                    })

                    $(container).on("keyup", "input.search-input", function (e) {
                        var $this = $(this);

                        if ($this.val()) {
                            throttle(function () {
                                getTagsByDiseaseName({text: $this.val(), system: ''}, container)
                                // updateSearchDropdown(dropList,$this.val())

                            }, 200)();
                        }
                    })
                    //隐藏dropdown
                    $(document).on("click", container, function (e) {
                        var dropList = $(container).find(".dropdown-tip");
                        var isShow = dropList.is(":visible");
                        if (isShow) {
                            dropList.empty().hide();
                        }
                    });
                    //item click
                    $(container).on("click", ".dropdown-tip-item", function (e) {
                        var $this = $(this);
                        var obj = {
                            value: $this.attr("data-value"),
                            text: $this.text(),
                            isCustom: "no"
                        };
                        if ($this.attr("data-type") == "custom") {
                            obj["isCustom"] = "yes";
                        }
                        addDiseaseTags(obj);
                        $("input.search-input", container).val("")
                    });

                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        $("#diseaseAddedTag").empty();
                    } else {
                        $("#diseaseAddedTag").empty();
                        dataValues = JSON.parse(dataValues);
                        var dataCustom = elementObj.dataCustom;
                        for (var i = 2, len = dataValues.length; i < len; i++) {

                            var obj = {
                                value: dataValues[i],
                                text: dataValues[i],
                            }
                            if (isCustom(dataValues[i], dataCustom)) {
                                obj['isCustom'] = 'yes'
                                obj['text'] = dataValues[i] + " (自定义词汇)"
                            } else {
                                obj['isCustom'] = 'no';
                            }
                            addDiseaseTags(obj);
                        }
                        if (dataValues[1] == "ne" || dataValues[1] == "exclude") {
                            $("#content_block_2").find(".btn-group button").removeClass("active");
                            $("#content_block_2").find(".btn-group button[data-value='ne']").addClass("active");
                        } else {
                            $("#content_block_2").find(".btn-group button").removeClass("active");
                            $("#content_block_2").find(".btn-group button[data-value='eq']").addClass("active");
                        }

                    }
                }
            },
            "t_3": {
                id: 'content_block_3',
                str: '<div class="row" style="margin-bottom: 5px">' +
                '<div class="col-xs-12"><div class="disease-tag-container" id="selectedSymptom" style="text-align: left"></div></div>' + //疾病标签
                '</div>' +
                '<div class="row">' + //查询
                '<div class="col-xs-9"><div class="disease-search-container"><input class="form-control search-input" placeholder="请输入查找关键词"><div class="dropdown-tip t"></div></div></div>' +
                '<div class="col-xs-3" style="padding: 8px;background-color: #ffffff"><div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default active" data-value="eq">包含</button><button type="button" class="btn btn-default" data-value="ne">不包含</button></div></div>' +
                '</div>' +
                '<div class="row" style="background-color: #ffffff;margin-top: 10px">' +
                // '<div class="col-xs-4"><div class="disease-list-container"><div class="disease-list-block"></div></div></div>' +
                '<div class="col-xs-12"><div class="disease-tags-main"><div id="symptomTags" style="text-align: left"></div></div></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    getSymptomTagData(container);
                    $(".btn-group", container).on("click", "button", function (e) {
                        var $this = $(this);
                        $this.parents('.btn-group').find("button").removeClass("active");
                        $this.addClass("active");
                    });
                    $(container).on("click", "span.disease-tag-item", function (e) {
                        var $this = $(this);
                        if ($this.hasClass("active") == false) {
                            addSymptomTags({text: $this.text(), value: $this.attr("data-value"), isCustom: 'no'});
                            $this.addClass("active");
                        } else {
                            $this.removeClass("active");
                            $(".added-tag[data-value='" + $this.attr("data-value") + "']").remove();
                        }
                    })
                    $(container).on("click", "a.delete-tag", function (e) {
                        var $this = $(this);
                        var tag = $this.parents(".added-tag");
                        var dataVal = tag.attr("data-value");
                        tag.remove();
                        $(container).find("span.disease-tag-item[data-value='" + dataVal + "']").removeClass("active");
                    })

                    $(container).on("keyup", "input.search-input", function (e) {
                        var $this = $(this);
                        if ($this.val()) {
                            throttle(function () {
                                getSymptomsByName($this.val(), container)
                            }, 200)();
                        }
                    })
                    //隐藏dropdown
                    $(document).on("click", container, function (e) {
                        var dropList = $(container).find(".dropdown-tip");
                        var isShow = dropList.is(":visible");
                        if (isShow) {
                            dropList.empty().hide();
                        }
                    });
                    //item click
                    $(container).on("click", ".dropdown-tip-item", function (e) {
                        var $this = $(this);
                        var obj = {
                            value: $this.attr("data-value"),
                            text: $this.text(),
                            isCustom: "no"
                        };
                        if ($this.attr("data-type") == "custom") {
                            obj["isCustom"] = "yes";
                        }
                        addSymptomTags(obj);
                        $("input.search-input", container).val("")
                    });

                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        $("#selectedSymptom").empty();
                    } else {
                        $("#selectedSymptom").empty();
                        dataValues = JSON.parse(dataValues);
                        var dataCustom = elementObj.dataCustom;
                        for (var i = 2, len = dataValues.length; i < len; i++) {
                            var obj = {
                                value: dataValues[i],
                                text: dataValues[i],
                            }
                            if (isCustom(dataValues[i], dataCustom)) {
                                obj['isCustom'] = 'yes'
                                obj['text'] = dataValues[i] + " (自定义词汇)"
                            } else {
                                obj['isCustom'] = 'no';
                            }
                            addSymptomTags(obj);
                        }
                    }
                    if (dataValues[1] == "ne" || dataValues[1] == "exclude") {
                        $("#content_block_3").find(".btn-group button").removeClass("active");
                        $("#content_block_3").find(".btn-group button[data-value='ne']").addClass("active");
                    } else {
                        $("#content_block_3").find(".btn-group button").removeClass("active");
                        $("#content_block_3").find(".btn-group button[data-value='eq']").addClass("active");
                    }

                }
            },
            "t_4": {
                id: 'content_block_4',
                str: '<div class="row">' +
                '<div class="col-xs-12"><div class="disease-tag-container" id="selectedDrugTags" style="text-align: left;"></div></div>' + //疾病标签
                '</div>' +
                '<div class="row" style="margin-top: 5px;">' + //查询
                '<div class="col-xs-9"><div class="disease-search-container"><input class="form-control search-input" placeholder="请输入查找关键词"><div class="dropdown-tip t"></div></div></div>' +
                '<div class="col-xs-3" style="padding: 8px;background-color: #ffffff"><div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default active" data-value="eq">包含</button><button type="button" class="btn btn-default" data-value="ne">不包含</button></div></div>' +
                '</div>' +
                '<div class="row" style="background-color: #ffffff;margin-top: 10px">' +
                '<div class="col-xs-4"><div class="disease-list-container"><div class="disease-list-block" id="drugLeftMainKind"></div></div></div>' +
                '<div class="col-xs-8"><div class="disease-tags-main"><div id="drugMainTag" style="text-align: left"></div></div></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    //药品
                    getDrugMainKind();
                    //event regist
                    $(".btn-group", container).on("click", "button", function (e) {
                        var $this = $(this);
                        $this.parents('.btn-group').find("button").removeClass("active");
                        $this.addClass("active");
                    });
                    $(container).on("click", "a.disease-kind-link", function (e) {
                        $(container).find("a.disease-kind-link").removeClass("active");
                        $(this).addClass("active");
                        getTagsByDrugName({text: "", category: $(this).text()});
                    })
                    $(container).on("click", "span.disease-tag-item", function (e) {
                        var $this = $(this);
                        if ($this.hasClass("active") == false) {
                            addDrugTags({text: $this.text(), value: $this.attr("data-value"), isCustom: 'no'});
                            $this.addClass("active")
                        } else {
                            $this.removeClass("active");
                            $(".added-tag[data-value='" + $this.attr("data-value") + "']").remove();
                        }
                    })
                    $(container).on("click", "a.delete-tag", function (e) {
                        var $this = $(this);
                        var tag = $this.parents(".added-tag");
                        var dataVal = tag.attr("data-value");
                        tag.remove();
                        $(container).find("span.disease-tag-item[data-value='" + dataVal + "']").removeClass("active");
                    })

                    $(container).on("keyup", "input.search-input", function (e) {
                        var $this = $(this);
                        if ($this.val()) {
                            throttle(function () {
                                getTagsByDrugName({text: $this.val(), category: ""}, container);
                            }, 200)();
                        }
                    })
                    //隐藏dropdown
                    $(document).on("click", container, function (e) {
                        var dropList = $(container).find(".dropdown-tip");
                        var isShow = dropList.is(":visible");
                        if (isShow) {
                            dropList.empty().hide();
                        }
                    });
                    //item click
                    $(container).on("click", ".dropdown-tip-item", function (e) {
                        var $this = $(this);
                        var obj = {
                            value: $this.attr("data-value"),
                            text: $this.text(),
                            isCustom: "no"
                        };
                        if ($this.attr("data-type") == "custom") {
                            obj["isCustom"] = "yes";
                        }
                        addDrugTags(obj);
                        $("input.search-input", container).val("")
                    });
                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        $("#selectedDrugTags").empty();
                    } else {
                        $("#selectedDrugTags").empty();
                        dataValues = JSON.parse(dataValues);
                        var dataCustom = elementObj.dataCustom;
                        for (var i = 2, len = dataValues.length; i < len; i++) {
                            var obj = {
                                value: dataValues[i],
                                text: dataValues[i],
                            }

                            addDrugTags(obj);
                        }
                    }
                    if (dataValues[1] == "ne" || dataValues[1] == "exclude") {
                        $("#content_block_4").find(".btn-group button").removeClass("active");
                        $("#content_block_4").find(".btn-group button[data-value='ne']").addClass("active");
                    } else {
                        $("#content_block_4").find(".btn-group button").removeClass("active");
                        $("#content_block_4").find(".btn-group button[data-value='eq']").addClass("active");
                    }

                }
            },
            "t_5": {
                id: 'content_block_5',
                str: '<div class="row" style="margin-bottom: 5px">' +
                '<div class="col-xs-12"><div class="disease-tag-container" id="selectedOperateTags" style="text-align: left"></div></div>' + //手术
                '</div>' +
                '<div class="row">' + //查询
                '<div class="col-xs-9"><div class="disease-search-container"><input class="form-control search-input" placeholder="请输入查找关键词"><div class="dropdown-tip t"></div></div></div>' +
                '<div class="col-xs-3" style="padding: 8px;background-color: #ffffff"><div class="btn-group" role="group" aria-label="..."><button type="button" class="btn btn-default active" data-value="eq">包含</button><button type="button" class="btn btn-default" data-value="ne">不包含</button></div></div>' +
                '</div>' +
                '<div class="row" style="background-color: #ffffff;margin-top: 10px">' +
                '<div class="col-xs-4"><div class="disease-list-container"><div class="disease-list-block" id="operateLeftMenu"></div></div></div>' +
                '<div class="col-xs-8"><div class="disease-tags-main" style="text-align: left"><div id="operateMainTag"></div></div></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    //手术
                    getOperateMainKind();
                    //event regist
                    $(".btn-group", container).on("click", "button", function (e) {
                        var $this = $(this);
                        $this.parents('.btn-group').find("button").removeClass("active");
                        $this.addClass("active");
                    });
                    $(container).on("click", "a.disease-kind-link", function (e) {
                        $(container).find("a.disease-kind-link").removeClass("active");
                        $(this).addClass("active");
                        getTagsByOperateName({text: "", category: $(this).text()});
                    })
                    $(container).on("click", "span.disease-tag-item", function (e) {
                        var $this = $(this);
                        if ($this.hasClass("active") == false) {
                            addOperateTags({text: $this.text(), value: $this.attr("data-value"), isCustom: 'no'});
                            $this.addClass("active")
                        } else {
                            $this.removeClass("active");
                            $(".added-tag[data-value='" + $this.attr("data-value") + "']").remove();
                        }
                    })
                    $(container).on("click", "a.delete-tag", function (e) {
                        var $this = $(this);
                        var tag = $this.parents(".added-tag");
                        var dataVal = tag.attr("data-value");
                        tag.remove();
                        $(container).find("span.disease-tag-item[data-value='" + dataVal + "']").removeClass("active");
                    })

                    $(container).on("keyup", "input.search-input", function (e) {
                        var $this = $(this);

                        if ($this.val()) {
                            throttle(function () {
                                getTagsByOperateName({text: $this.val(), category: ''}, container)
                            }, 200)();
                        }
                    })
                    //隐藏dropdown
                    $(document).on("click", container, function (e) {
                        var dropList = $(container).find(".dropdown-tip");
                        var isShow = dropList.is(":visible");
                        if (isShow) {
                            dropList.empty().hide();
                        }
                    });
                    //item click
                    $(container).on("click", ".dropdown-tip-item", function (e) {
                        var $this = $(this);
                        var obj = {
                            value: $this.attr("data-value"),
                            text: $this.text(),
                            isCustom: "no"
                        };
                        if ($this.attr("data-type") == "custom") {
                            obj["isCustom"] = "yes";
                        }
                        addOperateTags(obj);
                        $("input.search-input", container).val("")
                    });
                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        $("#selectedOperateTags").empty();
                    } else {
                        $("#selectedOperateTags").empty();
                        dataValues = JSON.parse(dataValues);
                        var dataCustom = elementObj.dataCustom;
                        for (var i = 2, len = dataValues.length; i < len; i++) {
                            var obj = {
                                value: dataValues[i],
                                text: dataValues[i],
                            }

                            addOperateTags(obj);
                        }
                    }
                    if (dataValues[1] == "ne") {
                        $("#content_block_5").find(".btn-group button").removeClass("active");
                        $("#content_block_5").find(".btn-group button[data-value='ne']").addClass("active");
                    } else {
                        $("#content_block_5").find(".btn-group button").removeClass("active");
                        $("#content_block_5").find(".btn-group button[data-value='eq']").addClass("active");
                    }

                }
            },
            "t_6": {
                id: 'content_block_6',
                str: '<div class="row" style="margin-bottom: 5px">' +
                '<div class="col-xs-12"><div class="disease-tag-container" id="labSeletedContainer"></div></div>' + //疾病标签
                '</div>' +
                '<div class="row">' + //查询
                '<div class="col-xs-12"><div class="disease-search-container"><input class="form-control search-input" placeholder="请输入查找关键词"><div class="dropdown-tip t"></div></div></div>' +
                '</div>' +
                '<div class="row" style="background-color: #ffffff;margin-top: 10px;height: 246px;padding-top: 15px;margin-left: 0px;margin-right: 0px">' +
                '<div class="col-xs-4"><select style="width: 100%" id="labSelect1" class="lab-select"></select></div>' +
                '<div class="col-xs-4"><select style="width: 100%" id="labSelect2" class="lab-select"></select></div>' +
                '<div class="col-xs-4"><select style="width: 100%" id="labSelect3" class="lab-select"></select></div>' +
                '<div class="col-xs-12"><div class="lab-details" style="padding: 15px;"><div class="row" style="margin-top: 10px;border-top: 1px solid #41b8b0;padding-top: 15px"><div class="col-xs-4 text-left"><span id="conditionLabel"></span></div><div class="col-xs-3"><select id="labConditionSelect" style="width: 100%"></select></div><div class="col-xs-4"><input type="text" class="form-control" id="labIptVal1" value="0"><span class="lab-gg" style="display: none;padding:0px 5px;">~</span><input type="text" class="form-control" id="labIptVal2" value="1" style="display: none"></div><div class="col-xs-1 text-left"><span  id="unitTxt" style="display: none"></span></div></div></div></div>' +
                '</div>',

                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    $("#labSelect1").select2();
                    $("#labSelect2").select2();
                    $("#labSelect3").select2();
                    $("#labConditionSelect").select2({minimumResultsForSearch: -1});
                    getLabMainKind();
                    $("#labSelect1").on("change", function (e) {
                        var $this = $(this);
                        var val = $this.val();
                        if (labObject[val] && labObject[val].length > 0) {
                            var l2op = "";
                            var v2
                            for (var i = 0, len = labObject[val].length; i < len; i++) {
                                var vv = labObject[val][i];
                                if (i == 0) {
                                    v2 = vv.name;
                                }
                                l2op += "<option value='" + vv.name + "'>" + vv.name + "</option>";
                            }
                            if (l2op) {
                                $("#labSelect2").empty().append(l2op).select2("val", v2).trigger("change");
                            }
                        }
                    })
                    $("#labSelect2").on("change", function (e) {
                        var $this = $(this);
                        var val = $this.val();
                        getLabLevel3Values(val);
                    })
                    $("#labSelect3").on("change", function (e) {
                        var $this = $(this);
                        var val = $this.val();
                        var l = val + "(" + labLevel3Map[val].specimen + ")";
                        $("#conditionLabel", container).html(l);
                        $("#labSeletedContainer").html(l);
                        $("#labSeletedContainer").attr("data-name", val);
                        $("#labSeletedContainer").attr("data-specimen", labLevel3Map[val].specimen);
                        var op = labLevel3Map[val].valueConstraint.operators;
                        var opStr = ""
                        for (var i = 0, len = op.length; i < len; i++) {
                            opStr += "<option value='" + op[i].id + "' data-operand='" + (op[i].operand ? op[i].operand : '0') + "' data-unit='" + (labLevel3Map[val].valueConstraint.unit ? labLevel3Map[val].valueConstraint.unit : '') + "' data-ipt-type='" + labLevel3Map[val].valueConstraint.type + "'>" + op[i].text + "</option>";
                        }
                        if (opStr) {
                            $("#labConditionSelect").empty().append(opStr).select2("val", op[0].id).trigger("change")
                        }

                    })
                    $("#labConditionSelect").on("change", function (e) {
                        var $this = $(this);
                        var val = $this.val();
                        var dataOperand = $this.find("option:selected").attr("data-operand");
                        var unit = $this.find("option:selected").attr("data-unit");
                        if (unit == 'undefined') unit = '';
                        var text = $this.select2("data").text;
                        switch (dataOperand) {
                            case "0":
                                $("#labIptVal1").hide();
                                $("#labIptVal2").hide();
                                $(".lab-gg").hide();
                                $("#unitTxt").hide();
                                break;
                            case "1":
                                $("#labIptVal1").show();
                                $("#labIptVal2").hide();
                                $(".lab-gg").hide();
                                $("#unitTxt").empty().show().text(unit);
                                break;
                            case "2":
                                $("#labIptVal1").show();
                                $("#labIptVal2").show();
                                $(".lab-gg").show();
                                $("#unitTxt").empty().show().text(unit);
                                break;
                        }
                        updateLabSelectedInfo();
                    })

                    $("#labIptVal2").on("keyup", function (e) {
                        updateLabSelectedInfo();
                    })
                    $("#labIptVal1").on("keyup", function (e) {
                        updateLabSelectedInfo();
                    })

                    $(container).on("keyup", "input.search-input", function (e) {
                        var $this = $(this);
                        if ($this.val()) {
                            throttle(function () {
                                getLabSearchItems({text: $this.val()}, container)
                            }, 200)();
                        }
                    })
                    //隐藏dropdown
                    $(document).on("click", container, function (e) {
                        var dropList = $(container).find(".dropdown-tip");
                        var isShow = dropList.is(":visible");
                        if (isShow) {
                            dropList.empty().hide();
                        }
                    });
                    //item click
                    $(container).on("click", ".dropdown-tip-item", function (e) {
                        var $this = $(this);
                        var val = $this.attr("data-name");
                        var valueConstraint = JSON.parse(decodeURIComponent($this.attr("data-constraint")))
                        var l = val + "(" + $this.attr("data-specimen") + ")";
                        $("#conditionLabel", container).html(l);
                        $("#labSeletedContainer").html(l);
                        $("#labSeletedContainer").attr("data-name", val);
                        $("#labSeletedContainer").attr("data-specimen", $this.attr("data-specimen"));
                        var op = valueConstraint.operators;
                        var opStr = ""
                        for (var i = 0, len = op.length; i < len; i++) {
                            opStr += "<option value='" + op[i].id + "' data-operand='" + (op[i].operand ? op[i].operand : "0") + "' data-unit='" + (valueConstraint.unit ? valueConstraint.unit : "") + "' data-ipt-type='" + valueConstraint.type + "'>" + op[i].text + "</option>";
                        }
                        if (opStr) {
                            $("#labConditionSelect").empty().append(opStr).select2("val", op[0].id).trigger("change")
                        }

                        $("input.search-input", container).val("")
                    });

                },
                updatePanel: function (elementObj) {

                }
            },
            "t_7": {
                id: 'content_block_7',
                str: '<div class="row">' +
                '<div class="col-xs-3"><div class="select-block"><select id="sel1Vital4Dlg" style="width: 100%;"></select></div></div><div class="col-xs-1 text-center">--</div>' +
                '<div class="col-xs-2"><div class="select-block"><select id="sel2Vital4Dlg" style="width: 100%;"></select></div></div><div class="col-xs-1 text-center">--</div>' +
                '<div class="col-xs-2"><div class="select-block" ><input class="form-control" id="ipt3Vitl4Dlg" placeholder="请输入"></div></div><div class="col-xs-1 text-center ipt3Vitl4Dlg_1">~</div><div class="col-xs-2"><div class="select-block" ><input class="form-control ipt3Vitl4Dlg_1" id="ipt3Vitl4Dlg_1" style="display: none" placeholder="请输入"></div></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                    $("#sel1Vital4Dlg", container).select2({minimumResultsForSearch: -1});
                    $("#sel2Vital4Dlg", container).select2({minimumResultsForSearch: -1});
                    getVitalSeletData();
                    //event
                    $("#ipt3Vitl4Dlg", container).on("keyup", function () {
                        var v = $(this).val();
                        if (/^\d+\.?\d*$/.test(v) == false) {
                            v = ""
                        }
                        $(this).val(v);
                    }).on("paste", function () {
                        var v = $(this).val();
                        if (/^\d+\.?\d*$/.test(v) == false) {
                            v = ""
                        }
                        $(this).val(v);
                    });
                    $("#sel1Vital4Dlg", container).on("change", function (e) {
                        var $this = $(this);
                        var key = $this.val();
                        var v2;
                        $("#sel2Vital4Dlg").empty().append((function () {
                            var data = vitalConditions[key];
                            var op = '';
                            for (var i = 0, len = data.length; i < len; i++) {
                                if (i == 0) {
                                    v2 = data[i]["id"];
                                }

                                op += '<option value="' + data[i]["id"] + '">' + data[i]["text"] + '</option>';
                            }
                            return op;
                        })());
                        $("#sel2Vital4Dlg").select2("val", v2).trigger("change");
                    })
                    $("#sel2Vital4Dlg", container).on("change", function (e) {
                        $("#ipt3Vitl4Dlg", container).val("");
                        $("#ipt3Vitl4Dlg_1", container).val("");

                        if ($(this).val() == 'bw') {
                            $(".ipt3Vitl4Dlg_1").show()
                        } else {
                            $(".ipt3Vitl4Dlg_1").hide();
                        }
                    })


                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        var key = $("#sel1Vital4Dlg").find("option:first-child").attr("value");
                        $("#sel1Vital4Dlg").select2("val", key);
                        $("#sel1Vital4Dlg").trigger("change")
                    } else {
                        dataValues = JSON.parse(dataValues);
                        if (dataValues.length > 0) {
                            $("#sel1Vital4Dlg").select2("val", dataValues[0]);
                            $("#sel1Vital4Dlg").trigger("change");
                            $("#sel2Vital4Dlg").select2("val", dataValues[1]);
                            $("#sel2Vital4Dlg").trigger("change");
                            if (isArray(dataValues[2]) && dataValues[2].length > 1) {
                                $("#ipt3Vitl4Dlg").val(dataValues[2][0]);
                                $("#ipt3Vitl4Dlg_1").val(dataValues[2][1])
                            } else {
                                $("#ipt3Vitl4Dlg").val(dataValues[2]);
                            }

                        }
                    }

                }
            },
            "t_8": {
                id: 'content_block_8',
                str: '<div class="row">' +
                '<label class="col-xs-12 text-left"><span class="label-tip">* 检查报告包含以下内容</span></label>' +
                '<div class="col-xs-12"><input id="summaryText" type="text" class="form-control check-summary-text" placeholder="输入内容"></div>' +
                '</div>',
                toString: function () {
                    return this.str;
                },
                renderPanel: function (container) { //regist event
                },
                updatePanel: function (elementObj) {
                    var dataValues = elementObj.dataValue;
                    if (!dataValues) {
                        $("#summaryText").val("");
                    } else {
                        dataValues = JSON.parse(dataValues);
                        if (dataValues.length > 0) {
                            $("#summaryText").val(dataValues[2]);
                        }
                    }

                }
            }
        }
        return templatObj[_id] ? templatObj[_id] : '';
    }

    //get patient basic info
    function getBasicInfo() {
        $.ajax({
            url: '/_/hosp/search/kword/basic',
            type: 'GET',
            success: function (data) {
                if (data && data.keywords.length > 0) {
                    basicInfoObj = data.keywords;
                    getHospitalArray();
                    updateBasicSelect();

                } else {
                    // getSimpleNotify('获取病人基本信息失败')
                }
            },
            error: function () {
                getSimpleNotify('获取病人基本信息失败')
            }
        })
    }

    function getHospitalArray() {
        $.ajax({
            url: '/_/hosp/search/kword/hospital',
            type: 'GET',
            success: function (data) {
                if (data && data.hospital && data.hospital.length > 0) {
                    hospitalInfoObj = data.hospital;
                } else {
                    // getSimpleNotify('获')
                }
            },
            error: function () {
                getSimpleNotify('获取医院列表信息失败')
            }
        })
    }

    function updateBasicSelect() {
        var datas = [];
        for (var i = 0, len = basicInfoObj.length; i < len; i++) {
            // if(!basicInfoConditions[basicInfoObj[i]._id])basicInfoConditions[basicInfoObj[i]._id]={};
            basicInfoConditions[basicInfoObj[i].id] = basicInfoObj[i].valueConstraint.operators;
            if (basicInfoObj[i].valueConstraint.choices) {
                basicInfoChoice[basicInfoObj[i].id] = basicInfoObj[i].valueConstraint.choices;
            }
            datas.push({
                id: basicInfoObj[i].id,
                text: basicInfoObj[i].text
            })
        }
        var v;
        $("#content_block_1 select.patient-infos-1").empty().append((function (datas) {
            var op = '';
            for (var j = 0, jlen = datas.length; j < jlen; j++) {
                if (j == 0) v = datas[j].id;
                op += '<option value="' + datas[j].id + '">' + datas[j].text + '</option>'
            }
            return op;
        })(datas));
        $("#content_block_1 select.patient-infos-1").select2("val", v);
        $("#content_block_1 select.patient-infos-1").trigger("change");
    }

    //get vital select info
    function getVitalSeletData() {
        $.ajax({
            url: '/_/hosp/search/kword/vital',
            type: 'GET',
            success: function (data) {
                if (data && data.keywords.length > 0) {
                    vitalObj = data.keywords;
                    updateVitalSelect();
                } else {
                    getSimpleNotify('获取病人基本信息失败')
                }
            },
            error: function () {
                getSimpleNotify('获取病人基本信息失败')
            }
        })
    }

    function updateVitalSelect() {
        var datas = [];
        for (var i = 0, len = vitalObj.length; i < len; i++) {
            vitalConditions[vitalObj[i].id] = vitalObj[i].valueConstraint.operators;
            datas.push({
                id: vitalObj[i].id,
                text: vitalObj[i].text
            })
        }
        var v;
        $("#sel1Vital4Dlg").empty().append((function (datas) {
            var op = '';
            for (var j = 0, jlen = datas.length; j < jlen; j++) {
                if (j == 0) v = datas[j].id;
                op += '<option value="' + datas[j].id + '">' + datas[j].text + '</option>'
            }
            return op;
        })(datas));
        $("#sel1Vital4Dlg").select2("val", v);
        $("#sel1Vital4Dlg").trigger("change");
    }

    function renderConditionValueByType(tp) {
        var basicCol2Datas = basicInfoConditions[tp];
        if (!basicCol2Datas) return;
        var op2 = '', v;
        for (var i = 0, len = basicCol2Datas.length; i < len; i++) {
            if (i == 0) v = basicCol2Datas[i].id;
            op2 += '<option value="' + basicCol2Datas[i].id + '">' + basicCol2Datas[i].text + '</option>';
        }
        $("#content_block_1 select.patient-infos-2").empty().append(op2).select2("val", v);
        $("#content_block_1 select.patient-infos-2").trigger("change");
        //选项3的显示方式
        switch (tp) {
            //input
            case "basic.inp.no": //住院号
            case "basic.idCode"://身份证
            case "basic.admit.dept"://入院科室
            case "basic.discharge.dept"://出院科室
            case "basic.doctors": //医生
                $("#content_block_1 .condition-col-3>.select-block").hide();
                $("#content_block_1 .condition-col-3>.select-block.text").show().find('input').val("");
                break;

            //number input
            case "basic.age": //年龄
            case "basic.inp.days": //住院天数
            case "basic.totalCost"://总费用
                $("#content_block_1 .condition-col-3>.select-block").hide();
                $("#content_block_1 .condition-col-3>.select-block.number").show().find('input').val("0");
                if (v != 'bw') {
                    $("#n2").hide();
                } else {
                    $("#n2").show().find("input").val("");
                }
                break;
            //select
            case "basic.visit.type": //就诊类型
            case "basic.hospital"://医院
            case "basic.gender"://性别
                var op3 = '', op3Obj = basicInfoChoice[tp];
                if (tp == "basic.hospital") {
                    op3Obj = hospitalInfoObj;
                }
                if (!op3Obj) {
                    op3Obj = [];
                }
                var jv;
                for (var j = 0, jlen = op3Obj.length; j < jlen; j++) {
                    if (j == 0) jv = op3Obj[j];
                    op3 += '<option value="' + op3Obj[j] + '">' + op3Obj[j] + '</option>';
                }
                $("#content_block_1 .condition-col-3>.select-block.select select").empty().append(op3).select2("val", jv);
                $("#content_block_1 .condition-col-3>.select-block").hide();
                $("#content_block_1 .condition-col-3>.select-block.select").show();
                break;
            //date
            case  "basic.admit.time": //入院时间
            case "basic.discharge.time"://出院时间
                $("#content_block_1 .condition-col-3>.select-block").hide();
                $("#content_block_1 .condition-col-3>.select-block.date").show().find('input').val("");
                if (v != 'bw') {
                    $("#d2").hide();
                } else {
                    $("#d2").show().find("input").val("");
                }
                break;
            //no display
            case "basic.isDead":
                $("#content_block_1 .condition-col-3>.select-block").hide();
                $("#deadgg").hide();
                break;
        }
    }

    //获取疾病相关信息
    //==获取疾病分类
    function getDiseaseMainKind() {
        $.ajax({
            url: '/_/hosp/search/kword/disease/category',
            type: 'GET',
            success: function (data) {
                if (data && data.categories.length > 0) {
                    renderDiseaseMainKind(data.categories);
                } else {
                    getSimpleNotify('获取疾病分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取疾病分类失败')
            }
        })
    }

    function renderDiseaseMainKind(datas) {
        if (datas && datas.length) {
            var diseaseName = "";
            var str = "<ul>";
            for (var i = 0, len = datas.length; i < len; i++) {
                if (i == 0) {
                    diseaseName = datas[i];
                    str += "<li><a class='disease-kind-link active' href='javascript:void(0)'>" + datas[i] + "</a></li>";
                } else {
                    str += "<li><a class='disease-kind-link' href='javascript:void(0)'>" + datas[i] + "</a></li>";
                }
            }
            str += "</ul>";
            $("#diseaseLeftMenu").empty().append(str);
            if (diseaseName != "") {
                getTagsByDiseaseName({text: '', category: diseaseName});
            }
        }
    }

    //获取疾病标签
    function getTagsByDiseaseName(obj, container) {
        $.ajax({
            type: "POST",
            url: '/_/hosp/search/kword/disease/item/search',
            data: JSON.stringify(obj),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                if (data && data.diseases) {
                    if (obj.category) {
                        updateDiseaseMainTag(data.diseases);
                    } else {
                        updateSearchDropdown(data.diseases, obj, container);
                    }

                } else {
                    // getSimpleNotify('获取疾病标签失败')
                    $(".dropdown-tip", container).empty();
                    $(".dropdown-tip", container).html('<div class="dropdown-tip-item custom-item t" data-type="custom" data-value="'+obj.text+'">'+obj.text+' (自定义词汇)</div>').show();
                }

            },
            error: function () {
                // getSimpleNotify('获取疾病标签失败')
                $(".dropdown-tip", container).empty();
            }
        })
    }

    //更新疾病tag区
    function updateDiseaseMainTag(values) {
        if (values && isArray(values) && values.length > 0) {
            var tags = "";
            for (var i = 0, len = values.length; i < len; i++) {
                var val = values[i];
                tags += '<span class="disease-tag-item" data-value="' + val.name + '">' + val.text + '</span>'
            }
            if (tags) {
                $("body #diseaseMainTag").empty().append(tags);
            }
        }
    }

    //更新下拉列表项
    function updateSearchDropdown(datas, obj, container, notCustom) {
        var dropList = $(container).find(".dropdown-tip");
        if (!notCustom) {
            dropList.empty().append('<div class="dropdown-tip-item custom-item t" data-type="custom" data-value="' + obj.text + '">' + obj.text + ' (自定义词汇)</div>');
        }
        if (datas && datas.length) {
            var str = "";
            for (var i = 0, len = datas.length; i < len; i++) {
                str += '<div class="dropdown-tip-item  t" data-type="" data-value="' + datas[i].name + '">' + datas[i].text + '</div>';
            }
            if (str) {
                dropList.append(str);
            }
            $(dropList).show();
        }


    }

    //添加疾病标签
    function addDiseaseTags(obj) {
        if (obj) {
            var tag = "";
            if (obj.text && obj.value) {
                tag += "<span class='added-tag' data-value='" + obj.value + "' data-text='" + obj.text + "' data-isCustom='" + obj.isCustom + "'><span class='tag-label'>" + obj.text + "</span><a class='delete-tag' href='javascript:void(0)'>X</a></span>"
            }
            if (tag) {
                $("#diseaseAddedTag").append(tag);
            }

        }

    }

    //获取手术相关系统
    //==获取手术分类
    function getOperateMainKind() {
        $.ajax({
            url: '/_/hosp/search/kword/operation/category',
            type: 'GET',
            success: function (data) {
                if (data && data.categories.length > 0) {
                    renderOperateMainKind(data.categories);
                } else {
                    getSimpleNotify('获取手术分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取手术分类失败')
            }
        })
    }

    function renderOperateMainKind(datas) {
        if (datas && datas.length) {
            var diseaseName = "";
            var str = "<ul>";
            for (var i = 0, len = datas.length; i < len; i++) {
                if (i == 0) {
                    diseaseName = datas[i];
                    str += "<li><a class='disease-kind-link active' href='javascript:void(0)'>" + datas[i] + "</a></li>";
                } else {
                    str += "<li><a class='disease-kind-link' href='javascript:void(0)'>" + datas[i] + "</a></li>";
                }
            }
            str += "</ul>";
            $("#operateLeftMenu").empty().append(str);
            if (diseaseName != "") {
                getTagsByOperateName({text: '', category: diseaseName});
            }
        }
    }

    function getTagsByOperateName(obj, container) {
        $.ajax({
            type: "POST",
            url: '/_/hosp/search/kword/operation/item/search',
            data: JSON.stringify(obj),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                if (data && data.operations) {
                    if (obj.category) {
                        updateOperateMainTag(data.operations);
                    } else {
                        updateSearchDropdown(data.operations, obj, container, false);
                    }
                } else {
                    //getSimpleNotify('获取疾病标签失败')
                    $(".dropdown-tip", container).empty();
                    $(".dropdown-tip", container).html('<div class="dropdown-tip-item custom-item t" data-type="custom" data-value="'+obj.text+'">'+obj.text+' (自定义词汇)</div>');
                }

            },
            error: function () {
                //getSimpleNotify('获取疾病标签失败')
            }
        })
    }

    function updateOperateMainTag(values) {
        if (values && isArray(values) && values.length > 0) {
            var tags = "";
            for (var i = 0, len = values.length; i < len; i++) {
                var val = values[i];
                tags += '<span class="disease-tag-item" data-value="' + val.name + '">' + val.text + '</span>'
            }
            if (tags) {
                $("#operateMainTag").empty().append(tags);
            }
        }
    }

    function addOperateTags(obj) {
        if (obj) {
            var tag = "";
            if (obj.text && obj.value) {
                tag += "<span class='added-tag' data-value='" + obj.value + "' data-text='" + obj.text + "' data-isCustom='" + obj.isCustom + "'><span class='tag-label'>" + obj.text + "</span><a class='delete-tag' href='javascript:void(0)'>X</a></span>"
            }
            if (tag) {
                $("#selectedOperateTags").append(tag);
            }
        }
    }


    //==获取症状相关信息
    function getSymptomTagData(container) {
        $.ajax({
            url: '/_/hosp/search/kword/symptom/item/most',
            type: 'GET',
            success: function (data) {
                if (data && data.symptoms.length > 0) {
                    updateSymptomTagContent(data.symptoms, container);
                } else {
                    getSimpleNotify('获取疾病分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取疾病分类失败')
            }
        })
    }

    //更新症状区tag
    function updateSymptomTagContent(datas, container) {
        var symptomTags = $("#symptomTags");
        symptomTags.empty();
        if (datas && isArray(datas) && datas.length > 0) {
            var tags = '';
            for (var i = 0, len = datas.length; i < len; i++) {
                var val = datas[i];
                tags += '<span class="disease-tag-item" data-value="' + val.name + '">' + val.text + '</span>'
            }
            if (tags) {
                $("#symptomTags").empty().append(tags);
            }
        }
    }

    //添加症状tag
    function addSymptomTags(obj) {
        if (obj) {
            var tag = "";
            if (obj.text && obj.value) {
                tag += "<span class='added-tag' data-value='" + obj.value + "' data-text='" + obj.text + "' data-isCustom='" + obj.isCustom + "'><span class='tag-label'>" + obj.text + "</span><a class='delete-tag' href='javascript:void(0)' style='padding-left: 5px'>  X</a></span>"
            }
            if (tag) {
                $("#selectedSymptom").append(tag);
            }

        }

    }

    function getSymptomsByName(sName, container) {
        $.ajax({
            type: "POST",
            url: '/_/hosp/search/kword/symptom/item/search',
            data: JSON.stringify({text: sName}),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                if (data && data.symptoms) {
                    updateSearchDropdown(data.symptoms, {text: sName}, container);
                } else {
                    //getSimpleNotify('获取列表失败')
                    $(".dropdown-tip", container).empty();
                    $(".dropdown-tip", container).html('<div class="dropdown-tip-item custom-item t" data-type="custom" data-value="' + sName + '">' + sName + ' (自定义词汇)</div>');
                }

            },
            error: function () {
                  getSimpleNotify('获取症状数据失败');
                $(".dropdown-tip", container).empty();
            }
        })
    }

    //==获取药品分类
    function getDrugMainKind() {
        $.ajax({
            url: '/_/hosp/search/kword/drug/category',
            type: 'GET',
            success: function (data) {
                if (data && data.categories.length > 0) {
                    renderDrugMainKind(data.categories);
                } else {
                    //getSimpleNotify('获取疾病分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取疾病分类失败')
            }
        })
    }

    function renderDrugMainKind(datas) {
        if (datas && datas.length) {
            var diseaseName = "";
            var str = "<ul>";
            for (var i = 0, len = datas.length; i < len; i++) {
                if (i == 0) {
                    diseaseName = datas[i].name;
                    str += "<li><a class='disease-kind-link active' href='javascript:void(0)'>" + datas[i].name + "</a></li>";
                } else {
                    str += "<li><a class='disease-kind-link' href='javascript:void(0)'>" + datas[i].name + "</a></li>";
                }
            }
            str += "</ul>";
            $("#drugLeftMainKind").empty().append(str);
            if (diseaseName != "") {
                getTagsByDrugName({text: '', category: diseaseName});
            }
        }
    }

    function getTagsByDrugName(obj, container) {
        $.ajax({
            type: "POST",
            url: '/_/hosp/search/kword/drug/item/search',
            data: JSON.stringify(obj),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                if (data && data.drugs) {
                    if (obj.category) {
                        updateDrugMainTag(data.drugs);
                    } else {
                        updateSearchDropdown4Drug(data.drugs, container);
                    }
                } else {
                    // getSimpleNotify('获取疾病标签失败')
                    $(".dropdown-tip", container).empty();
                }

            },
            error: function () {
                // getSimpleNotify('获取疾病标签失败')
                $(".dropdown-tip", container).empty();
            }
        })
    }

    function updateDrugMainTag(values) {
        var categoryObj = {};
        if (values && isArray(values) && values.length > 0) {
            for (var i = 0, len = values.length; i < len; i++) {
                var kindName = values[i].category[1];
                if (!categoryObj[kindName]) {
                    categoryObj[kindName] = []
                }
                categoryObj[kindName].push({
                    name: values[i].name,
                    text: values[i].text
                })

            }
            var s = "";
            for (var key in categoryObj) {
                s += '<div style="margin-top: 10px"><div><label class="block-label" style="padding-left: 15px">' + key + '</label></div><div>';
                for (var k = 0, klen = categoryObj[key].length; k < klen; k++) {
                    var val = categoryObj[key][k];
                    s += '<span class="disease-tag-item" data-value="' + val.name + '">' + val.text + '</span>';
                }
                s += '</div></div>';
            }
            $("#drugMainTag").empty().append(s);
        }
    }

    //添加药品标签
    function addDrugTags(obj) {
        if (obj) {
            var tag = "";
            if (obj.text && obj.value) {
                tag += "<span class='added-tag' data-value='" + obj.value + "' data-text='" + obj.text + "' data-isCustom='" + obj.isCustom + "'><span class='tag-label'>" + obj.text + "</span><a class='delete-tag' href='javascript:void(0)'>X</a></span>"
            }
            if (tag) {
                $("#selectedDrugTags").append(tag);
            }
        }
    }

    //添加药品下拉列表项
    function updateSearchDropdown4Drug(datas, container) {
        var dropList = $(container).find(".dropdown-tip");
        dropList.empty();
        if (datas && datas.length) {
            var str = "";
            for (var i = 0, len = datas.length; i < len; i++) {
                str += '<div class="dropdown-tip-item  t" data-type="custom" data-value="' + datas[i].name + '">' + datas[i].text + '</div>';
            }
            if (str) {
                dropList.append(str);
            }
            $(dropList).show();
        }

    }

    //==获取化验指标
    function getLabMainKind() {
        $.ajax({
            url: '/_/hosp/search/kword/labitem/category',
            type: 'GET',
            success: function (data) {
                if (data && data.categories.length > 0) {
                    var op1 = "";
                    for (var i = 0, len = data.categories.length; i < len; i++) {
                        labObject[data.categories[i].name] = data.categories[i].children;
                        op1 += "<option value='" + data.categories[i].name + "'>" + data.categories[i].name + "</option>";
                    }
                    $("#labSelect1").empty().append(op1).select2("val", data.categories[0].name).trigger("change");
                } else {
                    getSimpleNotify('获取疾病分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取疾病分类失败')
            }
        })
    }

    function getLabLevel3Values(val) {
        $.ajax({
            url: '/_/hosp/search/kword/labitem',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({"category": val}),
            success: function (data) {
                data.value = data.labitems;
                if (data && data.value.length > 0) {
                    var op = "", v;
                    for (var i = 0, len = data.value.length; i < len; i++) {
                        op += "<option value='" + data.value[i].name + "'>" + data.value[i].name + "</option>";
                        if (i == 0) {
                            v = data.value[i].name
                        }
                        labLevel3Map[data.value[i].name] = {
                            category: data.value[i].category,
                            specimen: data.value[i].specimen,
                            text: data.value[i].text,
                            valueConstraint: data.value[i].valueConstraint
                        }
                    }
                    if (op) {
                        $("#labSelect3").empty().append(op).select2("val", v).trigger("change");
                    }
                } else {
                    getSimpleNotify('获取疾病分类失败')
                }
            },
            error: function () {
                getSimpleNotify('获取疾病分类失败')
            }
        })
    }

    function updateLabSelectedInfo() {
        var selectedLab = $("#labSeletedContainer");
        var dataName = selectedLab.attr("data-name");
        var dataSpecimen = selectedLab.attr("data-specimen");
        var opVal = $("#labConditionSelect").select2("val");
        var unit = $("#labConditionSelect").find("option:selected").attr("data-unit");
        var dataOperand = $("#labConditionSelect").find("option:selected").attr("data-operand");
        var text = $("#labConditionSelect").select2("data").text;
        var dataValue = [];
        if ($("#labIptVal1").is(":visible")) {
            dataValue.push($("#labIptVal1").val())
        }
        if ($("#labIptVal2").is(":visible")) {
            dataValue.push($("#labIptVal2").val())
        }
        var valStr = "";
        if (dataValue.length == 1) {
            valStr += dataValue
        }
        if (dataValue.length == 2) {
            valStr = dataValue.join("~");
        }
        selectedLab.empty().html(dataName + "(" + dataSpecimen + ")" + text + (valStr ? valStr : "") + " " + (dataOperand == "0" ? "" : unit));
        selectedLab.attr("data-operate", opVal);
        selectedLab.attr("data-value", JSON.stringify(dataValue));
    }

    function getLabSearchItems(obj, container) {
        $.ajax({
            type: "POST",
            url: '/_/hosp/search/kword/labitem/search',
            data: JSON.stringify(obj),
            dataType: "json",
            contentType: 'application/json',
            success: function (data) {
                data["value"] = data.labitems;
                if (data && data.value) {
                    updateSearchDropdown4Lab(data.value, container);
                } else {
                    //getSimpleNotify('获取疾病标签失败')
                }

            },
            error: function () {
                getSimpleNotify('获取疾病标签失败')
            }
        })
    }

    //更新化验查询列表框
    function updateSearchDropdown4Lab(datas, container) {
        var dropList = $(container).find(".dropdown-tip");
        if (datas && datas.length) {
            var str = "";
            for (var i = 0, len = datas.length; i < len; i++) {
                var val = datas[i];
                str += '<div class="dropdown-tip-item  t"  data-specimen="' + val.specimen + '" data-name="' + val.name + '" data-constraint="' + encodeURIComponent(JSON.stringify(val.valueConstraint)) + '">' + val.name + "(" + val.specimen + ")" + '</div>';
            }
            if (str) {
                dropList.empty().append(str);
            }
            $(dropList).show();
        }
    }


    //保存面板数据
    function saveDialogData(panelIndex) {
        switch (panelIndex) {
            case "1": //保存基本信息
                var sl1Val = $("select.patient-infos-1").select2("val");
                var sl2Val = $("select.patient-infos-2").select2("val");
                var sl1Text = $("select.patient-infos-1").select2("data").text;
                var sl2Text = $("select.patient-infos-2").select2("data").text;
                if (!sl1Val) {
                    getSimpleNotify("基本信息选择不能为空");
                    return false;
                }
                if (!sl2Val) {
                    getSimpleNotify("条件不能空");
                    return false;
                }

                var sl3Val;
                if (sl1Val !== "basic.isDead") {
                    sl3Val = getSl3ValBySl1(sl1Val);
                    if (sl3Val == "") {
                        getSimpleNotify("条件值不能为空");
                        return false
                    }
                    if (isArray(sl3Val)) {
                        if (sl3Val[0] == "" || sl3Val[1] == "") {
                            getSimpleNotify("条件值不能为空");
                            return false
                        }
                        if (sl3Val[0] == sl3Val[1]) {
                            getSimpleNotify("条件值不能相同");
                        }
                    }
                } else {
                    sl3Val = "";
                }

                var dVal = [];
                dVal.push(sl1Val);
                dVal.push(sl2Val);
                if (isArray(sl3Val)) {
                    dVal.push(sl3Val);
                } else {
                    dVal.push(sl3Val);
                }


                var element = $("#" + __currentElementObj.domID);
                var txt = sl1Text + sl2Text + sl3Val;
                element.attr("data-text", encodeURIComponent(txt));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dVal)));
                element.find(".element-text").text(sl1Text + sl2Text + sl3Val);
                element.attr("data-panel", "1");
                element.removeAttr("data-params");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));
                return true;
            case "2":
                //疾病
                var panel = $("#content_block_2");
                var tags = $("#diseaseAddedTag").find(".added-tag");
                var opCustom = {
                    eq: 'include',
                    ne: 'exclude'
                }
                var op = panel.find(".btn-group button.active").attr("data-value");
                var isCustom = false;
                var vals = [], labels = [], customs = [];
                $(tags).each(function (idx, itm) {
                    var $this = $(this);
                    if ($this.attr("data-isCustom") == "yes") {
                        isCustom = true;
                        customs.push({
                            val: $this.attr("data-value"),
                            txt: $this.attr("data-text")
                        })
                    }
                    vals.push($this.attr("data-value").replace(' (自定义词汇)', ''));
                    labels.push($this.attr("data-text"));
                });

                var element = $("#" + __currentElementObj.domID);
                var t = labels.join(" ");
                var dataV = [];
                var keyWord = 'disease';
                if (isCustom) {
                    keyWord += ".fuzzy";
                    op = opCustom[op];
                }
                dataV.push(keyWord);
                dataV.push(op);
                vals.forEach(function (itm) {
                    dataV.push(itm);
                })
                var includeLabel = '';
                if (op == 'include') {
                    includeLabel = "包含"
                }
                if (op == 'exclude') {
                    includeLabel = "不包含"
                }
                if (op == 'eq') {
                    includeLabel = "等于"
                }
                if (op == 'ne') {
                    includeLabel = "不等于"
                }
                t = "疾病" + includeLabel + t;
                element.attr("data-text", encodeURIComponent(t));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dataV)));
                element.find(".element-text").html(t);
                element.attr("data-panel", "2");
                element.attr("data-custom", encodeURIComponent(JSON.stringify(customs)));
                element.removeAttr("data-params");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));

                return true;

            case "3":
                //症状
                var panel = $("#content_block_3");
                var tags = $("#selectedSymptom").find(".added-tag");
                var opCustom = {
                    eq: 'include',
                    ne: 'exclude'
                }
                var op = panel.find(".btn-group button.active").attr("data-value");
                var isCustom = false;
                var vals = [], labels = [], customs = [];
                $(tags).each(function (idx, itm) {
                    var $this = $(this);
                    if ($this.attr("data-isCustom") == "yes") {
                        isCustom = true;
                        customs.push({
                            val: $this.attr("data-value"),
                            txt: $this.attr("data-text")
                        })
                    }
                    vals.push($this.attr("data-text").replace(' (自定义词汇)', ''));
                    labels.push($this.attr("data-text"));
                });

                var element = $("#" + __currentElementObj.domID);
                var t = labels.join(" ");
                var dataV = [];
                var keyWord = 'symptom';
                if (isCustom) {
                    keyWord += ".fuzzy";
                    op = opCustom[op];
                }
                dataV.push(keyWord);
                dataV.push(op);
                vals.forEach(function (itm) {
                    dataV.push(itm);
                })
                var includeLabel = '';
                if (op == 'include') {
                    includeLabel = "包含"
                }
                if (op == 'exclude') {
                    includeLabel = "不包含"
                }
                if (op == 'eq') {
                    includeLabel = "等于"
                }
                if (op == 'ne') {
                    includeLabel = "不等于"
                }
                t = "症状" + includeLabel + t;
                element.attr("data-text", encodeURIComponent(t));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dataV)));
                element.find(".element-text").html(t);
                element.attr("data-panel", "3");
                element.attr("data-custom", encodeURIComponent(JSON.stringify(customs)));
                element.removeAttr("data-params");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));
                return true;

            case "4":
                //药品
                var panel = $("#content_block_4");
                var tags = $("#selectedDrugTags").find(".added-tag");
                var op = panel.find(".btn-group button.active").attr("data-value");
                var vals = [], labels = [];
                $(tags).each(function (idx, itm) {
                    var $this = $(this);
                    vals.push($this.attr("data-text"));
                    labels.push($this.attr("data-text"));
                });

                var element = $("#" + __currentElementObj.domID);
                var t = labels.join(" ");
                var dataV = [];
                var keyWord = 'drug';
                dataV.push(keyWord);
                dataV.push(op);
                vals.forEach(function (itm) {
                    dataV.push(itm);
                })
                var includeLabel = '';
                /*  if(op=='include'){
                 includeLabel="包含"
                 }
                 if(op=='exclude'){
                 includeLabel="不包含"
                 }*/
                if (op == 'eq') {
                    includeLabel = "等于"
                }
                if (op == 'ne') {
                    includeLabel = "不等于"
                }
                t = "药品" + includeLabel + t;
                element.attr("data-text", encodeURIComponent(t));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dataV)));
                element.find(".element-text").html(t);
                element.attr("data-panel", "4");
                element.removeAttr("data-params");
                // element.attr("data-custom", encodeURIComponent(JSON.stringify(customs)));
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));
                return true;

            case "5":
                //手术
                var panel = $("#content_block_5");
                var tags = $("#selectedOperateTags").find(".added-tag");
                 var opCustom = {
                 eq: 'include',
                 ne: 'exclude'
                 };
                var op = panel.find(".btn-group button.active").attr("data-value");
                var isCustom = false;
                var vals = [], labels = [], customs = [];
                $(tags).each(function (idx, itm) {
                    var $this = $(this);
                    if ($this.attr("data-isCustom") == "yes") {
                        isCustom = true;
                        customs.push({
                            val: $this.attr("data-value"),
                            txt: $this.attr("data-text")
                        })
                    }
                    vals.push($this.attr("data-text").replace(' (自定义词汇)', ''));
                    labels.push($this.attr("data-text"));
                });

                var element = $("#" + __currentElementObj.domID);
                var t = labels.join(" ");
                var dataV = [];
                var keyWord = 'operation';
                if (isCustom) {
                    keyWord += ".fuzzy";
                    op = opCustom[op];
                }
                dataV.push(keyWord);
                dataV.push(op);
                vals.forEach(function (itm) {
                    dataV.push(itm);
                })
                var includeLabel = '';
                if (op == 'include') {
                    includeLabel = "包含"
                }
                if (op == 'exclude') {
                    includeLabel = "不包含"
                }
                if (op == 'eq') {
                    includeLabel = "等于"
                }
                if (op == 'ne') {
                    includeLabel = "不等于"
                }
                t = "手术" + includeLabel + t;
                element.attr("data-text", encodeURIComponent(t));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dataV)));
                element.find(".element-text").html(t);
                element.attr("data-panel", "5");
                element.attr("data-custom", encodeURIComponent(JSON.stringify(customs)));
                element.removeAttr("data-params");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));

                return true;

            case "6":
                //化验
                var panel = $("#content_block_6");
                var labSelected = $("#labSeletedContainer");

                var element = $("#" + __currentElementObj.domID);
                var t = labSelected.text()
                var dataV = [];
                var keyWord = 'lab.item';
                var op = labSelected.attr("data-operate");
                var vals = JSON.parse(labSelected.attr("data-value"))
                dataV.push(keyWord);
                dataV.push(op);
                if (vals.length > 1 && op == "bw") {
                    dataV.push(vals);
                } else {
                    vals.forEach(function (itm) {
                        dataV.push(itm);
                    });
                }

                var dataParam = {
                    name: labSelected.attr("data-name"),
                    specimen: labSelected.attr("data-specimen")
                }

                t = "化验" + t;
                element.attr("data-text", encodeURIComponent(t));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dataV)));
                element.find(".element-text").html(t);
                element.attr("data-params", encodeURIComponent(JSON.stringify(dataParam)));
                element.attr("data-panel", "6");
                // element.attr("data-custom", encodeURIComponent(JSON.stringify(customs)));
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));

                return true;


            case "7":
                var sl1Val = $("#sel1Vital4Dlg").select2("val");
                var sl2Val = $("#sel2Vital4Dlg").select2("val");
                var sl1Text = $("#sel1Vital4Dlg").select2("data").text;
                var sl2Text = $("#sel2Vital4Dlg").select2("data").text;
                if (!sl1Val) {
                    getSimpleNotify("体征项不能为空");
                    return false;
                }
                if (!sl2Val) {
                    getSimpleNotify("条件不能空");
                    return false;
                }

                var sl3Val = $("#ipt3Vitl4Dlg").val();
                if (sl3Val == "") {
                    getSimpleNotify("体征值不能为空");
                    return false
                }


                var dVal = [];
                dVal.push(sl1Val);
                dVal.push(sl2Val);
                // dVal.push(sl3Val);
                var sl4Val = $("#ipt3Vitl4Dlg_1").val();
                if (sl2Val == 'bw') {
                    if (sl4Val == "") {
                        getSimpleNotify("区间值需要完整");
                        return false
                    }
                    dVal.push([sl3Val, sl4Val]);
                } else {
                    dVal.push(sl3Val)
                }

                var element = $("#" + __currentElementObj.domID);
                var txt = sl1Text + sl2Text + sl3Val;
                if (sl2Val == 'bw') {
                    txt += " 到 " + sl4Val;
                }
                element.attr("data-text", encodeURIComponent(txt));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dVal)));
                element.find(".element-text").text(txt);
                element.removeAttr("data-params");
                element.attr("data-panel", "7");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));
                return true;
            case "8":
                var textV = $("#summaryText").val();
                if (textV == "") {
                    getSimpleNotify("请输入检查内容");
                    return false
                }
                var element = $("#" + __currentElementObj.domID);
                var txt = '检查报告包括' + textV;
                var dVal = [];
                dVal.push('exam.fuzzy');
                dVal.push('include');
                dVal.push(textV);
                element.attr("data-text", encodeURIComponent(txt));
                element.attr("data-value", encodeURIComponent(JSON.stringify(dVal)));
                element.find(".element-text").text(txt);
                element.removeAttr("data-params");
                element.attr("data-panel", "8");
                var pId = __currentElementObj.domID.replace(/\-\d+$/, "");
                updateMind($("#" + pId));
                return true;

        }
        return true;
    }

    function getSl3ValBySl1(sl1Val) {
        switch (sl1Val) {
            //input
            case "basic.inp.no": //住院号
            case "basic.idCode"://身份证
            case "basic.admit.dept"://入院科室
            case "basic.discharge.dept"://出院科室
            case "basic.doctors": //医生
                return $("#content_block_1 .condition-col-3>.select-block.text").find('input').val();
            //number input
            case "basic.age": //年龄
            case "basic.inp.days": //住院天数
            case "basic.totalCost"://总费用
                var ipts = $("#content_block_1 .condition-col-3>.select-block.number:visible").find('input');
                if (ipts.length > 1) {
                    var n = [];
                    ipts.each(function (i, itm) {
                        n.push($(itm).val())
                    });
                    return n;
                } else {
                    return ipts.val();
                }
            //select
            case "basic.visit.type": //就诊类型
            case "basic.hospital"://医院
            case "basic.gender"://性别
                return $("#content_block_1 .condition-col-3>.select-block.select select").select2("val");
            //date
            case  "basic.admit.time": //入院时间
            case "basic.discharge.time"://出院时间
                var ipts = $("#content_block_1 .condition-col-3 .select-block.date:visible").find('input');
                if (ipts.length > 1) {
                    var n = [];
                    ipts.each(function (i, itm) {
                        n.push($(itm).val())
                    });
                    return n;
                } else {
                    return ipts.val();
                }
            //no display
            case "basic.isDead":
                return ""
        }
    }

    function setSl3ValBySl1(sl1Val, sl3Val, sl3Val_1) {
        switch (sl1Val) {
            //input
            case "basic.inp.no": //住院号
            case "basic.idCode"://身份证
            case "basic.admit.dept"://入院科室
            case "basic.discharge.dept"://出院科室
            case "basic.doctors": //医生
                $("#content_block_1 .condition-col-3>.select-block.text").find('input').val(sl3Val);
                break;
            //number input
            case "basic.age": //年龄
            case "basic.inp.days": //住院天数
            case "basic.totalCost"://总费用
                if (isArray(sl3Val) && sl3Val.length > 1) {
                    $("#content_block_1 .condition-col-3>.select-block.number").find('input').val(sl3Val[0]);
                    $("#n2>input").val(sl3Val[1]);
                } else {
                    $("#content_block_1 .condition-col-3>.select-block.number").find('input').val(sl3Val);
                }

                break;
            //select
            case "basic.visit.type": //就诊类型
            case "basic.hospital"://医院
            case "basic.gender"://性别
                $("#content_block_1 .condition-col-3>.select-block.select select").select2("val", sl3Val);
                $("#content_block_1 .condition-col-3>.select-block.select select").trigger("change")
                break;
            //date
            case  "basic.admit.time": //入院时间
            case "basic.discharge.time"://出院时间
                if (isArray(sl3Val) && sl3Val.length > 1) {
                    $("#content_block_1 .condition-col-3>.select-block.date").find('input').val(sl3Val[0]);
                    $("#d2>input").val(sl3Val[1]);
                } else {
                    $("#content_block_1 .condition-col-3>.select-block.number").find('input').val(sl3Val);
                }
                break;
            //no display
            case "basic.isDead":
                return ""
        }
    }

    function updateMind(elementDOM) {
        updateHeight(elementDOM);
        updatePos(elementDOM);
        updateCSSForIE();
    }

    function isConditionComplete() {
        var blocks = $("#boxMind").find(".element-block[data-type='4']");
        for (var i = 0, len = blocks.length; i < len; i++) {
            var bl = $(blocks[i]);
            var dataV = bl.attr("data-value")
            if (dataV == "") {
                return false;
            }
        }
        return true;
    }

    function buildUpQueryData() {
        var data = {
            "query": {}
        };
        var nodeDom = $("#mindRoot").find(".element-block");
        var nodeID = nodeDom.attr("id");
        var nodeType = nodeDom.attr("data-type");

        switch (nodeType) {
            case "1":
                data.query.or = {
                    "values": []
                };
                break;
            case "2":
                data.query.and = {
                    "values": []
                };
                break;
            case "4":
                var dataArr = JSON.parse(decodeURIComponent(nodeDom.attr("data-value")));
                var itemData;
                data.query.or = {};
                data.query.or.values = [];
                if (isArray(dataArr) && dataArr.length > 2) {
                    if (dataArr[2]) { //有条件值
                        var dataParam = nodeDom.attr("data-params");
                        var compares = []; //一次选择多个值时，比如一次选择多个症状
                        for (var i = 2, len = dataArr.length; i < len; i++) {
                            var cp = {
                                "compare": {
                                    "kword": dataArr[0],
                                    "operator": dataArr[1],
                                    "values": []
                                }
                            };
                            //bw
                            if (isArray(dataArr[i])) {
                                dataArr[i].forEach(function (itm) {
                                    cp.compare["values"].push(itm);
                                })
                            } else {
                                cp.compare["values"].push(dataArr[i]);
                            }
                            if (dataParam) {
                                dataParam = JSON.parse(decodeURIComponent(dataParam));
                                cp["compare"]["params"] = dataParam;
                            }
                            compares.push(cp);
                        }
                        itemData = {"and": {"values": compares}};
                    } else {
                        //没条件值
                        var dataParam = nodeDom.attr("data-params");
                        var compares = [{
                            "compare": {
                                "kword": dataArr[0],
                                "operator": dataArr[1],
                                "values": []
                            }
                        }];
                        itemData = {"and": {"values": compares}};
                    }
                } else {
                    //化验正常异常 条件值为空
                    var dataParam = nodeDom.attr("data-params");
                    var cp = {
                        "compare": {
                            "kword": dataArr[0],
                            "operator": dataArr[1],
                            "values": [dataArr[i]]
                        }
                    };
                    if (dataParam) {
                        dataParam = JSON.parse(decodeURIComponent(dataParam));
                        cp["compare"]["params"] = dataParam;
                    }
                    itemData = {"and": {"values": [cp]}};
                }

                if (itemData) {
                    data.query.or.values.push(itemData);
                }
                break;
        }

        if (nodeType === "1" || nodeType === "2") {
            var childDom = $("#" + nodeID + "-child");
            var childDoms = childDom.find(".element-block");

            if (childDoms.length > 0) {
                childDoms.each(function (index, item) {
                    var itemData = getNodeData($(item));
                    if (itemData) {
                        data.query[(nodeType === "1" ? "or" : "and")].values.push(itemData);
                    }
                });
            }
        }
        return data;
    }

    function getNodeData(nodeDom) {
        var nodeID = nodeDom.attr("id");
        var nodeType = nodeDom.attr("data-type");
        var data = null;
        if (nodeType === "1" || nodeType === "2") {
            var childDom = $("#" + nodeID + "-child");
            var childDoms = childDom.find(".element-block");
            var dataArr = [];

            if (childDoms.length > 0) {
                childDoms.each(function (index, item) {
                    var itemData = getNodeData($(item));
                    if (itemData) {
                        dataArr.push(itemData);
                    }
                });
            }

            if (dataArr.length > 0) {
                switch (nodeType) {
                    case "1":
                        data = {
                            "or": {
                                "values": dataArr
                            }
                        };
                        break;
                    case "2":
                        data = {
                            "and": {
                                "values": dataArr
                            }
                        };
                        break;
                }
            }
        } else {
            var dataArr = JSON.parse(decodeURIComponent(nodeDom.attr("data-value")));
            var itemData;
            if (isArray(dataArr) && dataArr.length) {
                var compare = {
                    "kword": dataArr[0],
                    "operator": dataArr[1],
                    "values": []
                }
                if (isArray(dataArr[2])) {
                    dataArr[2].forEach(function (itm) {
                        compare["values"].push(itm);
                    })
                } else if (dataArr[2]) {
                    compare["values"].push(dataArr[2]);
                }
                if (dataArr[0] == "lab.item") {
                    //化验正常异常
                    var dataParam = nodeDom.attr("data-params");
                    if (dataParam) {
                        dataParam = JSON.parse(decodeURIComponent(dataParam));
                        compare["params"] = dataParam;
                    }
                }
                itemData = {compare: compare};
            }

            if (itemData) {
                data = itemData;
            }
        }
        return data;
    }

    function __getDataModelByNode(domNode) {
        var dataModel = {};
        var dom = $('>div.element-block', domNode);
        var dataType = dom.attr('data-type');
        var id = dom.attr('id');
        var dataValue = dom.attr('data-value');
        var dataText = dom.attr('data-text');
        var dataPanel = dom.attr('data-panel');
        var dataCustom = dom.attr('data-custom');
        var childId = '#' + dom.attr('id') + '-child';
        dataModel['dataType'] = dataType;
        dataModel['dataValue'] = dataValue;
        dataModel['dataText'] = dataText;
        dataModel['dataPanel'] = dataPanel;
        if (dataCustom) {
            dataModel['dataCustom'] = dataCustom;
        }
        dataModel['children'] = [];
        if ($(childId).length > 0) {
            var wrapArr = $(childId).find('.wrap');
            if (wrapArr && wrapArr.length > 0) {
                for (var i = 0, len = wrapArr.length; i < len; i++) {
                    dataModel['children'].push(__getDataModelByNode($(wrapArr[i])));
                }
            }
            return dataModel;
        } else {
            return dataModel;
        }
    }

    //转成人话
    function renderToPersonLanguage(model) {
        if (isArray(model.children) && model.children.length > 0) {
            var arrStr = [];
            for (var i = 0, len = model.children.length; i < len; i++) {
                var childModel = model.children[i];
                if (isArray(childModel.children) && childModel.children.length > 0) {
                    // arrStr.push('[');
                    arrStr.push('[' + renderToPersonLanguage(childModel) + ']');
                    // arrStr.push(']');
                } else {
                    arrStr.push(decodeURIComponent(childModel.dataText));
                }
            }
            var opT = model.dataType ? (model.dataType * 1) : 0;
            return arrStr.join(' ' + opType[opT] + ' ');
        } else {
            return decodeURIComponent(model.dataText);
        }
    }

    //获取查询结果
    function getRSByCondition(qParam) {
        $.ajax({
            type: 'POST',
            url: '/_/hosp/search/case',
            data: qParam,
            contentType: 'application/json',
            dataType: 'json',
            beforeSend: function () {
                wt.show();
            },
            success: function (data) {
                if (data) {
                    _buildRSByData(data);
                    $(window).resize(); //trigger fixed
                    if (_start == 0) {
                        $(".medical-knowledge-reference").show();
                        _buildPagination(data);
                        getCharts();
                        //switch panel
                        $("#boxMind").hide();
                        $("#buttons").hide();
                        $("#mainSearchResult").show();
                        $("#fixedSearchBar").show();

                        $("#advanceContent .header").css({"position": "static", "height": "120px"});
                        $("#advanceSearch").css({"marginTop": "5px"});

                    }


                } else {
                    getSimpleNotify('获取查询数据失败');
                }

            },
            error: function (XMLHttpRequest) {
                getSimpleNotify('获取查询数据失败');
            },
            complete: function () {
                wt.hide();
            }
        });
    }

    //根据参数获取查询记录绘制脑图
    function getMindByHistory(_sId) {
        $.ajax({
            //get query model
            type: 'GET',
            url: '/_/hosp/search/logrecord/detail?id=' + _sId,
            dataType: 'json',
            beforeSend: function () {
            },
            success: function (data) {
                if (data && data.record && data.record.queryModel) {
                    var qModel = JSON.parse(data.record.queryModel);
                    addNodeByModel($('#mindNodeMain'), qModel);
                    $("#btnMindSubmit").click();
                } else {
                    getSimpleNotify('获取脑图数据失败')
                }

            },
            error: function (XMLHttpRequest) {
                getSimpleNotify('获取脑图数据失败')
            },
            complete: function () {
            }
        })
    }

    //----------------------$$$$$$-------查询结果---------$$$$$$$$--------------------------------

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

    //===============event regist =====================


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
                var highlights = data.items[i].highlights;
                for (var j = 0, jlen = keys.length; j < jlen; j++) {
                    var keyV = item[keys[j]];
                    if (keyV == null) {
                        keyV = "";
                    }
                    if (keys[j] == 'id') {
                        keyV = '/detail?_id=' + keyV;
                    }
                    if (keys[j] == 'visitType') {
                        keyV = keyV.substring(0, 1);
                    }
                    if (keys[j] == 'admitTime') {
                        keyV = moment(keyV).format(('YYYY-MM-DD'))
                    }
                    if (keys[j] == 'highlights') {
                        var ct = [];
                        if (highlights && highlights.length > 0) {
                            for (var k = 0, klen = highlights.length; k < klen; k++) {
                                if (k > 2) {
                                    break;
                                }
                                ct.push('<div class="content-item" title="' + highlights[k].title + '">' + highlights[k].title + ":" + highlights[k].text + '</div>');
                            }
                            keyV = ct.join('');
                        }
                    }
                    if (!keyV) {
                        keyV = "";
                    }
                    var reg = new RegExp("\\{\\{" + keys[j] + "\\}\\}", "gim");
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
                    var qObj = JSON.parse(__globalSearchParam);
                    qObj["start"] = _start;
                    qObj["size"] = _pageSize;
                    getRSByCondition(JSON.stringify(qObj));
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data, textStatus) {
                if (data) {
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
            data: __globalSearchParam,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                if (data) {
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
        if (data && isArray(data)) {
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
                    visible: true
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
            if (key == 'gender') {
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
                            size: "45%",
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    width: "40px",
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
                            return this.name + ' (' + this.percentage.toFixed(2) + '%)';
                        }
                    },
                    xAxis: {
                        visible: false
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
                serie['colorByPoint'] = true;
                serie['colors'] = ["#9ec1db", "#DB9EA2"];
            }
            for (var i = 0, len = data.length; i < len; i++) {
                var dt = data[i];
                var ct = dt.name;
                var ctData = dt.percent;

                if (key == 'gender') {
                    serie.data.push({name: ct, y: (ctData * 100).toFixed(2) * 1})
                } else {
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

    function addNodeByModel(dom, domModel) {
        //model 肯定有子结点，没有子结点不会走该方法 即default domModel.children>=2  ,注意当作为根结点进行重绘时，这种情况children==1 (fuck ! ....根结点是特例)
        var currentId = dom.attr("id");
        if (currentId == 'mindNodeMain' && isArray(domModel.children) && domModel.children.length > 0) {
            changeToParentNode(dom);
        }
        if (currentId == 'mindNodeMain' && isArray(domModel.children) && domModel.children.length == 0) {
            //是根结点，并且没有children
            var t = (domModel.dataText) ? decodeURIComponent(domModel.dataText) : '点击输入搜索条件';
            changeToElement($("#mindNodeMain"))
            $("#mindNodeMain").attr("data-type", "4").attr("data-value", domModel.dataValue).attr("data-text", domModel.dataText).attr("data-panel", domModel.dataPanel).find(".element-text").html(t);
            if (domModel.dataCustom) {
                $("#mindNodeMain").attr("data-custom", domModel.dataCustom);
            }
            return;
        }
        var childNodeId = currentId + '-child';
        //创建子结点wrapper ,先创建子结点
        if ($("#" + childNodeId).length == 0) {
            //如果是根结点mindRoot，非根结点.child
            var pDOM = dom.parent();
            var pPos = pDOM.offset(); // {left: pDOM.get(0).offsetLeft, top: pDOM.get(0).offsetTop};
            var s = 0;
            if (currentId == 'mindNodeMain') {
                s = 16;
            }
            var leftPos = pPos.left + pDOM.outerWidth() + 41 - s, topPos = pPos.top - 60 - 85 - 34; //header+buttons height 再减15+19 (padding+height)/2
            var positionCSS = "left:" + leftPos + "px;top:" + topPos + "px";
            var childStr = '<div class="child" id="' + childNodeId + '" style="' + positionCSS + '"><span class="child-before"></span><span class="child-after"></span></div>';
            $("#boxMind").append(childStr);
        }
        //当前dom结点的状态
        var type = domModel.dataType;
        if (type == null) {
            type = 0;
        }

        if (type == "1" || type == "2") {
            var label = opType[type * 1];
            dom.addClass('has-child');
            dom.attr('data-type', type);
            dom.removeAttr("data-value");
            dom.removeAttr("data-text");
            dom.removeAttr("data-panel");
            dom.find('.element-text').text(label).removeClass('trigger-condition').addClass('trigger-logic');
        } else if (type == "4") {
            changeToElement(dom, domModel);
        }
        //if(!domModel.children)domModel.children=[];
        for (var i = 0, len = domModel.children.length; i < len; i++) {
            var childModel = domModel.children[i];
            var nodeId = addNode(dom, childModel);
            if (childModel.children && childModel.children.length) {
                addNodeByModel($('#' + nodeId), childModel);
                if ($("#" + nodeId).length) {
                    updateMind($("#" + nodeId));
                    // updateHeight();
                }
            } else {
                updateMind($("#" + nodeId));
            }
        }

    }

    function clearPrevChartData() {
        updateChartModel('disease', []);
        updateChartModel('drug', []);
        updateChartModel('symptom', []);
        updateChartModel('labSet', []);
        updateChartModel('exam', []);
        updateChartModel('gender', []);
        updateChartModel('age', []);

    }


})