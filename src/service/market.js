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
   * @api {get} http://localhost:3000/mumbai/nft/is-approved-for-all/:addr/:operator Check if is ApprovedForAll
   * @apiName Check if is ApprovedForAll
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} addr address of owner.
   * @apiParam {String} operator address of operator for allow transaction on behalf owner.
   *
   * @apiSuccess {Boolean} status the status of approvation {user} {operator}.
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": true | false
   *     }
   *
   */
  app.get(
    "/mumbai/nft/is-approved-for-all/:addr/:operator",
    async (req, res) => {
      try {
        const { addr, operator } = req.params;
        
        const nftContract = new web3.eth.Contract(
          contract.abi,
          contractAddress
        );

        const isApprovedForAll = await nftContract.methods
          .isApprovedForAll(addr, operator)
          .call();

        return res.status(200).json({ status: isApprovedForAll });
      } catch (error) {
        return res.status(400).json({ error: error.toString() });
      }
    }
  );

  /**
   * @api {get} http://localhost:3000/mumbai/nft/set-approval-for-all/:address/:operator/:status/:pk Set Approval for All
   * @apiName Set Approval for All
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} address address of the sender.
   * @apiParam {String} operator address of operator for allow transaction on behalf owner.
   * @apiParam {String} status this can be set to true or false.
   * @apiParam {String} pk privKey of sender.
   *
   * @apiSuccess {String} txID Transaction hash.
   */
  app.get(
    "/mumbai/nft/set-approval-for-all/:address/:operator/:status/:pk",
    async (req, res) => {
      try {
        const { address, operator, status, pk } = req.params;
        const nftContract = new web3.eth.Contract(
          contract.abi,
          contractAddress
        );

        const nonce = await web3.eth.getTransactionCount(address, "latest"); // get latest nonce

        const gasEstimate = await nftContract.methods
          .setApprovalForAll(operator, Boolean(status))
          .estimateGas({ from: address }); // estimate gas qty

        const tx = {
          from: address,
          to: contractAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: nftContract.methods
            .setApprovalForAll(operator, Boolean(status))
            .encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          tx,
          pk
        );

        web3.eth.sendSignedTransaction(
          signedTransaction.rawTransaction,
          (error, hash) => {
            if (!error) {
              return res.status(200).json({ txID: hash });
            }
          }
        );
      } catch (error) {
        return res.status(400).json({ error: error.toString() });
      }
    }
  );

  /**
   * @api {get} http://localhost:3000/mumbai/nft/market-create/:address/:nftAddress/:id/:priceInWei/:expiresAt/:exPay/:pk Create an order to sell an NFT
   * @apiName Create an order to sell an NFT
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} address address of sender
   * @apiParam {String} nftAddress smart contract address of the NFTs
   * @apiParam {Number} id id of the NFT
   * @apiParam {Number} priceInWei price in WEI of the NFT order created
   * @apiParam {Number} expiresAt expiration date in days
   * @apiParam {Boolean} exPay true|false
   * @apiParam {String} pk private key of sender
   *
   * @apiSuccess {String} txID Transaction hash.
   */
  app.get(
    "/mumbai/nft/market-create/:address/:nftAddress/:id/:priceInWei/:expiresAt/:exPay/:pk",
    async (req, res) => {
      try {
        const { address, nftAddress, id, priceInWei, expiresAt, exPay, pk } =
          req.params;
        const market = new web3.eth.Contract(marketContract.abi, marketAddress);

        const nonce = await web3.eth.getTransactionCount(address, "latest"); // get latest nonce

        const gasEstimate = await market.methods
          .createOrder(nftAddress, id, priceInWei, expiresAt, Boolean(exPay))
          .estimateGas({ from: address }); // estimate gas qty        

        const tx = {
          to: marketAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: market.methods
            .createOrder(nftAddress, id, priceInWei, expiresAt, Boolean(exPay))
            .encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          tx,
          pk
        );

        web3.eth.sendSignedTransaction(
          signedTransaction.rawTransaction,
          (error, hash) => {
            if (!error) {
              return res.status(200).json({ txID: hash });
            }
          }
        );
      } catch (error) {
        return res.status(400).json({ error: error.toString() });
      }
    }
  );
};

module.exports = services;
