const dotenv = require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { resolve } = require("path");
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

require(`${__dirname}/render-host.js`)();

// environment variables
const cncGuildId = process.env.CNC_GUILD_ID;
const inviteUrl = process.env.INVITE_URL;
const token = process.env.TOKEN;
const prefix = process.env.PREFIX;
console.log(`Invite URL: ${inviteUrl}`);
console.log(`Token: ${token}`);
console.log(`Prefix: ${prefix}`);

const AuditLogManager = require(`${__dirname}/AuditLogManager`);

// commands
const cmds = {};
fs.readdirSync(`${__dirname}/commands`).forEach((name) => {
	let stat = fs.statSync(`${__dirname}/commands/${name}`);
	if (stat.isFile() && name.endsWith(".js")) {
		cmds[`${prefix}${name.split(".")[0]}`] = require(`${__dirname}/commands/${name}`);
	} else if (stat.isDirectory()) {
		let command = require(`${__dirname}/commands/${name}/command.json`);
		cmds[`${prefix}${name}`] = {
			name: command.name,
			description: command.description,
			main: require(`${__dirname}/commands/${name}/${command.main}`),
			admin: command.admin
		}
	}
});
console.log(`Commands:`);
console.log(cmds);

// input
client.on("messageCreate", (message) => {
	let timeout = message.guild.members.cache.find(member => member.id = client.user.id).communicationDisabledUntilTimestamp;
	if (timeout) return;

	let parsedContent = message.content.split(" ");
	let commandName = parsedContent[0];
	let command = cmds[commandName];
	if (command) {
		if (command.admin) {
			if (message.guild.id === cncGuildId) {
				command.main(client, message);
				client.audit.log(`${message.author.username}: \`${message}\``);
			}
		} else {
			command.main(client, message);
			client.audit.log(`${message.author.username}: \`${message}\``);
		}
	}
});

// client
client.once("ready", () => {
	new AuditLogManager(client)
	.then((audit) => {
		client.audit = audit;
		client.audit.log(`**${client.user.username}#${client.user.discriminator} is live!**`);
	});
});

// joined a guild
client.on("guildCreate", (guild) => {
	client.audit.log(`Joined guild \`${guild.name}\``);
	let channel = guild.channels.cache.find(channel => channel.name === "general") || guild.channels.cache.first();
	if (channel) {
		channel.send("hey im here")
		.then(message => cmds[`${prefix}help`].main(client, message));
	}
});

client.once("reconnecting", () => {
	console.log("Reconnecting!");
});
client.once("disconnect", () => {
	console.log("Disconnect!");
});

client.login(token);