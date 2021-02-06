let Factory = artifacts.require("NftFactory");
let Nft = artifacts.require("SeascapeNft");

// rinkeby testnet
let factoryAddress = '0xF06CF016b6DAdED5f676EE6340fc7398CA2142b0';
let nftAddress = '0x7115ABcCa5f0702E177f172C1c14b3F686d6A63a';

module.exports = async function(callback) {
    let res = init();

    callback(null, res);
};

let min = 1;
let max = 5;

let grantPermission = async function(factory, address) {
    let res = await factory.addGenerator(address);
    console.log(res);
    console.log(`Account ${address} granted a GENERATOR permission in Nft Factory`);
    return res;
}.bind(this);

let init = async function() {
    web3.eth.getAccounts(function(err,res) {accounts = res;});

    let factory = null;
    const networkId = await web3.eth.net.getId();    
    
    if (networkId == 4) {
	factory = await Factory.at(factoryAddress);	
    } else {
	factory = await Factory.deployed();
    }

    let nft = null;
    if (networkId != 4) {
	nft = await Nft.deployed();
    } else {
	nft = await Nft.at(nftAddress);
    }
    let nft_granted = await nft.setFactory(factory.address);
    console.log("Nft has been linked to factory: "+nft_granted.tx);

    let granted = await factory.isGenerator(accounts[0]);
    if (!granted) {
	await grantPermission(factory, accounts[0]);
    } else {
	console.log(`Account ${accounts[0]} was already granted a permission`);
    }

    let amount = 5;
    let args = process.argv.slice(4);
    if (args.length == 1) {
	amount = parseInt(args[0]);
	if (amount < min || amount > max) {
	    throw "Number of minting NFTs should be between 1 and 5";
	    process.exit(1);
	}
    }
    
    let owner = accounts[0];
    let generation = 0;

    for (var quality = 1; quality <= amount; quality++) {
	let res = await factory.mintQuality(owner, generation, quality);
	console.log("-------------------------");
	console.log(`Quality ${quality} was minted!`);	
	console.log(`Txid: ${res.tx}`);
	console.log();
    }
};

