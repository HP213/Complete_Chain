//This represents wallet of user

const { INITAL_BALANCE } = require('../difficulty');
const ChainUtil = require('../chain-util.js');
const Transaction = require('./transaction.js');
const EthCrypto = require('eth-crypto');
const cryptoJSON = require('crypto-json');

async function call(transaction, key){
  const encryptedObject = EthCrypto.cipher.parse(transaction.encryptedString);
  const message = await EthCrypto.decryptWithPrivateKey(
       key, // privateKey
       encryptedObject // encrypted-data
   );

   const algorithm = 'camellia-128-cbc'
   const encoding = 'hex'
   const password = message;
   const keys = ['amount', 'address']
   const data = cryptoJSON.decrypt(transaction.output, password, {encoding, keys, algorithm});
   return data.amount;
}

class Wallet{
  constructor(){
    this.balance = INITAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.publicKey; //encode('hex')used to convert given no. into hexadecimal form
  }

  toString(){
    return `Wallet -
    publicKey : ${this.publicKey.toString()}
    balance   : ${this.balance}`
  }   //return in above format

  sign(dataHash){
    const signature = EthCrypto.sign(
      this.keyPair.privateKey, // privateKey
      dataHash // hash of message
    );
    return signature;
  } // Sign the transaction.

  async createTransaction(recipient, amount, blockchain, transactionPool){
    this.balance = await this.calculateBalance(blockchain);

    if(amount > this.balance){
      console.log(`Amount ${amount} exceeds the wallet balance`);
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if(transaction){
      transaction.update(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }else{
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }
    return transaction;
  }

  async calculateBalance(blockchain){
    let balance = this.balance;
    let transactions = [];

    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));
    let walletInput = [];

    transactions.forEach(transaction => {
      if(transaction.input.address === this.publicKey){
        walletInput.push(transaction);
      }
    })
  let startTime = 0;

    if(walletInput.length){
      const recentInput = walletInput[walletInput.length - 2];

      balance = await call(recentInput.outputs[0][0], this.keyPair.privateKey);
      startTime = recentInput.input.timestamp;
    }

    const outputFinal = [];
    transactions.forEach(transaction => {
            if(transaction.input.timestamp > startTime){
              const valuess = JSON.stringify(transaction.outputs);
              if(valuess.substring(1, 2) === '{'){
                if(transaction.outputs[1].address === this.keyPair.address){
                  outputFinal.push(transaction.outputs);
                };
              }else{
                transaction.outputs.forEach(output => {
                  if(output[1].address === this.keyPair.address){
                      outputFinal.push(output);
                  };
                })
              }
            }

    })

    if(outputFinal.length){
      for(var i = 0 ; i <outputFinal.length; i++){
          var mydata = await call(outputFinal[i][0], this.keyPair.privateKey);
          balance = balance + mydata;
      }

    }
      return balance;
  }

  static blockchainWallet(){
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-walllet';
    return blockchainWallet;
  }
}
module.exports = Wallet;
