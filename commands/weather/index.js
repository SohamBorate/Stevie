const { EmbedBuilder } = require("discord.js");
const https = require("https");

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

    let apiKey = "0adf8bf49972ff8e8d643c1b06088c08";
    let unit = "metric";
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=${unit}`;

    https.get(url, (res) => {
        res.on("data", (data) => {
            let weatherData = JSON.parse(data);
            let embed = new EmbedBuilder();
            embed.setColor("#000000");
            if (weatherData.cod === 200) {
                let temp = weatherData.main.temp;
                let tempFeelsLike = weatherData.main.feels_like
                let humidity = weatherData.main.humidity;
                let weatherMain = weatherData.weather[0].main;
                let weatherDescription = weatherData.weather[0].description;
                let weatherIcon = weatherData.weather[0].icon;
                let iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

                embed.setTitle(`${query} weather`);
                embed.setThumbnail(iconUrl);
                embed.addFields(
                    {name: weatherMain, value: weatherDescription},
                    {name: "Temperature", value: `${temp} °C`},
                    {name: "Temperature feels like", value: `${tempFeelsLike} °C`},
                    {name: "Humidity", value: `${humidity} %`},
                );
                embed.setTimestamp();

                message.channel.send({ embeds: [embed] });
            } else {
                embed.addFields({name: `Error code ${weatherData.cod}`, value: weatherData.message});
                embed.setTimestamp();

                message.channel.send({ embeds: [embed] });
            }
        });
    });
}