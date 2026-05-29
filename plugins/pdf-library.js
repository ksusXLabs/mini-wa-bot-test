const fs = require("fs");
const path = require("path");

const config = require("../config"); // ⚡ prefix from config

const booksPath = path.join(__dirname, "../books.json");
let books = JSON.parse(fs.readFileSync(booksPath));

function searchBooks(query) {
    query = query.toLowerCase();
    return books.filter(b =>
        b.name.toLowerCase().includes(query)
    );
}

global.pdfSessions = global.pdfSessions || {};

module.exports = async (m, sock) => {

    const body = (m.message?.conversation ||
        m.message?.extendedTextMessage?.text || "").trim();

    const sender = m.key.remoteJid;

    const prefix = config.PREFIX; // ⚡ your prefix ( ! )

    // =========================
    // 📌 LIST BOOKS
    // =========================
    if (body === `${prefix}list`) {

        let txt = "╭━━〔 📚 FULL BOOK LIST 〕━━⬣\n";

        books.forEach((b, i) => {
            txt += `┃ ${i + 1}. ${b.name}\n`;
        });

        txt += "╰━━━━━━━━━━━━━━⬣\n\n✨ Developer K CeY | K Sasmitha";

        return sock.sendMessage(sender, { text: txt });
    }

    // =========================
    // 📌 SEARCH BOOKS
    // =========================
    if (body.startsWith(`${prefix}pdf`)) {

        let query = body.replace(`${prefix}pdf`, "").trim();

        if (!query) {
            return sock.sendMessage(sender, {
                text: `⚠️ Use: ${prefix}pdf <book name>`
            });
        }

        let results = searchBooks(query);

        if (results.length === 0) {
            return sock.sendMessage(sender, {
                text: "❌ No books found!"
            });
        }

        let txt = "╭━━〔 📚 SEARCH RESULTS 〕━━⬣\n";

        results.forEach((b, i) => {
            txt += `┃ ${i + 1}. ${b.name}\n`;
        });

        txt += "┃\n┃ Reply with number to download 📥\n";
        txt += "╰━━━━━━━━━━━━━━⬣\n\n✨ Developer K CeY | K Sasmitha";

        global.pdfSessions[sender] = results;

        return sock.sendMessage(sender, { text: txt });
    }

    // =========================
    // 📌 NUMBER REPLY
    // =========================
    if (!isNaN(body)) {

        let session = global.pdfSessions[sender];
        if (!session) return;

        let index = parseInt(body) - 1;

        if (!session[index]) {
            return sock.sendMessage(sender, {
                text: "❌ Invalid selection!"
            });
        }

        let book = session[index];

        const pdfUrl = `https://raw.githubusercontent.com/ksusXLabs/mini-wa-bot-test/main/pdf/${encodeURIComponent(book.file)}`;

        await sock.sendMessage(sender, {
            text: `📖 Sending: ${book.name}\n\n✨ Developer K CeY | K Sasmitha`
        });

        await sock.sendMessage(sender, {
            document: { url: pdfUrl },
            mimetype: "application/pdf",
            fileName: book.file
        });

        delete global.pdfSessions[sender];
    }
};
