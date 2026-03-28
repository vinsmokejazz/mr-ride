const http = require('node:http');
const app = require('./app');

const server = http.createServer(app);
server.listen(process.env.PORT || 3001, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3001));
});