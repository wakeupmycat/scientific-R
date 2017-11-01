var tSize=10,startSize=0;
function bindCheck(data) {//统计列表
    var strTab = "";
    var strNav = "";
    // console.log(data);
    for (var i = 0; i < data.items.length; i++) {
        var curItem = data.items[i]
        if (i === 0) {
            strNav += "<li id=" + curItem.name + " class=\"disblock active\">" + curItem.text + "</li>"
            strTab += "<li style=\"display: none\"  class=\"col-check unchecked\">";
            strTab += "<span><i class='checkicon'></i>" + curItem.text + "</span>"
            strTab += "</li>"
        } else {

            strNav += "<li id=" + curItem.name + ">" + curItem.text + "</li>"
            strTab += "<li  class=\"col-check unchecked\">";
            strTab += "<span><i class='checkicon'></i>" + curItem.text + "</span>"
            strTab += "</li>"
        }


    }
    $(".tab-nav").html(strNav)
    $(".list-items").html(strTab);
    $(".list-items>.col-check").each(function (index, item) {
        $(item).on("click", function () {
            if ($(item).hasClass("unchecked")) {
                $(item).removeClass("unchecked").addClass("checked")
                $(item).find("i").css("backgroundPosition", "-233px -40px")
                $(".tab-nav li").each(function (index1, item1) {
                    if (index == index1) {
                        $(item1).addClass("disblock")
                    }
                })
            } else {
                $(item).removeClass("checked").addClass("unchecked")
                $(item).find("i").css("backgroundPosition", "-169px -8px")
                $(".tab-nav li").eq(0).addClass("active").siblings().removeClass("active")
                $(".tab-con .con-item").eq(0).addClass("active").siblings().removeClass("active")
                $(".tab-nav li").each(function (index1, item1) {
                    if (index == index1) {
                        $(item1).removeClass("disblock")
                    }

                })
            }
        })

    })
    $(".tab-nav li").each(function (index, item) {
        $(item).on("click", function () {
            startSize=0
            $.ajax({
                type: "post",
                url: "/_/hosp/search/science/global",
                data: JSON.stringify({"text": $("#searchInput").val(), "type": $(item)[0].id, size: 10}),
                start:startSize,
                success: function (pData) {
                    bindTable(pData)
                }

            })
            $(this).addClass("active").siblings().removeClass("active")
            $(".tab-con .con-item").each(function (i, ite) {
                if (i == index) {
                    $(ite).addClass("active").siblings().removeClass("active")
                }
            })
        });

    })
    // $(".con-tab-items .con-tab-item").each(function (index, item) {
    //     $(item).on("click", function () {
    //         if ($(item).hasClass("unchecked")) {
    //             $(item).removeClass("unchecked").addClass("checked")
    //             $(item).find("i").css("backgroundPosition", "-233px -40px")
    //
    //         } else {
    //             $(item).removeClass("checked").addClass("unchecked")
    //             $(item).find("i").css("backgroundPosition", "-169px -8px")
    //         }
    //     })
    //
    // })
    $("#btnGetSearch").on("click", function () {
        $.ajax({
            type: "post",
            url: "/_/hosp/search/science/global",
            data: JSON.stringify({text: $("#searchInput").val(), type: "patient", size: 10}),
            success: function (pData) {
                bindTable(pData)
            },
            errno: function () {

            }

        })
    })
}

function bindTable(data) {

    var strCon = "";
    strCon += "<div class='con-item active'>"
    strCon += "<div class='con-tab'>"
    strCon += "<span class='choose'>筛选</span>"
    strCon += "<ul class='con-tab-items'>"
    for (var i = 0; i < data.columns.length; i++) {
        strCon += "<li id="+data.columns[i].key+" class='con-tab-item checked'>"
        strCon += "<span><i class='checkicon'></i>" + data.columns[i].text + "</span>"
        strCon += "</li>"
    }
    strCon += "</ul>"
    strCon += "<span>共搜到" + data.total + "条记录</span>"
    strCon += "</div>"
    strCon += "<div class='con-table'>"
    strCon += "<div class='table-layer'>"
    strCon += "<table border>"
    strCon += "<thead>"
    strCon += "<tr>"
    for (var i = 0; i < data.columns.length; i++) {
        strCon += "<th  table-type=" + data.columns[i].key + ">" + data.columns[i].text + "</th>"
    }
    strCon += "</tr>"
    strCon += "</thead>"
    strCon += "<tbody>"
    for (var i = 0; i < data.items.length; i++) {
        strCon += "<tr>"
        for (var j = 0; j < data.columns.length; j++) {
            if (data.items[i].data[data.columns[j].key] == undefined) {
                strCon += "<td table-type=" + data.columns[j].key + ">--</td>"
            } else {
                strCon += "<td table-type=" + data.columns[j].key + ">" + data.items[i].data[data.columns[j].key] + "</td>"
            }


        }
        strCon += "</tr>"
    }
    strCon += "</tbody>"
    strCon += "</table>"
    strCon += "</div>"
    strCon += "<div class='tab-footer'>"
    strCon += "<div style='float: right'>"
    strCon += "<span id='prev' class='prev'>上一页</span>"
    strCon += "<span id='next' class='next'>下一页</span>"
    strCon += "<span>跳转到<input id='gopage' type=\"text\" style=\"outline:none;width: 18px;height: 18px;text-align: center;margin-left: 10px;position: relative;top:-1px;font-size: 10px\"></span>"
    strCon += "<span id='go' class='go'>确定</span>"
    strCon += "</div>"
    strCon += "</div>"
    strCon += "</div>"
    strCon += "</div>"
    $(".tab-con").html(strCon)
    $(".con-tab-items .con-tab-item").each(function (index, item) {
        $(item).on("click",function () {
            var _attr=$(item)[0].id
            if ($(item).hasClass("checked")) {
                $(item).removeClass("checked").addClass("unchecked")
                $(item).find("i").css("backgroundPosition", "-169px -8px")

                $("th[table-type="+_attr+"]").hide()
                $("td[table-type="+_attr+"]").hide()
            } else {
                $(item).removeClass("unchecked").addClass("checked")
                $(item).find("i").css("backgroundPosition", "-233px -40px")
                console.log($("th[table-type=" + _attr + "]"));
                $("th[table-type="+_attr+"]").show()
                $("td[table-type="+_attr+"]").show()
            }
        })

    })
}

$.ajax({//初始化分类
    type: "get",
    url: "/_/hosp/search/science/category",
    success: function (tabData) {
        bindCheck(tabData)
    }
})
$(function () {
    $("#prev").on("click",function () {
        console.log($("#prev"));
        startSize==0?startSize=0:startSize--;
        $.ajax({
            type: "post",
            url: "/_/hosp/search/science/global",
            data: JSON.stringify({"text": $("#searchInput").val(), "type": "diagnosis", size: 10}),
            start:startSize,
            success: function (pData) {
                bindTable(pData)
            }

        })
    })
    $("#next").on("click",function () {
        startSize++;
        $.ajax({
            type: "post",
            url: "/_/hosp/search/science/global",
            data: JSON.stringify({"text": $("#searchInput").val(), "type": "diagnosis", size: 10}),
            start:startSize,
            success: function (pData) {
                bindTable(pData)
            }

        });
    })
    $("#go").on("click",function () {
        startSize=$("#gopage").val();
        $.ajax({
            type: "post",
            url: "/_/hosp/search/science/global",
            data: JSON.stringify({"text": $("#searchInput").val(), "type": "diagnosis", size: 10}),
            start:startSize,
            success: function (pData) {
                bindTable(pData)
            }

        });
    });
})



