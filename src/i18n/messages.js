export const messages = {
  fa: {
    "Application": "برنامه",
    "Starter layout": "قالب پایه",
    "Navigation": "منوها",
    "Test menu 1": "منوی تست ۱",
    "Test menu 2": "منوی تست ۲",
    "Settings": "تنظیمات",
    "Map": "نقشه",
    "Cars": "خودرو",
    "Tiles": "تایل",
    "Refreshing map data": "در حال بروزرسانی داده‌های نقشه",
    "Toggle sidebar": "باز و بسته کردن سایدبار",
    "Open sidebar": "باز کردن سایدبار",
    "Close sidebar": "بستن سایدبار",
    "Pin sidebar": "باز نگه داشتن سایدبار",
    "Profile menu": "منوی پروفایل",
    "Your profile": "حساب کاربری",
    "Settings and language": "تنظیمات و زبان",
    "Language": "زبان",
    "Change language": "تغییر زبان",
    "Choose your language and preferences.": "زبان و تنظیمات دلخواه خود را انتخاب کنید.",
    "The layout direction follows your selected language.": "جهت چیدمان با زبان انتخاب‌شده هماهنگ می‌شود.",
    "Search": "جستجو",
    "Search here": "جستو جو کنید",
    "Clear search": "پاک کردن جستجو",
    "Start building your page here.": "محتوای این صفحه را اضافه کنید.",
    "Close": "بستن",
  },
};

export function translate(locale, key, params = {}) {
  const message = messages[locale]?.[key] ?? key;
  return message.replace(/\{(\w+)\}/g, (placeholder, name) => String(params[name] ?? placeholder));
}
