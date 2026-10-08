# گزارش مرتب‌سازی پروژه

تاریخ: ۲۰۲۶-۱۰-۰۸

۳ فایل فعال جابه‌جا شد و ۲۲ فایل کد بدون مصرف‌کنندهٔ فعال حذف شد. مسیرهای import اصلاح شد. ساختار اصلی صفحات، مسیرها، Providerها، تنظیمات، APIهای مورد استفاده و استایل‌های منبع حفظ شد.

## فایل‌های جابه‌جاشده

| مسیر قبلی | مسیر جدید | علت |
| --- | --- | --- |
| `src/layouts/components/MapInfo.jsx` | `src/components/map/MapInfo.jsx` | قرارگرفتن اطلاعات نقشه کنار کامپوننت‌های نقشه؛ محتوای فایل عیناً حفظ شد. |
| `src/components/AppSearch.tsx` | `src/components/layout/AppSearch.jsx` | قرارگرفتن جست‌وجوی layout کنار اجزای آن؛ فایل فاقد TypeScript بود و پسوند به JSX هماهنگ شد. |
| `src/utils/axiosClient.js` | `src/api/axiosClient.js` | قرارگرفتن کلاینت HTTP کنار APIها؛ محتوای فایل عیناً حفظ شد. |

## فایل‌های حذف‌شده

| فایل | دلیل حذف |
| --- | --- |
| `src/components/app-sidebar.jsx` | نمونهٔ قدیمی sidebar؛ بدون ارجاع و دارای import به دو فایل ناموجود. |
| `src/components/Filters.jsx` | فقط از layout قدیمی و غیرفعال استفاده می‌شد؛ Toolbar فعال حفظ شد. |
| `src/components/map/MapCoordinates.jsx` | هیچ مصرف‌کنندهٔ فعال ندارد؛ MapInstance فعال حفظ شد. |
| `src/components/map/MapInfoUpdater.jsx` | هیچ مصرف‌کنندهٔ فعال ندارد؛ MapInstance فعال حفظ شد. |
| `src/components/MartinVectorLayer.jsx` | لایهٔ آزمایشی بدون import فعال؛ WorldMap فعلی حفظ شد. |
| `src/components/nav-user.jsx` | فقط وابستگی sidebarهای قدیمی؛ SidebarProfile فعال حفظ شد. |
| `src/components/team-switcher.jsx` | فقط وابستگی نمونهٔ sidebar قدیمی. |
| `src/components/ui/alert.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/breadcrumb.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/collapsible.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/direction.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/drawer.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/select.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/components/ui/switch.jsx` | کامپوننت UI بدون هیچ import فعال، ارجاع داینامیک یا ثبت در ورودی‌های پروژه. |
| `src/hooks/useMockShips.js` | بدون import فعال؛ public/mock.json حفظ شد. |
| `src/hooks/useShipDetails.js` | تنها ارجاع، در نسخهٔ کامنت‌شدهٔ صفحهٔ جزئیات کشتی بود؛ useShipPreview فعال حفظ شد. |
| `src/layouts/AppLayout.jsx` | layout قدیمی که در مسیرها و ورودی برنامه ثبت نشده بود. |
| `src/layouts/components/AppSidebar.jsx` | فقط بخشی از layout قدیمی و غیرفعال، یا بدون مصرف‌کنندهٔ فعال. |
| `src/layouts/components/NavigationHeader.jsx` | فقط بخشی از layout قدیمی و غیرفعال، یا بدون مصرف‌کنندهٔ فعال. |
| `src/layouts/components/NavigationLinks.jsx` | فقط بخشی از layout قدیمی و غیرفعال، یا بدون مصرف‌کنندهٔ فعال. |
| `src/layouts/components/RightSidebarContent.jsx` | فقط بخشی از layout قدیمی و غیرفعال، یا بدون مصرف‌کنندهٔ فعال. |
| `src/layouts/components/SidebarHeader.jsx` | فقط بخشی از layout قدیمی و غیرفعال، یا بدون مصرف‌کنندهٔ فعال. |

## پاک‌سازی داخل فایل‌های باقی‌مانده

- نسخهٔ کامل و کامنت‌شدهٔ قدیمی در `src/pages/ShipDetailPage.jsx` حذف شد؛ پیاده‌سازی فعلی و داده‌های نمونهٔ فعال آن حفظ شد.
- توابع `getShipSummary` و `getShipCompanies` از `src/api/shipApi.js` حذف شد؛ تنها مصرف‌کنندهٔ آن‌ها hook غیرفعال و حذف‌شدهٔ `useShipDetails` بود.
- importهای بلااستفادهٔ React، Settings، Link، DropdownMenuItem، Tooltip و MapInfo و binding بلااستفادهٔ setOpenMobile حذف شد.
- پس از حذف‌ها و جابه‌جایی‌ها، پوشه‌های خالی `src/layouts/components`، `src/layouts` و `src/utils` حذف شد.

## فایل‌های حفظ‌شده

- `README.md`: همان مسیر و محتوای اولیه، با تطبیق SHA-256.
- تمام ۲۰ فایل فونت Sahel: ۵ وزن در ۴ فرمت EOT، TTF، WOFF و WOFF2، همان مسیر و بایت‌های اولیه.
- تمام فایل‌های `src/assets` و `public`، شامل favicon.svg، icons.svg و mock.json حفظ شد.
- فونت‌های Geist و Inter و importهای CSS آن‌ها حفظ شد؛ ۱۷ فایل فونت خروجی build نیز با خروجی اولیه یکسان‌اند.
- `components_l1m2.zip`، `package.json` و هر دو lockfile دست‌نخورده حفظ شد.

## بررسی و نتیجه

- بررسی از `index.html` و `src/main.jsx` آغاز شد و تمام importهای مستقیم و زنجیرهٔ وابستگی‌ها تا صفحات، hookها و کامپوننت‌های UI دنبال شد.
- ارجاع‌های CSS، importهای جانبی، مسیرهای fetch و نبود import داینامیک یا glob برای کدهای حذف‌شده بررسی شد؛ نبود ارجاع در JSX به‌تنهایی معیار حذف Asset نبود.
- پس از تغییرات، هیچ import محلی ناموجود و هیچ فایل کد خارج از زنجیرهٔ اجرای فعلی باقی نماند.
- build اولیه و نهایی با `pnpm run build` موفق بود.
- lint اولیه: ۳۱ خطا و ۱ هشدار. lint نهایی: ۱۳ خطا و ۱ هشدار. هیچ یافتهٔ جدیدی اضافه نشد.
- خطاهای باقی‌مانده از قبل وجود داشتند: exportهای ترکیبی Fast Refresh، set-state-in-effect در sidebar و use-mobile، __dirname در تنظیمات Vite، و هشدار وابستگی useMemo در DirectionContext. برای اجتناب از تغییر رفتار، این موارد در این مرتب‌سازی اصلاح نشدند.
- اندازهٔ CSS خروجی از ۱۳۰٬۹۸۲ به ۱۰۵٬۸۵۳ بایت کاهش یافت (حدود ۱۹٫۲٪). فایل‌های CSS منبع و تعریف‌های فونت تغییر نکردند.
- `npm ci` به دلیل ناسازگاری قبلی package-lock.json با package.json متوقف شد؛ نصب و بررسی با `pnpm install --frozen-lockfile --ignore-scripts` و lockfile هماهنگ pnpm انجام شد.
- پوشهٔ پروژه مخزن Git نبود؛ مقایسهٔ فایل‌ها با نسخهٔ ثبت‌شده در ابتدای بررسی و هش‌ها انجام شد.
- این تأیید شامل build، importها، lint و یکسان‌بودن بایت‌های Assetهاست؛ آزمون تعاملی مرورگر یا اتصال به backend انجام نشده است.
