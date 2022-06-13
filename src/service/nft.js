const Moralis = require("moralis/node");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
require("dotenv").config();
const contract = require("../data/ABI_NFT.json");
const { getBestGasPrice } = require("../helpers/web3Helpers");

/* Moralis init code */
const serverUrl = String(process.env.MORALIS_SERVER);
const appId = String(process.env.MORALIS_APP_ID);
const masterKey = String(process.env.MORALIS_MASTER_KEY);
const collectionAddress = String(process.env.COLLECTION_SC_ADDRESS);

const web3 = createAlchemyWeb3(String(process.env.ALCHEMY_URI));

const services = (app) => {
  /**
   * @api {get} http://localhost:3000/mumbai/nft/get-nfts Get all tokens IDS
   * @apiName GetAllTokensIds
   * @apiGroup NFT
   *
   * @apiSuccess {Array} ids NFTs ids.
   */

  app.get("/mumbai/nft/get-nfts", async (req, res) => {
    await Moralis.start({ serverUrl, appId, masterKey });
    try {
      const mumbaiNFTs = await Moralis.Web3API.token.getAllTokenIds({
        address: collectionAddress,
        chain: "mumbai",
      });

      return res.status(200).json(mumbaiNFTs);
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });

  /**
   * @api {get} http://localhost:3000/mumbai/nft/get-contract-metadata Get contract metadata
   * @apiName GetContractMetadata
   * @apiGroup NFT
   *
   * @apiSuccess {Array} contract NFT Metadata.
   */

  app.get("/mumbai/nft/get-contract-metadata", async (req, res) => {
    await Moralis.start({ serverUrl, appId, masterKey });
    try {
      const mumbaiNFTs = await Moralis.Web3API.token.getNFTMetadata({
        address: collectionAddress,
        chain: "mumbai",
      });

      return res.status(200).json(mumbaiNFTs);
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });

  /**
   * @api {get} http://localhost:3000/mumbai/nft/get-nft-metadata/:tokenId Get metadata by token ID
   * @apiName GetNFTMetadataByTokenID
   * @apiGroup NFT
   *
   * @apiParam {Number} tokenId the id of the token to get the NFT metadata
   * 
   * @apiSuccess {Array} metadata NFT Metadata.
   */

   app.get("/mumbai/nft/get-nft-metadata/:tokenId", async (req, res) => {
    const { tokenId } = req.params;
    await Moralis.start({ serverUrl, appId, masterKey });
    try {
      const mumbaiNFTs = await Moralis.Web3API.token.getTokenIdMetadata({
        address: collectionAddress,
        token_id: parseInt(tokenId, 10),
        chain: "mumbai",
      });

      return res.status(200).json(mumbaiNFTs);
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });

   /**
   * @api {get} http://localhost:3000/mumbai/nft/get-token-id-owners/:tokenId Get token Owners by token Id
   * @apiName getTokenIdOwners
   * @apiGroup NFT
   * 
   * @apiParam {String} tokenId token Id
   *
   * @apiSuccess {Oject} nftInfo NFT info and owner.
   */

    app.get("/mumbai/nft/get-token-id-owners/:tokenId", async (req, res) => {
      await Moralis.start({ serverUrl, appId, masterKey });
      try {
        const { tokenId } = req.params;
        const nftInfo = await Moralis.Web3API.token.getTokenIdOwners({
          address: collectionAddress,
          token_id: String(tokenId),
          chain: "mumbai",
        });
  
        return res.status(200).json(nftInfo.result);
      } catch (error) {
        return res.status(400).json({ error: error.toString() });
      }
    });

  /**
   * @api {get} http://localhost:3000/mumbai/nft/transfer/:collectionAddress/:nftID/:to/:pk Transfer NFT
   * @apiName Transfer NFT
   * @apiGroup NFT
   *
   * @apiParam {String} collectionAddress nft collection address.
   * @apiParam {Number} nftID id of the NFT.
   * @apiParam {String} to NFT recipient address.
   * @apiParam {String} pk priv_ket of the owner-sender.
   *
   * @apiSuccess {String} txID Transaction hash.
   */

   app.get("/mumbai/nft/transfer/:collectionAddress/:nftID/:to/:pk", async (req, res) => {
    try {
      const { collectionAddress, nftID, to, pk } = req.params;

      const nftContract = new web3.eth.Contract(contract.abi, collectionAddress);

      const account = web3.eth.accounts.privateKeyToAccount(pk);

      const gasPrice = await getBestGasPrice();

      const nonce = await web3.eth.getTransactionCount(
        account.address,
        "latest"
      );

      const gasEstimate = await nftContract.methods
        .safeTransferFrom(account.address, to, Number(nftID), 1, "0x00")
        .estimateGas();

      const transaction = {
        to: collectionAddress,
        nonce: nonce,
        gas: gasEstimate,
        gasPrice,
        data: nftContract.methods
          .safeTransferFrom(account.address, to, Number(nftID), 1, "0x00")
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
  });

    /**
   * @api {post} http://localhost:3000/mumbai/nft/transfer-batch Transfer Batch NFT
   * @apiName Transfer Batch NFTs
   * @apiGroup NFT
   *
   * @apiBody {String} collectionAddress nft collection address.
   * @apiBody {Number[]} nftIDs ids of the NFT.
   * @apiBody {String} to NFT recipient address.
   * @apiBody {String} pk priv_ket of the owner-sender.
   *
   * @apiSuccess {String} txID Transaction hash.
   */

     app.post("/mumbai/nft/transfer-batch", async (req, res) => {
      try {
        const { collectionAddress, nftIDs, to, pk } = req.body;

        const itemsLength = nftIDs.length;
        const amounts = []

        for (let i = 0; i < itemsLength; i ++) {
          amounts.push(1);
        }
  
        const nftContract = new web3.eth.Contract(contract.abi, collectionAddress);
  
        const account = web3.eth.accounts.privateKeyToAccount(pk);
  
        const nonce = await web3.eth.getTransactionCount(
          account.address,
          "latest"
        );
  
        const gasEstimate = await nftContract.methods
          .safeBatchTransferFrom(account.address, to, nftIDs, amounts, "0x00")
          .estimateGas({ from: account.address }); // estimate gas qty
  
        const transaction = {
          to: collectionAddress,
          nonce: nonce,
          gas: gasEstimate,
          data: nftContract.methods
            .safeBatchTransferFrom(account.address, to, nftIDs, amounts, "0x00")
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
    });

};

module.exports = services;
