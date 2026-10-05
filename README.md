# Car Map Dashboard

داشبورد دو‌زبانه‌ی فارسی و انگلیسی با Vite، React، TanStack Query، کامپوننت‌های shadcn/ui بر پایه‌ی Base UI و نقشه‌ی Leaflet.

## امکانات

- انتخاب زبان از هدر یا تنظیمات، با ذخیره‌ی انتخاب در مرورگر
- فونت محلی ساحل برای فارسی و Inter برای انگلیسی، با تغییر خودکار همراه زبان
- فارسی با RTL و سایدبار راست، انگلیسی با LTR و سایدبار چپ
- سایدبار رسمی shadcn/ui با حالت باز/آیکن روی دسکتاپ و Sheet روی موبایل؛ میانبر `Ctrl+B` یا `Cmd+B`
- ترجمه‌ی متن‌ها، وضعیت‌ها، برچسب‌های دسترس‌پذیری و اطلاعات نقشه
- جهت هماهنگ آیکن‌ها، فاصله‌ها، جستجو، پنجره‌های شناور و کلیدهای روشن/خاموش
- مسیرهای نقشه (`/`)، فهرست خودروها (`/vehicles`) و تنظیمات (`/settings`)
- جستجو در هدر و ابزار فیلتر/لایه در لبه‌ی متناسب با جهت صفحه
- فیلتر وضعیت ماشین‌ها با Context
- سرچ Debounce شده
- دریافت ماشین‌ها با TanStack Query
- Polling هر 3 ثانیه
- ارسال `z/x/y` فعلی نقشه به API
- نمایش ماشین‌ها با Marker و باز شدن Drawer از پایین با کلیک، Enter یا Space
- جزئیات خودرو در Drawer دو‌زبانه‌ی shadcn/ui؛ بستن با دکمه، Escape یا کشیدن به پایین
- نمایش `lat/lng/z/x/y`
- Zoom controls سفارشی
- Raster tiles با `.png`
- Vector tiles اختیاری با `.pbf` و `Leaflet.VectorGrid`
- Mock API برای اجرای فوری بدون بک‌اند

## اجرا

```bash
pnpm install
cp .env.example .env
pnpm dev
```

اگر pnpm نداری:

```bash
npm install
cp .env.example .env
npm run dev
```

## اتصال به API واقعی

در `.env`:

```env
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:3000/api
```

درخواست ماشین‌ها به این شکل زده می‌شود:

```http
GET /cars?search=ali&status=available&z=13&x=5265&y=3230
```

فرمت پاسخ قابل قبول:

```json
[
  {
    "id": 101,
    "lat": 35.7001,
    "lng": 51.3922,
    "driverName": "علی رضایی",
    "plate": "12 الف 345",
    "status": "available"
  }
]
```

یا:

```json
{
  "items": []
}
```

## PBF / MBTiles

فرانت مستقیماً `.mbtiles` را نمی‌خواند. باید MBTiles را با یک tile server اجرا کنی و URL قالب PBF بدهی:

```env
VITE_VECTOR_TILE_URL=http://localhost:8080/tiles/{z}/{x}/{y}.pbf
```

بعد از نوار ابزار نقشه یا صفحه‌ی تنظیمات، «جزئیات برداری» / `Vector details` را فعال کن.

> اسم layerهای داخل PBF ممکن است با `road`, `water`, `building` و ... فرق کند. در صورت نیاز `src/components/map/VectorTileLayer.jsx` را مطابق layerهای فایل خودت تغییر بده.

## زبان و کامپوننت‌ها

متن‌های رابط در `src/i18n/messages.js` قرار دارند؛ کلید انگلیسی، متن پیش‌فرض انگلیسی است و ترجمه‌ی فارسی در `messages.fa` نگهداری می‌شود. `LocaleProvider` زبان، `dir` سند، عنوان صفحه، قالب اعداد و جهت Base UI را هماهنگ می‌کند. برای اجزای جدید از `useLocale()` و کلاس‌های منطقی مثل `start`، `end`، `ps`، `pe` و `text-start` استفاده کنید. نام راننده و پلاک، داده‌ی دریافتی هستند و ترجمه نمی‌شوند؛ با `bdi` از متن اطراف جدا می‌شوند.

کامپوننت‌های `src/components/ui` از [رجیستری رسمی shadcn/ui، سبک Base Nova](https://ui.shadcn.com/r/styles/base-nova/sidebar.json) گرفته و برای JavaScript و Tailwind CSS 3 سازگار شده‌اند. [مرجع Sidebar](https://ui.shadcn.com/docs/components/base/sidebar). ترکیب کامپوننت‌ها از API پایه‌ی `render` استفاده می‌کند، برای نمونه `PopoverTrigger render={<Button />}`. رنگ‌ها در `src/index.css` و نگاشت توکن‌ها در `tailwind.config.js` تعریف شده‌اند.

فونت فارسی ساحل با وزن‌های ۳۰۰، ۴۰۰، ۶۰۰، ۷۰۰ و ۹۰۰ در `src/assets/font` و فونت متغیر [Inter](https://rsms.me/inter/) با وزن‌های ۱۰۰ تا ۹۰۰ در `src/assets/font/inter` قرار دارند. تعریف‌های `@font-face` و انتخاب فونت بر اساس `lang` در `src/index.css` هستند؛ کلاس `font-sans` هم از همان انتخاب پیروی می‌کند. فونت‌ها با قالب WOFF2 از فایل‌های خود پروژه بارگذاری می‌شوند. مجوزها در `public/licenses` همراه خروجی build منتشر می‌شوند.

## بررسی

```bash
npm run test
npm run build
```

تست‌های تعاملی React رفتار زبان، فیلترها و سایدبار دسکتاپ و موبایل را در DOM شبیه‌سازی‌شده بررسی می‌کنند. برای بررسی بصری نقشه و اندازه‌های واقعی، پروژه را با `npm run dev` اجرا کنید.
