const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fbcover",
    version: "0.0.9",
    author: "ArYAN",
    role: 0,
    shortDescription: "Generate Facebook Cover",
    longDescription: "Create Facebook Cover using name, uid, etc.",
    category: "image",
    guide: {
      en: "-fbcover Name | UID | Subname | Email | Phone | Address | Color\n\nIf UID is empty or 'me', your own UID will be used."
    }
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").split("|").map(item => item.trim());

    if (input.length < 7) {
      return message.reply("❌ Please provide all 7 fields:\nName | UID | Subname | Email | Phone | Address | Color");
    }

    let [name, uid, subname, email, phoneNumber, address, color] = input;

    if (!uid || uid.toLowerCase() === "me" || uid.toLowerCase() === "my") {
      uid = event.senderID;
    }

    const waitMsg = await message.reply("🖼 Generating your Facebook cover...");

    try {
      const apiUrl = `https://aryan-nix-apis.vercel.app/api/fbcover?name=${encodeURIComponent(name)}&uid=${uid}&subname=${encodeURIComponent(subname)}&email=${encodeURIComponent(email)}&phoneNumber=${encodeURIComponent(phoneNumber)}&address=${encodeURIComponent(address)}&color=${encodeURIComponent(color)}`;

      const imgBuffer = (await axios.get(apiUrl, { responseType: "arraybuffer" })).data;

      const fileName = `fbcover-${Date.now()}.png`;
      const filePath = path.join(__dirname, "cache", fileName);
      fs.writeFileSync(filePath, Buffer.from(imgBuffer, "utf-8"));

      await message.reply({
        body: `✅ Facebook Cover Created Successfully for ${name}`,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating Facebook cover. Please try again later.");
    }

    if (waitMsg) {
      message.unsend(waitMsg.messageID);
    }
  }
};
