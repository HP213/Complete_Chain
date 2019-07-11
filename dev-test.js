
const Blockchain = require('./blockchain');
// const block = new Block('a', 'b', 'c', 'd');
// console.log("Hi there");
// console.log(block.toString());
// console.log(Block.genesis().toString());

// const testBlock = Block.mineBlock(Block.genesis(), "test");
// console.log(testBlock.toString());

// const bc = new Blockchain();
//
// for(let i = 1; i <= 10; i++){
//   console.log(bc.addBlock(`test ${i}`).toString());
// }


const Wallet = require('./wallet');
const wallet = new Wallet();
console.log(wallet.toString());
