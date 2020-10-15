const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const geolocation = require('geolocation');
const Filter = require('bad-words');
// Serve up the public directory
const publicDirectoryPath = path.join(__dirname, '../public');
console.log('======publicDirectoryPath=====', publicDirectoryPath);
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
app.use(express.static(publicDirectoryPath));
io.on('connection', (socket) => {
	console.log('====new websocket connection=======');

	socket.on('sendMessage', (message, cb) => {
		const filter = new Filter();
		if (filter.isProfane(message)) {
			return cb('Profanity is not allowed');
		}
		const user = getUser(socket.id);
		if (user) {
			io.to(user.room).emit('message', generateMessage(user.username, message));
			cb();
		}
	});
	socket.on('disconnet', () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
	socket.on('SendLocation', (pos, cb) => {
		const user = getUser(socket.id);
		if (user) {
			io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://www.google.com/maps?q=${pos.latitude},${pos.longitude}`));
			cb();
		}
	});
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });
		if (error) {
			return callback(error);
		}
		socket.join(user.room); // join room
		socket.emit('message', generateMessage('Admin', 'Welcome')); //send message to a specific client
		socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
		callback();
	});
});

server.listen(port, () => {
	console.log('Server is up on ' + port);
});
