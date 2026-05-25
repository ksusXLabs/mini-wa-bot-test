const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// PDF ෆයිල් සේව් වෙන්න ඕන ෆෝල්ඩරය
const pdfFolder = path.join(__dirname, '../saved_pdfs');
if (!fs.existsSync(pdfFolder)) {
    fs.mkdirSync(pdfFolder, { recursive: true });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  1. PDF එක Save කරගන්නා කොටස (Strict Owner Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cmd({
    pattern: "up",
    desc: "Reply to a PDF and save it with a shortcut name",
    category: "owner",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, { from, reply, q }) => {
    try {
        // බොට් මැසේජ් එක එවපු කෙනාගේ අංකය (Ex: 94752425527@s.whatsapp.net)
        const senderNumber = m.sender;
        const allowedAdmin = '94752425527@s.whatsapp.net';

        // අංකය ගැලපෙන්නේ නැත්නම් පද්ධතිය ප්‍රතික්ෂේප කරයි
        if (senderNumber !== allowedAdmin) {
            return reply(
`🚫 𝐀𝐜𝐜𝐞𝐬𝐬 𝐃𝐞𝐧𝐢𝐞𝐝!

🚨 ʏᴏᴜ ᴀʀᴇ ɴᴏᴛ ʀᴇᴄᴏɢɴɪᴢᴇᴅ ᴀꜱ ᴛʜᴇ ᴀᴅᴍɪɴ ᴏʀ ᴏᴡɴᴇʀ. 💡 ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ʀᴇQᴜɪʀᴇꜱ ꜱᴘᴇᴄɪᴀʟ ᴘᴇʀᴍɪꜱꜱɪᴏɴꜱ.

👤 ᴏᴡɴᴇʀ: *K CeY* 🥕
📞 ​ᴄᴏɴᴛᴀᴄᴛ: *+94752425527 to request access.*

> 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽`
            );
        }

        if (!q) {
            return reply("❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ sʜᴏʀᴛᴄᴜᴛ ɴᴀᴍᴇ ғᴏʀ ᴛʜᴇ ᴘᴅғ.\n💡 *ᴇx:* ¡up term_test");
        }

        const cmdName = q.trim().toLowerCase().replace(/\s+/g, '_'); 
        const quoted = m.quoted || null;
        const quotedType = quoted ? quoted.type : null;

        const mime = quoted?.msg?.mimetype || '';
        if (quotedType !== 'documentMessage' || !/pdf/.test(mime)) {
            return reply("❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴘᴅғ ᴅᴏᴄᴜᴍᴇɴᴛ ᴀɴᴅ ᴘʀᴏᴠɪᴅᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
        }

        reply("⏳ ᴛʜᴇ ᴘᴅғ ɪs ʙᴇɪɴ章 ᴜᴘʟᴏᴀᴅᴇᴅ ᴛᴏ ᴛʜᴇ ᴅᴀᴛᴀʙᴀsᴇ, ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ...\n\n> 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽");

        const buffer = await downloadMediaMessage(
            { message: quoted, key: { ...mek.key, id: quoted.id, participant: quoted.sender } },
            'buffer',
            {}
        ).catch(() => null);

        if (!buffer) return reply("❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ᴅᴏᴡɴʟᴏᴀᴅ ᴘᴅғ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ.");

        const filePath = path.join(pdfFolder, `${cmdName}.pdf`);
        fs.writeFileSync(filePath, buffer);

        reply(
`✅ 𝐏𝐃𝐅 𝐬𝐚𝐯𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!\n\n
📂 ᴄᴍᴅ ɴᴀᴍᴇ: *${cmdName}*\n\n
💡 ɴᴏᴡ ᴀɴʏᴏɴᴇ ᴄᴀɴ ᴀᴄᴄᴇꜱꜱ ᴛʜɪꜱ ᴘᴅꜰ ᴜꜱɪɴ章 *¡ᴘᴅꜰ ${cmdName}*.\n\n
> 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽`
        );

    } catch (e) {
        console.log('[PDF ADD ERROR]', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  2. ඕනෑම පරිශීලකයෙකුට PDF එක ලබාදෙන කොටස (Public)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cmd({
    pattern: "pdf",
    alias: ["getpdf", "document"],
    desc: "Get a saved PDF by its shortcut name",
    category: "download",
    react: "📄",
    filename: __filename
},
async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply("⛔ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴀᴍᴇ ᴏғ ᴛʜᴇ ᴘᴅғ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ.\n💡 *Ex:* ¡pdf science_paper");
        }

        const requestedCmd = q.trim().toLowerCase();
        const filePath = path.join(pdfFolder, `${requestedCmd}.pdf`);

        if (!fs.existsSync(filePath)) {
            return reply("🔴 ᴀ ᴘᴅғ ᴡɪᴛʜ ᴛʜᴀᴛ ɴᴀᴍᴇ ᴄᴀɴɴᴏᴛ ʙᴇ ғᴏᴜɴᴅ. ᴘʟᴇᴀsᴇ ᴄʜᴇᴄᴋ ᴛʜᴀᴛ ᴛʜᴇ ɴᴀᴍᴇ ɪs ᴄᴏʀʀᴇᴄᴛ.\n\n> 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽");
        }

        // PDF එක පරිශීලකයා වෙත යැවීම
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/pdf',
            fileName: `${requestedCmd}.pdf`
        }, { quoted: m });

        // PDF එක යැවූ පසු පරිශීලකයාට ලැබෙන Thank you මැසේජ් එක
        await conn.sendMessage(from, { 
            text: `✨ 𝑇ℎ𝑎𝑛𝑘 𝑦𝑜𝑢 𝑓𝑜𝑟 𝑢𝑠𝑖𝑛𝑔 𝑅𝑒𝑎𝑑𝑒𝑟𝑠 𝐻𝑒𝑎𝑣𝑒𝑛 𝐵𝑜𝑡!\n\n> 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝙱𝚢 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽` 
        }, { quoted: m });

    } catch (e) {
        console.log('[PDF GET ERROR]', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});
