//This part represents the blockchain, file name index.js to search easily by node

const Block = require('./block.js');
const fs = require('fs');
class Blockchain{
  constructor(){
    this.chain = Block.getBlocks();                       //This initialises an array with initial block as genesis block generated by calling genesis function in block class as a static one.
  }

  addBlock(data){
    const lastBlock = this.chain[this.chain.length-1];      //Data represents the blockchain passed while callig this function and "this" represents the passed blockchain or data.
    const block = Block.mineBlock(lastBlock, data);
    this.chain.push(block);  //Adds block to curret blockchain
    fs.readFile('test.json', function (err, data) {
    var json = JSON.parse(data)
    json.push(block)
    fs.writeFileSync("test.json", JSON.stringify(json))
    })
    return block;   //returns newly mined block;
  }

  isValid(chain){
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;  // retur false when genesis block != 1st block;
    for(let i = 1; i < chain.length; i++){
      const block = chain[i];
      const lastBlock = chain[i-1];

      if(block.lastHash !== lastBlock.hash  || block.hash !== Block.blockHash(block)){   // compare hashes
        return false; //BlockHash function in block.js and it is used to check if present hash is valid or not
      }
    }

    return true; //if everything correct return true;
  }

  replaceChain(newChain){                                                       //If current chain is not longest than replace it with longest
    if(newChain.length <= this.chain.length){                                   //Check passed chain is longer than given vhain or not?
      console.log("This is not the longest chain so can't replaced ");
      return;
    }else if(!this.isValid(newChain)){  // check validity of newChain in case it is longer than given chain
      console.log("Chain is not valid");
      return
    }
    fs.writeFileSync("test.json", JSON.stringify(newChain));
    console.log('Replacing Chain');
    this.chain = newChain;              //All confirms and conditions done than replace chain
  }

  getUserData(publicKey){
    let transactions = [];

    this.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));
    const walletOutput = []
    transactions.forEach(transaction =>{
      transaction.outputs.find(output=>{
        if(output.address === publicKey){
          walletOutput.push(output);
        }
      })
    })
    return walletOutput;
  }

  getSenderData(publicKey){
    let transactions = [];

    this.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));
    // console.log(transactions);
    const walletOutput = []
    transactions.forEach(transaction =>{
      transaction.outputs.find(output=>{
        if(output.address === publicKey){
          walletOutput.push(output);
        }
      })
    })
    return walletOutput;
  }
}

module.exports = Blockchain;
