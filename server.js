const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });
const clients = new Map(); // Store connected clients

// Function to broadcast an object message to clients with the same WebSocket URL
function broadcastMessage(message, url) {
    console.log('Broadcasting message:', message, 'to clients with URL:', url);

    // Convert the object to a JSON string
    const jsonMessage = JSON.stringify(message);

    // Iterate over all clients and send the message to clients with the same URL
    clients.forEach((client, clientUrl) => {
        if (clientUrl === url && client.readyState === WebSocket.OPEN) {
            client.send(jsonMessage);
        }
    });
}

// Handle new connections
wss.on('connection', (ws, req) => {
    const queryParams = url.parse(req.url, true).query;
    const username = queryParams.username;

    if (!username) {
        console.log('Connection rejected: No username provided');
        ws.close();
        return;
    }

    const clientUrl = req.url; // Get the WebSocket URL of the client

    console.log(`${username} connected with URL: ${clientUrl}`);

    // Store client in clients map with its WebSocket URL as the key
    clients.set(clientUrl, ws);

    // Handle messages from clients
   // Handle messages from clients
// Handle messages from clients
ws.on('message', (message) => {
    try {
        // Convert the Buffer message to a string
        const messageString = message.toString('utf8');

        // Parse the JSON message
        const parsedMessage = JSON.parse(messageString);

       

        // Broadcast the message to clients with the same WebSocket URL
        broadcastMessage(parsedMessage, clientUrl);
    } catch (error) {
        console.error('Error parsing message:', error);
    }
});



    // Handle client disconnections
    ws.on('close', () => {
        console.log(`${username} disconnected with URL: ${clientUrl}`);

        // Remove client from clients map
        clients.delete(clientUrl);
    });
});

// Create HTTP server
const server = http.createServer();

// Upgrade HTTP server to WebSocket server
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Start the HTTP server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket server started on port ${PORT}`);
});