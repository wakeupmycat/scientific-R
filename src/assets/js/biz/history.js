/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    moment().locale("zh-cn");
    var _start=0,pageSize=20,current=1;
    //wait for
    var wt = new waitfor();
   getHistoryList(_start,pageSize);

    //===============event regist =====================


    //================function define ==================
    function  getHistoryList (start,size) {
        var me = this;
        //get records number
        var data = {
            types:["simple","complex"],
            start:start,
            size:size
        };
        $.ajax({
            type: 'POST',
            url: '/_/hosp/search/logrecord',
            contentType:'application/json',
            data:JSON.stringify(data),
            dataType: 'json',
            success: function (resData) {
                if (resData) {
                       if(resData.records.length>0){
                           $("#noResult").hide();
                           $("#timeLineContent").show();
                           var pObj = prepareDisplayData(resData.records);
                           renderTimeLine(pObj);
                           _buildPagination(resData);
                       }else {
                           $("#noResult").show();
                           $("#timeLineContent").hide();
                       }


                } else {
                    getSimpleNotify('获取历史数据失败')
                }

            },
            error: function (XMLHttpRequest) {
                getSimpleNotify('获取历史数据失败')
            },
            compvare:function () {

            }
        });
    }
    //整理后台返回数据
    function prepareDisplayData(rs) {
        var timeObj = {};
        var today = new moment().format('YYYY-MM-DD');
        for(var i=0,len=rs.length;i<len;i++){
            var createTime =  new moment(rs[i].createTime);
            var timeKey = createTime.format('YYYY-MM-DD');
            var hourKey = createTime.format('HH:mm:ss');
            if(!timeObj[timeKey]){
                timeObj[timeKey]={label:'',actions:[]};
                var timeKeyLabel = (timeKey==today)?'今天':timeKey;
                timeObj[timeKey].label=timeKeyLabel;
            }
            var sTypeText =rs[i].type=='simple'?'简单搜索':'高级搜索';
            var sText = rs[i].query;
            var actionItem = {
                sHour:hourKey,
                sType:rs[i].type,
                sTypeText:sTypeText,
                _id:rs[i].id
            };
            if(actionItem.sType=='simple'){
                actionItem['sText'] = rs[i].query
            }else{
                actionItem['sText'] = rs[i].modelText
            }
            timeObj[timeKey].actions.push(actionItem)
        }
        // console.log(timeObj);
        return timeObj;
    }
    //绘制时间轴
    function renderTimeLine(data){
        var blocks=[];
        var timeLineData =data;
        for(var key in timeLineData) {
            var blockObj = timeLineData[key];
            var blockTime = '<span class="time-banner">'+blockObj['label']+'</span>';

            var blockContents = [];
            for(var i=0,len=blockObj.actions.length;i<len;i++){
                var action = blockObj.actions[i];
                var hrefV;
                switch (action.sType){
                    case 'simple':
                        hrefV="/results?t=0&sVal="+encodeURIComponent(action.sText);
                        break;
                    case 'complex':
                        hrefV="/advance?_sId="+action._id;
                        break;
                    case 'export':
                    case 'viewDetail':
                    case 'viewTimeline':
                        break;
                }

                var lk='<a class="block-detail" href='+(hrefV)+' target="_blank"><span class="time-detail">'+(action.sHour)+'</span><span class="search-type">'+(action.sTypeText)+':</span><span class="search-keyword">'+(action.sText)+'</span></a>';
                blockContents.push(lk);
            }

            blocks.push('<div class="search-history-block"><div class="block-time">'+(blockTime)+'</div>'+(blockContents.join(''))+'</div>')
        }

       $("#timeLineContent").empty().append($(blocks.join('')))
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
                    return 'records'
                },
                showLastOnEllipsisShow: false,
                triggerPagingOnInit: false,
                totalNumber: data.total,
                pageSize: pageSize,
                callback: function (data, pagination) {
                    _start = (pagination.pageNumber - 1) * pageSize;
                    var url = '/_/hosp/search/logrecord';
                    var data = {
                        types:["simple","complex"],
                        start:_start,
                        size:pageSize
                    };
                    $.ajax({
                        url: url,
                        type: 'POST',
                        contentType:'application/json',
                        dataType: 'json',
                        data:JSON.stringify(data),
                        beforeSend: function () {
                            wt.show();
                            // $("#searchResults").empty();
                        },
                        success: function (data) {
                            if(data  && data.records.length>0){
                                var pObj = prepareDisplayData(data.records);
                                renderTimeLine(pObj);
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


})