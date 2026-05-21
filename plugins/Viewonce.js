const { cmd } = require('../command');

// ━━ DEBUG VERSION - VV SPY ━━
// Logs check karanna hadala, fix karamu

const VO_TYPES = ['viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'];

const getOwnerJid = (conn) => {
    const raw = conn.user?.id || '';
    return raw.includes(':') ? raw.split(':')[0] + '@s.whatsapp.net' : raw;
};

const handleViewOnce = async (conn, mek, m, { from, isGroup, isMe, sender, pushname, groupName }) => {
    try {
        if (isMe) return;

        // DEBUG: always log when handler fires
        console.log('[VV-SPY] Handler fired | quoted:', !!m.quoted, '| quotedType:', m.quoted?.type);

        if (!m.quoted) return;
        if (!VO_TYPES.includes(m.quoted.type)) {
            console.log('[VV-SPY] Not view once. Type was:', m.quoted.type);
            return;
        }

        console.log('[VV-SPY] ✅ View once detected! Inner type:', m.quoted.msg?.type);

        const innerType = m.quoted.msg?.type;
        const isImg   = innerType === 'imageMessage';
        const isVid   = innerType === 'videoMessage';
        const isAudio = innerType === 'audioMessage';
        if (!isImg && !isVid && !isAudio) {
            console.log('[VV-SPY] Inner type not media:', innerType);
            return;
        }

        const tmpName = `vv_${Date.now()}`;
        const buffer  = await m.quoted.download(tmpName).catch(e => {
            console.log('[VV-SPY] Download error:', e.message);
            return null;
        });
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
            await conn.sendMessage(ownerJid, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
        }

        console.log('[VV-SPY] ✅ Forwarded to owner!');

    } catch (e) {
        console.log('[VV-SPY ERROR]', e.message);
    }
};

cmd({ on: "body", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, ctx) => {
    await handleViewOnce(conn, mek, m, ctx);
});

cmd({ on: "sticker", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, ctx) => {
    await handleViewOnce(conn, mek, m, ctx);
});
