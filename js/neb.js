const nebulas = require("nebulas");
const Nebpay = require('nebpay.js');
const Account = nebulas.Account;
const neb = new nebulas.Neb();
const dappAddress = 'n1jHXyVkL4W4S4AtyWKPvfPCNQC6vGiC6L3';

neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

const pay = new Nebpay();
const call = pay.call.bind(pay, dappAddress);

function createPost(callback) {
  const serial = call(0.00000001, 'beginplay',"",
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
}

function queryPost() {
  const from = Account.NewAccount().getAddressString();
  const value = "0";
  const nonce = "0"
  const gas_price = "1000000"
  const gas_limit = "2000000"
  const callFunction = "getamount";
  const contract = {
    "function": callFunction,
    "args": ""
  }
  return neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract);
}

var get = function (func,args,callback) {
    var self = this
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
        if(callback) callback(JSON.parse(resp.result))
    })
};



function queryInfo(serialNumber) {
  return pay.queryPayInfo(serialNumber) ;
}

module.exports = {
  createPost,
  queryPost,
  fetchQueryInfo(serialNumber) {
    return queryInfo(serialNumber).then(JSON.parse);
  }
}

window.pay = module.exports;
window.nebypay = pay;