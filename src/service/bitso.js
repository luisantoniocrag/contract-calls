const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const key = process.env.BITSO_API_KEY;
const secret = process.env.BITSO_API_SECRET;

const services = (app) => {
  /**
   * @api {post} http://localhost:3000/bitso/create-market-order create market order in Bitso
   * @apiName Create Market Order on Bitso
   * @apiGroup Bitso
   *
   * @apiBody {String} currency currency to buy (e, usd).
   * @apiBody {String} minorAmount amount mxn.
   *
   * @apiSuccess {Object} order Order created data.
   */
  app.post(
    "/bitso/create-market-order",
    async (req, res) => {
    try {
      const { currency, minorAmount } = req.body;
      
      const http_method = "POST";
      const request_path = "/v3/orders/";

      const jsonPayload = {
        book: `${currency}_mxn`,
        side: "buy",
        type: "market",
        minor: minorAmount,
      };

      // Create the signature
      const nonce = new Date().getTime();
      const payload = JSON.stringify(jsonPayload);
      const message = nonce+http_method+request_path+payload;
      const signature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("hex");

      // Build the auth header
      const auth_header = "Bitso " + key + ":" + nonce + ":" + signature;

      // Send request
      const options = {
        method: http_method,
        url: `https://api.bitso.com${request_path}`,
        headers: {
          Authorization: auth_header,
          "Content-Type": "application/json",
        },
        data: payload,
      };

      // Send request
      const request = await axios(options);
      return res.status(200).json({ response: request.data });
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });

  /**
   * @api {get} http://localhost:3000/bitso/get-order-trade/:oid get order trade info
   * @apiName Get Order Trade Info
   * @apiGroup Bitso
   *
   * @apiParam {String} oid oid trade.
   *
   * @apiSuccess {Object} order Order created data.
   */

  app.get("/bitso/get-order-trade/:oid", async (req, res) => {
    try {
      const { oid } = req.params;

      const http_method = "GET";
      const request_path = `/v3/order_trades/${oid}/`;

      // Create the signature
      const nonce = new Date().getTime();
      const message = nonce+http_method+request_path;
      const signature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("hex");

      // Build the auth header
      const auth_header = "Bitso " + key + ":" + nonce + ":" + signature;

      // Send request
      const options = {
        url: `https://api.bitso.com${request_path}`,
        method: http_method,
        headers: {
          Authorization: auth_header,
          "Content-Type": "application/json",
        }
      };

      // Send request
      const request = await axios(options);
      return res.status(200).json({ response: request.data });
    } catch (error) {
      return res.status(400).json({ error: error.toString() });
    }
  });
};

module.exports = services;
