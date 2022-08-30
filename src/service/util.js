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
      }
  })

  /**
   * @api {get} http://localhost:3000/util/get-private-key/:secret/:address/:userSecret get private key
   * @apiName User Private Key
   * @apiGroup Util
   * 
   * @apiParam {String} address the address of the user.
   * @apiParam {String} secret general.
   * @apiParam {String} userSecret secret of the user.
   * 
   * @apiSuccess {String} Private Key
   */
  app.get('/util/get-private-key/:secret/:address/:userSecret', async (req, res) => {
    try {
      const { secret, address,userSecret } = req.params;
      const crypto = require('crypto');
      const secretKey = `${secret}${address}`
      //hash private
      var decypher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey.substring(2,34)),secretKey.substring(8,24));
      //deccrypt private
      let privateKey = decypher.update(userSecret, 'hex','utf8')
      privateKey += decypher.final('utf8');

      return res.status(200).json({ result: privateKey });
    } catch (error) {
      return res.status(400).json({ error: error.toString() });

    }
  });
};

module.exports = services;
