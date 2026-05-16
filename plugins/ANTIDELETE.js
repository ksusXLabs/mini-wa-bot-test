// ═══════════════════════════════════════════════════
//   ANTI-DELETE PLUGIN — DINA BOT
//   Detects deleted messages and forwards to bot owner inbox
// ═══════════════════════════════════════════════════

const { downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');

const MAX_CACHE    = 1000;

// Message cache — filled by pair.js
const msgCache = new Map();

// ── Download media helper ──────────────────────────
async function downloadMedia(message, type) {
    try {
        const msgContent = message[`${type}Message`];
        if (!msgContent) return null;

        const stream = await downloadContentFromMessage(msgContent, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        console.log(`[ANTIDELETE] Download error (${type}):`, e.message);
        return null;
    }
}

// ── Main delete handler (called from pair.js) ──────
async function handleDelete(conn, updates) {
    try {
        // Bot එක දැනට connect වී ඇති තමන්ගේම අංකය (JID) inbox එක ලෙස ගණනය කිරීම
        const myJid = conn.user?.id ? jidNormalizedUser(conn.user.id) : null;
        if (!myJid) return;

        for (const msg of updates) {
            // Detect revoke (delete for everyone)
            const isRevoke =
                msg.update?.messageStubType === 1 ||
                msg.message?.protocolMessage?.type === 0;

            if (!isRevoke) continue;

            // Get the key of the deleted message
            const deletedKey = msg.message?.protocolMessage?.key || msg.key;
            const msgId      = deletedKey?.id;
            if (!msgId) continue;

            const cached = msgCache.get(msgId);
            if (!cached) continue;

            msgCache.delete(msgId);

            const { from, sender, pushname, type, body, message, timestamp } = cached;

            // ── Time & Date ──────────────────────
            const time    = new Date(timestamp);
            const dateStr = time.toLocaleDateString('en-LK', {
                timeZone: 'Asia/Colombo',
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const timeStr = time.toLocaleTimeString('en-LK', {
                timeZone: 'Asia/Colombo',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            const senderName = pushname || sender?.split('@')[0] || 'Unknown';
            const number     = '+' + (sender?.split('@')[0] || 'Unknown');
            const chatType   = from?.endsWith('@g.us') ? `📦 *Group Chat*` : `💬 *Private Chat*`;
            const msgType    = type?.replace('Message', '') || 'unknown';

            // ── Alert text ───────────────────────
            const alertText = `
╭━━━━━━━━━━━━━━━━━╮
┃  🗑️  *DELETED MESSAGE* ╰━━━━━━━━━━━━━━━━━╯

👤 *Name:* ${senderName}
📱 *Number:* ${number}
${chatType}
📋 *Type:* ${msgType}
📅 *Date:* ${dateStr}
🕐 *Time:* ${timeStr}
━━━━━━━━━━━━━━━━━
${body ? `📝 *Message:*\n${body}` : '📎 _Media message — see below_'}
━━━━━━━━━━━━━━━━━`.trim();

            await conn.sendMessage(myJid, { text: alertText });

            // ── Resend media ─────────────────────
            try {
                if (type === 'imageMessage') {
                    const buffer = await downloadMedia(message, 'image');
                    if (buffer) {
                        await conn.sendMessage(myJid, {
                            image: buffer,
                            caption: `📸 *Deleted image from ${senderName}*${message?.imageMessage?.caption ? '\n\n_' + message.imageMessage.caption + '_' : ''}`
                        });
                    } else {
                        await conn.sendMessage(myJid, { text: '📸 _Image download failed_' });
                    }

                } else if (type === 'videoMessage') {
                    const buffer = await downloadMedia(message, 'video');
                    if (buffer) {
                        await conn.sendMessage(myJid, {
                            video: buffer,
                            mimetype: 'video/mp4',
                            caption: `🎥 *Deleted video from ${senderName}*${message?.videoMessage?.caption ? '\n\n_' + message.videoMessage.caption + '_' : ''}`
                        });
                    } else {
                        await conn.sendMessage(myJid, { text: '🎥 _Video download failed_' });
                    }

                } else if (type === 'audioMessage' && message?.audioMessage?.ptt) {
                    // Voice note
                    const buffer = await downloadMedia(message, 'audio');
                    if (buffer) {
                        await conn.sendMessage(myJid, {
                            audio: buffer,
                            mimetype: 'audio/ogg; codecs=opus',
                            ptt: true
                        });
                        await conn.sendMessage(myJid, {
                            text: `🎤 *Deleted voice note from ${senderName}*`
                        });
                    } else {
                        await conn.sendMessage(myJid, { text: '🎤 _Voice note download failed_' });
                    }

                } else if (type === 'audioMessage') {
                    // Audio file
                    const buffer = await downloadMedia(message, 'audio');
                    if (buffer) {
                        await conn.sendMessage(myJid, {
                            audio: buffer,
                            mimetype: 'audio/mp4'
                        });
                        await conn.sendMessage(myJid, {
                            text: `🎵 *Deleted audio from ${senderName}*`
                        });
                    } else {
                        await conn.sendMessage(myJid, { text: '🎵 _Audio download failed_' });
                    }

                } else if (type === 'documentMessage') {
                    const buffer   = await downloadMedia(message, 'document');
                    const filename = message?.documentMessage?.fileName || 'document';
                    const mimetype = message?.documentMessage?.mimetype || 'application/octet-stream';
                    if (buffer) {
                        await conn.sendMessage(myJid, {
                            document: buffer,
                            fileName: filename,
                            mimetype,
                            caption: `📄 *Deleted document from ${senderName}*`
                        });
                    } else {
                        await conn.sendMessage(myJid, { text: '📄 _Document download failed_' });
                    }

                } else if (type === 'stickerMessage') {
                    const buffer = await downloadMedia(message, 'sticker');
                    if (buffer) {
                        await conn.sendMessage(myJid, { sticker: buffer });
                    }
                }
            } catch (mediaErr) {
                console.log('[ANTIDELETE] Media send error:', mediaErr.message);
                await conn.sendMessage(myJid, {
                    text: `⚠️ _Media send කරන්න බැරි වුණා: ${mediaErr.message}_`
                });
            }

            console.log(`[ANTIDELETE] ✅ Caught: ${senderName} | ${msgType}`);
        }
    } catch (e) {
        console.log('[ANTIDELETE] Error:', e.message);
    }
}

module.exports = { handleDelete, msgCache };
