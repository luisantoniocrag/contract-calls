const Moralis = require("moralis/node");

require("dotenv").config();

/* Moralis init code */
const serverUrl = String(process.env.MORALIS_SERVER);
const appId = String(process.env.MORALIS_APP_ID);
const masterKey = String(process.env.MORALIS_MASTER_KEY);
const collectionAddress = String(process.env.COLLECTION_SC_ADDRESS);

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
};

module.exports = services;
