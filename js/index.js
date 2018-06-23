
const nebulas = require("nebulas");
const Nebpay = require('nebpay');
const dappAddress = 'n1xgPazCPh6rSsKiZ5GKu9S4Rh32xEaTpVB';
var  Account = '';
const pay = new Nebpay();
const call = pay.call.bind(pay, dappAddress);

const neb = new nebulas.Neb();

var accountAmount = 0;
var allAccountAmount = 0;

var isBegin = true;

neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

function createPost(val,callback) {
    const serial = call(0, 'beginplay',val,
        {
          goods: {
            name: '老虎机',
            desc: `老虎机`,
          },
          listener(...args) {
            console.log(args);
            if (callback) {
              callback(serial, ...args);
            }
          }
        }
      );
};

function queryPost(func) {
  const from = Account;
  const value = "0";
  const nonce = "0"
  const gas_price = "1000000"
  const gas_limit = "2000000"
  const callFunction = func;
  const contract = {
    "function": callFunction,
    "args": Account
  }
  return neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract);
};




function getAccount(){
    var self=this;
    console.log('local='+Account);
    window.addEventListener('message', function (e) {
        if (e.data && e.data.data) {
            if (e.data.data.account) {
                Account= e.data.data.account
                console.log('extwallet='+Account);
                get('getAccountAmount',"[\""+ Account +"\"]",function(result){
                    console.log(' getAccountAmount ' +result);
                    accountAmount = result;
                    $("#info").html("当前奖池："+allAccountAmount+"  你的余额为："+accountAmount);
                });
                get('getAllAmount',"[]",function(result){
                    console.log(' allAccountAmount: ' +result);
                    allAccountAmount = result;
                    $("#info").html("当前奖池："+allAccountAmount+"  你的余额为："+accountAmount);
                });
                isBegin = false;
            }
        }
    })

    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
};


var nasApi = neb.api;


var get = function (func,args,callback) {
    nasApi.call({
        chainID: '1',
        from: Account,
        to: dappAddress,
        value: 0,
        gasPrice: 1000000,
        gasLimit: 2000000,
        contract: {
            function: func,
            args: args
        }
    }).then(function (resp) {
        console.log('----'+resp.result)
        if(callback) callback(resp.result)
    })
};


var winToggle = function(num) {
    if (num) {
        $(".winningOption").css("visibility", "visible");
    } else {
        $(".winningOption").css("visibility", "hidden");
    }
};

$(document).ready(function (){
    getAccount();
    if (Account == '') {
        setTimeout(getAccount, 2000);
    }
});

var jsonkey = '';
var times = 200;

function callbk(result){
    isBegin = false;
    if(result){
          console.log('result=',result,typeof result);
          if(times--<0){
            times = 200;
            $("#info2").html("出现错误，请大侠重新来过!");
            return;
          }
          var fdStart = true;
          try{
            var ttm = JSON.parse(JSON.parse(result))
            if(!ttm){
                throw result;
            }
          }catch(err){
            fdStart = false;
          }
          console.log('fdStart=',fdStart,typeof fdStart);
          $("#info2").html("查询结果中...." + times + "!");
          if(!fdStart){
             setTimeout(get("getLastResult","[\""+Account+"\"]",callbk),2000);
          }else{
              var isWinning = false;
              var winValue = 4;
              var item = JSON.parse(JSON.parse(result));
              console.log('item================='+item.jsonkey);
              if(item.jsonkey == jsonkey){
                 $("#info2").html("通讯完毕,正在摇奖!");
                  console.log('item:', item, item.allamount, item.length);
                  if(item.result == '1'){
                      isWinning = true;
                      winValue = item.value;
                      if(winValue == 8){
                         winValue = 7;
                      }
                  }
                  console.log('winValue=================',winValue);
                  accountAmount = item.amount;
                  allAccountAmount = item.allamount;
                   //配置老虎机参数
                    $.slot({
                        "height": 100, //单个奖项高度
                        "itemNum": 8, //奖项总个数
                        "shuffle": 10, //滚动圈数
                        "delay": 100, //延迟时间
                        "element": ".num", //奖项dom元素
                        "basicDuration": 6000, //基础滚动时间
                        "ladderDuration": 3000, //阶梯滚动时间增幅
                        "easing": "easeInOutCirc", //动画效果
                        "slotNum": 4, //滚动项列数
                        "winValue": winValue, //中奖下标
                        "isWinning": isWinning, //是否中奖标识
                        "callback": function() {
                            isBegin = false;
                            if (isWinning) {
                                //中奖回调
                                //alert("恭喜你中奖了！ 您的账户余额为：" + accountAmount + ",请客吃饭！请客吃饭！");
                                $("#info2").html("恭喜你中奖了！");
                                $("#info").html("当前奖池："+allAccountAmount+"  你的余额为："+accountAmount);
                            } else {
                                //未中奖回调
                                //alert("没中奖，当前奖池金额：" + allAccountAmount + " 再来一次呗");
                                $("#info2").html("本次没有中奖!");
                                $("#info").html("当前奖池："+allAccountAmount+"  你的余额为："+accountAmount);
                            }
                        }
                    });
              }else{
                setTimeout(get("getLastResult","[\""+Account+"\"]",callbk),2000);
              }
      }
    }
};

function getRandCode(len){
    var d,e,b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",c = "";
    for (d = 0;d<len; d ++) {
        e = Math.random() * b.length, e = Math.floor(e), c += b.charAt(e);
    }
    return c;  
};

$(function() {
    $('.btn').click(function() {
        if(isBegin) return;
        times = 200;
        $("#info2").html("");
        jsonkey = getRandCode(20);
        createPost("[\""+Account+"\"\,\""+jsonkey+"\"]",function(result){
            $("#info2").html("查询结果中....!");
            setTimeout(get("getLastResult","[\""+Account+"\"]",callbk),3000);
        });
    });
});
