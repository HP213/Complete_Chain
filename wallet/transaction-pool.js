const Transaction = require('./transaction.js');
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
}

class TransactionPool{
  constructor(){
    this.transactions = [];
  }

  updateOrAddTransaction(transaction){
    let transactionWithId = this.transactions.find(t => t.id == transaction.id);

    if(transactionWithId){
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    }else{
      this.transactions.push(transaction);
    }
  }

  existingTransaction(publicKey){
    return this.transactions.find(t => t.input.address === publicKey);
  }

  validTransactions(){
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0);

      if(transaction.input.amount !== outputTotal){
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return;
      }

      if(!Transaction.verifyTransaction(transaction)){
        console.log(`Invalid signature from ${transaction.input.address}.`);
        return;
      }

      transaction.outputs.forEach(outputData => {
        call(outputData).then(data =>{
          const inputData = [data];
          const address =  EthCrypto.publicKey.toAddress(outputData.address);
          inputData.push({address})
          transaction.outputs[transaction.outputs.indexOf(outputData)] = inputData;
        });
      })
      return transaction;
    });
  }

  clear(){
    this.transactions = [];
  }
}


module.exports = TransactionPool;
