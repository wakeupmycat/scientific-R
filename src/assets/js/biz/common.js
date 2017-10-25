/**
 * Created by willzhao on 17/3/23.
 */
'use strict';
$(function () {
    $("body").css({visibility: ""});
    //get qCode
    $.ajax({
        type: "GET",
        url: '/assets/tpl/qcode.html',
        async: false,
        success: function (data) {
            $("body").append(data);
        },
        error: function (e) {
        }
    })


    $.ajax({
        type: 'GET',
        url: '/_/hosp/user/who',
        dataType: 'json',
        beforeSend: function () {
            $('#userinfo-loading').show()
        },
        success: function (data, textStatus) {
            if (data && data.name) {
                $("#navUsername").text(data.name);
                $("#menuDrop").show();
                if (data.role.id == 'limited-user') {
                    $("#menuDrop").removeAttr("data-toggle");
                    $("#menuDrop").attr("href", "javascript:void(0)");
                    $("#menuDrop").css({cursor: 'not-allowed'});

                    $('a.left-brand').removeAttr("target");
                    $('a.left-brand').attr("href", "javascript:void(0)");
                    $("#showSimillar").hide();
                    $("#exportRecords").hide();
                }
                if (data.manageOptions && data.manageOptions.canUpdatePassword == true) {
                    $("#canUpdatePassword").show();
                }
            }
        },
        error: function (XMLHttpRequest) {
        },
        complete: function () {
            $('#userinfo-loading').hide()
        }
    });

    //get qcode show yes or no, whether display customer title
    $.ajax({
        type: 'GET',
        url: '/options',
        dataType: 'json',
        beforeSend: function () {
            // $('#userinfo-loading').show()
        },
        success: function (data, textStatus) {
            if (data && data['feedback.showWeiXinCode']) {
                if (data['feedback.showWeiXinCode'] == 'false') {
                    $(".qr-code-block").hide();
                }
            }
            if (data['title'] && $(".hosp-title-container").length > 0) {
                $(".hosp-title-container").text(data['title'])
            } else if (!data['title'] && $(".hosp-title-container").length > 0) {
                $(".hosp-title-container").text('医疗大数据平台');
            }
            //二维码 qq群 联系电话信息 todo
        },
        error: function (XMLHttpRequest) {
        },
        complete: function () {
            $('#userinfo-loading').hide()
        }
    });


    //==========QRCode==========================
    $('.qr-code-block').on('mouseover', function (e) {
        //console.log('===================')
        $('.qrcode-img-block', $(this)).addClass('show');
        /*  if($('.qrcode-img-block',$(this)).hasClass('show')==false){

         }*/
    });
    $("body").on('mousemove', function (e) {
        if ($(e.target).hasClass('haha'))return;
        $('.qrcode-img-block').removeClass('show');
    });

    $(window).on('scroll', function () {
        var sTop = $(document).scrollTop();
        if (sTop > 200) {
            $('.jump-to-top').css({display: 'block'});
        } else {
            $('.jump-to-top').hide();
        }
    });
    $('.jump-to-top').on('click', function (e) {
        $('html,body').animate({scrollTop: 0}, 'normal')
    })


})

function formatNum(num) {
    if (isNaN(num)) {
        throw new Error('invalid number');
    }
    num = num.toString();//字符化
    var s = num.match(/e\+(\d+)$/), ext = 0;
    num = num.replace(/e.+$/, '');
    if (s) ext = Number(s[1]);
    //分割小数点两边
    var tA = num.split('.');
    if (tA.length >= 2 && ext) {//有小数点则分割开来处理(小数点后面可能还跟有科学记数法表示)
        if (tA.length > ext) {
            tA[0] += tA[1].slice(0, ext - 1);
            tA[1] = tA[1].slice(ext - 1, tA[1].length - 1);
        } else {
            tA[0] += (tA[1] + '0'.repeat(ext - tA.length));
            tA[1] = '';
        }
    }
    tA[0] = tA[0].split('');//拆字符
    for (var i = tA[0].length; (i -= 3) > 0;) {//插逗号
        tA[0].splice(i, 0, ',');
    }
    return tA[0].join('') + (tA[1] ? '.' + tA[1] : '');//连起来
}
function getSimpleNotify(msg) {
    $.pnotify.defaults.styling = "bootstrap3";
    $.pnotify.defaults.history = false;
    $.pnotify({
        title: false,
        text: msg,
        nonblock_opacity: 1,
        icon: false,
        opacity: .8,
        delay: 3500,
        animate_speed: "fast"
    });
}

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}


// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind = function (owner) {
        var that = this;
        if (arguments.length <= 1) {
            return function () {
                return that.apply(owner, arguments);
            };
        } else {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                return that.apply(owner, arguments.length === 0 ? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim = function () {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf = function (find, i /*opt*/) {
        if (i === undefined) i = 0;
        if (i < 0) i += this.length;
        if (i < 0) i = 0;
        for (var n = this.length; i < n; i++)
            if (i in this && this[i] === find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf = function (find, i /*opt*/) {
        if (i === undefined) i = this.length - 1;
        if (i < 0) i += this.length;
        if (i > this.length - 1) i = this.length - 1;
        for (i++; i-- > 0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i] === find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach = function (action, that /*opt*/) {
        for (var i = 0, n = this.length; i < n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map = function (mapper, that /*opt*/) {
        var other = new Array(this.length);
        for (var i = 0, n = this.length; i < n; i++)
            if (i in this)
                other[i] = mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter = function (filter, that /*opt*/) {
        var other = [], v;
        for (var i = 0, n = this.length; i < n; i++)
            if (i in this && filter.call(that, v = this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every = function (tester, that /*opt*/) {
        for (var i = 0, n = this.length; i < n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some = function (tester, that /*opt*/) {
        for (var i = 0, n = this.length; i < n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}


function unique(arr) {
    var _arr = arr;
    if (_arr.length) {
        var res = [];
        var json = {};
        for (var i = 0; i < _arr.length; i++) {
            if (!json[_arr[i]]) {
                res.push(_arr[i]);
                json[_arr[i]] = 1;
            }
        }
        return res;
    }
}

//判断数组包含
Array.prototype.S = String.fromCharCode(2);
Array.prototype.in_array = function (e) {
    var r = new RegExp(this.S + e + this.S);
    return (r.test(this.S + this.join(this.S) + this.S));
};

var isArray = function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

Function.prototype.before = function (beforefn) {
    var __self = this;
    return function () {
        beforefn.applty(this, arguments);
        return __self.apply(this, arguments)
    }
}

Function.prototype.after = function (afterfn) {
    var __self = this;
    return function () {
        var ret = __self.apply(this, arguments);
        afterfn.apply(this, arguments);
        return ret;
    }
}

var throttle = function (fn, interval) {
    var __self = fn, timer, firstTime = true;
    return function () {
        var args = arguments,
            __me = this;
        if (firstTime) {
            __self.apply(__me, args);
            return firstTime = false;
        }
        if (timer) {
            return false;
        }
        timer = setTimeout(function () {
            clearTimeout(timer);
            timer = null;
            __self.apply(__me, args);

        }, interval || 500);
    }
}



//判断当前浏览类型
function BrowserType() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE浏览器
    var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
    var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
    var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器

    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return "IE7";
        }
        else if (fIEVersion == 8) {
            return "IE8";
        }
        else if (fIEVersion == 9) {
            return "IE9";
        }
        else if (fIEVersion == 10) {
            return "IE10";
        }
        else if (fIEVersion == 11) {
            return "IE11";
        }
        else {
            return "0"
        }//IE版本过低
    }//isIE end

    if (isFF) {
        return "FF";
    }
    if (isOpera) {
        return "Opera";
    }
    if (isSafari) {
        return "Safari";
    }
    if (isChrome) {
        return "Chrome";
    }
    if (isEdge) {
        return "Edge";
    }
}//myBrowser() end

//判断是否是IE浏览器
function isIE() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 //判断是否IE浏览器
    if (isIE) {
        return 1;
    }
    else {
        return -1;
    }
}


//判断是否是IE浏览器，包括Edge浏览器
function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE浏览器
    var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            // return "IE7";
            return 7;
        }
        else if (fIEVersion == 8) {
            // return "IE8";
            return 8;
        }
        else if (fIEVersion == 9) {
            // return "IE9";
            return 9;
        }
        else if (fIEVersion == 10) {
            return 10
            // return "IE10";
        }
        else if (fIEVersion == 11) {
            // return "IE11";
            return 11;
        }
        else {
            return 0;
            // return "0"
        }//IE版本过低
    }
    else if (isEdge) {
        return "Edge";
    }
    else {
        return "-1";//非IE
    }
}
