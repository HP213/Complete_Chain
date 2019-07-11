const { DIFFICULTY, mine_rate } = require('../difficulty');
const ChainUtil = require('../chain-util.js');
const fs = require('fs');

class Block{
  constructor(timestamp, lastHash, hash, data, nonce, difficulty){
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY
  } // this constructor function initiated as soon as object of this class called and this will help us to dclare variables within every block

  toString(){
    return `Block -
     TimeStamp : ${this.timestamp}
     lastHash : ${this.lastHash.substring(0, 10)}
     Hash : ${this.hash.substring(0, 10)}
     Nonce : ${this.nonce}
     DIFFICULTY : ${this.difficulty}
     Data : ${this.data}`;
  } // toString() function called to view block in representable format. This is called every time when we want to view the block and shown in above format

  static genesis(){
    return new this('Genesis Time', '-----', 'f1r4--fe', [], 0, DIFFICULTY);
  } // Genesis block, the initial block, since static so can be called even "without" object of class. // best use for test case.

  static getBlocks(){
      const data = fs.readFileSync('test.json', "utf8");
      if(data){
        return JSON.parse(data);
      }else{
        var json = [];
        json.push({"timestamp":"Genesis Time","lastHash":"-----","hash":"f1r4--fe","data":[],"nonce":0,"difficulty":4});
        fs.writeFileSync("test.json", JSON.stringify(json));
        const data = fs.readFileSync('test.json', "utf8");
        return JSON.parse(data);
      }
  }

  static mineBlock(previousBlock, data){
    let timestamp, hash;
    const lastHash = previousBlock.hash;
    let difficulty = previousBlock.difficulty;
    let nonce = 0;

    do {
      nonce++; //every time increase the value of nonce by one.
      timestamp = Date.now();                                                   // get the current seconds from 1 jan 1970.
      difficulty = Block.adjustDifficulty(previousBlock, timestamp);            //adjust the difficulty randomly acc. to time required to mine, and time required on cpu ability and no. of miners
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);          //Calculate hash for the block acc. to data.
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));         //Condition while difficulty does not matches.

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);        //Return newly mined block.
  }

  //Since adjustDifficulty and hash functions are static so they can be called within a class without object of class .

  static hash(timestamp, lastHash, data, nonce, difficulty){
    return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
  }

  static blockHash(block){
    return Block.hash(block.timestamp, block.lastHash, block.data, block.nonce, block.difficulty);
  }// generates hash for block

  static adjustDifficulty(previousBlock, currentTime){
    let difficulty = previousBlock.difficulty;
    difficulty = previousBlock.timestamp + mine_rate > currentTime ? difficulty + 1 : difficulty - 1;
    return difficulty;
  }
}// the function used to randomly adjust difficulty acc. to mining time and computational power.

module.exports = Block;
//Export features of block
