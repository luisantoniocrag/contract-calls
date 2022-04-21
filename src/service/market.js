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
   * @api {get} http://localhost:3000/mumbai/nft/set-approval-for-all/:operator/:status/:pk Set Approval for All
   * @apiName Set Approval for All
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} operator address of operator for allow transaction on behalf owner.
   * @apiParam {Boolean} status this can be set to true or false.
   * @apiParam {String} pk privKey of sender.
   *
   * @apiSuccess {String} txID Transaction hash.
   */
  app.get(
    "/mumbai/nft/set-approval-for-all/:operator/:status/:pk",
    async (req, res) => {
      try {
        const { operator, pk } = req.params;
        let {status} = req.params;
        status = status === "on"

        const account = web3.eth.accounts.privateKeyToAccount(pk);
        const nftContract = new web3.eth.Contract(
          contract.abi,
          contractAddress
        );

        const nonce = await web3.eth.getTransactionCount(
          account.address,
          "latest"
        );

        const gasEstimate = await nftContract.methods
          .setApprovalForAll(operator, status)
          .estimateGas({ from: account.address });

        const transaction = {
          to: contractAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: nftContract.methods
            .setApprovalForAll(operator, status)
            .encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          transaction,
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
   * @api {get} http://localhost:3000/mumbai/nft/market-create/:nftAddress/:id/:priceInWei/:expiresAt/:exPay/:pk Create an order to sell an NFT
   * @apiName Create an order to sell an NFT
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} pk private key of sender
   * @apiParam {String} nftAddress smart contract address of the NFT Collection
   * @apiParam {Number} id id of the NFT item
   * @apiParam {Number} priceInWei price in WEI of the NFT order created (1**18 == 1 Matic)
   * @apiParam {Number} expiresAt expiration date in days
   * @apiParam {Boolean} exPay true|false
   *
   * @apiSuccess {String} txID Transaction hash.
   */
  app.get(
    "/mumbai/nft/market-create/:nftAddress/:id/:priceInWei/:expiresAt/:exPay/:pk",
    async (req, res) => {
      try {
        const { nftAddress, id, priceInWei, expiresAt, pk } = req.params;
        let { exPay } = req.params;
        exPay = exPay === "on";
        const account = web3.eth.accounts.privateKeyToAccount(pk);

        const market = new web3.eth.Contract(marketContract.abi, marketAddress);

        const nonce = await web3.eth.getTransactionCount(
          account.address,
          "latest"
        ); // get latest nonce

        const gasEstimate = await market.methods
          .createOrder(nftAddress, id, priceInWei, expiresAt, exPay)
          .estimateGas({ from: account.address }); // estimate gas qty

        const transaction = {
          to: marketAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: market.methods
            .createOrder(nftAddress, id, priceInWei, expiresAt, exPay)
            .encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          transaction,
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
   * @api {get} http://localhost:3000/mumbai/nft/market-cancel-order/:pkOwner/:nftAddress/:orderID Cancel an order to sell an NFT
   * @apiName Cancel an order to sell an NFT
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} nftAddress smart contract address of the NFT Collection
   * @apiParam {Number} orderID id of the order id
   * @apiParam {String} pkOwner private key of order owner
   *
   * @apiSuccess {String} txID Transaction hash.
   */

  app.get(
    "/mumbai/nft/market-cancel-order/:pkOwner/:nftAddress/:orderID",
    async (req, res) => {
      try {
        const { pkOwner, nftAddress, orderID } = req.params;

        const account = web3.eth.accounts.privateKeyToAccount(pkOwner);
        const market = new web3.eth.Contract(marketContract.abi, marketAddress);

        const nonce = await web3.eth.getTransactionCount(
          account.address,
          "latest"
        ); // get latest nonce

        const gasEstimate = await market.methods
          .cancelOrder(nftAddress, orderID)
          .estimateGas({ from: account.address }); // estimate gas qty

        const transaction = {
          to: marketAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: market.methods.cancelOrder(nftAddress, orderID).encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          transaction,
          pkOwner
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
        return res.status(200).json({ error: error.toString() });
      }
    }
  );

  /**
   * @api {get} http://localhost:3000/mumbai/nft/market-execute-order/:nftAddress/:newOwner/:orderID/:secKey/:adminPK Execute an order to transfer the NFT
   * @apiName Execute an order to transfer an NFT
   * @apiGroup NFTMarketPlace
   *
   * @apiParam {String} nftAddress address of order owner
   * @apiParam {String} newOwner private key of order owner
   * @apiParam {String} orderID smart contract address of the NFT Collection
   * @apiParam {String} secKey id of the order id
   * @apiParam {String} adminPK private ket of the admin
   *
   * @apiSuccess {String} txID Transaction hash.
   */

  app.get(
    "/mumbai/nft/market-execute-order/:nftAddress/:newOwner/:orderID/:secKey/:adminPK",
    async (req, res) => {
      try {
        const { nftAddress, newOwner, orderID, secKey, adminPK } = req.params;

        const account = web3.eth.accounts.privateKeyToAccount(adminPK);
        const market = new web3.eth.Contract(marketContract.abi, marketAddress);

        const nonce = await web3.eth.getTransactionCount(
          account.address,
          "latest"
        );

        const gasEstimate = await market.methods
          .safeExecuteOrder(nftAddress, newOwner, orderID, secKey)
          .estimateGas({ from: account.address }); // estimate gas qty

        const transaction = {
          to: marketAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: market.methods
            .safeExecuteOrder(nftAddress, newOwner, orderID, secKey)
            .encodeABI(),
        };

        const signedTransaction = await web3.eth.accounts.signTransaction(
          transaction,
          adminPK
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
