const axios = require("axios");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const contract = require("../data/ABI_NFT.json");
require("dotenv").config();

const contractAddress = String(process.env.COLLECTION_SC_ADDRESS);
const web3 = createAlchemyWeb3(String(process.env.ALCHEMY_URI));

const services = (app) => {
  /**
   * @api {get} http://localhost:3000/mumbai/block-number Get block number
   * @apiName Get Block Number
   * @apiGroup Block
   * @apiSuccess {Number} blockNumber last block number of blockchain.
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "blockNumber": 25977115
   *     }
   *
   * @apiErrorExample Error-Response:
   *   Error 400: Bad Request
   *   {
   *     "error": "Error: (401)  Must be authenticated!"
   *   }
   */
  app.get("/mumbai/block-number", async (req, res) => {
    try {
      const blockNumber = await web3.eth.getBlockNumber();
      return res.status(200).json({ blockNumber });
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });

  /**
   * @api {get} http://localhost:3000/mumbai/nft/data/:nftID Get NFT metadata from a given ID
   * @apiName Get NFT metadata
   * @apiGroup NFT
   * @apiParam {Number} nftID id of the NFT.
   * @apiSuccess {Object} metadata The metadata of a given NFT ID.
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *
   * {
   *  "image": "https://gateway.pinata.cloud/ipfs/QmaE8UNKmB2X1dy9naBchG3ajKKMnX44MKuxnPM2sSK4c1","attributes": [
   *  {
   *    "trait_type": "Body",
   *    "value": "Chocolate"
   *  },
   *  {
   *  "trait_type": "Clothes",
   *  "value": "Glam"
   *  },
   * {
   *  "trait_type": "Color Background",
   *  "value": "Ruby"
   *  },
   *  {
   *  "trait_type": "Eyes",
   *  "value": "Shades"
   *  },
   * {
   *  "trait_type": "Hair",
   *  "value": "Flame"
   *  },
   *  {
   *  "trait_type": "Mouth",
   *  "value": "Smile"
   *  },
   *  {
   *  "trait_type": "Texture",
   *  "value": "Rays"
   *  }],
   * "name": "Token 6"
   * }
   */
  app.get("/mumbai/nft/data/:nftID", async (req, res) => {
    try {
      const { nftID } = req.params;
      const nftContract = new web3.eth.Contract(contract.abi, contractAddress);
      const nftURI = await nftContract.methods.uri(nftID).call();
      const uri = nftURI.slice(0, -5);

      const hex = parseInt(nftID, 10).toString(16);

      const metadata = await axios.get(`${uri}/${hex}`);
      return res.status(200).json(metadata.data);
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });
  
  /**
   * @api {get} http://localhost:3000/mumbai/mempool/tx/:txID Transaction Info
   * @apiName Transaction Info
   * @apiGroup TX
   *
   * @apiParam {String} txID id of the transaction.
   *
   * @apiSuccess {Object} txInfo Transaction info.
   */

  app.get("/mumbai/mempool/tx/:txID", async (req, res) => {
    try {
      const { txID } = req.params;

      const txInfo = await web3.eth.getTransactionReceipt(txID);

      return res.status(200).json(txInfo);
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });
};

module.exports = services;
