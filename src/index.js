const alchemy = require("./service/alchemy");
const market = require("./service/market");
const matic = require("./service/matic");
const cors = require("cors");
const express = require("express");

const app = express();
const PORT = 3000;

const server = () => {
  app.use(cors());

  alchemy(app);
  market(app);
  matic(app);

  app.listen(PORT, () => {
    console.log("server listening on port:", PORT);
  });
};

server();
