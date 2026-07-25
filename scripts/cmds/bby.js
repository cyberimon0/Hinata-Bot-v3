const axios = require('axios');

// Fetching dynamic API URL from GitHub
const getBaseApiUrl = async () => {
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch (e) {
        return "https://noobs-api.top"; // Fallback URL
    }
};

// শুধু "bot" ট্রিগার হিসেবে থাকবে
const triggerWords = ["bot"];

module.exports = {
    config: {
        name: "bot",
        aliases: ["mbot", "milonbot"],
        version: "11.1.0",
        author: "Milon",
        countDown: 2,
        role: 0,
        description: "Bot responds only to 'bot' trigger with funny dialogues or AI.",
        category: "fun",
        guide: { 
            en: "{pn} [text]\n{pn} teach [q] - [a]\n{pn} list" 
        }
    },

    onStart: async function ({ api, event, args, usersData, commandName }) {
        const { threadID, messageID, senderID } = event;
        const baseUrl = await getBaseApiUrl();

        try {
            const name = await usersData.getName(senderID);

            if (!args[0]) {
                return api.sendMessage({
                    body: `「 ${name} 」\nবলুন আমি "বট" আপনাকে কিভাবে সাহায্য করতে পারি? 😘`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            const action = args[0].toLowerCase();

            if (action === "teach") {
                const input = args.slice(1).join(" ");
                const [trigger, ...responsesArr] = input.split(" - ");
                const responses = responsesArr.join(" - ");
                if (!trigger || !responses) return api.sendMessage("⚠️ Format: teach ask - reply", threadID, messageID);
                const res = await axios.post(`${baseUrl}/api/jan/teach`, { trigger, responses, userID: senderID });
                return api.sendMessage(`✅ Added: ${trigger} -> ${responses}`, threadID, messageID);
            }

            // Default AI Response
            const res = await axios.post(`${baseUrl}/api/hinata`, { 
                text: args.join(" "), 
                style: 3, 
                attachments: event.attachments || [] 
            });
            return api.sendMessage(res.data.message, threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
            }, messageID);

        } catch (err) {
            return api.sendMessage("API Busy! ❌", threadID, messageID);
        }
    },

    onReply: async function ({ api, event, commandName }) {
        if (api.getCurrentUserID() == event.senderID) return;
        try {
            const baseUrl = await getBaseApiUrl();
            const res = await axios.post(`${baseUrl}/api/hinata`, { 
                text: event.body?.toLowerCase() || "hi", 
                style: 3, 
                attachments: event.attachments || [] 
            });
            return api.sendMessage(res.data.message, event.threadID, (err, info) => {
                if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: event.senderID });
            }, event.messageID);
        } catch (err) {}
    },

    onChat: async function ({ api, event, usersData, commandName }) {
        const { body, senderID, threadID, messageID } = event;
        if (!body) return;
        const lowerBody = body.toLowerCase();

        // চেক করবে মেসেজটি "bot" দিয়ে শুরু হয়েছে কি না
        if (triggerWords.some(word => lowerBody.startsWith(word))) {
            const text = body.replace(/^bot\s*/i, "").trim();

            if (!text) {
                const name = await usersData.getName(senderID);
                const randomReplies = [
                    "𝗵𝗲 𝗯𝗼𝘁 𝗯𝗼𝘁 𝗰𝗵𝗶𝗹𝗹 𝗯𝗿𝗼!", "I love you 💝", "আমি ইমন বস এর সাথে বিজি আছি-😕😏",
                    "আমার বস ইমন কে একটা জি GF দাও-😽🫶", "জান তোমার নানি রে আমার হাতে তুলে দিবা-🙊🙆‍♂",
                    "ইমন বস'এর হবু বউ রে কেও দেকছো?😪", "জান হাঙ্গা করবা-🙊😝",
                    "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤", "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
                    "বেশি Bot Bot করলে leave নিবো কিন্তু😒", "তোর বাড়ি কি মাল দিপ গ্রাম😵‍💫",
                    "মেয়ে হলে বস ইমন কে 𝐊𝐈𝐒𝐒 দে 😒", "চুমু খাওয়ার বয়স টা চকলেট🍫খেয়ে উড়িয়ে দিলো ইমন বস 🥺🤗",
                    "আহ শোনা আমার আমাকে এতো ডাকতাছো কেনো আসো বুকে আসো🥱", "জান বাল ফালাইবা-🙂🥱🙆‍♂",
                    "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇", "দিনশেষে পরের BOW সুন্দর-☹️🤧",
                    "সুন্দর মাইয়া মানেই-🥱আমার বস ইমন এর বউ-😽🫶", "হা জানু , এইদিক এ আসো কিস দেই🤭 😘",
                    "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘", "জানু তোমার জন্য আমার মনটা আই ঢাই করে 💖",
                    "ওই যে দেখো ইমন বস যাচ্ছে , এক বালতি প্রেম দিয়ে দাও 🤭", "𝗔𝗺𝗮𝗿 𝗝𝗮𝗻𝘂 𝗟𝗮𝗴𝗯𝗲 𝗧𝘂𝗺𝗶 𝗞𝗶 𝗦𝗶𝗻𝗴𝗲𝗹 𝗔𝗰𝗵𝗼?",
                    "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼 😒😒", "𝗧𝘂𝗺𝗮𝗿 𝗴𝗳 𝗻𝗮𝗶, 𝘁𝗮𝘆 𝗮𝗺𝗸 𝗱𝗮𝗸𝘀𝗼? 😂😂😂",
                    "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺", "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚",
                    "জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽", "বার বার Disturb করেছিস কেন, আমার জানু এর সাথে ব্যাস্ত আছি 😋"
                ];
                const rand = randomReplies[Math.floor(Math.random() * randomReplies.length)];

                return api.sendMessage({
                    body: `「 ${name} 」\n\n${rand}`,
                    mentions: [{ tag: name, id: senderID }]
                }, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            }

            try {
                const baseUrl = await getBaseApiUrl();
                const { data } = await axios.post(`${baseUrl}/api/hinata`, { text: text, style: 3 });
                api.sendMessage(data.message, threadID, (err, info) => {
                    if (!err) global.GoatBot?.onReply?.set(info.messageID, { commandName, author: senderID });
                }, messageID);
            } catch (err) {}
        }
    }
};