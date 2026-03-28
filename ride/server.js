const http = require("node:http");
const app = require("./app");
const rabbitMq = require("./service/rabbit");

rabbitMq.connect();

const server = http.createServer(app);

server.listen(3003, () => {
  console.log("ride service is running on port 3003");
});
