const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "1.0.2",
    author: "ArYAN",
    role: 0,
    countDown: 5,
    shortDescription: {
      en: "Generate hack image using UID and name",
    },
    longDescription: {
      en: "Send a fake hack image with Facebook UID and name of yourself or another person.",
    },
    category: "fun",
    guide: {
      en: "{pn} <name>\nTag or reply to auto-use name and uid",
    },
  },

  onStart: async function ({ api, event, args }) {
    try {
      let uid, name;

      if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
        name = event.mentions[uid].replace(/^@/, "").trim();
      } else if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
        const userInfo = await api.getUserInfo(uid);
        name = userInfo[uid]?.name || "Unknown";
      } else if (args.length > 0) {
        uid = event.senderID;
        name = args.join(" ").trim();
      } else {
        uid = event.senderID;
        const userInfo = await api.getUserInfo(uid);
        name = userInfo[uid]?.name || "Unknown";
      }

      const apiUrl = `https://aryan-nix-apis.vercel.app/api/hack?name=${encodeURIComponent(name)}&uid=${uid}`;
      const res = await axios.get(apiUrl, { responseType: "arraybuffer" });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const imgPath = path.join(cacheDir, `hack_${uid}.jpg`);

      fs.writeFileSync(imgPath, res.data);

      await api.sendMessage(
        {
          body: `💻 Successfully`,
          attachment: fs.createReadStream(imgPath),
        },
        event.threadID,
        event.messageID
      );

      fs.unlinkSync(imgPath);
    } catch (err) {
      return api.sendMessage(`⚠️ Failed: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
