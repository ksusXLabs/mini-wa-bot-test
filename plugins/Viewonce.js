const { cmd } = require('../command');

cmd({
    pattern: "aa",
    react: "👀",
    alias: ["retrive", "ok"],
    desc: "Retrieve ViewOnce media and send to owner inbox (Owner Only)",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, {
    from,
    reply
}) => {
    try {
        // බොට් පාවිච්චි කරන කෙනාගේ අංකය ලබා ගැනීම
        const senderNumber = m.sender.split('@')[0];
        
        // අදාළ අංකය පමණක් පරීක්ෂා කිරීම (94752425527)
        if (senderNumber !== "94752425527") {
            // වෙනත් අයෙක් භාවිතා කළහොත් කිසිදු ප්‍රතිචාරයක් නොදක්වා නතර වේ
            return;
        }

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

        const targetInbox = "94752425527@s.whatsapp.net";

        // IMAGE
        if (mediaType === "imageMessage") {
            await conn.sendMessage(targetInbox, {
                image: buffer,
                caption: quoted.msg?.caption || ""
            });
            return reply("✅ Media forwarded to your inbox!");
        }

        // VIDEO
        if (mediaType === "videoMessage") {
            await conn.sendMessage(targetInbox, {
                video: buffer,
                caption: quoted.msg?.caption || ""
            });
            return reply("✅ Media forwarded to your inbox!");
        }

        // AUDIO / VOICE
        if (mediaType === "audioMessage") {
            await conn.sendMessage(targetInbox, {
                audio: buffer,
                mimetype: "audio/mp4",
                ptt: quoted.msg?.ptt || false
            });
            return reply("✅ Media forwarded to your inbox!");
        }

        return reply(`❌ Unsupported type: ${mediaType}`);

    } catch (e) {
        console.log("[VV ERROR]", e);
        reply(`❌ Error: ${e.message}`);
    }
});
