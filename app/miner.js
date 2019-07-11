const Transaction = require('../wallet/transaction.js');
const Wallet = require('../wallet/index.js');
const EthCrypto = require('eth-crypto');
var rndm = require('rndm');
const cryptoJSON = require('crypto-json');


async function call(transaction){
  var id = rndm(15);

  const encrypted = await EthCrypto.encryptWithPublicKey(
      transaction.address, // by encryping with bobs publicKey, only bob can decrypt the payload with his privateKey
      id // we have to stringify the payload before we can encrypt it
  );
  const algorithm = 'camellia-128-cbc'
  const encoding = 'hex'
  const password = id;
  const keys = ['amount', 'address'];
  const output = cryptoJSON.encrypt(
    transaction, password, {encoding, keys, algorithm}
  )

  const encryptedString = EthCrypto.cipher.stringify(encrypted);
  const returnValue = {encryptedString, output}
  return returnValue;
};

class Miners{
  constructor(blockchain, transactionPool, wallet, p2pserver){
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pserver = p2pserver;
  }

   mine(){
    const validTransactions = this.transactionPool.validTransactions();
    const value = Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet());
    call(value.outputs[0]).then(data => {
      const outputData = [data];
      const address =  EthCrypto.publicKey.toAddress(value.outputs[0].address);
      outputData.push({address});
      value.outputs = outputData;
      return value;
    }).then(datas => {
      validTransactions.push(value);
      const block = this.blockchain.addBlock(validTransactions);
      this.p2pserver.syncChain();
      this.transactionPool.clear();
      this.p2pserver.broadcastClearMessage();

    })

    return;
  }
}
module.exports = Miners;
