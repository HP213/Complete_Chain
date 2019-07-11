//Set up server

const express = require('express');
const bodyParser = require('body-parser');  // used to read data send from other pages
const Blockchain  = require('../blockchain');
const P2pserver = require('./p2p-server.js');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool.js');
const Miner = require('./miner');
const path = require('path');
const HTTP_PORT = process.env.HTTP_PORT || 3001; // Set up PORT

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pserver = new P2pserver(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pserver);
const fs = require('fs');
app.use(bodyParser.json()); // body parser used to read json data

app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.get('/blocks', (req, res)=>{
  res.json(bc.chain);
});

app.post('/getUserData', (req, res)=>{
  const { publicKey } = req.body;
  const walletOutput = bc.getUserData(publicKey);
  res.json(walletOutput);
})

app.post('/mine', (req, res)=>{
  const block = bc.addBlock(req.body.data);
  console.log(`New Block added : ${block.toString()}`);
  p2pserver.syncChain();  // this part is really important used to keep chains updated all the time
  res.redirect('/blocks');
})

app.get('/keyPair', (req, res)=>{
  res.json(wallet.keyPair.getPrivate('hex'));
})

app.get('/mine', (req, res)=>{
  res.redirect('/blocks');
})

app.get('/transactions', (req, res)=>{
  res.json(tp.transactions);
})

app.get('/publickey', (req, res)=>{
  res.json({ "Public Key " : wallet.publicKey})
})

app.get('/mine-transaction', (req, res)=>{
  const block = miner.mine();
  res.redirect('/blocks');
})

app.post('/transact', (req, res)=>{
  const { recepient,  amount } = req.body;
  const transaction = wallet.createTransaction(recepient, amount, bc,  tp);
  p2pserver.broadcastTransaction(transaction);
  res.redirect('/transactions');
})


app.listen(HTTP_PORT, ()=>{
  console.log(`Listening on PORT ${HTTP_PORT}`);
});
p2pserver.listen();
