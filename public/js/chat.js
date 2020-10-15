console.log('=====chat js======');
const socket = io();
// client receive event from sever
socket.on('countUpdated', (count) => {
	console.log('Updated====', count);
});
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});
const autoScroll = () => {
	const $newMessage = $messages.lastElementChild;

	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	const visibleHeight = $messages.offsetHeight;

	const containerHeight = $messages.scrollHeight;
	
	const scrollOffset = $messages.scrollTop + visibleHeight;
	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};
socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, { username: message.username, message: message.text, createdAt: moment(message.createdAt).format('h:mm a') });
	$messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});
const $locations = document.querySelector('#locations');

socket.on('locationMessage', (message) => {
	console.log(message, 'message====');
	const html = Mustache.render(locationTemplate, { username: message.username, url: message.url, createdAt: moment(message.createdAt).format('h:mm a') });
	$locations.insertAdjacentHTML('beforeend', html);
	autoScroll();
});
const $messageFrom = document.querySelector('#message-form');
const $messageFromInput = document.querySelector('input');
const $messageFromButton = document.querySelector('button');

// sendMessage
$messageFrom.addEventListener('submit', function (e) {
	e.preventDefault();
	// disable sending
	$messageFromButton.setAttribute('disabled', 'disabled');

	const message = e.target.elements.message.value;
	socket.emit('sendMessage', message, (error) => {
		//after the event is acknowledged
		// enable sending
		$messageFromButton.removeAttribute('disabled');
		$messageFromInput.value = '';
		$messageFromInput.focus();
		if (error) {
			return console.log(error);
		}
		console.log('The message was delivered! ');
	});
});
const $sendButton = document.querySelector('#send-location');
$sendButton.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}
	$sendButton.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		console.log(position);
		socket.emit(
			'SendLocation',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			() => {
				$sendButton.removeAttribute('disabled');
				console.log('Location Shared!');
			}
		);
	});
});
socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});

const $sidebar = document.querySelector('#sidebar');
socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, { room, users });
	$sidebar.insertAdjacentHTML('beforeend', html);
});
