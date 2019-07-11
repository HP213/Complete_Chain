//test cases for transaction

const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../difficulty.js');


describe('Transaction', ()=>{
  let transaction, wallet, amount, recipient;

  beforeEach(()=>{
    wallet = new Wallet();
    amount = 50;
    recipient = 're45sqeaaa';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it('outputs the `amount` substracted from wallet', ()=>{
    expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount);
  })

  it('outputs the `amount` substracted from wallet to recepient wallet', ()=>{
    expect(transaction.outputs.find(output => output.address === recipient).amount)
      .toEqual(amount);
  })

  it('inputs the balance of the wallet', ()=>{
    expect(transaction.input.amount).toEqual(wallet.balance);
  })

  it('validates the correct transaction', ()=>{
    expect(Transaction.verifyTransaction(transaction)).toEqual(true);
  })

  it('invalidates the corrupted transaction', ()=>{
    transaction.outputs[0].amount = 5000;
    expect(Transaction.verifyTransaction(transaction)).toEqual(false);
  })

  describe('it does not create transaction when exceeds limit', ()=>{
    beforeEach(()=>{
      amount = 5000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('Shows error on exceeding the limit', ()=>{
      expect(transaction).toEqual(undefined);
    })
  })

  describe('Updating a transaction', ()=>{
    let nextAmount, nextRecipient;

    beforeEach(()=>{
      nextAmount = 20;
      nextRecipient = '343dfgterytr-5';
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    })

    it('substracts amount from senders output', ()=>{
      expect(transaction.outputs.find(output =>  output.address === wallet.publicKey).amount)
        .toEqual(wallet.balance - amount - nextAmount);
    })
    it('outputs an amount for the next recipient', ()=>{
      expect(transaction.outputs.find(output =>  output.address === nextRecipient).amount)
        .toEqual(nextAmount);
    })
  });

  describe('creating a reward trasaction', ()=>{
    beforeEach(()=>{
      transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
    });

    it(`reward the miner's wallet`, ()=>{
      expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount)
        .toEqual(MINING_REWARD);
    });
  });
});
