pragma solidity ^0.4.17;

              /*微博管理平台*/
contract WeiboRegistry {

      //根据账户昵称、ID、地址查找微博账户
      mapping (address => string) _addressToAccountName;
      mapping (uint => address) _accountIdToAccountAddress;
      mapping (string => address) _accountNameToAddress;

      //平台上的注册账户数量
      uint _numberOfAccounts;

      //微博平台管理员
      address _registryAdmin;

      //权限控制，被这个修饰符修饰的方法，表示该方法只能被微博平台管理员操作
      modifier onlyRegistryAdmin() {
        require(msg.sender == _registryAdmin);
        _;
      }

      //微博平台构造函数
      function WeiboRegistrys() public {
        _numberOfAccounts = 0;
        _registryAdmin = msg.sender;
      }

      //在微博上注册微博：用户名，微博账户
      function register(string name, address accountAddress) public {
        //账户之前未注册过
        require(_accountNameToAddress[name] == address(0));

        //账户昵称之前未注册过
        require(bytes(_addressToAccountName[accountAddress]).length == 0);

        //昵称不能超过64个字符
        require(bytes(name).length < 64);

        _addressToAccountName[accountAddress] = name;
        _accountNameToAddress[name] = accountAddress;
        _accountIdToAccountAddress[_numberOfAccounts] = accountAddress;
        _numberOfAccounts++;
      }

      //返回已注册账户数量
      function getNumberOfAccounts() constant public returns (uint numberOfAccounts) {
        numberOfAccounts = _numberOfAccounts;
      }

      //返回昵称对应的微博账户地址
      function getAddressOfName(string name) constant public returns (address addr) {
        addr = _accountNameToAddress[name];
      }

      //返回与微博账户地址对应的昵称
      function getNameOfAddress(address addr) constant public returns (string name) {
        name = _addressToAccountName[addr];
      }

      //根据ID返回账户
      function getAddressOfId(uint id) constant public returns (address addr) {
        addr = _accountIdToAccountAddress[id];
      }

      //取回打赏
      function adminRetrieveDonations() onlyRegistryAdmin public {
        assert(_registryAdmin.send(this.balance));
      }

      //摧毁合约
      function adminDeleteRegistry() onlyRegistryAdmin public {
        selfdestruct(_registryAdmin);
      }

      //记录每条打赏
      event LogDonate(address indexed from, uint256 _amount);

      //接受别人打赏
      function() payable public{
        emit LogDonate(msg.sender, msg.value);
      }

}
