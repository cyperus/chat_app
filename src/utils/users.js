const users = [];
// addUser
const addUser = ({ id, username, room }) => {
	// Clean the data
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();
	if (!username || !room) {
		return {
			error: 'Username and room are required',
		};
	}
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});
	if (existingUser) {
		return {
			error: 'Username is in use!',
		};
	}
	const user = {
		id,
		username,
		room,
	};
	users.push(user);
	return { user };
};
// removeUser
const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id;
	});
	if (index !== -1) {
		return users.splice(index, 1);
	}
};
// getUser
const getUser = (id) => {
	const user = users.find((user) => {
		return user.id === id;
	});

	return user;
};
// getUsersInRoom
const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	const usersInRoom = users.filter((user) => {
		return user.room === room;
	});

	return usersInRoom;
};
module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
};
