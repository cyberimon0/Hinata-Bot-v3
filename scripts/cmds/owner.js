const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
config: {
  name: "owner",
  aurthor:"Tokodori",// Convert By Goatbot Tokodori 
   role: 0,
  shortDescription: " ",
  longDescription: "",
  category: "admin",
  guide: "{pn}"
},

  onStart: async function ({ api, event }) {
  try {
    const ownerInfo = {
      name: '𓆩⟡ 👾𝐄𝐌𝐑𝐀𝐍 ⟡𓆪⚠️',
      gender: '𝐌𝐀𝐋𝐄👾🌪️',
      
      
      
      nick: '𝗟𝗘͜͡𝗔𝗗𝗘𝗥 𝗩𝗔͜͡𝗜 ⚠️🏴‍☠'
    };

    const bold = 'https://files.catbox.moe/2rdi8m.mp4'; // Replace with your Google Drive videoid link https://drive.google.com/uc?export=download&id=here put your video id

    const tmpFolderPath = path.join(__dirname, 'tmp');

    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
    }

    const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
    const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

    fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

    const response = ` 
╭────────────◊
├─⦿ 𝐁𝐨𝐭 & 𝐎𝐰𝐧𝐞𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 
├─⦿ 𝐍𝐚𝐦𝐞: ${ownerInfo.name}
├─⦿ 𝗩𝗶͜͡𝗿𝘂𝘀 𝗔𝗹𝗲𝗿𝘁⚡📨
├─⦿ 𝗢𝗽𝗽͜͡𝘀𝘀𝘀 ....... 🎭
├─⦿ 𝗙𝗮𝘃𝗼𝗿𝗶𝘁𝗲 𝘄𝗼𝗿𝗱 : 𝗘𝗿𝗼𝗼𝗿 👑📨🌪️
├─⦿ 𝗛𝗼𝗯𝗯𝘆 :  𝗛𝗮͜͡𝟯𝗸𝗶𝗻𝗴 🎭
├─⦿ ⚡ 𝗪͟𝗛͟͠𝗢  𝗜͟𝗔͟͠𝗠  𝘠͟𝗼͟͠𝘂  𝗵͟𝗮͟͠𝘃𝗲  𝗻͟𝗼͟͠ 𝗶͟𝗱͟͠𝗲𝗮 📨🍷
├─⦿ 🌪️𝗳͟𝗮͟͠𝘁𝗵𝗲𝗿  𝗼͟𝗳  𝗻͟𝗼͟͠𝗯𝗶𝗻 ⚡
├─⦿ ⁷¹³𝗟𝗢𝗔𝗗𝗜𝗡𝗚...........................👾
├─⦿ 𝐆𝐞𝐧𝐝𝐞𝐫:  ${ownerInfo.gender}
├─⦿ 𝐍𝐢𝐜𝐤 : ${ownerInfo.nick}  
╰────────────◊ 
`;

    await api.sendMessage({
      body: response,
      attachment: fs.createReadStream(videoPath)
    }, event.threadID, event.messageID);

    if (event.body.toLowerCase().includes('ownerinfo')) {
      api.setMessageReaction('🚀', event.messageID, (err) => {}, true);
    }
  } catch (error) {
    console.error('Error in ownerinfo command:', error);
    return api.sendMessage('An error occurred while processing the command.', event.threadID);
  }
},
};