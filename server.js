const express = require('express');
const app = express();
const WebSocket = require('ws');
const http = require('http');
const bodyParser = require('body-parser');
const urlencodedParser = require('urlencoded-parser');
const cors = require('cors');

const PORT = 8000;
const server = http.createServer(app);
const wsServer = new WebSocket.Server({server}); 
const clients = {};

const getUniqueID = () => {
    const s4 = () => {
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        return s4() + s4() + '-' + s4();
    };
};
app.use(bodyParser.urlencoded({extended: false}));
// app.use(urlencodedParser())
app.use(cors());

app.get('/', (req, res) => {
    console.log('req', req)
    console.log('res', res)
    wsServer.on('request',(request)=> { 
        const userID = getUniqueID();
        const connection = request.accept(null, request.origin);
        clients[userID] = connection;
        console.log(`connected: ${userID} in ${Object.getOwnPropertyNames(clients)}`);
        connection.on('message', (message) => {
            if (message.type === 'utf8') {
                console.log('recieved message', message.utf8Data);
                for (key in clients) {
                    clients[key].sendUTF(message.utf8Data);
                    console.log('sent Message to', clients[key]);
                }
            }
        })
    })
})


server.listen(PORT)
console.log('listening on port', PORT)
// app.listen(PORT,() => {
//     console.log('listening on port', PORT);
// }); 