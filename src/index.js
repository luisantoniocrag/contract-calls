const cors = require("cors");
const express = require("express");

const nft = require("./service/nft");
const util = require("./service/util");
const matic = require("./service/matic");
const market = require("./service/market");
const alchemy = require("./service/alchemy");
const bitso = require("./service/bitso");

const app = express();
app.use(express.json());
const PORT = 3000;

const server = () => {
  app.use(cors());

  alchemy(app);
  market(app);
  bitso(app);
  matic(app);
  util(app);
  nft(app);

  app.listen(PORT, () => {
    console.log("server listening on port:", PORT);
  });
};

server();
