const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// PDF ෆයිල් සේව් වෙන්න ඕන ෆෝල්ඩරය (Bot root එකේ 'saved_pdfs' කියලා හැදෙයි)
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
        // Owner කෙනෙක් නොවේ නම් සිලන්ට් වෙනවා (ඔයාගේ tagall එකේ වගේමයි)
        if (!isOwner) return;

        // PDF එකට දෙන නම ඇතුලත් කර ඇත්දැයි බැලීම
        if (!q) return reply("❌ කරුණාකර PDF එක සඳහා shortcut නමක් ලබා දෙන්න.\n*Ex:* .add science_paper");

        const cmdName = q.trim().toLowerCase().replace(/\s+/g, '_'); // හිස්තැන් ඇත්නම් '_' දමයි
        const quoted = m.quoted || null;
        const quotedType = quoted ? quoted.type : null;

        // Reply කර ඇති මැසේජ් එක PDF එකක්ද කියා පරික්ෂා කිරීම
        const mime = quoted?.msg?.mimetype || '';
        if (quotedType !== 'documentMessage' || !/pdf/.test(mime)) {
            return reply("❌ කරුණාකර PDF Document එකකට Reply කර මෙම command එක ලබාදෙන්න.");
        }

        reply("⏳ PDF එක Bot තුලට Download වෙමින් පවතී, කරුණාකර රැඳී සිටින්න...");

        // ඔයාගේ tagall එකේ විදිහටම media එක download කරගන්නවා
        const buffer = await downloadMediaMessage(
            { message: quoted, key: { ...mek.key, id: quoted.id, participant: quoted.sender } },
            'buffer',
            {}
        ).catch(() => null);

        if (!buffer) return reply("❌ PDF එක Download කිරීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");

        // ෆයිල් එක සේව් කිරීම
        const filePath = path.join(pdfFolder, `${cmdName}.pdf`);
        fs.writeFileSync(filePath, buffer);

        reply(`✅ *සාර්ථකව සේව් කරගත්තා!*\n\nදැන් ඕනෑම අයෙකුට \`.pdf ${cmdName}\` ලෙස බාවිතා කර මෙම PDF එක ලබාගත හැක.`);

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
        if (!q) return reply("❌ කරුණාකර ලබාගත යුතු PDF එකේ නම ඇතුලත් කරන්න.\n*Ex:* .pdf science_paper");

        const requestedCmd = q.trim().toLowerCase();
        const filePath = path.join(pdfFolder, `${requestedCmd}.pdf`);

        // එහෙම ෆයිල් එකක් තියෙනවද බලනවා
        if (!fs.existsSync(filePath)) {
            return reply("❌ එවැනි නමකින් PDF එකක් සොයාගත නොහැක. කරුණාකර නම නිවැරදිදැයි පරීක්ෂා කරන්න.");
        }

        // PDF එක පරිශීලකයා වෙත යැවීම
        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/pdf',
            fileName: `${requestedCmd}.pdf`
        }, { quoted: m });

    } catch (e) {
        console.log('[PDF GET ERROR]', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});
