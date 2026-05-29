const { cmd } = require('../command');

cmd({
    pattern: "vv",
    react: "🖕",
    alias: ["retrive", "viewonce"],
    desc: "Fetch and resend a ViewOnce message content",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, {
    from,
    reply
}) => {
    try {

        // Reply check
        if (!m.quoted) {
            return reply("❌ ViewOnce message ekakata reply karanna.");
        }

        let quoted = m.quoted;
        let msg = quoted.message || quoted.msg || quoted;

        // Handle ViewOnce wrapper
        if (msg.viewOnceMessage) {
            msg = msg.viewOnceMessage.message;
        }

        if (msg.viewOnceMessageV2) {
            msg = msg.viewOnceMessageV2.message;
        }

        if (msg.viewOnceMessageV2Extension) {
            msg = msg.viewOnceMessageV2Extension.message;
        }

        // Detect media type
        let type = Object.keys(msg)[0];

        // IMAGE
        if (type === "imageMessage") {
            let buffer = await quoted.download();

            await conn.sendMessage(from, {
                image: buffer,
                caption: msg.imageMessage.caption || "🌸 Retrieved ViewOnce Image"
            }, {
                quoted: mek
            });
        }

        // VIDEO
        else if (type === "videoMessage") {
            let buffer = await quoted.download();

            await conn.sendMessage(from, {
                video: buffer,
                caption: msg.videoMessage.caption || "🌸 Retrieved ViewOnce Video"
            }, {
                quoted: mek
            });
        }

        // AUDIO / VOICE
        else if (type === "audioMessage") {
            let buffer = await quoted.download();

            await conn.sendMessage(from, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: true
            }, {
                quoted: mek
            });
        }

        // Unsupported
        else {
            return reply("❌ Supported na. Image/Video/Voice ViewOnce ekak reply karanna.");
        }

    } catch (e) {
        console.log("[VV ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});
