const axios = require("axios");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const contract = require("../data/ABI_NFT.json");
const marketContract = require("../data/ABI_MARKET.json");
require("dotenv").config();

const contractAddress = String(process.env.COLLECTION_SC_ADDRESS);
const marketAddress = String(process.env.MARKET_SC_ADDRESS);
const web3 = createAlchemyWeb3(String(process.env.ALCHEMY_URI));

const services = (app) => {
  /**
   * @api {get} http://localhost:3000/mumbai/account/balance/:addr check balance of a given address 
   * @apiName Check balance of a given address
   * @apiGroup Accounts
   *
   * @apiParam {String} addr address for checking balance.
   *
   * @apiSuccess {Number} balance balance of the given address in Matic.
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "balance": 1.234567543562345
   *     }
   *
   */
 app.get('/mumbai/account/balance/:addr', async (req, res) => {
    try {
        const { addr } = req.params;
        const balance = await web3.eth.getBalance(addr)

        res.status(200).json({ balance: parseInt(balance.toString(), 10) / 10**18 });
    } catch(error) {
        res.status(400).json({ error: error.toString() })
    }
 });

 /**
   * @api {get} http://localhost:3000/mumbai/account/transfer/matic/:sender/:receiver/:amount/:pkSender Send Matic
   * @apiName Send Matic to a given address from a priv key account
   * @apiGroup Accounts
   *
   * @apiParam {String} sender address of sender.
   * @apiParam {String} pkSender privKey of sender.
   * @apiParam {String} receiver address of receiver.
   * @apiParam {String} amount amount in matic (can be in decimal as: 1.1).
   *
   * @apiSuccess {String} txID Transaction hash.
   */
 app.get('/mumbai/account/transfer/matic/:sender/:receiver/:amount/:pkSender', async (req, res) => {
  try {

    const { sender, receiver, amount, pkSender } = req.params;

    const nonce = await web3.eth.getTransactionCount(sender, 'latest'); // nonce starts counting from 0

    const transaction = {
     'to': receiver,
     'value': Number(amount) * (10**18),
     'gas': 30000,
     'nonce': nonce,
    };
    
    const signedTx = await web3.eth.accounts.signTransaction(transaction, pkSender);
    
    web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
      if (!error) {
        return res.status(200).json({ txID: hash });
      } 
    })
  } catch (error) {
    res.status(400).json({ error: error.toString() })
  }
 })

};

module.exports = services;
