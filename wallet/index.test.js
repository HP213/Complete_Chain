const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');

describe('Wallet', ()=>{
  let wallet, tp, bc;

  beforeEach(()=>{
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', ()=>{
    let transaction, amount, recepient;

    beforeEach(()=>{
      amount = 50;
      recepient = "3456-456fgr";
      transaction = wallet.createTransaction(recepient, amount,bc, tp);
    });

    describe("Repeating the same transaction", ()=>{
      beforeEach(()=>{
        wallet.createTransaction(recepient, amount, bc, tp);
      });

      it('doubles the send amount subtracted from wallet', ()=>{
        expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
          .toEqual(wallet.balance - amount*2);
      });

      it('clones the send output send to recipient', ()=>{
        expect(transaction.outputs.filter(output => output.address === recepient)
          .map(output => output.amount)).toEqual([amount, amount]);
      })
    })
  })
})
