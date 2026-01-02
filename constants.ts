
import { HabitCategory, HabitTask, Community, Language } from './types';

export const DEFAULT_HABITS: Record<Language, Omit<HabitTask, 'id' | 'score'>[]> = {
  fa: [
    { label: 'دیشب خواب خوب و کافی داشتم', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'امروز با طلوع خورشید بیدار شدم', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'امروز هوشیار و سوبر بودم', category: HabitCategory.MINDSET, weight: 3 },
    { label: 'امروز پاک از دود بودم', category: HabitCategory.HEALTH, weight: 3 },
    { label: 'امروز نورخواری (Light feeding) داشتم', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'امروز ورزش و فعالیت فیزیکی داشتم', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'امروز به تعادل تغذیه‌ای‌ام رسیدم', category: HabitCategory.DIET, weight: 2 },
    { label: 'امروز تمرکز و کار عمیق داشتم', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'امروز تمرینات تنفسی داشتم', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'امروز دوش آب سرد گرفتم', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'امروز پادکست یا کتاب رشد شخصی خواندم', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'امروز افکارم را نوشتم (Journaling)', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'امروز شکر سفید را کاملاً حذف کردم', category: HabitCategory.DIET, weight: 2 },
    { label: 'امروز هله‌هوله ناسالم نخوردم', category: HabitCategory.DIET, weight: 2 },
    { label: 'امروز روزه متناوب داشتم', category: HabitCategory.DIET, weight: 2 },
    { label: 'امروز برنامه فردایم را چک کردم', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'امروز تمرین شکرگزاری داشتم', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'امروز به روتین خوابم پایبند بودم', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'امروز چالش شخصی‌ام را انجام دادم', category: HabitCategory.MINDSET, weight: 2 },
  ],
  en: [
    { label: 'I had a good and sufficient sleep last night', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'I woke up with the sunrise today', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'I was sober today', category: HabitCategory.MINDSET, weight: 3 },
    { label: 'I was smoke-free today', category: HabitCategory.HEALTH, weight: 3 },
    { label: 'I had light feeding (Sunlight exposure) today', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'I had physical exercise and activity today', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'I achieved nutritional balance today', category: HabitCategory.DIET, weight: 2 },
    { label: 'I had focus and deep work today', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'I had breathing exercises today', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'I took a cold shower today', category: HabitCategory.HEALTH, weight: 2 },
    { label: 'I read a personal growth book or listened to a podcast today', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'I wrote down my thoughts (Journaling) today', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'I completely avoided white sugar today', category: HabitCategory.DIET, weight: 2 },
    { label: 'I didn\'t eat unhealthy snacks today', category: HabitCategory.DIET, weight: 2 },
    { label: 'I did intermittent fasting today', category: HabitCategory.DIET, weight: 2 },
    { label: 'I checked my schedule for tomorrow today', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'I practiced gratitude today', category: HabitCategory.MINDSET, weight: 2 },
    { label: 'I stuck to my sleep routine today', category: HabitCategory.ROUTINE, weight: 2 },
    { label: 'I completed my personal challenge today', category: HabitCategory.MINDSET, weight: 2 },
  ]
};

export const MOCK_COMMUNITIES: Record<Language, Community[]> = {
  fa: [
    {
      id: 'c1',
      name: 'گروه ریه پاک (ترک دخانیات)',
      description: 'حمایت متقابل برای رهایی از وابستگی به نیکوتین و بازگشت به تنفس آگاهانه.',
      telegramLink: 'https://t.me/man_no_quit_smoking',
      telegramChatId: '-1002145678901',
      requiredHabitLabels: ['امروز پاک از دود بودم'],
      memberCount: '۱.۲k',
      icon: '🚭',
      leaderName: 'دکتر صبوری',
      leaderAvatar: '👨‍⚕️'
    },
    {
      id: 'c2',
      name: 'گروه سحرخیزان منِ نو',
      description: 'جامعه‌ای برای کسانی که با خورشید بیدار می‌شوند و از سکوت صبح لذت می‌برند.',
      telegramLink: 'https://t.me/man_no_early_birds',
      telegramChatId: '-1002145678902',
      requiredHabitLabels: ['امروز با طلوع خورشید بیدار شدم', 'امروز به روتین خوابم پایبند بودم'],
      memberCount: '۴.۸k',
      icon: '☀️',
      leaderName: 'آرش راد',
      leaderAvatar: '🏃‍♂️'
    },
    {
      id: 'c3',
      name: 'گروه تغذیه هوشمند',
      description: 'تمرکز روی روزه‌داری متناوب و حذف قندهای مصنوعی برای عملکرد بهینه مغز.',
      telegramLink: 'https://t.me/man_no_bio_diet',
      telegramChatId: '-1002145678903',
      requiredHabitLabels: ['امروز شکر سفید را کاملاً حذف کردم', 'امروز روزه متناوب داشتم'],
      memberCount: '۲.۵k',
      icon: '🥦',
      leaderName: 'هستی تغذیه',
      leaderAvatar: '👩‍🍳'
    },
    {
      id: 'c4',
      name: 'گروه ذهن آگاه و متمرکز',
      description: 'تمرینات تنفسی و کار عمیق برای رسیدن به بالاترین سطح بهره‌وری ذهنی.',
      telegramLink: 'https://t.me/man_no_focus',
      telegramChatId: '-1002145678904',
      requiredHabitLabels: ['امروز تمرکز و کار عمیق داشتم', 'امروز تمرینات تنفسی داشتم'],
      memberCount: '۳.۱k',
      icon: '🧠',
      leaderName: 'استاد فلاح',
      leaderAvatar: '🧘‍♂️'
    }
  ],
  en: [
    {
      id: 'c1',
      name: 'Clean Lungs Group',
      description: 'Mutual support for freedom from nicotine addiction and return to conscious breathing.',
      telegramLink: 'https://t.me/man_no_quit_smoking',
      telegramChatId: '-1002145678901',
      requiredHabitLabels: ['I was smoke-free today'],
      memberCount: '1.2k',
      icon: '🚭',
      leaderName: 'Dr. Sabouri',
      leaderAvatar: '👨‍⚕️'
    },
    {
      id: 'c2',
      name: 'Mane No Early Birds',
      description: 'A community for those who wake up with the sun and enjoy the morning silence.',
      telegramLink: 'https://t.me/man_no_early_birds',
      telegramChatId: '-1002145678902',
      requiredHabitLabels: ['I woke up with the sunrise today', 'I stuck to my sleep routine today'],
      memberCount: '4.8k',
      icon: '☀️',
      leaderName: 'Arash Rad',
      leaderAvatar: '🏃‍♂️'
    },
    {
      id: 'c3',
      name: 'Smart Nutrition Group',
      description: 'Focus on intermittent fasting and eliminating artificial sugars for optimal brain performance.',
      telegramLink: 'https://t.me/man_no_bio_diet',
      telegramChatId: '-1002145678903',
      requiredHabitLabels: ['I completely avoided white sugar today', 'I did intermittent fasting today'],
      memberCount: '2.5k',
      icon: '🥦',
      leaderName: 'Hasti Nutrition',
      leaderAvatar: '👩‍🍳'
    }
  ]
};
