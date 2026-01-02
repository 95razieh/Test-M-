
/**
 * Telegram Integration Service for Mane No
 * This service communicates with the Telegram Bot API.
 */

const BOT_TOKEN = (process as any).env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

export const sendTelegramReport = async (chatId: string, message: string) => {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || !chatId) {
    console.warn("Telegram Bot Token or Chat ID missing. Report not sent to Telegram.");
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
    console.error("Error sending Telegram message:", error);
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
  
  let checklistStr = tasks.map(t => {
    const icon = t.score === 4 ? '🔥' : t.score === 3 ? '✅' : t.score === 2 ? '🟡' : t.score === 1 ? '🟠' : '❌';
    return `${icon} ${t.label}`;
  }).join('\n');

  if (isFa) {
    return `
📊 <b>گزارش تحول روزانه «مَنِ نو»</b>
👤 کاربر: <b>${userName}</b>
📅 تاریخ: ${date}

📝 <b>وضعیت چک‌لیست:</b>
${checklistStr}

✨ <b>تحلیل مربی هوشمند:</b>
<i>${briefing}</i>

🚀 @ManeNoBot
    `;
  } else {
    return `
📊 <b>Mane No Daily Evolution Report</b>
👤 User: <b>${userName}</b>
📅 Date: ${date}

📝 <b>Checklist Status:</b>
${checklistStr}

✨ <b>AI Coach Briefing:</b>
<i>${briefing}</i>

🚀 @ManeNoBot
    `;
  }
};
