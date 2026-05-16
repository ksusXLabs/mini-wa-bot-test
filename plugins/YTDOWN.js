const { cmd } = require('../command');
const axios = require('axios');

const pending = {};

// ── /ytlink <url> ──────────────────────────────────────────────
cmd({
    pattern: "ytlink",
    alias: ["yt", "youtube", "ytdl"],
    desc: "YouTube video/audio downloader",
    category: "downloader",
    react: "🎬",
    filename: __filename
},
async (conn, mek, m, { from, args, reply, sender }) => {
    try {
        const url = args[0];
        if (!url) return reply(`❌ URL දාන්න!\n\nExample: */ytlink https://youtu.be/xxxxx*`);

        await reply('⏳ Video info ගන්නවා...');

        const api = `https://www.movanest.xyz/v2/yt-vidsave?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api, { timeout: 30000 });

        if (!data.status || !data.results) return reply('❌ Video හොයාගන්න බැරි වුණා. URL check කරන්න.');

        const { title, thumbnail, formats, duration, views, channel } = data.results;

        const videos = (formats || []).filter(f => f.type === 'video');
        const audios = (formats || []).filter(f => f.type === 'audio');
        const allFormats = [...videos, ...audios];

        pending[sender] = { formats: allFormats, title, thumbnail };

        let formatList = '';
        let i = 1;

        if (videos.length > 0) {
            formatList += '\n📹 *VIDEO FORMATS*\n';
            videos.forEach(v => {
                formatList += `*${i}.* ${v.quality || v.format || 'MP4'} ${v.size ? '— ' + v.size : ''}\n`;
                i++;
            });
        }

        if (audios.length > 0) {
            formatList += '\n🎵 *AUDIO FORMATS*\n';
            audios.forEach(a => {
                formatList += `*${i}.* ${a.quality || a.format || 'M4A'} ${a.size ? '— ' + a.size : ''}\n`;
                i++;
            });
        }

        const msg = `
🎬 *${title}*

${channel ? `👤 *Channel:* ${channel}` : ''}
${duration ? `⏱️ *Duration:* ${duration}` : ''}
${views ? `👁️ *Views:* ${views}` : ''}

━━━━━━━━━━━━━━━
${formatList}
━━━━━━━━━━━━━━━
📥 *Number reply කරන්න download කරන්න!*
Example: *1*
        `.trim();

        if (thumbnail) {
            await conn.sendMessage(from, {
                image: { url: thumbnail },
                caption: msg
            }, { quoted: mek });
        } else {
            await reply(msg);
        }

    } catch (e) {
        console.log('ytlink error:', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});


// ── Number reply handler ───────────────────────────────────────
cmd({
    on: "text",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, body, sender, reply }) => {
    try {
        const num = parseInt(body.trim());
        if (isNaN(num) || !pending[sender]) return;

        const { formats, title } = pending[sender];

        if (num < 1 || num > formats.length) {
            return reply(`❌ *1* සිට *${formats.length}* අතර number reply කරන්න!`);
        }

        const selected = formats[num - 1];
        delete pending[sender];

        await reply(`⏳ *${title}*\n\nDownload link ගන්නවා...`);

        const isAudio = selected.type === 'audio';
        const formatName = selected.quality || selected.format || (isAudio ? 'Audio' : 'Video');

        const linkMsg = `
${isAudio ? '🎵' : '📹'} *${title}*

📦 *Format:* ${formatName}
${selected.size ? `💾 *Size:* ${selected.size}` : ''}

🔗 *Download Link:*
${selected.url}

⚠️ _Link expire වෙන්න පුළුවන් — ඉක්මනින් download කරන්න!_
        `.trim();

        await conn.sendMessage(from, { text: linkMsg }, { quoted: mek });

    } catch (e) {
        console.log('yt select error:', e.message);
    }
});
