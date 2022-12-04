const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

// random
getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

// tic tac toe session
const sessions = [];
class TtcSession {
	constructor(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		return this;
	}

	id = uuidv4();
	ended = false;
	boxData = {}
	gameData = {
		player1: "O",
		player2: "X",
		playing: "player2",
		timeRemaining: 15
	}

	timer = () => {
		if (this.ended) { return; }
		this.gameData.timeRemaining--;
		if (this.gameData.timeRemaining < 1) {
			this.end("everyone left? fine.");
			return;
		}
		setTimeout(() => {
			this.timer();
		}, 1000);
	}

	checkForWin = (char) => {
		let winConditions = [];
		// row
		winConditions.push(["A1", "A2", "A3"]);
		winConditions.push(["B1", "B2", "B3"]);
		winConditions.push(["C1", "C2", "C3"]);
		// column
		winConditions.push(["A1", "B1", "C1"]);
		winConditions.push(["A2", "B2", "C2"]);
		winConditions.push(["A3", "B3", "C3"]);
		// diagonal
		winConditions.push(["A1", "B2", "C3"]);
		winConditions.push(["A3", "B2", "C1"]);

		for (let i = 0; i < winConditions.length; i++) {
			let condition = winConditions[i];
			let match = 0;
			condition.forEach((slot, index) => {
				if (this.boxData[slot] === char) {
					match++;
				}
			});
			if (match === 3) {
				return match;
			}
		}
	}

	buttonClick = (slot, interaction) => {
		let user = interaction.member.user;

		if (user.id === this.player1.id) {
			if (this.gameData.playing === "player1") {
				this.boxData[slot] = this.gameData.player1;
				this.gameData.playing = ("player2");
				this.gameData.timeRemaining = 15;
				this.checkForWin(this.gameData.player1);
                if (this.checkForWin(this.gameData.player1) === 3) {
					this.end(`<@${this.player1.id}> (**${this.gameData.player1}**) won`, interaction);
				} else if (Object.keys(this.boxData).length === 9) {
					this.end("ended in a draw", interaction);
				} else {
					let box = this.buildBox(this.boxData);
					interaction.update(box);
				}
			} else {
				interaction.reply({ content: "not your turn", ephemeral: true }).catch(console.log);
			}
		} else if (user.id === this.player2.id) {
			if (this.gameData.playing === "player2") {
				this.boxData[slot] = this.gameData.player2;
				this.gameData.playing = ("player1");
				this.gameData.timeRemaining = 15;
				this.checkForWin(this.gameData.player2);
                if (this.checkForWin(this.gameData.player2) === 3) {
					this.end(`<@${this.player2.id}> (**${this.gameData.player2}**) won`, interaction);
				} else if (Object.keys(this.boxData).length === 9) {
					this.end("ended in a draw", interaction);
				} else {
					let box = this.buildBox(this.boxData);
					interaction.update(box);
				}
			} else {
				interaction.reply({ content: "not your turn", ephemeral: true }).catch(console.log);
			}
		} else {
			interaction.reply({ content: "you aren't playing", ephemeral: true }).catch(console.log);
		}
	}

	buildBox = (boxData) => {
		if (this.ended) { return; }
		let player1name = this.player1.username;
		let player2name = this.player2.username;
		let playingId = this[this.gameData.playing].id;
		let playingChar = this.gameData[this.gameData.playing];
		let timeRemaining = this.gameData.timeRemaining;
		let content = `${player1name} vs ${player2name}\n\n<@${playingId}>\'s move (**${playingChar}**)\nyou have ${timeRemaining} seconds`;

		let rows = ["A", "B", "C"];
		let messageComponent = [];
		rows.forEach((rowIndex, index) => {
			let row = new ActionRowBuilder();
			for (let i = 1; i < 4; i++) {
				let button = new ButtonBuilder();
				button.setCustomId(`TTC ${this.id} ${rowIndex}${i}`);
				button.setStyle("Secondary");
				button.setLabel(boxData[`${rowIndex}${i}`] || " ");
				button.setDisabled(boxData[`${rowIndex}${i}`] ? true : false);
				row.addComponents(button);
			}
			messageComponent.push(row);
		});

		return { content: content, components: messageComponent };
	}

	begin = (message) => {
		// randomize
		let int = getRandomInt(2);
        console.log(int);
		let player = ((int == 0) ? "player1" : "player2");
        // if (int == 0) {player = "player1"} else {player = "player2"}
		int = getRandomInt(2);
        console.log(int);
		let char1 = ((int == 0) ? "O" : "X");
		let char2 = ((char1 === "O") ? "X" : "O");
        // if (int == 0) {char1 = "O"; char2 = "X"} else {char1 = "X"; char2 = "O"}
		this.gameData.playing = player;
		this.gameData.player1 = char1;
		this.gameData.player2 = char2;
		// build box
		let box = this.buildBox({});
		let msg = message.channel.send(box);
		msg.then((playbox) => {
			this.playbox = playbox;
		});
		// begin timer
		setTimeout(() => {
			this.timer();
		}, 1000);
	}

	end = (endMessage, interaction) => {
		this.ended = true;
		sessions.forEach((session, index) => {
			if (session.id === this.id) {
				sessions.pop(index);
			}
		});

		let player1name = this.player1.username;
		let player2name = this.player2.username;
		let content = `${player1name} vs ${player2name}\n\n${endMessage}`;

		let rows = ["A", "B", "C"];
		let messageComponent = [];
		rows.forEach((rowIndex, index) => {
			let row = new ActionRowBuilder();
			for (let i = 1; i < 4; i++) {
				let button = new ButtonBuilder();
				button.setCustomId(`TTC ${this.id} ${rowIndex}${i}`);
				button.setStyle("Secondary");
				button.setLabel(this.boxData[`${rowIndex}${i}`] || " ");
				button.setDisabled(true);
				row.addComponents(button);
			}
			messageComponent.push(row);
		});

		if (interaction) {
			interaction.update({ content: content, components: messageComponent });
		} else {
			this.playbox.edit({ content: content, components: messageComponent });
		}
	}
}

module.exports = (client, message) => {
    // interaction
    client.on("interactionCreate", interaction => {
        if (!interaction.isButton()) {return}
        let config = interaction.customId.split(" ");
        let type = config[0];
        if (type === "TTC") {
            let id = config[1];
            let slot = config[2];
            sessions.forEach((session, index) => {
                if (session.id === id) {
                    session.buttonClick(slot, interaction);
                }
            });
        }
    });

    let selfTag = false;
    if (message.mentions.everyone) {
        return message.channel.send("one at a time please");
    }
    if (message.mentions.roles.size !== 0) {
        return message.channel.send("lol nice try");
    }
    if (message.mentions.users.size === 0) {
        return message.channel.send("you need to tag a valid user to play against");
    }
    message.mentions.users.forEach((user, id) => {
        if (id === message.author.id) {
            message.channel.send("you can't play with yourself");
            selfTag = true;
        }
    });
    if (selfTag) { return; }

    let player2 = Array.from(message.mentions.users.values())[0];
    if (player2.id === client.user.id) {
        return message.channel.send("no");
    }
    if (player2.bot) {
        return message.channel.send("the bot said no");
    }
    if (player2.system) {
        return message.channel.send("uhh");
    }

    let player1 = message.author;
    let session = new TtcSession(player1, player2, message);
    sessions.push(session);
    session.begin(message);
}