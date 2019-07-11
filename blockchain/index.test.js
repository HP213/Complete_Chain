//test cases for complete Blockchain

const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', ()=>{
  let bc;

  beforeEach(()=>{
    bc = new Blockchain();
    bc2 = new Blockchain();
  });

  it('starts with a genesis block', ()=>{
    expect(bc.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', ()=>{
    const data = 'test';
    bc.addBlock(data);

    expect(bc.chain[bc.chain.length-1].data).toEqual(data);
  })

  it('validates a valid chain', ()=>{
    bc2.addBlock('test_data');
    expect(bc.isValid(bc2.chain)).toBe(true);
  });

  it('invalidates a corrupt genesis block', ()=>{
    bc2.chain[0].data = 'test_data_1';  //corrupt a chain;
    expect(bc.isValid(bc2.chain)).toBe(false);
  })

  it('invalidates corrupt chain', ()=>{
    bc2.addBlock('test_data');
    bc2.chain[1].data = 'test_data_altered';

    expect(bc.isValid(bc2.chain)).toBe(false);
  })

  it('replaces chain with longest chain', ()=>{
    bc2.addBlock('test_data');
    bc.replaceChain(bc2.chain);

    expect(bc.chain.length).toEqual(bc2.chain.length);
  })

  it('Don"t replaces chain with small chain', ()=>{
    bc.addBlock('test_data');
    bc.replaceChain(bc2.chain);

    expect(bc.chain.length).not.toEqual(bc2.chain.length);
  })
})
