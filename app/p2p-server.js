const Websocket = require('ws'); // websocket used to set up peer to peer connection

const P2P_PORT = process.env.P2P_PORT || 5001;   // setting up port
// process.env.P2P_PORT is used if someone sets commands"set P2P_PORT = 5002" then p2p server will run on 5002.
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
// this defines the peers connection. If someone commands "set PEERS=ws://localhost:5001,ws://localhost:5002" than it will split by , and push it in array.
const MESSAGE_TYPES = {
  chain : "CHAIN",
  transaction : "TRANSACTION",
  clearMessage : "CLEAR_MESSAGE"
};


class P2pserver{
  constructor(blockchain, transactionPool){  // need to pass blockchain to call constructor function and initalize it
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = []; // list of all connected peers/sockets
  }

  listen(){
    const server = new Websocket.Server({ port : P2P_PORT}); // create a new websocket serveer called peer which other can join it
    server.on('connection', socket => this.connnectSocket(socket)); // used when new peer added so on connection add that peer to this socket[];
    this.connectToPeers(); //this is called to connect to connect to existing peers already present before.

    console.log(`Listening for peers-to-peers connection on ${P2P_PORT}`);
  }

  connectToPeers(){  //check for each peer and make new websocket connection for each peer and connect to it.
    peers.forEach(peer=>{
      const socket = new Websocket(peer);

      socket.on('open', ()=> this.connnectSocket(socket));
    })
  }

  connnectSocket(socket){
    this.sockets.push(socket);  // push sockets in socket array
    console.log('Socket Connected');

    this.messageHadler(socket);

    this.sendChain(socket);
  }

  messageHadler(socket){ // used to handle message when recived
    socket.on('message', message=>{
      const data = JSON.parse(message);
      switch(data.type){
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clearMessage:
          this.transactionPool.clear();
          break;
      }

    });
  }

  sendChain(socket){ // send blockchain to given socket
    socket.send(JSON.stringify({
      type : MESSAGE_TYPES.chain,
      chain : (this.blockchain.chain)
    })); // send message to all PEERS.
  }

  sendTransaction(socket, transaction){
    socket.send(JSON.stringify({
      type : MESSAGE_TYPES.transaction,
      transaction}));
  }

  syncChain(){
    this.sockets.forEach(socket =>this.sendChain(socket));
  }

  broadcastTransaction(transaction){
    this.sockets.forEach(socket =>this.sendTransaction(socket, transaction));
  }

  broadcastClearMessage(){
    this.sockets.forEach(socket => socket.send(JSON.stringify({
      type : MESSAGE_TYPES.clearMessage
    })));
  }
}

module.exports = P2pserver;
