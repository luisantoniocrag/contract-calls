const CicularJSON = require("circular-json");
const axios = require("axios");

async function getBestGasPrice() {
  try {
    const response = await axios.post(process.env.ALCHEMY_URI, {
      jsonrpc: "2.0",
      id: 0,
      method: "eth_gasPrice",
    });

    const solveCircular = CicularJSON.stringify(response);
    const JSONResponse = JSON.parse(solveCircular);
    const gasPrice = Math.round(parseInt(JSONResponse.data.result, 16) * 1.1);

    return gasPrice;
  } catch (error) {
    console.log(error);
    throw Error(error.message);
  }
}

module.exports = {
  getBestGasPrice,
}