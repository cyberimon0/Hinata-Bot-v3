const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "info",
    version: "1.0",
    author: "TONMOY",
    role: 0,
    shortDescription: "System information",
    longDescription: "Shows bot system information with video",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const videoURL = "https://files.catbox.moe/jet2ug.mp4";

      const tmpFolder = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpFolder)) {
        fs.mkdirSync(tmpFolder, { recursive: true });
      }

      const videoPath = path.join(tmpFolder, "info.mp4");

      const response = await axios({
        url: videoURL,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const msg = `
📋 BOT INFORMATION

🤖 Bot Name : SIZUKA BABY
👑 Owner    : CZB EMRAN 
⚙ Version  : 1.0.0
🟢 Status   : Online

💻 SYSTEM INFORMATION

🖥 Platform : ${os.platform()}
🏗 Arch     : ${os.arch()}
📦 Node.js  : ${process.version}
🧠 RAM      : ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
⚡ CPU       : ${os.cpus()[0].model}

⏱ Uptime    : ${hours}h ${minutes}m ${seconds}s

✅ Thanks for using the bot.
`;

      api.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(videoPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        },
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Failed to load system information.",
        event.threadID,
        event.messageID
      );
    }
  }
};