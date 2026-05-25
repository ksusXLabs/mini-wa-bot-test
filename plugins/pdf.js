const fs = require('fs');
const path = require('path');

// PDF සේව් වන ෆෝල්ඩරය
const pdfFolder = './saved_pdfs';
if (!fs.existsSync(pdfFolder)) {
    fs.mkdirSync(pdfFolder);
}

// ප්‍රධාන Handler එක ඇතුලත හෝ අදාල Plugin එක තුල ලිවිය යුතු කොටස:
async function handlePdfPlugin(conn, m, text, prefix, command) {
    const adminNumber = '94752425527@s.whatsapp.net'; // ඔබේ WhatsApp ID එක
    const sender = m.sender; // මැසේජ් එක එවූ කෙනාගේ ID එක

    // ----------------------------------------
    // 1. PDF එක සේව් කරගන්නා කොටස (Admin Only)
    // ----------------------------------------
    if (command === 'add') {
        // ඇඩ්මින් කෙනෙක්ද කියා පරීක්ෂා කිරීම
        if (sender !== adminNumber) {
            return m.reply("මෙම විධානය භාවිත කළ හැක්කේ Admin හට පමණි!");
        }

        // කමාන්ඩ් එකේ නම ලබා ගැනීම (Ex: .add science_paper)
        const cmdName = text.trim().toLowerCase();
        if (!cmdName) {
            return m.reply(`කරුණාකර කමාන්ඩ් එකක් ඇතුලත් කරන්න.\n*Ex:* ${prefix}add science_paper`);
        }

        // Reply කර ඇති මැසේජ් එක පරීක්ෂා කිරීම
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/pdf/.test(mime)) {
            return m.reply("කරුණාකර PDF එකකට Reply කර මෙම Command එක ලබාදෙන්න.");
        }

        try {
            m.reply("PDF එක Download වෙමින් පවතී, කරුණාකර රැඳී සිටින්න...");
            
            // Framework එක අනුව download කරන ආකාරය වෙනස් විය හැක. 
            // සාමාන්‍ය Baileys Framework වල:
            const buffer = await m.quoted.download(); 
            
            const filePath = path.join(pdfFolder, `${cmdName}.pdf`);
            fs.writeFileSync(filePath, buffer);

            m.reply(`✅ සාර්ථකයි!\nPDF එක *${cmdName}* නමින් සේව් කරගත්තා.\nදැන් ඕනෑම අයෙකුට *${prefix}${cmdName}* ලෙස ලබා දී මෙය ලබාගත හැක.`);
        } catch (error) {
            console.error(error);
            m.reply("PDF එක සේව් කිරීමට යාමේදී දෝෂයක් ඇතිවිය.");
        }
    }

    // ----------------------------------------
    // 2. වෙනත් ඕනෑම අයෙකුට PDF එක ලබාදෙන කොටස
    // ----------------------------------------
    const requestedCmd = command.toLowerCase();
    const checkPath = path.join(pdfFolder, `${requestedCmd}.pdf`);

    if (fs.existsSync(checkPath)) {
        try {
            // PDF එක සාර්ථකව පරිශීලකයා වෙත යැවීම
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(checkPath),
                mimetype: 'application/pdf',
                fileName: `${requestedCmd}.pdf`
            }, { quoted: m });
        } catch (err) {
            console.error(err);
            m.reply("PDF එක එවීමට යාමේදී දೋෂයක් ඇතිවිය.");
        }
    }
}
