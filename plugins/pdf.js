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
//  1. PDF එක Save කරගන්නා කොටස (Admin/Owner Only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cmd({
    pattern: "up",
    desc: "Reply to a PDF and save it with a shortcut name",
    category: "owner",
    react: "📥",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply, q }) => {
    try {
        if (!isOwner) return;

        if (!q) {
            return reply("❌ කරුණාකර PDF එක සඳහා shortcut නමක් ලබා දෙන්න.\n💡 *Ex:* !up science_paper");
        }

        const cmdName = q.trim().toLowerCase().replace(/\s+/g, '_'); 
        const quoted = m.quoted || null;
        const quotedType = quoted ? quoted.type : null;

        const mime = quoted?.msg?.mimetype || '';
        if (quotedType !== 'documentMessage' || !/pdf/.test(mime)) {
            return reply("❌ කරුණාකර PDF Document එකකට Reply කර මෙම command එක ලබාදෙන්න.");
        }

        reply("⏳ PDF එක Readers Heaven වෙත Download වෙමින් පවතී, කරුණාකර රැඳී සිටින්න...");

        const buffer = await downloadMediaMessage(
            { message: quoted, key: { ...mek.key, id: quoted.id, participant: quoted.sender } },
            'buffer',
            {}
        ).catch(() => null);

        if (!buffer) return reply("❌ PDF එක Download කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");

        const filePath = path.join(pdfFolder, `${cmdName}.pdf`);
        fs.writeFileSync(filePath, buffer);

        reply(
`✅ *PDF එක සාර්ථකව සේව් කරගත්තා!*\n
📂 *Name:* ${cmdName}\n
💡 දැන් ඕනෑම අයෙකුට *!pdf ${cmdName}* ලෙස භාවිත කර මෙම PDF එක ලබාගත හැක.\n
𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘣𝘺 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽`
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
            return reply("❌ කරුණාකර ලබාගත යුතු PDF එකේ නම ඇතුලත් කරන්න.\n💡 *Ex:* !pdf science_paper");
        }

        const requestedCmd = q.trim().toLowerCase();
        const filePath = path.join(pdfFolder, `${requestedCmd}.pdf`);

        if (!fs.existsSync(filePath)) {
            return reply("❌ එවැනි නමකින් PDF එකක් සොයාගත නොහැක. කරුණාකර නම නිවැරදිදැයි පරීක්ෂා කරන්න.");
        }

        // PDF එක පරිශීලකයා වෙත යැවීම
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/pdf',
            fileName: `${requestedCmd}.pdf`
        }, { quoted: m });

        // PDF එක යැවූ පසු පරිශීලකයාට ලැබෙන Thank you මැසේජ් එක
        await conn.sendMessage(from, { 
            text: `✨ *Thank you for using Readers Heaven Bot!*\n\n𝘗𝘰𝘸𝘦𝘳𝘦𝘥 𝘣𝘺 𝘒 𝘊𝘦𝘠 | +𝟿𝟺𝟽𝟻𝟸𝟺𝟸𝟻𝟻𝟸𝟽` 
        }, { quoted: m });

    } catch (e) {
        console.log('[PDF GET ERROR]', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});
