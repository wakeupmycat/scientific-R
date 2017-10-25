/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    //get records number
    $.ajax({
        type: 'GET',
        // url: '/_/v1/search/overall/totalcase',
        url: '/_/hosp/search/overall/totalcase',
        dataType: 'json',
        success: function (data, textStatus) {
            if (data) {
                // console.log(me.state.total);
                // $("#rNum").html("<a href='/statistics' target='_blank' class='stastics-link'>"+formatNum(data.value)+"</a>");
                $("#rNum").html("<span class='stastics-link'>"+formatNum(data.value)+"</span>");
            } else {

            }

        },
        error: function (XMLHttpRequest) {

        },
        complete:function () {
            $("#rNum").removeClass('ani-twinkle')
        }
    });
    //get patients number
    $.ajax({
        type: 'GET',
        // url: '/_/v1/search/overall/totalpatient',
        url: '/_/hosp/search/overall/totalpatient',
        dataType: 'json',
        success: function (data, textStatus) {
            if (data) {
               // $("#pNum").html("<a href='/statistics' target='_blank' class='stastics-link'>"+formatNum(data.value)+"</a>");
               $("#pNum").html("<span class='stastics-link'>"+formatNum(data.value)+"</span>");
            } else {
            }

        },
        error: function (XMLHttpRequest) {
        },
        complete:function () {
            $("#pNum").removeClass('ani-twinkle')
        }
    });

    //===============event regist =====================
    $("#btnGetSearch").on("click",function (e) {
        e = e || window.event;
        var sIpt = $("#searchInput");
        var sIptVal = sIpt.val();
        if(!sIptVal){
           getSimpleNotify('请输入搜索关键词');
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;
            return false
        }
    })
    
    $("#searchInput").on('keyup',function (e) {
        var val = $(this).val();
        var url = "/results?t=0&sVal="+encodeURIComponent(val); //t=0
        $("#btnGetSearch").attr("href",url);
        var keyCode = e.keyCode;
        if(keyCode==13){
            window.open(url)
        }
    })



    //================function define ==================

})