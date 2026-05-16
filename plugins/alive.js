const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');
const os = require('os');

cmd({
    pattern: "alive",
    alias: ["online", "active", "bot"],
    desc: "Check if bot is alive",
    category: "main",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, {
    from, pushname, reply
}) => {
    try {
        const uptime = runtime(process.uptime());
        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const nodeVer = process.version;

        const aliveMsg = `
╭━━━━━━━━━━━━━━━╮
┃   🤖 *BOT STATUS* 🤖   
╰━━━━━━━━━━━━━━━╯

✅ *Bot is Alive!*

👤 *User:* ${pushname}
🕐 *Uptime:* ${uptime}
💾 *Memory:* ${memUsed} MB used
⚙️ *Node:* ${nodeVer}
🔧 *Prefix:* ${config.PREFIX}

━━━━━━━━━━━━━━━━━
🌐 *Status:* Online ✅
━━━━━━━━━━━━━━━━━
        `.trim();

        await conn.sendMessage(from, {
            text: aliveMsg
        }, { quoted: mek });

    } catch (e) {
        console.log('Alive plugin error:', e);
        reply(`Error: ${e.message}`);
    }
});
