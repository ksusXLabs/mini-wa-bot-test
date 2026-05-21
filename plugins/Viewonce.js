const { cmd } = require('../command');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  VIEW ONCE SPY - Auto Forward to Inbox
//  Kawru hari view once msg ekkata
//  mokakma hari reply karama → owner
//  inbox ekata auto forward wenawa
//  Silent | No reply | No react
//
//  ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴋ ᴄᴇʏ | ᴅᴇᴠʀᴀʙʙɪᴛᴢᴢ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VO_TYPES = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];

const getOwnerJid = (conn) => {
    const raw = conn.user?.id || '';
    return raw.includes(':') ? raw.split(':')[0] + '@s.whatsapp.net' : raw;
};

const handleViewOnce = async (conn, mek, m, { from, isGroup, isMe, sender, pushname, groupName }) => {
    try {
        if (isMe) return;
        if (!m.quoted) return;

        // V1 + V2 + V2Ext check
        if (!VO_TYPES.includes(m.quoted.type)) return;

        // Inner type (msg.js already set correctly after fix)
        const innerType = m.quoted.msg?.type;
        const isImg   = innerType === 'imageMessage';
        const isVid   = innerType === 'videoMessage';
        const isAudio = innerType === 'audioMessage';
        if (!isImg && !isVid && !isAudio) return;

        // Download using m.quoted.download() - msg.js fix handles this
        const tmpName = `vv_${Date.now()}`;
        const buffer  = await m.quoted.download(tmpName).catch(() => null);
        if (!buffer) return;

        const ownerJid   = getOwnerJid(conn);
        const senderNum  = sender.split('@')[0];
        const caption    = m.quoted.msg?.caption || '';
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

// Text / Emoji / Number / Symbol replies
cmd({ on: "body", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, ctx) => {
    if (ctx.isMe) return;
    await handleViewOnce(conn, mek, m, ctx);
});

// Sticker replies
cmd({ on: "sticker", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, ctx) => {
    if (ctx.isMe) return;
    await handleViewOnce(conn, mek, m, ctx);
});
