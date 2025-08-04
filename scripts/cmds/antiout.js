const { GoatWrapper } = require("fca-aryan-nix");

module.exports = {
  config: {
    name: "antiout",
    version: "1.3",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Toggle anti-out system",
    longDescription: "Prevent members from leaving the group",
    category: "boxchat",
    guide: "{pn} on | off"
  },

  onStart: async function ({ message, event, threadsData, args }) {
    const current = await threadsData.get(event.threadID, "settings.antiout");

    if (!["on", "off"].includes(args[0])) {
      return message.reply(`Please use:\n{pn} on\n{pn} off\n\nCurrent: ${current ? "✅ ON" : "✅ OFF"}`);
    }

    const newValue = args[0] === "on";
    await threadsData.set(event.threadID, newValue, "settings.antiout");

    return message.reply(`✅ Antiout system has been ${newValue ? "Enabled" : "Disable"}`);
  },

  onEvent: async function ({ api, event, threadsData }) {
    const isEnabled = await threadsData.get(event.threadID, "settings.antiout");

    if (!isEnabled) return;

    if (event.logMessageType === "log:unsubscribe" && event.logMessageData?.leftParticipantFbId) {
      const leftUserID = event.logMessageData.leftParticipantFbId;

      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const isStillInGroup = threadInfo.participantIDs.includes(leftUserID);

        if (!isStillInGroup) {
          // দ্রুত এড করার জন্য সরাসরি addUserToGroup
          await api.addUserToGroup(leftUserID, event.threadID);

          const userInfo = await api.getUserInfo(leftUserID);
          const name = userInfo[leftUserID]?.name || "User";

          api.sendMessage({
            body: `✅ ${name} added successfully!`,
            mentions: [{
              tag: name,
              id: leftUserID
            }]
          }, event.threadID);
        }
      } catch (err) {
        console.log("Antiout error:", err.message);
      }
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
