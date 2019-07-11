const Block = require('./block.js');                                            //Getting block property

describe('Block', ()=>{
  let data, block, lastBlock;

  beforeEach(()=>{                                                              //beforeEach is executed before every it statement
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  })

  it('Matches the `data` with given data', () =>{                               //Checks that input of data is correct or not?
    expect(block.data).toEqual(data);
  });

  it('match the hashes of last block', () =>{                                   //It matches the last last hash and hash of previous block
    expect(block.lastHash).toEqual(lastBlock.hash);
  })
  it('matches the difficulty', () =>{                                           //Random difficulty check
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    console.log(block.toString());
  })

  it('lowers the difficulty when block is slowly mined', ()=>{
    expect(Block.adjustDifficulty(block, block.timestamp+360000)).toEqual(block.difficulty-1);
  })

  it('increases the difficulty when block is fastly mined', ()=>{
    expect(Block.adjustDifficulty(block, block.timestamp+1)).toEqual(block.difficulty+1);
  })
})
