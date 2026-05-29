const { cmd } = require('../command');

cmd({
    pattern: "vv",
    react: "🖕",
    alias: ["retrive", "viewonce"],
    desc: "Retrieve ViewOnce media",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, {
    from,
    reply
}) => {
    try {

        if (!m.quoted) {
            return reply("❌ ViewOnce ekakata reply karanna.");
        }

        let quoted = m.quoted;

        // Raw message eka ganna
        let message = quoted.message || quoted.msg || {};

        // ViewOnce unwrap
        let voMessage =
            message?.viewOnceMessage?.message ||
            message?.viewOnceMessageV2?.message ||
            message?.viewOnceMessageV2Extension?.message;

        if (!voMessage) {
            return reply("❌ Meeka ViewOnce message ekak neme.");
        }

        // media type detect
        let mediaType = Object.keys(voMessage)[0];

        // download media
        let buffer = await quoted.download();

        if (!buffer) {
            return reply("❌ Media download failed.");
        }

        // IMAGE
        if (mediaType === "imageMessage") {

            return await conn.sendMessage(from, {
                image: buffer,
                caption: voMessage.imageMessage.caption || ""
            }, {
                quoted: mek
            });
        }

        // VIDEO
        if (mediaType === "videoMessage") {

            return await conn.sendMessage(from, {
                video: buffer,
                caption: voMessage.videoMessage.caption || ""
            }, {
                quoted: mek
            });
        }

        // AUDIO / VOICE
        if (mediaType === "audioMessage") {

            return await conn.sendMessage(from, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: voMessage.audioMessage.ptt || false
            }, {
                quoted: mek
            });
        }

        return reply("❌ Supported na. Image/Video/Voice ViewOnce ekak try karanna.");

    } catch (e) {
        console.log("[VV ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});
