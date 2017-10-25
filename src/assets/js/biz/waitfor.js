/**
 * Created by willzhao on 17/3/27.
 */
function waitfor(opts) {
    this.opt = opts || {};
    var that  = this;
    $.ajax({
        type:'GET',
        async:false,
        url:'/assets/tpl/waitfor.html',
        success:function (htm) {
             that.opt['html'] = $(htm);
             if($("#waitfor").length==0){
                 $("body").append(that.opt['html']);
             }else{
                 that.opt['html'] = $("#waitfor")
            }
        },
        error:function () {

        }
    })

}


waitfor.prototype.show=function () {
    if(!this.opt['__isShow']){
        this.opt['html'].modal('show');
        this.opt['__isShow']=true;
    }
}

waitfor.prototype.hide=function () {
    if(this.opt['__isShow']){
        this.opt['html'].modal('hide');
        this.opt['__isShow']=false;
    }
}

function confirmDlg(opts) {
    this.opt = opts || {};
    var that  = this;
    $.ajax({
        type:'GET',
        async:false,
        url:'/assets/tpl/confirmdlg.html',
        success:function (htm) {
            that.opt['html'] = $(htm);
            if($("#confirmdlg").length==0){
                $("body").append(that.opt['html']);
                that.opt['html'] = $("#confirmdlg");
            }else{
                that.opt['html'] = $("#confirmdlg")
            }
        },
        error:function () {}
    });
    $(".okBtn",that.opt['html']).text(that.opt['okBtnText']||'确定');
    $(".okBtn",that.opt['html']).css({backgroundColor:(that.opt['okBtnBgColor']||''),border:'none'});
    $(".cancelBtn",that.opt['html']).text(that.opt['cancelBtn']||'取消');

    $(".okBtn",that.opt['html']).on('click',function (e) {
        if(that.opt["okcallback"] && Object.prototype.toString.call(that.opt["okcallback"]) === '[object Function]'){
            that.opt["okcallback"].call(that);
        }
    })

    $(".cancelBtn",that.opt['html']).on('click',function (e) {
       that.close();
    })


}

confirmDlg.prototype.open=function (op) {
    var that  = this;
    if(!this.opt['__isShow']){
        this.opt['html'].modal('show');
        this.opt['__isShow']=true;
        if(op && op['cf_title']){
            this.opt['html'].find('.modal-title').empty().text(op['cf_title']);
        }
        if(op && op['cf_content']){
            this.opt['html'].find('.modal-body-text').empty().text(op['cf_content']);
        }
        if(op && Object.prototype.toString.call(op['okcallback']) === '[object Function]'){
            this.opt['okcallback']=op['okcallback']; //.call(that);
        }

    }
}

confirmDlg.prototype.close=function () {
    if(this.opt['__isShow']){
        this.opt['html'].modal('hide');
        this.opt['__isShow']=false;
    }
}

/*
* common dialog
* */
function commonDlg() {
    var t;
     this.template = '';
    $.ajax({
        url:'/assets/tpl/commonDlg.html',
        type:'GET',
        async:false,
        success:function (d) {
             t = d;
        },
        error:function () {
            throw new Error('get dialog basic template error')
        }
    })
    if(t){
        this.template = t;
        this.dlgDOM = $(this.template);
        this.dlgDOM.attr("id","dlg_"+new Date().getTime()+"_"+(Math.random()*1000+999).toFixed(0))
        $("body").append(this.dlgDOM);
    }
    this.opt={
        isShowOK:true,
    };
    this.opt['__isShow']=false;
}

commonDlg.prototype.init=function (opts) {
    var that = this;
    this.dlgDOM.on("click","button.cancel",function () {
        that.close();
    });
    this.dlgDOM.on("click","button.ok",function () {
        if(opts && opts.okCallback && Object.prototype.toString.call(opts.okCallback) === '[object Function]'){
            opts.okCallback.call(that);
        }
       // that.close();
    });

    // if(opts && opts.hideBtnOK=="hide"){
    //     that.dlgDOM.find('button.ok').hide();
    // }

    if(opts && opts.okText){
        that.dlgDOM.find('button.ok').text(opts.okText)
    }
    if(opts && opts.cancelText){
        that.dlgDOM.find('button.cancel').text(opts.cancelText)
    }
    if(opts && opts.okBtnBgColor){
        that.dlgDOM.find('button.ok').css("backgroundColor",opts.okBtnBgColor);
    }
    if(opts && opts.dlgTitle){
        that.dlgDOM.find('.modal-title').text(opts.dlgTitle);
    }

    if(opts && opts.dlgContent){
        that.dlgDOM.find('.modal-body').empty().append(opts.dlgContent);
    }


    if(opts && opts.dlgSize){
        that.dlgDOM.find('div.modal-dialog').addClass(opts.dlgSize);
    }

    if(opts && opts.afterInit && Object.prototype.toString.call(opts.afterInit) === '[object Function]'){
        opts.afterInit.call(this);
    }

    if(opts && opts.beforeShow && Object.prototype.toString.call(opts.beforeShow) === '[object Function]'){
        //立即执行
        this.dlgDOM.on('show.bs.modal',function (e) {
            // var $this = $(this);
            // var activePanel = $this.find(".condition-tab-panel.active");
            // var activeID = activePanel.attr("data-index");
            if($(e.target).hasClass("modal")){
                opts.beforeShow.call(that);
            }

        })
    }
    if(opts && opts.afterShow && Object.prototype.toString.call(opts.afterShow) === '[object Function]'){
        //立即执行
        this.dlgDOM.on('shown.bs.modal',function (e) {
            // var $this = $(this);
            // var activePanel = $this.find(".condition-tab-panel.active");
            // var activeID = activePanel.attr("data-index");
            if($(e.target).hasClass("modal")){
                opts.afterShow.call(that);
            }

        })
    }
    if(opts && opts.afterHidden && Object.prototype.toString.call(opts.afterHidden) === '[object Function]'){
        //立即执行
        this.dlgDOM.on('hidden.bs.modal',function (e) {
            // var $this = $(this);
            // var activePanel = $this.find(".condition-tab-panel.active");
            // var activeID = activePanel.attr("data-index");
            if($(e.target).hasClass("modal")){
                opts.afterHidden.call(that);
            }

        })
    }
    //close event
    this.dlgDOM.on('hide.bs.modal',function (e) {
        if($(e.target).hasClass("modal")){
            that.opt['__isShow']=false;
        }
    })


}

commonDlg.prototype.open = function () {
    if(!this.opt['__isShow']){
        this.opt['__isShow']=true;
        this.dlgDOM.modal('show');
    }
}


commonDlg.prototype.close=function () {
    if(this.opt['__isShow']){
        this.opt['__isShow']=false;
        this.dlgDOM.modal('hide');
        
    }
}



