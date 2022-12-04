const { EmbedBuilder } = require("discord.js");

module.exports = (client, message) => {
    let messageSplit = message.content.split(" ");
    let query = "";
    for (let i = 1; i < messageSplit.length; i++) {
        if (i + 1 === messageSplit.length) {
            query = query + messageSplit[i];
        } else {
            query = query + messageSplit[i] + " ";
        }
    }
    let embed = new EmbedBuilder();
    embed.setColor("#000000");
    embed.addFields({name: `Stevie announcement`, value: query});
    embed.setTimestamp();

    client.guilds.cache.forEach(guild => {
        let timeout = guild.members.cache.find(member => member.id = client.user.id).communicationDisabledUntilTimestamp;
        if (timeout) return;
        let channel = guild.systemChannel;
        if (!channel)  channel = guild.channels.cache.find(channel => channel.name === "general" && channel.type === 0) || guild.channels.cache.first(channel => channel.type === 0);
        if (!channel) return;
        try{channel.send({ embeds: [embed] });}
        catch{err => console.log(err)};
    });
}