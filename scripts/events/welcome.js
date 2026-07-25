const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');

async function createWelcomeCanvas(gcImg, avatar, userName, memberCount, threadName) {
const width = 1000;
const height = 500;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

ctx.fillStyle = "#0d0d0d";
ctx.fillRect(0, 0, width, height);

ctx.strokeStyle = "rgba(0,255,150,0.1)";
for (let i = 0; i < width; i += 40) {
ctx.beginPath();
ctx.moveTo(i, 0);
ctx.lineTo(i, height);
ctx.stroke();
}

ctx.beginPath();
ctx.arc(width / 2, height / 2, 180, 0, Math.PI * 2);
const grad = ctx.createRadialGradient(
width / 2,
height / 2,
50,
width / 2,
height / 2,
200
);
grad.addColorStop(0, "rgba(0,255,150,0.3)");
grad.addColorStop(1, "transparent");
ctx.fillStyle = grad;
ctx.fill();

try {
const img = await loadImage(avatar);

ctx.save();
ctx.beginPath();
ctx.arc(width / 2, 180, 90, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(img, width / 2 - 90, 90, 180, 180);
ctx.restore();

} catch {}

ctx.textAlign = "center";

ctx.fillStyle = "#00ff9c";
ctx.font = "bold 40px Sans";
ctx.fillText("WELCOME", width / 2, 330);

ctx.fillStyle = "#ffffff";
ctx.font = "28px Sans";
ctx.fillText(userName, width / 2, 380);

ctx.fillStyle = "#aaaaaa";
ctx.font = "20px Sans";
ctx.fillText("Member #${memberCount}", width / 2, 420);

ctx.fillStyle = "#00ff9c";
ctx.font = "18px Sans";
ctx.fillText(threadName, width / 2, 460);

return canvas.toBuffer();
}

module.exports = {
config: {
name: "welcome",
version: "3.0",
author: "TONMOY",
category: "events"
},

onStart: async ({ event, message, usersData, threadsData }) => {
if (event.logMessageType !== "log:subscribe") return;

try {
  const thread = await threadsData.get(event.threadID);
  const added = event.logMessageData.addedParticipants[0];

  const uid = added.userFbId;
  const name = added.fullName || await usersData.getName(uid);
  const avatar = await usersData.getAvatarUrl(uid);

  const threadName = thread.threadName || "GROUP";
  const memberCount = thread.members?.length || 1;

  const welcomeTime = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const buffer = await createWelcomeCanvas(
    thread.imageSrc,
    avatar,
    name,
    memberCount,
    threadName
  );

  const filePath = path.join(__dirname, "welcome.png");
  fs.writeFileSync(filePath, buffer);

  const msg = `

╔══════════════════════╗
🎉 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 🎉
╚══════════════════════╝

👋 Hello ${name}

🏠 Group: ${threadName}
👥 Member No: ${memberCount}
🆔 UID: ${uid}

⏰ Welcome Time
╭────────────────╮
│ ${welcomeTime}
╰────────────────╯

━━━━━━━━━━━━━━━━━━

🌺 আসসালামু আলাইকুম 🌺

💖 ${threadName} পরিবারে আপনাকে স্বাগতম।

📜 𝗚𝗥𝗢𝗨𝗣 𝗥𝗨𝗟𝗘𝗦

🔹 Spam করা যাবে না
🔹 Admin-দের সম্মান করুন
🔹 কাউকে অপমান করবেন না
🔹 অশ্লীল Content নিষিদ্ধ
🔹 গ্রুপের পরিবেশ সুন্দর রাখুন
🔹 ধর্মীয় ও সামাজিক মূল্যবোধ বজায় রাখুন

━━━━━━━━━━━━━━━━━━

🤝 Respect Everyone
💬 Stay Active
🔥 Enjoy Your Stay

━━━━━━━━━━━━━━━━━━

✨ Welcome To ${threadName} ✨

❤️ Have A Nice Day ❤️
`;

  await message.send({
    body: msg,
    mentions: [
      {
        tag: name,
        id: uid
      }
    ],
    attachment: fs.createReadStream(filePath)
  });

  fs.unlinkSync(filePath);

} catch (err) {
  console.error("WELCOME ERROR:", err);
}

}
};