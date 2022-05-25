require("dotenv").config();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyURI = String(process.env.ALCHEMY_URI);
const web3 = createAlchemyWeb3(alchemyURI);
const axios = require("axios");
const CicularJSON = require("circular-json")

const services = (app) => {
  /**
   * @api {get} http://localhost:3000/util/compare-checksum-addresses/:addrOne/:addrTwo check if two addresses are the same with the checksum included
   * @apiName Check if two addresses are the same
   * @apiGroup Util
   *
   * @apiParam {String} addrOne first address to compare.
   * @apiParam {String} addrTwo second address to compare.
   *
   * @apiSuccess {Boolean} result if the two addresses are the same or not.
   */
  app.get(
    "/util/compare-checksum-addresses/:addrOne/:addrTwo",
    async (req, res) => {
      const { addrOne, addrTwo } = req.params;
      const checkSumAddrOne = web3.utils.toChecksumAddress(String(addrOne));
      const checkSumAddrTwo = web3.utils.toChecksumAddress(String(addrTwo));

      return res
        .status(200)
        .json({ result: checkSumAddrOne === checkSumAddrTwo });
    }
  );

    /**
   * @api {get} http://localhost:3000/util/get-gas-price get gas price
   * @apiName Gas Price
   * @apiGroup Util
   * 
   * @apiSuccess {Boolean} result if the two addresses are the same or not.
   */

  app.get('/util/get-gas-price', async (req, res) => {
      try {
        const gasPrice = await axios.post(alchemyURI, {
          "jsonrpc": "2.0",
          "id": 0,
          "method": "eth_gasPrice"
        });

        const result = CicularJSON.stringify(gasPrice)

        const data = JSON.parse(result)

        return res.status(200).json({ result: parseInt(data.data.result, 16)  })
      } catch (error) {
        return res.status(400).json({ error: error.toString() });
      }
  })
};

module.exports = services;
