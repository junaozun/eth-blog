import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import WeiboRegistry_artifacts from '../../build/contracts/WeiboRegistry.json'
import WeiboAccount_artifacts from '../../build/contracts/WeiboAccount.json'
var WeiboRegistry = contract(WeiboRegistry_artifacts);
var WeiboAccount = contract(WeiboAccount_artifacts);

window.App = {
  start: function() {
    var self = this;
   WeiboRegistry.setProvider(web3.currentProvider);

   getPlantformInfo();
   showAllRegister();

    $("#home_tab").click(function (e){
      e.preventDefault();
      getPlantformInfo();
      showAllRegister();
    })

    $("#weibo_tab").click(function (e){
      e.preventDefault();
      getWeiboInfo();
      showWeibo();
    })

    $("#registerBtn").click(function (){
      register();
    });

    $("#sendweiboBtn").click(function (){
      sendWeibo();
    });

  }

};

//部署好WeiboRegistry合约地址
var weiboRegistryAddress = "0x238b62ecf3c1796d5225bed444f1909b336af584";
var currentWeiboAddress;
var weiboRegistryInstance;

//部署WeiboAccount合约，需要的gas
var defaultGas = 4700000;

//注册微博帐号
function register(){
  var weiboRegistryInstance;
  var name = $("weiboName").val();
  var accountAddress;
  var weiboAccountAddress;
  WeiboAccount.new({from: web3.eth.accounts[0], gas:defaultGas}).then(function(instance){
    weiboAccountAddress = instance.address;
    currentWeiboAddress = weiboAccountAddress;
    $("weiboAddress").val(weiboAccountAddress);
  }).then(function () {
    WeiboRegistry.at(weiboRegistryAddress).then(function (instance){
      weiboRegistryInstance = instance;
      return weiboRegistryInstance.register(name,weiboAccountAddress,{
        from: web3.eth.accounts[0],
        gas: defaultGas
      });
    }).then(function (txReceipt){
      console.info(txReceipt);
      showAllRegister();
    });
  });
}

//根据id获取某个注册用户
function getRegisterUser(id){
  var addr;
  return WeiboRegistry.at(weiboRegistryAddress).then(function(instance){
    weiboRegistryInstance = instance;
    return weiboRegistryInstance.getAddressOfId.call(id).then(function(a){
      addr = a;
      return weiboRegistryInstance.getNameOfAddress.call(addr);
    }).then(function (name){
      return {id: id,name: name,addr: addr}
    })
  });
}

//微博平台上所有注册用户
function getTotalRegisterUser(){
  return WeiboRegistry.at(weiboRegistryAddress).then(function (instance){
    weiboRegistryInstance = instance;
    return weiboRegistryInstance.getNumberOfAccounts.call()
  }).then(function (total){
    return total;
  });
}

//查看平台所有已注册的微博账户
//{id:1,name:"",address:""}
async function getAllRegister() {
  let users = [];
  let total = await getTotalRegisterUser();
  for(let i=0;i<total;i++){
    let user = await getRegisterUser(i);
    users.push(user);
  }
  return users;
}

//在页面中展示所有已注册用户
function showAllRegister(){
  getAllRegister().then(function (list){
    $("weiboList").html('');
    list.forEach(function (item,index){
      $("weiboList").append("<tr><td>"+item.id+"</td><td>"+item.name+"</td><td>"+item.addr+"</td></tr>");

    });
    currentWeiboAddress = list[0].addr || "";
  })
}

//平台余额
function plantformBalance(){
  let balance = web3.eth.getBalance(weiboRegistryAddress);
  balance =web3.fromWei(balance,'ether');
  return balance.toString();
}

//微博平台基本信息
function getPlantformInfo(){
  $("#plantformAccount").html(weiboRegistryAddress);
  $("#plantformBalance").html(plantformBalance()+"ether");
}

//账户发微博
function sendWeibo(){
  var weiboAccountInstance;
  var weiboContent = $("weiboContent").val();
  WeiboAccount.at(currentWeiboAddress).then(function (instance){
    weiboAccountInstance = instance;
    return weiboAccountInstance.weibo(weiboContent,{from:web3.eth.accounts[0],gas:defaultGas});

  }).then(function (txReceipt){
    console.info(txReceipt);
    showWeibo();
    $("#weiboContent").val('');
  });
}

//返回weiboAddress账户发出的第id条微博
function getWeibo(weiboAddress,id){
  var weiboAccountInstance;
  return WeiboAccount.at(weiboAddress).then(function (instance){
    weiboAccountInstance =instance;
    return weiboAccountInstance.getWeibo.call(id).then(function (w){
      return {id:id,weiboContent:w[0],timestamp:w[1]};
    })
  });
}

//返回账户发送的微博总数
function getTotalWeibo(weiboAddress){
  var weiboAccountInstance;
  return WeiboAccount.at(weiboAddress).then(function (instance){
    weiboAccountInstance =instance;
    return weiboAccountInstance.getNumberOfWeibos.call()
  }).then(function (total){
    return total;
  });
}

//返回账户发的所有微博
async function getAllWeibo(weiboAddress){
  let weibos =[];
  let total =await getTotalWeibo(weiboAddress);
  for (let i=0;i < total;i++){
    let weibo =await getWeibo(weiboAddress,i);
    weibos.push(weibo);
  }
  return weibos;
}

//在页面中展示微博信息
function showWeibo(){
  getAllWeibo(currentWeiboAddress).then(function (list){
    $("#weiboContentList").html('');
    list.forEach(function (item,index){
      $("#weiboContentList").append("<tr><td>"+item.id+"</td><td>"+item.weiboContent+"</td><td>"+item.timestamp+"</td></tr>");
    });
  });

}

//微博余额
function weiboBalance(){
  var balance = web3.eth.getBalance(currentWeiboAddress);
  balance = web3.fromWei(balance,'ether');
  return balance.toString();
}

function getNameOfAddress(){
  var weiboRegistryInstance;
  return WeiboRegistry.at(weiboRegistryAddress).then(function (instance){
    weiboRegistryInstance =instance;
    return weiboRegistryInstance.getNameOfAddress.call(currentWeiboAddress);
  }).then(function (name){
    $("#myName").html(name);
  });
}

function getWeiboInfo(){
  getNameOfAddress();
  $("#myAccount").html(currentWeiboAddress);
  $("#myBalance").html(weiboBalance()+"ether");
}


window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
