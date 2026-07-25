const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autonamaz",
  version: "3.0",
  role: 0,
  author: "Farhan-Khan",
  description: "🕌 প্রতিদিনের নামাজের সময়সূচী, ইসলামিক ক্যাপশন ও অটো নোটিফিকেশন সহ",
  category: "Islam",
  countDown: 3,
};

module.exports.onLoad = async function ({ api }) {
  const videoURL = "https://files.catbox.moe/gr8zqw.mp4";
  const cacheDir = path.join(__dirname, "cache");
  const videoPath = path.join(cacheDir, "namazvideo.mp4");
  const logFile = path.join(cacheDir, "namaz_log.txt");

  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  // ভিডিও ডাউনলোড
  if (!fs.existsSync(videoPath)) {
    try {
      const writer = fs.createWriteStream(videoPath);
      const response = await axios({
        url: videoURL,
        method: "GET",
        responseType: "stream"
      });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      console.log("📥 Video downloaded successfully");
    } catch (err) {
      console.error("❌ Video download failed:", err.message);
    }
  }

  console.log("✅ AutoNamaz Scheduler Loaded...");

  // Helper: log write
  const writeLog = (message) => {
    const time = moment().tz("Asia/Dhaka").format("DD-MM-YYYY HH:mm:ss");
    fs.appendFileSync(logFile, `[${time}] ${message}\n`);
  };

  // প্রতিটি নামাজের বার্তা এবং ইসলামিক ক্যাপশন
  const namazData = {
    "Fajr": {
      title: "🌅 ফজরের নামাজের সময় হয়েছে!",
      caption: "✨ “ঘুমের চেয়ে সালাত উত্তম।” আল-কুরআন ও হাদিসের আলোকে ফজরের সালাত মানুষের মনে প্রান্তি ও দিনের প্রথম আলো ছড়িয়ে দেয়। আসুন, অলসতা ত্যাগ করে আল্লাহর দরবারে সিজদায় অবনত হই।"
    },
    "Dhuhr": {
      title: "☀️ যোহরের নামাজের সময় হয়েছে!",
      caption: "✨ “নিশ্চয়ই নির্দিষ্ট সময়ে সালাত আদায় করা মুমিনদের ওপর ফরজ করা হয়েছে।” (সূরা আন-নিসা: ১০৩)। কাজের ব্যস্ততা থামিয়ে কিছুক্ষণ আল্লাহর স্মরণে সময় দিন।"
    },
    "Asr": {
      title: "🌤️ আসরের নামাজের সময় হয়েছে!",
      caption: "✨ “তোমরা সালাতসমূহের প্রতি যত্নবান হও, বিশেষ করে মধ্যবর্তী সালাতের (আসরের) প্রতি।” (সূরা আল-বাকারা: ২৩৮)। সফলতার দিকে এক ধাপ এগিয়ে আসরের সালাত সময়মতো আদায় করুন।"
    },
    "Maghrib": {
      title: "🌇 মাগরিবের নামাজের সময় হয়েছে!",
      caption: "✨ দিনের কাজ শেষ, এবার রবের ইবাদতের পালা। মাগরিবের আজানের সাথে সাথেই নিজেকে সঁপে দিন রবের দরবারে। সঠিক সময়ে সালাত আদায় করে আত্মাকে প্রশান্ত করুন।"
    },
    "Isha": {
      title: "🌙 এশার নামাজের সময় হয়েছে!",
      caption: "✨ “যে ব্যক্তি এশার ও ফজরের সালাত জামাতে আদায় করবে, সে যেন সারা রাত জেগে সালাত আদায় করার সাওয়াব পেল।” (সহীহ মুসলিম)। আসুন, পবিত্রতার সাথে দিনটি শেষ করি।"
    }
  };

  // API থেকে ঢাকা শহর ও বাংলাদেশ সময় অনুযায়ী আজানের তথ্য
  const getNamazTimes = async () => {
    try {
      const res = await axios.get(
        "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2"
      );
      if (!res.data?.data?.timings) {
        writeLog("❌ API থেকে timings পাওয়া যায়নি");
        return null;
      }
      return res.data.data.timings;
    } catch (err) {
      writeLog(`❌ API request failed: ${err.message}`);
      return null;
    }
  };

  // নামাজের জন্য scheduler
  const scheduleNamaz = async () => {
    const namazTimes = await getNamazTimes();
    if (!namazTimes) return;

    const now = moment().tz("Asia/Dhaka");

    for (const key of Object.keys(namazData)) {
      const apiTime = namazTimes[key];
      if (!apiTime) continue;

      const [hour, minute] = moment(apiTime, ["HH:mm", "HH:mm:ss"]).format("HH:mm").split(":").map(Number);
      let namazTime = moment().tz("Asia/Dhaka").hour(hour).minute(minute).second(0);

      // সময় পার হয়ে গেলে ইগনোর করবে
      if (namazTime.isBefore(now)) continue;

      const delay = namazTime.diff(now);

      setTimeout(async () => {
        const todayDate = moment().tz("Asia/Dhaka").format("DD-MM-YYYY");
        const currentTime = moment().tz("Asia/Dhaka").format("hh:mm A");
        const { title, caption } = namazData[key];

        const msg = 
`◢◤━━━━━━━━━━━━━━━━◥◣
📢 ${title}
🕒 সময়: ${currentTime}
◥◣━━━━━━━━━━━━━━━━◢◤

📖 ${caption}

━━━━━━━━━━━━━━━━━━━━
📅 তারিখ: ${todayDate}
🤖 ʙᴏᴛ ᴏᴡɴᴇʀ: ─꯭─⃝͎̽𓆩𝐄𝐌𝐑𝐀𝐍𓆪_
━━━━━━━━━━━━━━━━━━━━`;

        try {
          const allThreads = await api.getThreadList(1000, null, ["INBOX"]);
          const groups = allThreads.filter(t => t.isGroup);

          if (groups.length === 0) {
            writeLog(`⚠️ কোনো গ্রুপ পাওয়া যায়নি: ${key}`);
            return;
          }

          const messageData = { body: msg };
          
          // যদি ভিডিও ডাউনলোডেড থাকে তবেই সাথে যোগ করবে
          if (fs.existsSync(videoPath)) {
            messageData.attachment = fs.createReadStream(videoPath);
          }

          await Promise.all(
            groups.map(thread => api.sendMessage(messageData, thread.threadID))
          );

          writeLog(`✅ নামাজ রিমাইন্ডার পাঠানো হয়েছে: ${key}`);
        } catch (e) {
          writeLog(`❌ Bot API Error for ${key}: ${e.message}`);
        }
      }, delay);
    }
  };

  // আজ দিনের জন্য রান করবে
  scheduleNamaz();

  // আগামী দিনের জন্য অটো রিসেট
  const scheduleNextDay = () => {
    const now = moment().tz("Asia/Dhaka");
    const tomorrow = moment().tz("Asia/Dhaka").add(1, "day").startOf("day");
    const msUntilTomorrow = tomorrow.diff(now);

    setTimeout(function dailyReset() {
      scheduleNamaz();
      scheduleNextDay();
    }, msUntilTomorrow);
  };

  scheduleNextDay();
};

module.exports.onStart = () => {};