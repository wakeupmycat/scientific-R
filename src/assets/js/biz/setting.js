/**
 * Created by willzhao on 17/3/22.
 */
$(function () {
    "use strict"
    var wt = new waitfor();
    var username;
    getPersonInfo();


    //===============event regist =====================
    $(".left-nav").on("click","dl>dd",function (e) {
        var $this = $(this);
        if(!$this.hasClass('active')){
            $(".left-nav").find('dd').removeClass('active');
            $this.addClass('active');
            var _id = $(".left-nav").find('dd.active>a').attr('data-panel-id');
            $(".pan").hide();
            $("#"+_id).show();

        }
    });
    $("#btnSavePass").on("click",function (e) {
        restPassWord();
    });

    $(".chgpass").on("keyup",function (e) {
        checkInputVal();
    })

    //================function define ==================
   function getPersonInfo() {
       $.ajax({
           type: 'GET',
           url: '/_/hosp/user/who',
           dataType: 'json',
           beforeSend: function () {
               wt.show();
           },
           success: function (data, textStatus) {
               if (data) {
                    username = data['username'];
                   $("#_username").text(data['username']);
                   $("#_name").text(data['name']);
                   $("#_department").text(data['department']);
                   $("#_hospital").text(data['hospital']);
                   $("#_name_p2").text(data['name']);

               } else {
                   return null;
               }
           },
           error: function (XMLHttpRequest) {
           },
           complete:function () {
               wt.hide();
           }
       });
   }

   function checkInputVal() {
       var v1 = $('#pre_pass').val(), v2 = $('#new_pass').val(), v3 = $('#repeat_pass').val();
       if (v1 && v2 && v3) {
           $("#btnSavePass").attr('disabled', false);
       } else {
           $("#btnSavePass").attr('disabled', true);
       }
   }
   
   function restPassWord() {
       var v1 = $('#pre_pass').val(), v2 = $('#new_pass').val(), v3 = $('#repeat_pass').val();
       if(!username) return false;
       if (!v1) {
           getPersonInfo('原密码不能为空');
           return false
       }
       if (!v2) {
           getPersonInfo('新密码不能为空');
           return false
       }
       if(v2.length<6){
           getPersonInfo('密码长度要大于6个字符');
           return false
       }
       if (!v3) {
           getPersonInfo('确认新密码不能为空');
           return false
       }
       if(v1!="" && v1==v2){
           getPersonInfo('新密码不能和旧密码相同');
           return false;
       }
       if (v2 != '' && v2 != v3) {
           getPersonInfo('新密码确认不一致');
           return false
       }

       var postData = {"username": username, "password": $.md5(v1), "newPassword": $.md5(v2)}

       $.ajax({
           type: 'POST',
           url: '/_/hosp/user/changepassword',
           dataType: 'json',
           data:JSON.stringify(postData),
           beforeSend: function () {
               wt.show();
           },
           success: function (data) {
               getSimpleNotify('修改密码成功')

           },
           error: function (XMLHttpRequest) {
               getPersonInfo('密码修改失败')
           },
           complete:function () {
               wt.hide();
           }
       });
   }

})