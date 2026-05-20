const { cmd } = require('../command');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  /tagall - Invisible Mention Plugin
//  Reply to any msg (text/image/video) +
//  type /tagall → copy that msg & mention
//  all members invisibly
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cmd({
    pattern: "tagall",
    alias: ["all", "everyone", "tageveryone"],
    desc: "Tag all group members invisibly using a replied message",
    category: "group",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, participants, isAdmins, isOwner, reply
}) => {
    try {
        // Group only
        if (!isGroup) return reply('❌ මේ command eka group ලෙස පමණයි use කරන්නේ!');

        // Get all member JIDs
        const allMembers = participants.map(p => p.id);

        // Quoted message (reply කරපු msg) ගන්නා
        const quoted = m.quoted || null;
        const quotedType = quoted ? quoted.type : null;

        // ── invisible mention text ──
        // Members ලා text ලා නොදකිනා mention කරන්න
        // Zero-width chars use නොකර empty string + mentions array use කරන්නේ
        // WhatsApp mentions array ඇත්නම් notify කරනවා text නොපෙනුනත්
        const invisibleText = '\u200e'; // left-to-right mark (invisible)

        // ── CASE 1: Image (with or without caption) ──
        if (quotedType === 'imageMessage') {
            const imageCaption = quoted.msg?.caption || '';

            const buffer = await downloadMediaMessage(
                { message: quoted, key: { ...mek.key, id: quoted.id, participant: quoted.sender } },
                'buffer',
                {}
            ).catch(() => null);

            if (!buffer) return reply('❌ Image download failed. Try again.');

            await conn.sendMessage(from, {
                image: buffer,
                caption: imageCaption || invisibleText,
                mentions: allMembers,
                contextInfo: {
                    mentionedJid: allMembers
                }
            });

        // ── CASE 2: Video (with or without caption) ──
        } else if (quotedType === 'videoMessage') {
            const videoCaption = quoted.msg?.caption || '';

            const buffer = await downloadMediaMessage(
                { message: quoted, key: { ...mek.key, id: quoted.id, participant: quoted.sender } },
                'buffer',
                {}
            ).catch(() => null);

            if (!buffer) return reply('❌ Video download failed. Try again.');

            await conn.sendMessage(from, {
                video: buffer,
                caption: videoCaption || invisibleText,
                mentions: allMembers,
                contextInfo: {
                    mentionedJid: allMembers
                }
            });

        // ── CASE 3: Text message ──
        } else if (quotedType === 'conversation' || quotedType === 'extendedTextMessage') {
            const text = quoted.msg?.text || quoted.msg || '';

            await conn.sendMessage(from, {
                text: text || invisibleText,
                mentions: allMembers,
                contextInfo: {
                    mentionedJid: allMembers
                }
            });

        // ── CASE 4: No reply - just invisible tagall ──
        } else {
            await conn.sendMessage(from, {
                text: invisibleText,
                mentions: allMembers,
                contextInfo: {
                    mentionedJid: allMembers
                }
            });
        }

    } catch (e) {
        console.log('[TAGALL ERROR]', e.message);
        reply(`❌ Error: ${e.message}`);
    }
});
