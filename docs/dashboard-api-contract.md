# قرارداد API داشبورد مدیریت ناوگان

این سند قرارداد پیشنهادی برای پنج سرویس مستقل است. در این مرحله هیچ Endpoint، دیتابیس یا درخواست شبکه جدیدی ساخته نشده است. سرویس‌های فعلی JSON محلی را می‌خوانند و پاسخ نهایی را از مجموعه فیلترشده محاسبه می‌کنند.

## زبان فعلی داشبورد

فعلاً فقط داشبورد جدید (پنج تب Home)، اعداد، تاریخ‌ها، خروجی‌ها و نام‌های Mock به انگلیسی نمایش داده می‌شوند. useDashboardLocale در src/components/dashboard ترجمه ثابت انگلیسی را بدون تغییر زبان سراسری برنامه فراهم می‌کند. Home دارای lang=en و DirectionProvider محلی LTR است. سایدبار، پروفایل، انتخاب زبان و صفحات موجود همچنان از زبان انتخاب‌شده کاربر استفاده می‌کنند. ترجمه‌های فارسی و عربی برای استفاده بعدی حفظ شده‌اند.

## ساختار فایل‌ها

| بخش         | فایل UI                                       | فایل داده مستقل                   | سرویس                             | API آینده                   |
| ----------- | --------------------------------------------- | --------------------------------- | --------------------------------- | --------------------------- |
| نمای کلی    | src/components/dashboard/tabs/OverviewTab.jsx | src/mocks/dashboard/overview.json | overview.service.js / getOverview | GET /api/dashboard/overview |
| وسایل نقلیه | src/components/dashboard/tabs/VehiclesTab.jsx | src/mocks/dashboard/vehicles.json | vehicles.service.js / getVehicles | GET /api/dashboard/vehicles |
| جایگاه‌ها   | src/components/dashboard/tabs/ParkingsTab.jsx | src/mocks/dashboard/parkings.json | parkings.service.js / getParkings | GET /api/dashboard/parkings |
| مسیرها      | src/components/dashboard/tabs/RoutesTab.jsx   | src/mocks/dashboard/routes.json   | routes.service.js / getRoutes     | GET /api/dashboard/routes   |
| گزارش‌ها    | src/components/dashboard/tabs/ReportsTab.jsx  | src/mocks/dashboard/reports.json  | reports.service.js / getReports   | GET /api/dashboard/reports  |

فایل‌های سرویس در src/services/dashboard قرار دارند. هیچ تب از سرویس یا داده تب دیگر استفاده نمی‌کند. DashboardTab، FilterBar، KpiCard، ChartContainer و DataTable اجزای مشترک نمایش هستند؛ analytics.js منطق مستقل از React و mockService.js شبیه‌ساز انتقال پاسخ است.

## امضای سرویس و جایگزینی Mock

امضای هر سرویس:

```js
getOverview(filters, { signal, referenceAt, mockState, delay });
// Promise<DashboardResponse>
```

پس از ساخت بک‌اند، بدنه همان سرویس را با adapter واقعی جایگزین کنید؛ نام تابع و شکل پاسخ حفظ شود. پاسخ ناموفق باید به Error تبدیل شود تا React Query بتواند Error State را نمایش دهد. پارامتر signal باید برای لغو درخواست پشتیبانی شود. کامپوننت نمودار به پاسخ API وابسته است و نیازی به بازنویسی ندارد.

options مربوط به delay و mockState فقط مخصوص Mock هستند و به بک‌اند ارسال نمی‌شوند. در نسخه واقعی، referenceAt ساعت snapshot معتبر سرور است؛ کنترل آزمایشی ساعت می‌تواند در محیط production غیرفعال شود.

## Query Parameters مشترک

| پارامتر                               | نوع / مقدار                           | رفتار                                                                                                |
| ------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| dateFrom, dateTo                      | YYYY-MM-DD با تقویم میلادی            | ابتدا و انتهای روز به‌صورت inclusive در timeZone سفر؛ مقدار خالی بدون محدودیت                        |
| vehicleId                             | شناسه از data.options.vehicles        | تطابق دقیق                                                                                           |
| parkingId                             | شناسه از data.options.parkings        | سفر دارای مبدأ یا مقصد مربوطه؛ برای رویدادها خود جایگاه رویداد                                       |
| originParkingId, destinationParkingId | شناسه جایگاه                          | فیلترهای جهت‌دار و مستقل                                                                             |
| status                                | مقدار وضعیت سفر از جدول زیر           | تطابق دقیق با وضعیت مشتق‌شده در generatedAt                                                          |
| vehicleStatus                         | parked / in_transit / inactive        | وضعیت فعلی ناوگان در snapshot، مخصوص نمای کلی                                                        |
| delayedOnly                           | boolean                               | تأخیر تکمیل‌شده یا تأخیر در مسیر                                                                     |
| trafficType                           | incoming / outgoing؛ مقدار خالی هر دو | مخصوص تردد جایگاه‌ها و گزارش parking_events                                                          |
| search                                | string                                | جست‌وجوی نام، شناسه، پلاک و مسیر؛ حساس نبودن به حروف بزرگ؛ در گزارش رویدادها فقط متن ردیف قابل نمایش |
| reportType                            | مقدار از جدول گزارش‌ها                | مخصوص گزارش‌گیری؛ پیش‌فرض movements                                                                  |
| page                                  | integer >= 1؛ پیش‌فرض 1               | با تعداد صفحات clamp می‌شود                                                                          |
| pageSize                              | 1..100؛ پیش‌فرض 10                    | در UI گزینه‌های 10،20،50،100                                                                         |
| sortBy                                | کلید یکی از ستون‌های نوع جدول         | پیش‌فرض actualDepartureAt؛ برای جایگاه‌ها entries؛ برای رویدادها occurredAt؛ برای عملکردها trips     |
| sortOrder                             | asc / desc؛ پیش‌فرض desc              | null در انتهای جدول                                                                                  |
| exportAll                             | boolean؛ پیش‌فرض false                | برای خروجی تمام ردیف‌های فیلترشده؛ pagination روی آمار و نمودارها اثر ندارد                          |
| referenceAt                           | RFC3339 با Z یا offset                | ساعت snapshot قابل تنظیم؛ پیش‌فرض زمان جاری                                                          |

پارامترهای مجاز هر سرویس:

- overview: dateFrom، dateTo، vehicleId، parkingId، vehicleStatus، search، pagination و sort.
- vehicles: dateFrom، dateTo، vehicleId، status، originParkingId، destinationParkingId، delayedOnly، search، pagination و sort.
- parkings: dateFrom، dateTo، parkingId، trafficType، vehicleId، search، pagination و sort.
- routes: dateFrom، dateTo، originParkingId، destinationParkingId، vehicleId، status، delayedOnly، search، pagination و sort.
- reports: ترکیب تمام فیلترهای سفر، reportType، parkingId و trafficType برای گزارش رویدادها، search، pagination، sort و exportAll.

در آینده شناسه‌های Mock مانند V001 و P01 باید با شناسه‌های واقعی جایگزین شوند؛ UI آن‌ها را string در نظر می‌گیرد. گزینه‌های فیلتر از خود پاسخ سرویس می‌آیند و با نتیجه خالی حذف نمی‌شوند.

## پاسخ استاندارد

```json
{
  "success": true,
  "data": {
    "summary": { "totalTrips": 232, "completedTrips": 224 },
    "charts": {},
    "items": [],
    "options": {
      "vehicles": [
        {
          "id": "V001",
          "title": "Azarakhsh",
          "registration": "IR-2100",
          "active": true
        }
      ],
      "parkings": [
        {
          "id": "P01",
          "name": "Shahid Rajaee Port",
          "active": true,
          "timezone": "Asia/Tehran"
        }
      ],
      "statuses": [
        "completed",
        "completed_delayed",
        "in_transit",
        "delayed_in_transit",
        "scheduled"
      ]
    }
  },
  "meta": {
    "filters": {},
    "generatedAt": "2026-10-10T08:00:00.000Z",
    "timeZone": "Asia/Tehran",
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 232,
      "totalPages": 24
    }
  }
}
```

عددهای مثال فقط snapshot نمونه هستند. همه timestampها RFC3339 و همه مدت‌ها دقیقه عددی (قابل اعشار) هستند. null به معنی نبود داده کافی است و با صفر جایگزین نمی‌شود. items تنها صفحه فعلی است مگر exportAll=true. summary و charts از کل مجموعه فیلترشده و پیش از pagination محاسبه می‌شوند. totalPages برای نتیجه خالی برابر 1 است.

## مدل سفر و محاسبات زمان

```json
{
  "id": "T0001",
  "vehicleId": "V001",
  "originParkingId": "P01",
  "destinationParkingId": "P02",
  "actualDepartureAt": "2026-10-10T06:30:00Z",
  "estimatedArrivalAt": "2026-10-10T07:30:00Z",
  "actualArrivalAt": null,
  "timeZone": "Asia/Tehran"
}
```

| وضعیت              | قاعده                                      |
| ------------------ | ------------------------------------------ |
| scheduled          | ATD وجود ندارد و ATA وجود ندارد            |
| in_transit         | ATD ثبت شده، ATA null و generatedAt <= ETA |
| delayed_in_transit | ATD ثبت شده، ATA null و generatedAt > ETA  |
| completed          | ATA ثبت شده و ATA <= ETA                   |
| completed_delayed  | ATA ثبت شده و ATA > ETA                    |

durationMinutes = (ATA - ATD)/60000 فقط برای سفر تکمیل‌شده؛ elapsedMinutes = (generatedAt - ATD)/60000 فقط برای سفر در جریان؛ estimatedMinutes = (ETA - ATD)/60000؛ delayMinutes = max(0, (ATA یا generatedAt) - ETA)/60000 برای سفر حرکت‌کرده. سفر scheduled تأخیر صفر دارد. ATA بدون ATD، تاریخ نامعتبر و ATA پیش از ATD خطاست.

میانگین مدت واقعی و مقایسه واقعی/تخمینی فقط روی یک cohort از سفرهای تکمیل‌شده محاسبه می‌شود. تعداد تکمیل‌شده هر دو وضعیت completed و completed_delayed را شامل می‌شود. تأخیرها هر دو وضعیت delayed_in_transit و completed_delayed هستند. سفر scheduled در مجموع سفرها وجود دارد اما در تعداد سفرهای جاری یا ورود/خروج قرار نمی‌گیرد.

زمان‌ها ابتدا به instant تبدیل می‌شوند؛ مرز روز، روز هفته، ساعت Heatmap و نمایش جدول با IANA timeZone محاسبه می‌شوند. فیلتر زمانی سفرها روی ATD (برای scheduled روی ETA) است. فیلتر زمانی ورود/خروج روی occurredAt است؛ بنابراین ورود امروز با حرکت دیروز باید در گزارش ورود امروز دیده شود. ETA هرگز یک ورود واقعی یا مدت واقعی نیست.

وضعیت فعلی وسیله از آخرین سفر حرکت‌کرده به‌دست می‌آید. ATA=null یعنی وسیله در مسیر و جایگاه فعلی null است. در غیر این صورت مقصد آخرین سفر، جایگاه فعلی است. وسیله بدون سفر از initialParkingId استفاده می‌کند. active=false وضعیت inactive دارد. در فیلترهای مربوط به سفر، ناوگان به وسایل شرکت‌کننده در cohort محدود می‌شود؛ زمان توقف فعلی به متوسط توقف کامل اضافه نمی‌شود.

مدت توقف معتبر از ATA یک سفر تا ATD اولین سفر بعدی همان وسیله استخراج می‌شود، تنها اگر مقصد قبلی با مبدأ بعدی یکی باشد. سفر بعدی می‌تواند بیرون از بازه گزارش باشد، چون نقش شاهد پایان توقف را دارد. در تحلیل جایگاه‌ها، توقف باید با یکی از رویدادهای فیلترشده ورود یا خروج همان جایگاه مرتبط باشد. بدون شاهد معتبر، averageStopMinutes=null است.

## Summary هر Endpoint

تمام سرویس‌ها می‌توانند Summary مشترک کامل را برگردانند؛ UI فیلدهای موردنیاز تب را مصرف می‌کند:

| Endpoint | KPIهای مصرف‌شده                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| overview | totalVehicles، parkedVehicles، inTransitVehicles، completedTrips، delayedTrips، activeParkings                                             |
| vehicles | activeVehicles، totalTrips، averageDurationMinutes، inTransitVehicles، delayedTrips، averageStopMinutes                                    |
| parkings | activeParkings، totalEntries، totalExits، stationedVehicles، averageStopMinutes                                                            |
| routes   | totalTrips، activeRoutes، inTransitTrips، averageDurationMinutes، delayedTrips                                                             |
| reports  | totalTrips، completedTrips، inTransitTrips، delayedTrips؛ برای parking_events: totalEntries، totalExits، activeParkings، stationedVehicles |

فیلدهای اضافی Summary مشترک: activeVehicles، parkedVehicles، inTransitVehicles، totalVehicles و تمام فیلدهای جدول بالا. شمارش‌ها عدد صحیح غیرمنفی‌اند. averageDurationMinutes و averageStopMinutes عدد یا null هستند. activeRoutes تعداد زوج‌های مبدأ/مقصد در cohort است. activeParkings تعداد جایگاه‌های فعال دارای تردد یا وسیله مستقر در cohort است. A→B با B→A یکی نیست. مجموع وسیله مستقر فقط وضعیت parked را شامل می‌شود.

## قرارداد داده نمودارها

نمودارها داده معنایی دریافت می‌کنند؛ تنظیمات ECharts در لایه UI ساخته می‌شود.

| کلید                                            | شکل داده                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| tripsByDay، vehicleTrend، delayTrend            | Array<{date: YYYY-MM-DD, trips: number, delays: number}>                                                                               |
| vehicleStatus                                   | Array<{status: parked/in_transit/inactive, value: number}>                                                                             |
| parkingTraffic، parkingRanking، parkedByParking | آرایه ردیف‌های عملکرد جایگاه (ساختار زیر)                                                                                              |
| parkingTrend                                    | Array<{date: YYYY-MM-DD, entries: number, exits: number}>                                                                              |
| heatmap                                         | Array<{day: 0..6, hour: 0..23, value: number}>؛ روز 0 شنبه                                                                             |
| vehicleTrips، vehicleRanking                    | آرایه عملکرد وسیله (ساختار زیر)                                                                                                        |
| routeTraffic، routeDuration                     | آرایه عملکرد مسیر (ساختار زیر)                                                                                                         |
| durationComparison                              | آرایه عملکرد وسیله؛ در routes آرایه عملکرد مسیر؛ هر دو averageDurationMinutes و estimatedMinutes از سفرهای تکمیل‌شده                   |
| sankey                                          | {nodes: Array<{name: string, label: string, side: origin/destination}>, links: Array<{source: string, target: string, value: number}>} |

sankey برای جلوگیری از چرخه، نام گره‌های مبدأ را origin:P01 و مقصد را destination:P01 قرار می‌دهد. این دو گره به یک جایگاه واقعی اشاره می‌کنند اما دو ستون جدا هستند. تعداد جریان به‌ازای هر زوج جهت‌دار از مجموعه فیلترشده به‌دست می‌آید.

نمودارهای هر Endpoint:

- overview: tripsByDay، vehicleStatus، parkingTraffic، routeTraffic.
- vehicles: vehicleTrips، vehicleTrend، durationComparison، vehicleStatus، vehicleRanking. vehicleTrend بدون انتخاب vehicleId پیام انتخاب وسیله نشان می‌دهد.
- parkings: parkingTraffic، parkingTrend، heatmap، parkingRanking، parkedByParking.
- routes: sankey، routeTraffic، routeDuration، durationComparison، delayTrend.
- reports: بسته به reportType؛ رویدادها parkingTraffic/parkingTrend، عملکرد وسیله vehicleTrips/durationComparison، عملکرد مسیر routeTraffic/routeDuration، تأخیرها delayTrend/routeTraffic، بقیه tripsByDay/routeTraffic.

هر سری باید مستقل از page/pageSize باشد. interactive Legend، Tooltip، zoom و پنجره بزرگ‌نمایی از ECharts استفاده می‌کنند. کلیک روی ستون جایگاه همان parkingId را انتخاب می‌کند. PNG از وضعیت فعلی نمودار فیلترشده گرفته می‌شود.

## ساختار جدول‌ها

### سفر (overview، vehicles، routes و اکثر گزارش‌ها)

فیلدهای پایه مدل سفر به‌علاوه vehicleTitle، registration، originName، destinationName، status، completed:boolean، delayed:boolean، durationMinutes:number|null، elapsedMinutes:number|null، estimatedMinutes:number|null و delayMinutes:number. برای مشاهده جزئیات وسیله از مسیر موجود /ships/:id استفاده می‌شود.

### عملکرد جایگاه

{id، parkingName، timeZone، active، entries، exits، stationed، averageStopMinutes:number|null، lastEntryAt:string|null، lastExitAt:string|null}. lastEntryAt/lastExitAt فقط از رویدادهای واقعی و فیلترشده محاسبه می‌شوند. پروژه فعلی صفحه جزئیات مجزای جایگاه ندارد؛ نام جایگاه به فهرست موجود /port با فیلتر نام می‌رود. صفحه جدیدی دوباره‌سازی نشده است.

### رویداد جایگاه

{id، tripId، vehicleId، vehicleTitle، registration، parkingId، parkingName، type:incoming|outgoing، occurredAt، timeZone}. هر ATD یک خروج و هر ATA یک ورود ایجاد می‌کند. ETA هیچ رویدادی ایجاد نمی‌کند.

### عملکرد مسیر

{id:originId→destinationId، originParkingId، destinationParkingId، originName، destinationName، routeName، trips، completedTrips، averageDurationMinutes:number|null، estimatedMinutes:number|null، delayedTrips}.

### عملکرد وسیله

{id:vehicleId، vehicleId، vehicleTitle، registration، trips، completedTrips، averageDurationMinutes:number|null، estimatedMinutes:number|null، delayedTrips}.

## گزارش‌ها و خروجی

| reportType          | ردیف‌ها                             |
| ------------------- | ----------------------------------- |
| movements           | تمام سفرهای منطبق با فیلترها        |
| parking_events      | رویدادهای واقعی ورود/خروج           |
| completed           | سفرهای تکمیل‌شده به‌موقع و تأخیردار |
| in_transit          | سفرهای حرکت‌کرده بدون ATA           |
| delays              | سفرهای تأخیردار جاری و تکمیل‌شده    |
| route_performance   | تجمیع بر زوج جهت‌دار مبدأ/مقصد      |
| vehicle_performance | تجمیع بر vehicleId                  |

جست‌وجو قبل از تجمیع اعمال می‌شود؛ آمار هر مسیر/وسیله از سفرهای منطبق با تمام فیلترها محاسبه می‌شود. مرتب‌سازی پس از تجمیع و قبل از pagination انجام می‌شود. انتخاب ستون‌ها در UI با visibleColumns نگهداری می‌شود و جزو query الزامی API نیست.

برای خروجی، سرویس با همان filters، sort و referenceAt=response.meta.generatedAt فراخوانی می‌شود تا کل خروجی مربوط به همان snapshot نمایش‌داده‌شده باشد. exportAll=true فقط pagination ردیف‌ها را کنار می‌گذارد. CSV با UTF-8 BOM و escaping فرمول تولید می‌شود. XLSX ستون‌ها، مقادیر عددی، جهت sheet مطابق زبان فعال و sheet جداگانه Filters دارد. PDF همه ردیف‌ها را در چند صفحه landscape، با هدر تکرارشونده، شماره صفحه و متن فارسی رندر می‌کند. PDF فعلی raster است؛ متن آن قابل جست‌وجو نیست. PNG از منوی هر نمودار دانلود می‌شود. بدون نتیجه یا هنگام دریافت پاسخ، دکمه‌های خروجی غیرفعال‌اند.

## قرارداد Loading / Error / Empty

- Loading وضعیت کلاینت است و پاسخ API جداگانه ندارد؛ Skeleton مستقل برای تب فعال نمایش داده می‌شود. هنگام تغییر فیلتر داده قبلی با aria-busy نگهداری می‌شود تا پاسخ جدید برسد.
- Error: Promise سرویس reject می‌شود؛ تب فعال پیام و دکمه Retry دارد. API آینده باید پاسخ نمونه {success:false,error:{code:'DASHBOARD_LOAD_FAILED',message:'...',retryable:true}} را به خطای قابل نمایش تبدیل کند. تاریخ شروع بعد از پایان یک خطای اعتبارسنجی است.
- Empty پاسخ موفق با items=[]، totalItems=0، summary شمارشی صفر، متوسط‌ها null و سری‌های خالی است؛ options کامل باقی می‌ماند تا فیلترها قابل اصلاح باشند. current fleet هم با cohort خالی محدود می‌شود. reset فیلترها بازگشت به داده را ممکن می‌کند.
- Abort لغو درخواست قبلی هنگام تغییر فیلتر یا تب است و نباید به‌عنوان خطای عملیاتی نمایش داده شود.

Query key هر تب مستقل است؛ retry و refresh یک تب داده سایر تب‌ها را تغییر نمی‌دهد. تب و فیلترهای هر تب در URL نگهداری می‌شوند، برای مثال /?tab=vehicles&vehicles.vehicleId=V001&vehicles.delayedOnly=true. تغییر تب reload ایجاد نمی‌کند. کلیدهای URL با پیشوند تب مستقل هستند؛ فیلتر و ستون‌های هر تب با رفت‌وبرگشت حفظ می‌شوند.

## طراحی Mock و ساعت قابل تنظیم

هر JSON پاسخ snapshot اولیه معتبر و کامل دارد و علاوه بر قرارداد خروجی، data.trips و catalog محلی را برای شبیه‌سازی محاسبات نگهداری می‌کند. این فیلدهای منبع در API واقعی الزامی نیستند. تمام فایل‌ها مستقل و قابل جایگزینی‌اند؛ اشتراک شناسه‌ها به معنی خواندن از فایل تب دیگر نیست.

meta.referenceAt فقط مبنای انتقال زمان fixture است. تمام ATD/ETA/ATA در خواندن به اندازه generatedAt - referenceAt جابه‌جا می‌شوند؛ به همین دلیل تاریخ قدیمی fixture سناریوی در مسیر را منقضی نمی‌کند. default generatedAt زمان واقعی هر فراخوانی است، UI هر 60 ثانیه refresh می‌کند و refresh دستی نیز دارد. کنترل ساعت در پایین Home زمان محلی تهران را با offset +03:30 ذخیره می‌کند. URL با referenceAt دارای Z یا offset برای snapshot تکرارپذیر قابل تنظیم است. با ساعت دستی، refresh خودکار غیرفعال است.

برای بررسی وضعیت‌ها: /?mockState=error، /?mockState=empty و /?mockState=loading (تأخیر شش ثانیه‌ای). این حالت‌ها فقط رفتار Mock را تغییر می‌دهند. mockState=empty عمداً catalog را هم حذف می‌کند؛ Empty ناشی از فیلتر عادی، catalog کامل را حفظ می‌کند.

لینک جزئیات Mock دارای mock=dashboard است و صفحه موجود را با داده Navigation State باز می‌کند؛ queryهای واقعی جزئیات برای این حالت غیرفعال‌اند. بازگشت به Home و URL فیلترها از helper ناوبری موجود استفاده می‌کند. ورود معمول به صفحات موجود همچنان رفتار قبلی پروژه را دارد.

## بررسی و اجرای محلی

- npm test: آزمون‌های زمان، status، aggregate، فیلتر، pagination، سازگاری JSONهای مستقل و خروجی واقعی CSV/XLSX.
- npm run build: بررسی production bundle.
- npm run dev: اجرای پروژه با تنظیم فعلی Vite؛ صفحه / و /?tab=routes برای بررسی نمودارها.

کتابخانه‌های افزوده‌شده echarts، exceljs و jspdf هستند. نمودارها و کتابخانه‌های خروجی به‌صورت lazy بارگذاری می‌شوند. dependency جدید uuid مربوط به ExcelJS به نسخه اصلاح‌شده 11.1.1 یا بالاتر override شده است. ایرادهای lint سراسری در کامپوننت‌های قدیمی UI/context و vite.config.js خارج از این تغییرند؛ lint فایل‌های داشبورد و فایل‌های اصلاح‌شده باید موفق باشد. بررسی بصری مرورگر و PDF/PNG به مرورگر متصل نیاز دارد؛ در جلسه پیاده‌سازی مرورگری در دسترس نبود.
