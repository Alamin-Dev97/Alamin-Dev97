module.exports = {
  config: {
    name: "listbox",
    version: "1.0.0",
    author: "ArYAN",
    role: 2,
    countDown: 10,
    shortDescription: {
      en: "List all groups bot is in",
    },
    longDescription: {
      en: "Shows all group names and their thread IDs where the bot is a member.",
    },
    category: "system",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      // বেশি গ্রুপ পেতে 500 পর্যন্ত নেওয়া যায়
      const threads = await api.getThreadList(500, null, ["INBOX"]);
      const groupThreads = threads.filter(t => t.isGroup && t.threadID);

      if (groupThreads.length === 0) {
        return api.sendMessage("❌ No group threads found.", event.threadID, event.messageID);
      }

      const botID = api.getCurrentUserID();

      // ফাস্ট চেক করার জন্য Promise.all
      const validGroups = await Promise.all(
        groupThreads.map(async (group) => {
          try {
            const info = await api.getThreadInfo(group.threadID);
            if (info && info.participantIDs.includes(botID)) {
              return {
                name: group.name || "(Unnamed Group)",
                threadID: group.threadID
              };
            }
          } catch (_) { }
          return null;
        })
      );

      const filteredGroups = validGroups.filter(Boolean);

      if (filteredGroups.length === 0) {
        return api.sendMessage("❌ Bot is not currently in any active groups.", event.threadID, event.messageID);
      }

      let msg = `🎯 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀: ${filteredGroups.length}\n━━━━━━━━━━━━━━\n`;

      filteredGroups.forEach((group, index) => {
        msg += `${index + 1}. 📌 𝗡𝗮𝗺𝗲: ${group.name}\n`;
        msg += `   🆔 𝗧𝗵𝗿𝗲𝗮𝗱𝗜𝗗: ${group.threadID}\n`;
        msg += `━━━━━━━━━━━━━━\n`;
      });

      return api.sendMessage(msg, event.threadID, event.messageID);
    } catch (error) {
      console.error("listbox error:", error);
      return api.sendMessage("❌ An error occurred while processing the group list.", event.threadID, event.messageID);
    }
  },
};
