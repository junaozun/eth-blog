pragma solidity ^0.4.17;

              /*微博账户*/
contract WeiboAccount {

      //一个微博的数据结构
      struct Weibo {
        uint timestamp;

        string weiboString;
      }

      //这个微博账户的所有微博，由微博ID映射微博内容
      mapping (uint => Weibo) _weibos;

      //这个微博账户发的微博数量
      uint _numberOfWeibos;

      //这个微博账户的所有者
      address _adminAddress;

      //权限控制，被这个修饰符修饰的方法，表示该方法只能被微博所有者操作
      modifier onlyAdmin() {
        require(msg.sender == _adminAddress);
        _;
      }

      //微博合约的构造方法
      function WeiboAccounts() public {
        _numberOfWeibos = 0;
        _adminAddress = msg.sender;
      }

      //发送微博
      function weibo(string weiboString) onlyAdmin public {
        //要求微博的长度小于160
        require(bytes(weiboString).length <= 160);
        _weibos[_numberOfWeibos].timestamp = now;
        _weibos[_numberOfWeibos].weiboString = weiboString;
        _numberOfWeibos++;
      }

      //根据Id查找微博
      function getWeibo(uint weiboId) constant public returns (string weiboString, uint timestamp) {
        weiboString = _weibos[weiboId].weiboString;
        timestamp = _weibos[weiboId].timestamp;
      }

      //返回最新一条微博
      function getLatestWeibo() constant public returns (string weiboString, uint timestamp,uint numberOfWeibos) {
        //该函数返回三个变量
        weiboString = _weibos[_numberOfWeibos - 1].weiboString;
        timestamp = _weibos[_numberOfWeibos - 1].timestamp;
        numberOfWeibos = _numberOfWeibos;
      }

      //返回微博账户所有者
      function getOwnerAddress() constant public returns (address adminAddress) {
        return _adminAddress;
      }

      //返回微博总数
      function getNumberOfWeibos() constant public returns (uint numberOfWeibos) {
        return _numberOfWeibos;
      }

      //取回打赏
      function adminRetrieveDonations(address receiver) onlyAdmin public {
        assert(receiver.send(this.balance));
      }

      //摧毁合约
      function adminDeleteAccount() onlyAdmin public {
        selfdestruct(_adminAddress);
      }

      //记录每条打赏记录
      event LogDonate(address indexed from, uint256 _amount);

      //接受别人的打赏
      function() payable public{
        emit LogDonate(msg.sender, msg.value);
      }


}
