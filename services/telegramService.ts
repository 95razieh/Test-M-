
/**
 * Telegram Integration Service for Mane No
 * This service communicates with the Telegram Bot API.
 */

// ۱. توکن بات را از @BotFather بگیرید و اینجا قرار دهید:
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; 

export const sendTelegramReport = async (chatId: string, message: string) => {
  // اگر توکن وارد نشده باشد یا چت‌آیدی نباشد، ارسال نمی‌کنیم
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || !chatId) {
    console.warn("Telegram Configuration Missing: Check BOT_TOKEN and User ChatID.");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error("Telegram error:", error);
    return false;
  }
};

export const formatTelegramMessage = (
  userName: string,
  tasks: any[],
  briefing: string,
  isFa: boolean
) => {
  const date = new Date().toLocaleDateString(isFa ? 'fa-IR' : 'en-US');
  
  // فیلتر کردن فقط مواردی که تیک خورده‌اند (اختیاری - یا نمایش همه)
  let checklistStr = tasks.map(t => {
    let icon = '❌';
    if (t.score === 4) icon = '🔥';
    else if (t.score === 3) icon = '✅';
    else if (t.score === 2) icon = '🟡';
    else if (t.score === 1) icon = '🟠';
    
    return `${icon} ${t.label}`;
  }).join('\n');

  if (isFa) {
    return `
📊 <b>گزارش روزانه: ${userName}</b>
📅 تاریخ: ${date}

📝 <b>وضعیت عادت‌ها:</b>
${checklistStr}

✨ <b>تحلیل مربی هوشمند:</b>
<i>${briefing}</i>

🚀 @ManeNoBot
    `;
  } else {
    return `
📊 <b>Daily Report: ${userName}</b>
📅 Date: ${date}

📝 <b>Habits Status:</b>
${checklistStr}

✨ <b>AI Coach Analysis:</b>
<i>${briefing}</i>

🚀 @ManeNoBot
    `;
  }
};
