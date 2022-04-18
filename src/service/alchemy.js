const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

require("dotenv").config();
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
};

module.exports = services;
