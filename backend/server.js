const express = require('express');
const config = require('config');

const server = express();

server.get('/', (req, res) => res.send('Hello World!'));

server.listen(config.get('alertgen.serverConfig.port'), () => console.log('Server listening on port ' + config.get('alertgen.serverConfig.port') + '!'));