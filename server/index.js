const express = require('express');
const cors = require('cors');
const { createServer } = require('dynamodb-admin');
const { client, docClient } = require('./db');
require('dotenv').config()


const app = express();
app.use(cors());
app.use(express.json());
const adminApp = createServer(client, docClient);
const host = process.env.HOST;
const port = process.env.PORT;
const server = adminApp.listen(port, host);

server.on('listening', () => {
  const address = server.address();
  console.log(`Listening on http://${address.address}:${address.port}`);
});



require('./routes/routes')(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



app.listen(3000, () => {
  console.log('Example app listening at http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

















