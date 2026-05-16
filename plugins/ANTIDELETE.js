// ═══════════════════════════════════════════════════
//   ANTI-DELETE PLUGIN — DINA BOT
//   Detects deleted messages and forwards to owner
// ═══════════════════════════════════════════════════

const ALERT_NUMBER = '94752425527@s.whatsapp.net';
const MAX_CACHE    = 1000;

// Message cache — filled by pair.js
const msgCache = new Map();

// ── Main delete handler (called from pair.js) ──────
async function handleDelete(conn, updates) {
    try {
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

            // ── Time & Date ──
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

            // ── Alert text ──
            const alertText = `
╭━━━━━━━━━━━━━━━━━╮
┃  🗑️  *DELETED MESSAGE*  
╰━━━━━━━━━━━━━━━━━╯

👤 *Name:* ${senderName}
📱 *Number:* ${number}
${chatType}
📋 *Type:* ${msgType}
📅 *Date:* ${dateStr}
🕐 *Time:* ${timeStr}
━━━━━━━━━━━━━━━━━
${body ? `📝 *Message:*\n${body}` : '📎 _Media message — see below_'}
━━━━━━━━━━━━━━━━━`.trim();

            await conn.sendMessage(ALERT_NUMBER, { text: alertText });

            // ── Resend media if any ──
            const isImage   = type === 'imageMessage';
            const isVideo   = type === 'videoMessage';
            const isAudio   = type === 'audioMessage' && !message?.audioMessage?.ptt;
            const isVoice   = type === 'audioMessage' &&  message?.audioMessage?.ptt;
            const isDoc     = type === 'documentMessage';
            const isSticker = type === 'stickerMessage';

            try {
                if (isImage) {
                    const media = await conn.downloadMediaMessage({ message, key: deletedKey });
                    await conn.sendMessage(ALERT_NUMBER, {
                        image: media,
                        caption: `📸 *Deleted image from ${senderName}*${message?.imageMessage?.caption ? '\n\n_' + message.imageMessage.caption + '_' : ''}`
                    });

                } else if (isVideo) {
                    const media = await conn.downloadMediaMessage({ message, key: deletedKey });
                    await conn.sendMessage(ALERT_NUMBER, {
                        video: media,
                        caption: `🎥 *Deleted video from ${senderName}*${message?.videoMessage?.caption ? '\n\n_' + message.videoMessage.caption + '_' : ''}`
                    });

                } else if (isVoice) {
                    const media = await conn.downloadMediaMessage({ message, key: deletedKey });
                    await conn.sendMessage(ALERT_NUMBER, {
                        audio: media,
                        mimetype: 'audio/ogg; codecs=opus',
                        ptt: true
                    });
                    await conn.sendMessage(ALERT_NUMBER, { text: `🎤 *Deleted voice note from ${senderName}*` });

                } else if (isAudio) {
                    const media = await conn.downloadMediaMessage({ message, key: deletedKey });
                    await conn.sendMessage(ALERT_NUMBER, {
                        audio: media,
                        mimetype: 'audio/mp4'
                    });
                    await conn.sendMessage(ALERT_NUMBER, { text: `🎵 *Deleted audio from ${senderName}*` });

                } else if (isDoc) {
                    const media    = await conn.downloadMediaMessage({ message, key: deletedKey });
                    const filename = message?.documentMessage?.fileName || 'document';
                    const mimetype = message?.documentMessage?.mimetype || 'application/octet-stream';
                    await conn.sendMessage(ALERT_NUMBER, {
                        document: media,
                        fileName: filename,
                        mimetype,
                        caption: `📄 *Deleted document from ${senderName}*`
                    });

                } else if (isSticker) {
                    const media = await conn.downloadMediaMessage({ message, key: deletedKey });
                    await conn.sendMessage(ALERT_NUMBER, { sticker: media });
                }
            } catch (mediaErr) {
                await conn.sendMessage(ALERT_NUMBER, {
                    text: `⚠️ _Media download කරන්න බැරි වුණා — ${mediaErr.message}_`
                });
            }

            console.log(`[ANTIDELETE] ✅ Caught: ${senderName} | ${msgType}`);
        }
    } catch (e) {
        console.log('[ANTIDELETE] Error:', e.message);
    }
}

module.exports = { handleDelete, msgCache };
