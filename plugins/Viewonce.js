const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MEDIA SPY + VIEW ONCE HANDLER
//  view once / voice / video / image
//  damma gaman → owner inbox yanna
//  No reply | No react | Silent
//
//  ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cmd({
    on: "body",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, isMe, sender, pushname, botNumber
}) => {
    try {
        if (isMe) return;

        const raw = mek.message;
        if (!raw) return;

        // Owner JID (bot pair kara thiyana number)
        const ownerJid = conn.user.id.includes(':')
            ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
            : conn.user.id;

        // Sender full details
        const senderNum  = sender.split('@')[0];
        const groupLabel = isGroup ? `📍 *Group:* ${from}\n` : '';
        const chatType   = isGroup ? '👥 Group' : '📩 Inbox (DM)';

        // ── View Once check ──
        const viewOnceMsg =
            raw.viewOnceMessage?.message ||
            raw.viewOnceMessageV2?.message ||
            raw.viewOnceMessageV2Extension?.message ||
            null;

        if (viewOnceMsg) {
            const isImg   = !!viewOnceMsg.imageMessage;
            const isVid   = !!viewOnceMsg.videoMessage;
            if (!isImg && !isVid) return;

            const mtype   = isImg ? 'imageMessage' : 'videoMessage';
            const caption = viewOnceMsg[mtype]?.caption || '';

            const buffer = await downloadMediaMessage(
                { message: viewOnceMsg, key: mek.key },
                'buffer',
                {}
            ).catch(() => null);
            if (!buffer) return;

            const details = `
🔓 *VIEW ONCE ${isImg ? 'IMAGE' : 'VIDEO'} SAVED*

👤 *Name:* ${pushname}
📱 *Number:* +${senderNum}
${groupLabel}🏷️ *Chat:* ${chatType}
📝 *Caption:* ${caption || 'No caption'}
🕐 *Time:* ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
            `.trim();

            if (isImg) {
                await conn.sendMessage(ownerJid, { image: buffer, caption: details });
            } else {
                await conn.sendMessage(ownerJid, { video: buffer, caption: details });
            }
            return;
        }

        // ── Regular Media check (voice / audio / image / video) ──
        const isVoice = !!raw.audioMessage;
        const isImage = !!raw.imageMessage;
        const isVideo = !!raw.videoMessage;

        if (!isVoice && !isImage && !isVideo) return;

        // Group + Inbox (DM) media oba forward karanna

        let mediaBuffer = null;
        let mediaLabel  = '';
        let sendPayload = {};

        if (isVoice) {
            mediaLabel  = '🎙️ VOICE MESSAGE';
            mediaBuffer = await downloadMediaMessage(mek, 'buffer', {}).catch(() => null);
            if (!mediaBuffer) return;
            sendPayload = { audio: mediaBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true };
        } else if (isImage) {
            mediaLabel  = '🖼️ IMAGE';
            mediaBuffer = await downloadMediaMessage(mek, 'buffer', {}).catch(() => null);
            if (!mediaBuffer) return;
            sendPayload = { image: mediaBuffer };
        } else if (isVideo) {
            mediaLabel  = '🎥 VIDEO';
            mediaBuffer = await downloadMediaMessage(mek, 'buffer', {}).catch(() => null);
            if (!mediaBuffer) return;
            sendPayload = { video: mediaBuffer };
        }

        const details = `
📥 *${mediaLabel} RECEIVED*

👤 *Name:* ${pushname}
📱 *Number:* +${senderNum}
${groupLabel}🏷️ *Chat:* ${chatType}
🕐 *Time:* ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
        `.trim();

        // Details msg first
        await conn.sendMessage(ownerJid, { text: details });
        // Then media
        await conn.sendMessage(ownerJid, sendPayload);

    } catch (e) {
        console.log('[MEDIA-SPY ERROR]', e.message);
    }
});
