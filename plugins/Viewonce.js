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
            return reply("❌ ViewOnce message ekakata reply karanna.");
        }

        const quoted = m.quoted;

        // REAL media type
        const mediaType = quoted.msg?.type || quoted.type;

        // Download media
        const buffer = await quoted.download().catch(() => null);

        if (!buffer) {
            return reply("❌ Media download failed.");
        }

        // IMAGE
        if (mediaType === "imageMessage") {
            return await conn.sendMessage(from, {
                image: buffer,
                caption: quoted.msg?.caption || ""
            }, {
                quoted: mek
            });
        }

        // VIDEO
        if (mediaType === "videoMessage") {
            return await conn.sendMessage(from, {
                video: buffer,
                caption: quoted.msg?.caption || ""
            }, {
                quoted: mek
            });
        }

        // AUDIO / VOICE
        if (mediaType === "audioMessage") {
            return await conn.sendMessage(from, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quoted.msg?.ptt || false
            }, {
                quoted: mek
            });
        }

        return reply(`❌ Unsupported type: ${mediaType}`);

    } catch (e) {
        console.log("[VV ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});
