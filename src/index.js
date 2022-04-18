const alchemy = require("./service/alchemy");
const cors = require("cors");
const express = require("express");

const app = express();
const PORT = 3000;

const server = () => {
  app.use(cors());
  alchemy(app);
  app.listen(PORT, () => {
    console.log("server listening on port:", PORT);
  });
};

server();
