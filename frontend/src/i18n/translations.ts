export const translations = {
  en: {
    // Daily Content
    verseOfTheDay: 'Verse of the Day',
    hadithOfTheDay: 'Hadith of the Day',
    defaultHadithText: 'The key to Paradise is prayer, and the key to prayer is cleanliness.',
    defaultHadithSource: 'Ahmad',
    
    // Hijri Months
    hijriMonths: [
      'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ],
    
    // Navigation
    home: 'Home',
    prayerTimes: 'Prayer Times',
    settings: 'Settings',
    
    // Home Page
    quickActions: 'Quick Actions',
    qiblaDirection: 'Qibla Direction',
    prayerTracker: 'Prayer Tracker',
    nearbyMosques: 'Nearby Mosques',
    dailyDhikr: 'Daily Dhikr',
    nextPrayer: 'Next Prayer',
    
    // Prayer Times
    muslimPrayerTimes: 'Muslim Prayer Times',
    enterCityOrLocation: 'Enter a city or use your location',
    searchCity: 'Search for a city...',
    selectCityForPrayerTimes: 'Select your city for prayer times',
    useMyLocation: 'Use My Location',
    notificationsEnabled: 'Prayer notifications are enabled',
    previousDay: 'Previous Day',
    nextDay: 'Next Day',
    today: 'Today',
    
    // Prayer Names
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    
    // Qibla & Mosques
    qiblaRequiresMobile: 'The Qibla compass requires a mobile device with motion sensors',
    locationPermissionDenied: 'Location permission was denied',
    compassError: 'Error accessing compass',
    calibratingCompass: 'Calibrating compass...',
    calibrationInstructions: 'Move your phone in a figure-8 pattern to calibrate the compass',
    magnetometerUnavailable: 'Magnetometer is not available on this device',
    currentHeading: 'Heading',
    qiblaAngle: 'Qibla',
    relativeAngle: 'Relative',
    qiblaInstructions: 'Hold your phone flat and rotate until the green arrow points to the red indicator at the top',
    aligned: 'Aligned',
    rotate: 'Rotate',
    calibrating: 'Calibrating',
    fromNorth: 'from North',
    yourHeading: 'Your heading',
    calibrateCompass: 'Move your phone in a figure-8 to calibrate the compass',
    alignKaabaTip: "Turn until the Ka'bah icon points straight up to face Qibla",
    gettingLocation: 'Getting your location...',
    locationPermissionRequired: 'Location permission is required to find nearby mosques',
    errorFindingMosques: 'Error finding nearby mosques',
    milesAway: 'miles away',
    directions: 'Directions',
    call: 'Call',
    website: 'Website',
    findingMosques: 'Finding nearby mosques...',
    found: 'Found',
    mosquesNearby: 'mosques nearby',
    retry: 'Retry',
    chooseNavigationApp: 'Choose Navigation App',
    selectAppForDirections: 'Select an app for directions',
    openNow: 'Open now',
    closed: 'Closed',
    
    // Prayer Tracker
    prayerTrackerTitle: 'Prayer Tracker',
    prayersCompleted: 'prayers completed',
    markCompleted: 'Mark as completed',
    markMissed: 'Mark as missed',
    resetPrayer: 'Reset',
    howToUse: 'How to use',
    tapOnceComplete: 'Tap once to mark as completed ✓',
    tapTwiceMissed: 'Tap twice to mark as missed ✗',
    tapThirdReset: 'Tap third time to reset ○',
    
    // Daily Dhikr
    dailyDhikrTitle: 'Daily Dhikr',
    remembranceOfAllah: 'Remembrance of Allah',
    totalDhikr: 'Total',
    tapToCount: 'Tap to Count',
    completed: 'Completed!',
    resetCounter: 'Reset Counter',
    reward: 'Reward',
    
    // Settings
    customizePreferences: 'Customize your app preferences',
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    receivePrayerAlerts: 'Receive prayer time alerts',
    adhanSound: 'Adhan Sound',
    playAdhanAtPrayerTimes: 'Play adhan at prayer times',
    vibrate: 'Vibrate',
    vibrateWithNotifications: 'Vibrate with notifications',
    prePrayerReminder: 'Pre-prayer Reminder',
    
    // Appearance
    appearance: 'Appearance',
    theme: 'Theme',
    choosePreferredAppearance: 'Choose your preferred appearance',
    language: 'Language',
    selectPreferredLanguage: 'Select your preferred language',
    showHijriDates: 'Show Hijri Dates',
    displayIslamicCalendarDates: 'Display Islamic calendar dates',
    timeFormat: 'Time Format',
    chooseTimeDisplay: 'Choose how times are displayed',
    
    // Theme Options
    light: 'Light',
    dark: 'Dark',
    systemDefault: 'System Default',
    
    // Time Format Options
    '24hour': '24-hour',
    '12hour': '12-hour',
    
    // Prayer Calculations
    prayerCalculations: 'Prayer Calculations',
    calculationMethod: 'Calculation Method',
    calculationMethodDesc: 'Different methods may show slight time variations',
    autoLocationMethod: 'Auto Location Method',
    autoLocationMethodDesc: 'Automatically use the best method for your location',
    recommendedForYourLocation: 'Recommended for your location',
    calculationMethodUpdated: 'Calculation Method Updated',
    calculationMethodUpdatedDesc: 'Prayer calculation method has been automatically updated for better accuracy in this region.',
    apply: 'Apply',
    calculationMethods: {
      mwl: 'Muslim World League (Recommended)',
      isna: 'Islamic Society of North America',
      egypt: 'Egyptian General Authority',
      makkah: 'Umm Al-Qura University (Saudi)',
      karachi: 'University of Islamic Sciences (Pakistan)',
    },
    methodForCalculating: 'Method for calculating prayer times',
    madhab: 'Madhab (Asr Calculation)',
    schoolOfThought: 'School of thought for Asr prayer',
    
    // Calculation Methods
    muslimWorldLeague: 'Muslim World League',
    isna: 'Islamic Society of North America',
    egyptianGeneralAuthority: 'Egyptian General Authority',
    ummAlQura: 'Umm Al-Qura University',
    universityOfKarachi: 'University of Islamic Sciences, Karachi',
    
    // Madhab Options
    shafiMalikiHanbali: 'Shafi\'i, Maliki, Hanbali',
    hanafi: 'Hanafi',
    
    // Location
    location: 'Location',
    useGPSLocation: 'Use GPS Location',
    automaticallyDetectLocation: 'Automatically detect location',
    currentLocation: 'Current Location',
    selectedLocation: 'Selected Location',
    locationNotSet: 'Location Not Set',
    changeLocation: 'Change Location',
    useGPS: 'Use GPS',
    city: 'City',
    
    // Common
    save: 'Save',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    done: 'Done',
    select: 'Select',
    search: 'Search',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    pleaseEnterCityName: 'Please enter a city name',
    invalidCityName: 'Please enter a valid city',
    validationError: 'Error validating city name',
    popularCities: 'Popular Cities',
    searching: 'Searching...',
    invalidLocation: 'Invalid Location',
    
    // Time
    minutesBefore: 'minutes before',
    
    // Messages
    settingsSaved: 'Settings Saved',
    preferencesUpdated: 'Your preferences have been updated.',
    ok: 'OK',
    loadingPrayerTimes: 'Loading prayer times...',
    unableToGetPrayerTimes: 'Unable to get prayer times. Please check your internet connection and try again.',
    unableToDetermineNextPrayer: 'Unable to determine next prayer time.',
    permissionToAccessLocationDenied: 'Permission to access location was denied.',
    couldNotDetermineLocation: 'Could not determine prayer times for your location.',
    failedToGetLocation: 'Failed to get location or prayer times.',
    cityNotFound: 'City not found. Please try another city.',
    couldNotFetchPrayerTimes: 'Could not fetch prayer times. Please check your connection.',
    
    // Picker Titles
    selectTheme: 'Select Theme',
    selectLanguage: 'Select Language',
    selectTimeFormat: 'Select Time Format',
    selectCalculationMethod: 'Select Calculation Method',
    selectMadhab: 'Select Madhab',
    
    // Support
    support: 'Support',
    contactSupport: 'Contact Support',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    appVersion: 'App Version',
  },
  
  ar: {
    // Daily Content
    verseOfTheDay: 'آية اليوم',
    hadithOfTheDay: 'حديث اليوم',
    defaultHadithText: 'مفتاح الجنة الصلاة ومفتاح الصلاة الطهارة.',
    defaultHadithSource: 'أحمد',
    
    // Hijri Months
    hijriMonths: [
      'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
      'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
      'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ],
    
    // Navigation
    home: 'الرئيسية',
    prayerTimes: 'أوقات الصلاة',
    settings: 'الإعدادات',
    
    // Home Page
    quickActions: 'الإجراءات السريعة',
    qiblaDirection: 'اتجاه القبلة',
    prayerTracker: 'متتبع الصلاة',
    nearbyMosques: 'المساجد القريبة',
    dailyDhikr: 'الذكر اليومي',
    nextPrayer: 'الصلاة التالية',
    
    // Prayer Times
    muslimPrayerTimes: 'أوقات الصلاة الإسلامية',
    enterCityOrLocation: 'أدخل المدينة أو استخدم موقعك',
    searchCity: 'البحث عن مدينة...',
    selectCityForPrayerTimes: 'اختر مدينتك لأوقات الصلاة',
    useMyLocation: 'استخدم موقعي',
    notificationsEnabled: 'إشعارات الصلاة مفعلة',
    previousDay: 'اليوم السابق',
    nextDay: 'اليوم التالي',
    today: 'اليوم',
    
    // Prayer Names
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    
    // Qibla & Mosques
    qiblaRequiresMobile: 'بوصلة القبلة تتطلب جهازاً محمولاً مع حساسات الحركة',
    locationPermissionDenied: 'تم رفض إذن الموقع',
    compassError: 'خطأ في الوصول إلى البوصلة',
    calibratingCompass: 'معايرة البوصلة...',
    calibrationInstructions: 'حرك هاتفك في شكل رقم 8 لمعايرة البوصلة',
    magnetometerUnavailable: 'المقياس المغناطيسي غير متوفر على هذا الجهاز',
    currentHeading: 'الاتجاه',
    qiblaAngle: 'القبلة',
    relativeAngle: 'النسبي',
    qiblaInstructions: 'أمسك هاتفك بشكل مسطح ودوره حتى يشير السهم الأخضر إلى المؤشر الأحمر في الأعلى',
    aligned: 'متوازي',
    rotate: 'دوّر',
    calibrating: 'معايرة',
    fromNorth: 'من الشمال',
    yourHeading: 'اتجاهك',
    calibrateCompass: 'حرك هاتفك في شكل رقم 8 لمعايرة البوصلة',
    alignKaabaTip: 'استدر حتى تشير أيقونة الكعبة مباشرة إلى الأعلى لمواجهة القبلة',
    gettingLocation: 'الحصول على موقعك...',
    locationPermissionRequired: 'إذن الموقع مطلوب للعثور على المساجد القريبة',
    errorFindingMosques: 'خطأ في العثور على المساجد القريبة',
    milesAway: 'ميل',
    directions: 'الاتجاهات',
    call: 'اتصال',
    website: 'الموقع الإلكتروني',
    findingMosques: 'البحث عن المساجد القريبة...',
    found: 'وُجد',
    mosquesNearby: 'مساجد قريبة',
    retry: 'إعادة المحاولة',
    chooseNavigationApp: 'اختر تطبيق الملاحة',
    selectAppForDirections: 'اختر تطبيقاً للاتجاهات',
    openNow: 'مفتوح الآن',
    closed: 'مغلق',
    
    // Settings
    customizePreferences: 'خصص تفضيلات التطبيق',
    notifications: 'الإشعارات',
    enableNotifications: 'تفعيل الإشعارات',
    receivePrayerAlerts: 'تلقي تنبيهات أوقات الصلاة',
    adhanSound: 'صوت الأذان',
    playAdhanAtPrayerTimes: 'تشغيل الأذان في أوقات الصلاة',
    vibrate: 'الاهتزاز',
    vibrateWithNotifications: 'الاهتزاز مع الإشعارات',
    prePrayerReminder: 'تذكير ما قبل الصلاة',
    
    // Appearance
    appearance: 'المظهر',
    theme: 'السمة',
    choosePreferredAppearance: 'اختر المظهر المفضل',
    language: 'اللغة',
    selectPreferredLanguage: 'اختر اللغة المفضلة',
    showHijriDates: 'عرض التواريخ الهجرية',
    displayIslamicCalendarDates: 'عرض تواريخ التقويم الإسلامي',
    timeFormat: 'تنسيق الوقت',
    chooseTimeDisplay: 'اختر كيفية عرض الأوقات',
    
    // Theme Options
    light: 'فاتح',
    dark: 'داكن',
    systemDefault: 'افتراضي النظام',
    
    // Time Format Options
    '24hour': '24 ساعة',
    '12hour': '12 ساعة',
    
    // Prayer Calculations
    prayerCalculations: 'حسابات الصلاة',
    calculationMethod: 'طريقة الحساب',
    calculationMethodDesc: 'قد تُظهر الطرق المختلفة اختلافات طفيفة في التوقيت',
    autoLocationMethod: 'طريقة الموقع التلقائية',
    autoLocationMethodDesc: 'استخدم تلقائياً أفضل طريقة لموقعك',
    recommendedForYourLocation: 'موصى به لموقعك',
    calculationMethodUpdated: 'تم تحديث طريقة الحساب',
    calculationMethodUpdatedDesc: 'تم تحديث طريقة حساب الصلاة تلقائياً للحصول على دقة أفضل في هذه المنطقة.',
    apply: 'تطبيق',
    calculationMethods: {
      mwl: 'رابطة العالم الإسلامي (موصى بها)',
      isna: 'الجمعية الإسلامية لأمريكا الشمالية',
      egypt: 'الهيئة المصرية العامة للمساحة',
      makkah: 'جامعة أم القرى (السعودية)',
      karachi: 'جامعة العلوم الإسلامية (باكستان)',
    },
    methodForCalculating: 'طريقة حساب أوقات الصلاة',
    madhab: 'المذهب (حساب العصر)',
    schoolOfThought: 'المدرسة الفقهية لصلاة العصر',
    
    // Calculation Methods
    muslimWorldLeague: 'رابطة العالم الإسلامي',
    isna: 'الجمعية الإسلامية لأمريكا الشمالية',
    egyptianGeneralAuthority: 'الهيئة العامة المصرية للمساحة',
    ummAlQura: 'جامعة أم القرى',
    universityOfKarachi: 'جامعة العلوم الإسلامية، كراتشي',
    
    // Madhab Options
    shafiMalikiHanbali: 'الشافعي، المالكي، الحنبلي',
    hanafi: 'الحنفي',
    
    // Location
    location: 'الموقع',
    useGPSLocation: 'استخدم موقع GPS',
    automaticallyDetectLocation: 'كشف الموقع تلقائياً',
    currentLocation: 'الموقع الحالي',
    selectedLocation: 'الموقع المحدد',
    locationNotSet: 'لم يتم تحديد الموقع',
    changeLocation: 'تغيير الموقع',
    useGPS: 'استخدم GPS',
    city: 'المدينة',
    
    // Common
    save: 'حفظ',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    done: 'تم',
    select: 'اختر',
    search: 'بحث',
    refresh: 'تحديث',
    refreshing: 'جاري التحديث...',
    pleaseEnterCityName: 'يرجى إدخال اسم المدينة',
    invalidCityName: 'يرجى إدخال مدينة صحيحة',
    validationError: 'خطأ في التحقق من اسم المدينة',
    popularCities: 'المدن الشائعة',
    searching: 'جاري البحث...',
    invalidLocation: 'موقع غير صالح',
    
    // Time
    minutesBefore: 'دقائق قبل',
    
    // Messages
    settingsSaved: 'تم حفظ الإعدادات',
    preferencesUpdated: 'تم تحديث تفضيلاتك.',
    ok: 'موافق',
    loadingPrayerTimes: 'تحميل أوقات الصلاة...',
    unableToGetPrayerTimes: 'غير قادر على الحصول على أوقات الصلاة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
    unableToDetermineNextPrayer: 'غير قادر على تحديد وقت الصلاة التالية.',
    permissionToAccessLocationDenied: 'تم رفض إذن الوصول إلى الموقع.',
    couldNotDetermineLocation: 'لا يمكن تحديد أوقات الصلاة لموقعك.',
    failedToGetLocation: 'فشل في الحصول على الموقع أو أوقات الصلاة.',
    cityNotFound: 'المدينة غير موجودة. يرجى تجربة مدينة أخرى.',
    couldNotFetchPrayerTimes: 'لا يمكن جلب أوقات الصلاة. يرجى التحقق من الاتصال.',
    
    // Picker Titles
    selectTheme: 'اختر السمة',
    selectLanguage: 'اختر اللغة',
    selectTimeFormat: 'اختر تنسيق الوقت',
    selectCalculationMethod: 'اختر طريقة الحساب',
    selectMadhab: 'اختر المذهب',
    
    // Support
    support: 'الدعم',
    contactSupport: 'اتصل بالدعم',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    appVersion: 'إصدار التطبيق',
  },
  
  ur: {
    // Daily Content
    verseOfTheDay: 'آج کی آیت',
    hadithOfTheDay: 'آج کی حدیث',
    defaultHadithText: 'جنت کی چابی نماز ہے اور نماز کی چابی طہارت ہے۔',
    defaultHadithSource: 'احمد',
    
    // Hijri Months
    hijriMonths: [
      'محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی',
      'جمادی الاولیٰ', 'جمادی الثانیہ', 'رجب', 'شعبان',
      'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'
    ],
    
    // Navigation
    home: 'ہوم',
    prayerTimes: 'نماز کے اوقات',
    settings: 'سیٹنگز',
    
    // Home Page
    quickActions: 'فوری کارروائیاں',
    qiblaDirection: 'قبلہ کی سمت',
    prayerTracker: 'نماز ٹریکر',
    nearbyMosques: 'قریبی مساجد',
    dailyDhikr: 'روزانہ ذکر',
    nextPrayer: 'اگلی نماز',
    
    // Prayer Times
    muslimPrayerTimes: 'مسلم نماز کے اوقات',
    enterCityOrLocation: 'شہر داخل کریں یا اپنا مقام استعمال کریں',
    searchCity: 'شہر تلاش کریں...',
    selectCityForPrayerTimes: 'نماز کے اوقات کے لیے اپنا شہر منتخب کریں',
    useMyLocation: 'میرا مقام استعمال کریں',
    notificationsEnabled: 'نماز کی اطلاعات فعال ہیں',
    previousDay: 'پچھلا دن',
    nextDay: 'اگلا دن',
    today: 'آج',
    
    // Prayer Names
    fajr: 'فجر',
    sunrise: 'طلوع آفتاب',
    dhuhr: 'ظہر',
    asr: 'عصر',
    maghrib: 'مغرب',
    isha: 'عشاء',
    
    // Qibla & Mosques
    qiblaRequiresMobile: 'قبلہ کمپاس کے لیے حرکت کے سینسرز والے موبائل ڈیوائس درکار ہے',
    locationPermissionDenied: 'مقام کی اجازت مسترد کر دی گئی',
    compassError: 'کمپاس تک رسائی میں خرابی',
    calibratingCompass: 'کمپاس کیلیبریٹ کر رہے ہیں...',
    calibrationInstructions: 'کمپاس کیلیبریٹ کرنے کے لیے اپنا فون آٹھ کی شکل میں حرکت دیں',
    magnetometerUnavailable: 'اس ڈیوائس پر میگنیٹومیٹر دستیاب نہیں ہے',
    currentHeading: 'سمت',
    qiblaAngle: 'قبلہ',
    relativeAngle: 'نسبتی',
    qiblaInstructions: 'اپنا فون فلیٹ پکڑیں اور اسے اس وقت تک گھمائیں جب تک کہ سبز تیر اوپر سرخ اشارے کی طرف نہ ہو',
    aligned: 'برابر',
    rotate: 'گھمائیں',
    calibrating: 'کیلیبریٹ کر رہے ہیں',
    fromNorth: 'شمال سے',
    yourHeading: 'آپ کی سمت',
    calibrateCompass: 'کمپاس کیلیبریٹ کرنے کے لیے اپنا فون آٹھ کی شکل میں حرکت دیں',
    alignKaabaTip: 'اس وقت تک گھمائیں جب تک کہ کعبہ کا آئیکن سیدھا اوپر قبلہ کی طرف نہ ہو',
    gettingLocation: 'آپ کا مقام حاصل کر رہے ہیں...',
    
    // Settings
    customizePreferences: 'ایپ کی ترجیحات کو اپنی مرضی کے مطابق بنائیں',
    notifications: 'اطلاعات',
    enableNotifications: 'اطلاعات فعال کریں',
    receivePrayerAlerts: 'نماز کے وقت کی تنبیہات حاصل کریں',
    adhanSound: 'اذان کی آواز',
    playAdhanAtPrayerTimes: 'نماز کے اوقات میں اذان بجائیں',
    vibrate: 'کمپن',
    vibrateWithNotifications: 'اطلاعات کے ساتھ کمپن',
    prePrayerReminder: 'نماز سے پہلے یاد دہانی',
    
    // Appearance
    appearance: 'ظاہری شکل',
    theme: 'تھیم',
    choosePreferredAppearance: 'اپنی پسندیدہ ظاہری شکل منتخب کریں',
    language: 'زبان',
    selectPreferredLanguage: 'اپنی پسندیدہ زبان منتخب کریں',
    showHijriDates: 'ہجری تاریخیں دکھائیں',
    displayIslamicCalendarDates: 'اسلامی کیلنڈر کی تاریخیں دکھائیں',
    timeFormat: 'وقت کا فارمیٹ',
    chooseTimeDisplay: 'وقت کیسے دکھایا جائے منتخب کریں',
    
    // Theme Options
    light: 'روشن',
    dark: 'تاریک',
    systemDefault: 'سسٹم ڈیفالٹ',
    
    // Time Format Options
    '24hour': '24 گھنٹے',
    '12hour': '12 گھنٹے',
    
    // Prayer Calculations
    prayerCalculations: 'نماز کے حسابات',
    calculationMethod: 'حساب کا طریقہ',
    calculationMethodDesc: 'مختلف طریقے وقت میں معمولی تبدیلیاں دکھا سکتے ہیں',
    autoLocationMethod: 'خودکار مقام کا طریقہ',
    autoLocationMethodDesc: 'آپ کے مقام کے لیے بہترین طریقہ خودکار استعمال کریں',
    recommendedForYourLocation: 'آپ کے مقام کے لیے تجویز کردہ',
    calculationMethodUpdated: 'حساب کا طریقہ اپ ڈیٹ ہوا',
    calculationMethodUpdatedDesc: 'اس علاقے میں بہتر درستگی کے لیے نماز کا حساب کتاب خودکار طور پر اپ ڈیٹ کر دیا گیا ہے۔',
    apply: 'لاگو کریں',
    calculationMethods: {
      mwl: 'مسلم ورلڈ لیگ (تجویز کردہ)',
      isna: 'اسلامک سوسائٹی آف نارتھ امریکہ',
      egypt: 'مصری جنرل اتھارٹی',
      makkah: 'جامعہ ام القریٰ (سعودی)',
      karachi: 'جامعہ علوم اسلامیہ (پاکستان)',
    },
    methodForCalculating: 'نماز کے اوقات کیلئے حساب کا طریقہ',
    madhab: 'مذہب (عصر کا حساب)',
    schoolOfThought: 'عصر کی نماز کیلئے فقہی مکتب',
    
    // Calculation Methods
    muslimWorldLeague: 'رابطہ عالم اسلامی',
    isna: 'اسلامک سوسائٹی آف نارتھ امریکہ',
    egyptianGeneralAuthority: 'مصری جنرل اتھارٹی',
    ummAlQura: 'جامعہ ام القریٰ',
    universityOfKarachi: 'جامعہ علوم اسلامیہ، کراچی',
    
    // Madhab Options
    shafiMalikiHanbali: 'شافعی، مالکی، حنبلی',
    hanafi: 'حنفی',
    
    // Location
    location: 'مقام',
    useGPSLocation: 'GPS مقام استعمال کریں',
    automaticallyDetectLocation: 'خودکار طور پر مقام تلاش کریں',
    city: 'شہر',
    
    // Common
    save: 'محفوظ کریں',
    saveChanges: 'تبدیلیاں محفوظ کریں',
    cancel: 'منسوخ',
    done: 'مکمل',
    select: 'منتخب کریں',
    search: 'تلاش',
    refresh: 'ریفریش',
    refreshing: 'ریفریش ہو رہا ہے...',
    pleaseEnterCityName: 'برائے کرم شہر کا نام داخل کریں',
    invalidCityName: 'برائے کرم ایک درست شہر درج کریں',
    validationError: 'شہر کے نام کی تصدیق میں خرابی',
    popularCities: 'مشہور شہر',
    searching: 'تلاش کر رہے ہیں...',
    invalidLocation: 'غلط مقام',
    
    // Time
    minutesBefore: 'منٹ پہلے',
    
    // Messages
    settingsSaved: 'سیٹنگز محفوظ ہو گئیں',
    preferencesUpdated: 'آپ کی ترجیحات اپ ڈیٹ ہو گئیں۔',
    ok: 'ٹھیک ہے',
    loadingPrayerTimes: 'نماز کے اوقات لوڈ ہو رہے ہیں...',
    unableToGetPrayerTimes: 'نماز کے اوقات حاصل کرنے سے قاصر۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں اور دوبارہ کوشش کریں۔',
    unableToDetermineNextPrayer: 'اگلی نماز کا وقت طے کرنے سے قاصر۔',
    permissionToAccessLocationDenied: 'مقام تک رسائی کی اجازت مسترد کر دی گئی۔',
    couldNotDetermineLocation: 'آپ کے مقام کے لیے نماز کے اوقات طے نہیں کر سکے۔',
    failedToGetLocation: 'مقام یا نماز کے اوقات حاصل کرنے میں ناکام۔',
    cityNotFound: 'شہر نہیں ملا۔ برائے کرم کوئی اور شہر آزمائیں۔',
    couldNotFetchPrayerTimes: 'نماز کے اوقات لانے سے قاصر۔ برائے کرم اپنا کنکشن چیک کریں۔',
    
    // Picker Titles
    selectTheme: 'تھیم منتخب کریں',
    selectLanguage: 'زبان منتخب کریں',
    selectTimeFormat: 'وقت کا فارمیٹ منتخب کریں',
    selectCalculationMethod: 'حساب کا طریقہ منتخب کریں',
    selectMadhab: 'مذہب منتخب کریں',
    
    // Support
    support: 'سپورٹ',
    contactSupport: 'سپورٹ سے رابطہ کریں',
    privacyPolicy: 'پرائیویسی پالیسی',
    termsOfService: 'خدمات کی شرائط',
    appVersion: 'ایپ ورژن',
  },
  
  tr: {
    // Daily Content
    verseOfTheDay: 'Günün Ayeti',
    hadithOfTheDay: 'Günün Hadisi',
    defaultHadithText: 'Cennetin anahtarı namazdır, namazın anahtarı da temizliktir.',
    defaultHadithSource: 'Ahmed',
    
    // Hijri Months
    hijriMonths: [
      'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
      'Cemaziyelevvel', 'Cemaziyelahir', 'Receb', 'Şaban',
      'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
    ],
    
    // Navigation
    home: 'Ana Sayfa',
    prayerTimes: 'Namaz Vakitleri',
    settings: 'Ayarlar',
    
    // Home Page
    quickActions: 'Hızlı İşlemler',
    qiblaDirection: 'Kıble Yönü',
    prayerTracker: 'Namaz Takipçisi',
    nearbyMosques: 'Yakındaki Camiler',
    dailyDhikr: 'Günlük Zikir',
    nextPrayer: 'Sonraki Namaz',
    
    // Prayer Times
    muslimPrayerTimes: 'Müslüman Namaz Vakitleri',
    enterCityOrLocation: 'Bir şehir girin veya konumunuzu kullanın',
    searchCity: 'Şehir arayın...',
    selectCityForPrayerTimes: 'Namaz vakitleri için şehrinizi seçin',
    useMyLocation: 'Konumumu Kullan',
    notificationsEnabled: 'Namaz bildirimleri etkin',
    previousDay: 'Önceki Gün',
    nextDay: 'Sonraki Gün',
    today: 'Bugün',
    
    // Prayer Names
    fajr: 'İmsak',
    sunrise: 'Güneş',
    dhuhr: 'Öğle',
    asr: 'İkindi',
    maghrib: 'Akşam',
    isha: 'Yatsı',
    
    // Qibla & Mosques
    qiblaRequiresMobile: 'Kıble pusula hareket sensörleri olan mobil cihaz gerektirir',
    locationPermissionDenied: 'Konum izni reddedildi',
    compassError: 'Pusula erişim hatası',
    calibratingCompass: 'Pusula kalibre ediliyor...',
    calibrationInstructions: 'Pusulayı kalibre etmek için telefonunuzu 8 şeklinde hareket ettirin',
    magnetometerUnavailable: 'Bu cihazda magnetometre mevcut değil',
    currentHeading: 'Yön',
    qiblaAngle: 'Kıble',
    relativeAngle: 'Göreceli',
    qiblaInstructions: 'Telefonunuzu düz tutun ve yeşil ok üstteki kırmızı göstergeyi gösterene kadar döndürün',
    aligned: 'Hizalandı',
    rotate: 'Döndür',
    calibrating: 'Kalibre ediliyor',
    fromNorth: 'kuzeyden',
    yourHeading: 'Yönünüz',
    calibrateCompass: 'Pusulayı kalibre etmek için telefonunuzu 8 şeklinde hareket ettirin',
    alignKaabaTip: 'Kâbe simgesi dümdüz yukarıyı gösterene kadar döndürün ve Kıbleye yönelin',
    gettingLocation: 'Konumunuz alınıyor...',
    
    // Settings
    customizePreferences: 'Uygulama tercihlerinizi özelleştirin',
    notifications: 'Bildirimler',
    enableNotifications: 'Bildirimleri Etkinleştir',
    receivePrayerAlerts: 'Namaz vakti uyarıları alın',
    adhanSound: 'Ezan Sesi',
    playAdhanAtPrayerTimes: 'Namaz vakitlerinde ezan çal',
    vibrate: 'Titreşim',
    vibrateWithNotifications: 'Bildirimlerle birlikte titret',
    prePrayerReminder: 'Namaz Öncesi Hatırlatma',
    
    // Appearance
    appearance: 'Görünüm',
    theme: 'Tema',
    choosePreferredAppearance: 'Tercih ettiğiniz görünümü seçin',
    language: 'Dil',
    selectPreferredLanguage: 'Tercih ettiğiniz dili seçin',
    showHijriDates: 'Hicri Tarihleri Göster',
    displayIslamicCalendarDates: 'İslami takvim tarihlerini göster',
    timeFormat: 'Saat Formatı',
    chooseTimeDisplay: 'Saatlerin nasıl gösterileceğini seçin',
    
    // Theme Options
    light: 'Açık',
    dark: 'Koyu',
    systemDefault: 'Sistem Varsayılanı',
    
    // Time Format Options
    '24hour': '24 saat',
    '12hour': '12 saat',
    
    // Prayer Calculations
    prayerCalculations: 'Namaz Hesaplamaları',
    calculationMethod: 'Hesaplama Yöntemi',
    calculationMethodDesc: 'Farklı yöntemler hafif zaman farklılıkları gösterebilir',
    autoLocationMethod: 'Otomatik Konum Yöntemi',
    autoLocationMethodDesc: 'Konumunuz için en iyi yöntemi otomatik olarak kullanın',
    recommendedForYourLocation: 'Konumunuz için önerilen',
    calculationMethodUpdated: 'Hesaplama Yöntemi Güncellendi',
    calculationMethodUpdatedDesc: 'Bu bölgede daha iyi doğruluk için namaz hesaplama yöntemi otomatik olarak güncellendi.',
    apply: 'Uygula',
    calculationMethods: {
      mwl: 'Müslüman Dünya Birliği (Önerilen)',
      isna: 'Kuzey Amerika İslam Cemiyeti',
      egypt: 'Mısır Genel Otoritesi',
      makkah: 'Ümmü\'l-Kura Üniversitesi (Suudi)',
      karachi: 'İslami İlimler Üniversitesi (Pakistan)',
    },
    methodForCalculating: 'Namaz vakitlerini hesaplama yöntemi',
    madhab: 'Mezhep (İkindi Hesabı)',
    schoolOfThought: 'İkindi namazı için fıkıh okulu',
    
    // Calculation Methods
    muslimWorldLeague: 'Müslüman Dünya Ligi',
    isna: 'Kuzey Amerika İslam Cemiyeti',
    egyptianGeneralAuthority: 'Mısır Genel Otoritesi',
    ummAlQura: 'Ümmü\'l-Kurâ Üniversitesi',
    universityOfKarachi: 'Karaçi İslami İlimler Üniversitesi',
    
    // Madhab Options
    shafiMalikiHanbali: 'Şafi, Maliki, Hanbeli',
    hanafi: 'Hanefi',
    
    // Location
    location: 'Konum',
    useGPSLocation: 'GPS Konumunu Kullan',
    automaticallyDetectLocation: 'Konumu otomatik olarak tespit et',
    city: 'Şehir',
    
    // Common
    save: 'Kaydet',
    saveChanges: 'Değişiklikleri Kaydet',
    cancel: 'İptal',
    done: 'Tamam',
    select: 'Seç',
    search: 'Ara',
    refresh: 'Yenile',
    refreshing: 'Yenileniyor...',
    pleaseEnterCityName: 'Lütfen şehir adını girin',
    invalidCityName: 'Lütfen geçerli bir şehir girin',
    validationError: 'Şehir adı doğrulama hatası',
    popularCities: 'Popüler Şehirler',
    searching: 'Aranıyor...',
    invalidLocation: 'Geçersiz Konum',
    
    // Time
    minutesBefore: 'dakika önce',
    
    // Messages
    settingsSaved: 'Ayarlar Kaydedildi',
    preferencesUpdated: 'Tercihleriniz güncellendi.',
    ok: 'Tamam',
    loadingPrayerTimes: 'Namaz vakitleri yükleniyor...',
    unableToGetPrayerTimes: 'Namaz vakitlerini alamıyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.',
    unableToDetermineNextPrayer: 'Sonraki namaz vakti belirlenemedi.',
    permissionToAccessLocationDenied: 'Konuma erişim izni reddedildi.',
    couldNotDetermineLocation: 'Konumunuz için namaz vakitleri belirlenemedi.',
    failedToGetLocation: 'Konum veya namaz vakitleri alınamadı.',
    cityNotFound: 'Şehir bulunamadı. Lütfen başka bir şehir deneyin.',
    couldNotFetchPrayerTimes: 'Namaz vakitleri getirilemedi. Lütfen bağlantınızı kontrol edin.',
    
    // Picker Titles
    selectTheme: 'Tema Seç',
    selectLanguage: 'Dil Seç',
    selectTimeFormat: 'Saat Formatı Seç',
    selectCalculationMethod: 'Hesaplama Yöntemi Seç',
    selectMadhab: 'Mezhep Seç',
    
    // Support
    support: 'Destek',
    contactSupport: 'Destekle İletişim',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Hizmet Şartları',
    appVersion: 'Uygulama Sürümü',
  },
};
