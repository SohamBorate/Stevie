const fs = require("fs");
const { EmbedBuilder } = require("discord.js");
const path = require("path");

const prefix = process.env.PREFIX;
const cmdDir = path.join(__dirname, "../");
const cmds = [];

fs.readdirSync(cmdDir).forEach((name) => {
    let stat = fs.statSync(`${cmdDir}/${name}`);
    if (stat.isDirectory()) {
        let command = require(`${cmdDir}/${name}/command.json`);
        if (!command.admin) cmds.push({
            name: `${prefix}${command.name}`,
            value: command.description
        });
    }
});

module.exports = (client, message) => {
    let embed = new EmbedBuilder();
    embed.setTitle(`${client.user.username} commands`);
    embed.setColor("#000000");
    embed.addFields(cmds);
    message.channel.send({ embeds: [embed] });
}