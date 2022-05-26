const crypto = require("crypto");
const axios = require("axios");

const key = process.env.BITSO_API_KEY;
const secret = process.env.BITSO_API_SECRET;  

const services = (app) => {
    /**
     * @api {post} http://localhost:3000/bitso/create-market-order create market order in Bitso
     * @apiName Create Market Order on Bitso
     * @apiGroup Bitso
     *
     * @apiBody {String} currency currency to buy (e, usd).
     *
     * @apiSuccess {Object} order Order created data.
   */
    app.post("/bitso/create-market-order", async (req, res) => {
        try {
            const {currency} = req.body;

            const http_method="post";
            const request_path="/v3/orders/"
    
            const jsonPayload= {
            book: `${currency}`,
            side: "buy",
            type: "market"            
            };  
    
            // Create the signature
            const nonce = new Date().getTime();
            const message = nonce+http_method+request_path+payload;
            const payload = JSON.stringify(jsonPayload)
            const signature = crypto.createHmac('sha256', secret).update(message).digest('hex');
    
            // Build the auth header
            const auth_header = "Bitso "+key+":" +nonce+":"+signature;
    
            // Send request
            const options = {
            url: `api.bitso.com${request_path}` ,
            method: http_method,
            headers: {
              'Authorization': auth_header,
              'Content-Type': 'application/json'
            },
            data: payload
            };
    
            // Send request
            const req = await axios(options)
            return res.statusCode(200).json({ response: req.data });
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
            const {oid} = req.params;

            const http_method="get";
            const request_path=`/v3/order_trades/${oid}/`
    
            const jsonPayload= {};  
    
            // Create the signature
            const nonce = new Date().getTime();
            const message = nonce+http_method+request_path+payload;
            const payload = JSON.stringify(jsonPayload)
            const signature = crypto.createHmac('sha256', secret).update(message).digest('hex');
    
            // Build the auth header
            const auth_header = "Bitso "+key+":" +nonce+":"+signature;
    
            // Send request
            const options = {
            url: `api.bitso.com${request_path}` ,
            method: http_method,
            headers: {
              'Authorization': auth_header,
              'Content-Type': 'application/json'
            },
            data: payload
            };
    
            // Send request
            const req = await axios(options)
            return res.statusCode(200).json({ response: req.data });
        } catch (error) {
            return res.status(400).json({ error: error.toString() });

        }
    })
}

module.exports = services;