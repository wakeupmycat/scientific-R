$(".list-items>.col-check").each(function (index,item) {
    console.log($(item));
    $(item).on("click",function () {
        if($(item).hasClass("unchecked")){
            $(item).removeClass("unchecked").addClass("checked")
            $(item).find("i").css("backgroundPosition","-233px -40px")
            $(".tab-nav li").each(function (index1,item1) {
                if(index==index1){
                    $(item1).addClass("disblock")
                }
            })
        }else{
            $(item).removeClass("checked").addClass("unchecked")
            $(item).find("i").css("backgroundPosition","-169px -8px")
            $(".tab-nav li").eq(0).addClass("active")
            $(".tab-con .con-item").eq(0).addClass("active").siblings().removeClass("active")
            $(".tab-nav li").each(function (index1,item1) {
                if(index==index1){
                    $(item1).removeClass("disblock")
                }

            })
        }
    })

})
$(".tab-nav li").each(function (index,item) {
    $(item).on("click",function () {
        $(this).addClass("active").siblings().removeClass("active")
        $(".tab-con .con-item").each(function (i,ite) {
           if(i==index){
               $(ite).addClass("active").siblings().removeClass("active")
           }
        })
    })
})
$(".con-tab-items .con-tab-item").each(function (index,item) {
    $(item).on("click",function () {
        if($(item).hasClass("unchecked")){
            $(item).removeClass("unchecked").addClass("checked")
            $(item).find("i").css("backgroundPosition","-233px -40px")

        }else{
            $(item).removeClass("checked").addClass("unchecked")
            $(item).find("i").css("backgroundPosition","-169px -8px")
        }
    })

})