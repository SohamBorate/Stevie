const dotenv = require("dotenv").config();
const cncGuildId = process.env.CNC_GUILD_ID;

var dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    timeZoneName: "long",
});

class AuditLogManager {
    constructor(client) {
        this.client = client;
        return new Promise((resolve, reject) => {
            this.checkAuditLog()
            .then(() => {
                this.connectAuditLog()
                .then(() => resolve(this));
            });
        });
    }

    createAuditLog = () => {
        return new Promise((resolve, reject) => {
            let cnc = this.client.guilds.cache.get(cncGuildId);
            let auditCategory = cnc.channels.cache.find(channel => channel.name === "audit" && channel.type === 4);
            let d = dateFormatter.format(Date.now()).split(",")[0].split("/").join("-");
            let channelName = `audit-${d}`;

            cnc.channels.create({ name: channelName, reason: "New audit log" })
                .then(channel => {
                    channel.setParent(auditCategory.id)
                        .then(() => resolve());
                });
        });
    }

    checkAuditLog = () => {
        return new Promise((resolve, reject) => {
            let cnc = this.client.guilds.cache.get(cncGuildId);
            let auditCategory = cnc.channels.cache.find(channel => channel.name === "audit" && channel.type === 4);
            let d = dateFormatter.format(Date.now()).split(",")[0].split("/").join("-");
            let channelName = `audit-${d}`;
            let auditChannel = cnc.channels.cache.find(channel => channel.name === channelName && channel.parentId === auditCategory.id);

            if (!auditChannel) {
                this.createAuditLog()
                    .then(() => resolve());
                return;
            }
            if (auditChannel.parentId !== auditCategory.id) {
                this.createAuditLog()
                    .then(() => resolve());
                return;
            }
            if (auditChannel && (auditChannel.parentId === auditCategory.id))
                resolve();
        });
    }

    connectAuditLog = () => {
        return new Promise((resolve, reject) => {
            let cnc = this.client.guilds.cache.get(cncGuildId);
            let auditCategory = cnc.channels.cache.find(channel => channel.name === "audit" && channel.type === 4);
            let d = dateFormatter.format(Date.now()).split(",")[0].split("/").join("-");
            let channelName = `audit-${d}`;
            let auditChannel = cnc.channels.cache.find(channel => channel.name === channelName && channel.parentId === auditCategory.id);
            if (!auditChannel) {
                this.checkAuditLog()
                .then(() => {
                    this.connectAuditLog()
                    .then(() => resolve());
                });
            } else if (auditChannel.parentId === auditCategory.id) {
                this.channelName = channelName;
                this.channel = auditChannel;
                resolve();
            }
        });
    }

    log = (log) => {
        this.checkAuditLog()
        .then(() => {
            this.connectAuditLog()
            .then(() => {
                this.channel.send(log);
                console.log(log);
            });
        });
    }
}

module.exports = AuditLogManager;