const Wallet = require('./index');
const Transaction = require('./transaction.js');
const TransactionPool = require('./transaction-pool.js');
const Blockchain = require('../blockchain');

describe('Testing of transaction pool', ()=>{
  let tp, transaction, wallet, bc;
  beforeEach(()=>{
    wallet = new Wallet();
    // transaction = new Transaction();
    tp = new TransactionPool();
    bc = new Blockchain();
    // transaction = Transaction.newTransaction(wallet, '4354-546fght', 40);
    // tp.updateOrAddTransaction(transaction);
    transaction = wallet.createTransaction('4354-546fght', 30, bc, tp);
  });

  it('Checking transaction added to pool', ()=>{
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
  })

  it('udpates a transaction in pool', ()=>{
    const oldTransaction = JSON.stringify(transaction);
    transaction.update(wallet, '435-dfsgfhdgr', 50);
    tp.updateOrAddTransaction(transaction);
    const newTransaction = tp.transactions.find(t => t.id === transaction.id);
    // console.log('New Transaction', newTransaction);
    // console.log('oldTransaction : ', JSON.parse(oldTransaction));
    expect(JSON.stringify(newTransaction)).not.toEqual(oldTransaction);
  });

  it('clears the transactions', ()=>{
    tp.clear();
    expect(tp.transactions).toEqual([]);
  })

  describe('mixing valid and corrupt transactions', ()=>{
    let validTransactions;

    beforeEach(()=>{
      validTransactions = [...tp.transactions];
      for(let i=0; i<6; i++){
        wallet = new Wallet();
        transaction = wallet.createTransaction('435-dfsgfhdgr', 30,bc, tp);
        if(i % 2 === 0){
          transaction.input.amount = 999;
        }else{
          validTransactions.push(transaction);
        }
      }
    });

    it('shows a difference btw valid and corrupt transactions', ()=>{
      expect(JSON.stringify(tp.trasactions)).not.toEqual(JSON.stringify(validTransactions));
    });

    it('grabs a valid transaction', ()=>{
      expect(tp.validTransactions()).toEqual(validTransactions);
    })
  })
})
