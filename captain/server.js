const http = require('node:http');
const app = require('./app');
const rabbitMq = require('./service/rabbit');

rabbitMq.connect();

const server = http.createServer(app);
server.listen(process.env.PORT || 3002, () => {
  console.log('Captain Server is running on port ' + (process.env.PORT || 3002));
});