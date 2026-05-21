const { cmd } = require('../command');
const { downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VIEW ONCE SPY - Auto Forward to Inbox
//  Kawru hari view once msg ekkata
//  mokakma hari reply karama → owner
//  inbox ekata auto forward wenawa
//  Silent | No reply | No react
//
//  ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VIEW_ONCE_TYPES = [
    'viewOnceMessage',
    'viewOnceMessageV2',
    'viewOnceMessageV2Extension'
];

// Owner JID helper
const getOwnerJid = (conn) => {
    const raw = conn.user?.id || '';
    return raw.includes(':') ? raw.split(':')[0] + '@s.whatsapp.net' : raw;
};

// View once inner message extract (V1 + V2 + V2Ext all handle)
const extractViewOnce = (quotedRaw) => {
    for (const voType of VIEW_ONCE_TYPES) {
        if (!quotedRaw[voType]) continue;
        const inner = quotedRaw[voType].message;
        if (!inner) continue;
        const innerType = getContentType(inner);
        if (!innerType) continue;
        return { msg: inner[innerType], innerType };
    }
    return null;
};

// Download buffer directly without writing to file
const downloadBuffer = async (msgContent, mediaType) => {
    const stream = await downloadContentFromMessage(msgContent, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
};

// Main forward logic
const handleViewOnce = async (conn, mek, m, { from, isGroup, sender, pushname, groupName }) => {
    try {
        if (!m.quoted) return;

        // quoted raw message
        const quotedRaw = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage
            || mek.message?.stickerMessage?.contextInfo?.quotedMessage
            || mek.message?.imageMessage?.contextInfo?.quotedMessage
            || mek.message?.videoMessage?.contextInfo?.quotedMessage
            || null;

        if (!quotedRaw) return;

        // Check if quoted is view once type
        const voType = VIEW_ONCE_TYPES.find(t => quotedRaw[t]);
        if (!voType) return;

        // Extract inner media
        const extracted = extractViewOnce(quotedRaw);
        if (!extracted) return;

        const { msg: mediaContent, innerType } = extracted;

        const isImg   = innerType === 'imageMessage';
        const isVid   = innerType === 'videoMessage';
        const isAudio = innerType === 'audioMessage';

        if (!isImg && !isVid && !isAudio) return;

        // Download buffer
        const dlType  = isImg ? 'image' : isVid ? 'video' : 'audio';
        const buffer  = await downloadBuffer(mediaContent, dlType).catch(() => null);
        if (!buffer) return;

        const ownerJid   = getOwnerJid(conn);
        const senderNum  = sender.split('@')[0];
        const caption    = mediaContent?.caption || '';
        const chatInfo   = isGroup ? `👥 *Group:* ${groupName || from}` : `📩 *Inbox (DM)*`;
        const mediaLabel = isImg ? '🖼️ IMAGE' : isVid ? '🎥 VIDEO' : '🎙️ AUDIO';

        const details = `
🔓 *VIEW ONCE ${mediaLabel} CAPTURED*

👤 *Name:* ${pushname}
📱 *Number:* wa.me/${senderNum}
${chatInfo}
📝 *Caption:* ${caption || 'No caption'}
🕐 *Time:* ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
        `.trim();

        if (isImg) {
            await conn.sendMessage(ownerJid, { image: buffer, caption: details });
        } else if (isVid) {
            await conn.sendMessage(ownerJid, { video: buffer, caption: details });
        } else {
            await conn.sendMessage(ownerJid, { text: details });
            await conn.sendMessage(ownerJid, {
                audio: buffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            });
        }

    } catch (e) {
        console.log('[VV-SPY ERROR]', e.message);
    }
};

// ━━ HANDLER 1: Text / Emoji / Symbol / Number replies ━━
cmd({
    on: "body",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isMe, sender, pushname, groupName }) => {
    if (isMe) return;
    await handleViewOnce(conn, mek, m, { from, isGroup, sender, pushname, groupName });
});

// ━━ HANDLER 2: Sticker replies ━━
cmd({
    on: "sticker",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isMe, sender, pushname, groupName }) => {
    if (isMe) return;
    await handleViewOnce(conn, mek, m, { from, isGroup, sender, pushname, groupName });
});
