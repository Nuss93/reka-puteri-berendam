'use strict'

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs')
const axios = require('axios')
const { initializeApp } = require('firebase/app')
// const { getDatabase } = require('firebase/database');
const firebaseConfig = require('./config.js');
// const db = getDatabase();

const app = initializeApp(firebaseConfig);
const client = new Client({
	authStrategy: new LocalAuth()
});

let chat_log = null;
const ID = '60102333893@c.us'

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');

	console.log('Fetching logs');
	fs.readFile('/Users/nasreenrazak/Documents/test.json', (err,data) =>{
		// console.log(err, data);
		if(err) {
			chat_log = []
			console.log('Logs tak ada, dah reset.');
		}
		else chat_log = JSON.parse(data);

		console.log('Logs fetched!');
	})

	// let snapshot = db.ref('/hello').once('value')
	// console.log('app', snapshot.val());
});

client.on('message_create', async message => {
	const content = message.body;
	console.log('======================================');
	// console.log('got message', message.from, content, message.isStatus);
	console.log('new message!');
	// console.log(message);

	if(message.isStatus !== true) {
		const to_push = {
			body: message.body,
			notifyName : message._data.notifyName,
			from : message.from,
			to : message.to,
			isForwarded : message.isForwarded,
			deviceType : message.deviceType,
			timestamp : message.timestamp,
			hasMedia : message.hasMedia
		}

		// console.log('chat_log', chat_log);
		console.log('to_push', to_push);
		chat_log.data.push(to_push)

		// console.log('new chat_log', chat_log);

		let data = JSON.stringify(chat_log, null, 2);
		// console.log('data', data);


		fs.writeFile('/Users/nasreenrazak/Documents/test.json', data, err => {
			if(err) {
				console.log(err);
			} else {
				// console.log('Dah write!');
			}
		})

		// console.log('got message', message.from, content);
		// console.log(message);
		// console.log('group', group);
		if(content === '/test') {
			client.sendMessage(message.from, "Hello there! I am BOT");
		}
		if(content === '/help'){
			message.reply("Hello there! Here are some commands to get you started:")
			client.sendMessage(message.from, "```/test``` : Send a test message. \n\n ```/aboutreka``` : Get informaton on who we are. \n\n ```/iamlonely``` : You will get a random joke.")
		}

		if(content === '/iamlonely') {
			const joke = await axios("https://v2.jokeapi.dev/joke/Coding?safe-mode")
			.then(res => res.data)
			
			const joke_message = await client.sendMessage(message.from, joke.setup || joke.joke)
			if(joke.delivery) setTimeout(() => {
				joke_message.reply(joke.delivery)
			}, 5000);
		}

		if(content === '/aboutreka') {
			message.reply("We are inventors, designers, engineers, and entrepreneurs, passionate and purposeful in the work we do.\n\nWe are working to create a better way of solving some of the world's problems. We have a once-in-a-century opportunity to reinvent how we do things in our life—and we need your help.\n\nAt REKA, you'll find a creative, collaborative environment where great ideas thrive, and where everyone is driven by the same big purpose.")
		}

		if(content === '/getchat') {
			const chat = await message.getChat();
			console.log(chat.participants);
			// message.reply('Some group info: \n\nName : ' + chat.name + '\n\n Members: ' + chat.size + ' \n\n')
			message.reply(JSON.stringify(chat, null, 2))
		}
		if(content === '/getcommon') {
			const common_group = await client.getCommonGroups(ID);
			console.log(ID, common_group);
			// message.reply('Some group info: \n\nName : ' + chat.name + '\n\n Members: ' + chat.size + ' \n\n')
			message.reply('Total common groups : ' + common_group.length)
		}
		if(content === '/giveup') {
			message.reply('Nasreen dah give up ke tuu. Bye~')
		}
	} else {
		
	}

	
})

client.on('group_leave', snap => {
	console.log(snap);
})

// group.getRecipients()

// ask about company

// who is in the group

// file sharing and upload copy of file somewhere

client.initialize();