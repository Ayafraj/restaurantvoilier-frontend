// src/translations.js

export const translations = {
  fr: {
    // ===== GENERAL =====
    appName: "Le Voilier — Hôtel El Mehdi",
    welcome: "Bienvenue",
    home: "Accueil",
    dashboard: "Tableau de bord",
    admin: "Administration",
    client: "Client",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    close: "Fermer",
    confirm: "Confirmer",
    search: "Rechercher",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    actions: "Actions",
    details: "Détails",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    yes: "Oui",
    no: "Non",

    // ===== THEME / ACCESSIBILITY =====
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    moreOptions: "Plus d’options",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",

    // ===== AUTHENTICATION =====
    login: "Connexion",
    logout: "Déconnexion",
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    register: "Créer un compte",
    loginSuccess: "Connexion réussie",
    loginError: "Email ou mot de passe incorrect.",
    registerSuccess: "Compte créé avec succès.",
    registerError: "Erreur lors de la création du compte.",

    // ===== CLIENT =====
    myAccount: "Mon compte",
    myReservations: "Mes réservations",
    myTables: "Mes tables",
    myProfile: "Mon profil",
    myComplaints: "Mes réclamations",
    myReviews: "Mes avis",
    reservation: "Réservation",
    reservations: "Réservations",
    table: "Table",
    tables: "Tables",
    reserveTable: "Réserver une table",
    reservationDate: "Date de réservation",
    reservationTime: "Heure de réservation",
    numberOfPeople: "Nombre de personnes",
    reservationStatus: "Statut de la réservation",
    reservationCreated: "Réservation créée avec succès.",
    reservationCancelled: "Réservation annulée.",
    noReservations: "Aucune réservation.",
    noTables: "Aucune table réservée.",

    // ===== MENU =====
    menu: "Menu",
    menus: "Menus",
    dishes: "Plats",
    dish: "Plat",
    category: "Catégorie",
    categories: "Catégories",
    price: "Prix",
    quantity: "Quantité",
    description: "Description",
    image: "Image",
    addDish: "Ajouter un plat",
    editDish: "Modifier le plat",
    deleteDish: "Supprimer le plat",
    addCategory: "Ajouter une catégorie",
    categoryName: "Nom de la catégorie",
    noCategory: "Sans catégorie",
    popularDishes: "Plats populaires",

    // ===== ADMIN =====
    customers: "Clients",
    customer: "Client",
    totalCustomers: "Total des clients",
    totalReservations: "Total des réservations",
    totalReviews: "Total des avis",
    totalComplaints: "Total des réclamations",
    revenue: "Chiffre d'affaires",
    statistics: "Statistiques",
    statistic: "Statistique",
    complaints: "Réclamations",
    complaint: "Réclamation",
    reviews: "Avis",
    review: "Avis",
    users: "Utilisateurs",
    user: "Utilisateur",

    // ===== DASHBOARD =====
    overview: "Vue d'ensemble",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    thisYear: "Cette année",
    total: "Total",
    average: "Moyenne",
    averageBasket: "Panier moyen",
    averageAmountPerPerson: "Montant moyen par personne (DT)",
    reservedPeople: "personnes réservées",
    cancellationRate: "Taux d’annulation",
    peakHours: "Heures de pointe",
    notEnoughHourlyData: "Pas assez de données horaires.",

    // ===== CUSTOMER SEGMENTATION =====
    segmentation: "Segmentation",
    customerSegmentation: "Segmentation clients",
    vip: "VIP",
    vipDescription: "10+ visites",
    regularCustomers: "Réguliers",
    regularDescription: "3 à 9 visites",
    newCustomers: "Nouveaux",
    newDescription: "0 à 1 visite",
    noShow: "No-show",

    // ===== PROMOTIONS =====
    promoCodes: "Codes promo",
    promoCode: "Code promo",
    createPromoCode: "Créer un code promo",
    promoCodeCreated: "Code promo créé",
    promoCodeError: "Erreur lors de la création du code promo.",
    specialOffers: "Offres spéciales",
    dailyMenu: "Menu du jour",
    dailyMenuAdded: "Offre ajoutée au menu du jour",

    // ===== TABLES =====
    addTable: "Ajouter une table",
    addMultipleTables: "Ajouter plusieurs tables",
    tableNumber: "Numéro de table",
    startingNumber: "Numéro de départ",
    tableQuantity: "Quantité",
    tableAdded: "Table ajoutée avec succès.",
    tablesAdded: "Tables ajoutées avec succès.",
    tableDeleted: "Table supprimée avec succès.",

    // ===== CATEGORIES =====
    categoryAlreadyExists: "Cette catégorie existe déjà.",
    categoryAdded: "Catégorie ajoutée avec succès.",
    categoryDeleted: "Catégorie supprimée avec succès.",

    // ===== COMPLAINTS =====
    sendComplaint: "Envoyer une réclamation",
    complaintSubject: "Sujet",
    complaintMessage: "Message",
    complaintSent: "Réclamation envoyée avec succès.",
    noComplaints: "Aucune réclamation.",

    // ===== REVIEWS =====
    leaveReview: "Laisser un avis",
    rating: "Note",
    comment: "Commentaire",
    reviewSent: "Avis envoyé avec succès.",
    noReviews: "Aucun avis.",

    // ===== ERRORS =====
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    requiredField: "Ce champ est obligatoire.",
    serverError: "Une erreur serveur est survenue.",
    networkError: "Erreur de connexion au serveur.",

    // ===== LANGUAGE =====
    language: "Langue",
    french: "Français",
    english: "Anglais",
    arabic: "Arabe",

    // ===== MISC =====
    hotel: "Hôtel",
    restaurant: "Restaurant",
    contact: "Contact",
    phone: "Téléphone",
    address: "Adresse",
    date: "Date",
    time: "Heure",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    available: "Disponible",
    unavailable: "Indisponible",
    occupied: "Occupée",
    free: "Libre",
    used: "Utilisé",
    estimationOnly: "Utilisé uniquement pour l'estimation BI.",
  },

  en: {
    // ===== GENERAL =====
    appName: "Le Voilier — El Mehdi Hotel",
    welcome: "Welcome",
    home: "Home",
    dashboard: "Dashboard",
    admin: "Administration",
    client: "Client",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    search: "Search",
    loading: "Loading...",
    noData: "No data available",
    actions: "Actions",
    details: "Details",
    back: "Back",
    next: "Next",
    previous: "Previous",
    yes: "Yes",
    no: "No",

    // ===== THEME / ACCESSIBILITY =====
    lightMode: "Light mode",
    darkMode: "Dark mode",
    moreOptions: "More options",
    showPassword: "Show password",
    hidePassword: "Hide password",

    // ===== AUTHENTICATION =====
    login: "Login",
    logout: "Logout",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    forgotPassword: "Forgot password?",
    register: "Create an account",
    loginSuccess: "Login successful",
    loginError: "Incorrect email or password.",
    registerSuccess: "Account created successfully.",
    registerError: "Error creating account.",

    // ===== CLIENT =====
    myAccount: "My account",
    myReservations: "My reservations",
    myTables: "My tables",
    myProfile: "My profile",
    myComplaints: "My complaints",
    myReviews: "My reviews",
    reservation: "Reservation",
    reservations: "Reservations",
    table: "Table",
    tables: "Tables",
    reserveTable: "Reserve a table",
    reservationDate: "Reservation date",
    reservationTime: "Reservation time",
    numberOfPeople: "Number of people",
    reservationStatus: "Reservation status",
    reservationCreated: "Reservation created successfully.",
    reservationCancelled: "Reservation cancelled.",
    noReservations: "No reservations.",
    noTables: "No reserved tables.",

    // ===== MENU =====
    menu: "Menu",
    menus: "Menus",
    dishes: "Dishes",
    dish: "Dish",
    category: "Category",
    categories: "Categories",
    price: "Price",
    quantity: "Quantity",
    description: "Description",
    image: "Image",
    addDish: "Add dish",
    editDish: "Edit dish",
    deleteDish: "Delete dish",
    addCategory: "Add category",
    categoryName: "Category name",
    noCategory: "No category",
    popularDishes: "Popular dishes",

    // ===== ADMIN =====
    customers: "Customers",
    customer: "Customer",
    totalCustomers: "Total customers",
    totalReservations: "Total reservations",
    totalReviews: "Total reviews",
    totalComplaints: "Total complaints",
    revenue: "Revenue",
    statistics: "Statistics",
    statistic: "Statistic",
    complaints: "Complaints",
    complaint: "Complaint",
    reviews: "Reviews",
    review: "Review",
    users: "Users",
    user: "User",

    // ===== DASHBOARD =====
    overview: "Overview",
    today: "Today",
    thisWeek: "This week",
    thisMonth: "This month",
    thisYear: "This year",
    total: "Total",
    average: "Average",
    averageBasket: "Average basket",
    averageAmountPerPerson: "Average amount per person (DT)",
    reservedPeople: "reserved people",
    cancellationRate: "Cancellation rate",
    peakHours: "Peak hours",
    notEnoughHourlyData: "Not enough hourly data.",

    // ===== CUSTOMER SEGMENTATION =====
    segmentation: "Segmentation",
    customerSegmentation: "Customer segmentation",
    vip: "VIP",
    vipDescription: "10+ visits",
    regularCustomers: "Regular customers",
    regularDescription: "3 to 9 visits",
    newCustomers: "New customers",
    newDescription: "0 to 1 visit",
    noShow: "No-show",

    // ===== PROMOTIONS =====
    promoCodes: "Promo codes",
    promoCode: "Promo code",
    createPromoCode: "Create promo code",
    promoCodeCreated: "Promo code created",
    promoCodeError: "Error creating promo code.",
    specialOffers: "Special offers",
    dailyMenu: "Daily menu",
    dailyMenuAdded: "Offer added to today's menu",

    // ===== TABLES =====
    addTable: "Add table",
    addMultipleTables: "Add multiple tables",
    tableNumber: "Table number",
    startingNumber: "Starting number",
    tableQuantity: "Quantity",
    tableAdded: "Table added successfully.",
    tablesAdded: "Tables added successfully.",
    tableDeleted: "Table deleted successfully.",

    // ===== CATEGORIES =====
    categoryAlreadyExists: "This category already exists.",
    categoryAdded: "Category added successfully.",
    categoryDeleted: "Category deleted successfully.",

    // ===== COMPLAINTS =====
    sendComplaint: "Send a complaint",
    complaintSubject: "Subject",
    complaintMessage: "Message",
    complaintSent: "Complaint sent successfully.",
    noComplaints: "No complaints.",

    // ===== REVIEWS =====
    leaveReview: "Leave a review",
    rating: "Rating",
    comment: "Comment",
    reviewSent: "Review sent successfully.",
    noReviews: "No reviews.",

    // ===== ERRORS =====
    error: "Error",
    success: "Success",
    warning: "Warning",
    requiredField: "This field is required.",
    serverError: "A server error occurred.",
    networkError: "Server connection error.",

    // ===== LANGUAGE =====
    language: "Language",
    french: "French",
    english: "English",
    arabic: "Arabic",

    // ===== MISC =====
    hotel: "Hotel",
    restaurant: "Restaurant",
    contact: "Contact",
    phone: "Phone",
    address: "Address",
    date: "Date",
    time: "Time",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    available: "Available",
    unavailable: "Unavailable",
    occupied: "Occupied",
    free: "Free",
    used: "Used",
    estimationOnly: "Used only for BI estimation.",
  },

  ar: {
    // ===== GENERAL =====
    appName: "لو فوايلييه — فندق المهدي",
    welcome: "مرحباً",
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    admin: "الإدارة",
    client: "العميل",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    close: "إغلاق",
    confirm: "تأكيد",
    search: "بحث",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    actions: "الإجراءات",
    details: "التفاصيل",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    yes: "نعم",
    no: "لا",

    // ===== THEME / ACCESSIBILITY =====
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    moreOptions: "خيارات إضافية",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",

    // ===== AUTHENTICATION =====
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    register: "إنشاء حساب",
    loginSuccess: "تم تسجيل الدخول بنجاح",
    loginError: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    registerSuccess: "تم إنشاء الحساب بنجاح.",
    registerError: "حدث خطأ أثناء إنشاء الحساب.",

    // ===== CLIENT =====
    myAccount: "حسابي",
    myReservations: "حجوزاتي",
    myTables: "طاولاتي",
    myProfile: "ملفي الشخصي",
    myComplaints: "شكاويّ",
    myReviews: "تقييماتي",
    reservation: "حجز",
    reservations: "الحجوزات",
    table: "طاولة",
    tables: "الطاولات",
    reserveTable: "حجز طاولة",
    reservationDate: "تاريخ الحجز",
    reservationTime: "وقت الحجز",
    numberOfPeople: "عدد الأشخاص",
    reservationStatus: "حالة الحجز",
    reservationCreated: "تم إنشاء الحجز بنجاح.",
    reservationCancelled: "تم إلغاء الحجز.",
    noReservations: "لا توجد حجوزات.",
    noTables: "لا توجد طاولات محجوزة.",

    // ===== MENU =====
    menu: "القائمة",
    menus: "القوائم",
    dishes: "الأطباق",
    dish: "طبق",
    category: "الفئة",
    categories: "الفئات",
    price: "السعر",
    quantity: "الكمية",
    description: "الوصف",
    image: "الصورة",
    addDish: "إضافة طبق",
    editDish: "تعديل الطبق",
    deleteDish: "حذف الطبق",
    addCategory: "إضافة فئة",
    categoryName: "اسم الفئة",
    noCategory: "بدون فئة",
    popularDishes: "الأطباق الأكثر طلباً",

    // ===== ADMIN =====
    customers: "العملاء",
    customer: "العميل",
    totalCustomers: "إجمالي العملاء",
    totalReservations: "إجمالي الحجوزات",
    totalReviews: "إجمالي التقييمات",
    totalComplaints: "إجمالي الشكاوى",
    revenue: "الإيرادات",
    statistics: "الإحصائيات",
    statistic: "إحصائية",
    complaints: "الشكاوى",
    complaint: "شكوى",
    reviews: "التقييمات",
    review: "تقييم",
    users: "المستخدمون",
    user: "مستخدم",

    // ===== DASHBOARD =====
    overview: "نظرة عامة",
    today: "اليوم",
    thisWeek: "هذا الأسبوع",
    thisMonth: "هذا الشهر",
    thisYear: "هذه السنة",
    total: "الإجمالي",
    average: "المتوسط",
    averageBasket: "متوسط السلة",
    averageAmountPerPerson: "متوسط المبلغ لكل شخص (د.ت)",
    reservedPeople: "الأشخاص المحجوزون",
    cancellationRate: "نسبة الإلغاء",
    peakHours: "ساعات الذروة",
    notEnoughHourlyData: "لا توجد بيانات كافية حسب الساعات.",

    // ===== CUSTOMER SEGMENTATION =====
    segmentation: "التقسيم",
    customerSegmentation: "تقسيم العملاء",
    vip: "عملاء VIP",
    vipDescription: "أكثر من 10 زيارات",
    regularCustomers: "العملاء المنتظمون",
    regularDescription: "من 3 إلى 9 زيارات",
    newCustomers: "العملاء الجدد",
    newDescription: "من 0 إلى زيارة واحدة",
    noShow: "لم يحضر",

    // ===== PROMOTIONS =====
    promoCodes: "رموز الخصم",
    promoCode: "رمز الخصم",
    createPromoCode: "إنشاء رمز خصم",
    promoCodeCreated: "تم إنشاء رمز الخصم",
    promoCodeError: "حدث خطأ أثناء إنشاء رمز الخصم.",
    specialOffers: "العروض الخاصة",
    dailyMenu: "قائمة اليوم",
    dailyMenuAdded: "تمت إضافة العرض إلى قائمة اليوم",

    // ===== TABLES =====
    addTable: "إضافة طاولة",
    addMultipleTables: "إضافة عدة طاولات",
    tableNumber: "رقم الطاولة",
    startingNumber: "رقم البداية",
    tableQuantity: "الكمية",
    tableAdded: "تمت إضافة الطاولة بنجاح.",
    tablesAdded: "تمت إضافة الطاولات بنجاح.",
    tableDeleted: "تم حذف الطاولة بنجاح.",

    // ===== CATEGORIES =====
    categoryAlreadyExists: "هذه الفئة موجودة بالفعل.",
    categoryAdded: "تمت إضافة الفئة بنجاح.",
    categoryDeleted: "تم حذف الفئة بنجاح.",

    // ===== COMPLAINTS =====
    sendComplaint: "إرسال شكوى",
    complaintSubject: "الموضوع",
    complaintMessage: "الرسالة",
    complaintSent: "تم إرسال الشكوى بنجاح.",
    noComplaints: "لا توجد شكاوى.",

    // ===== REVIEWS =====
    leaveReview: "إضافة تقييم",
    rating: "التقييم",
    comment: "التعليق",
    reviewSent: "تم إرسال التقييم بنجاح.",
    noReviews: "لا توجد تقييمات.",

    // ===== ERRORS =====
    error: "خطأ",
    success: "نجاح",
    warning: "تنبيه",
    requiredField: "هذا الحقل مطلوب.",
    serverError: "حدث خطأ في الخادم.",
    networkError: "حدث خطأ في الاتصال بالخادم.",

    // ===== LANGUAGE =====
    language: "اللغة",
    french: "الفرنسية",
    english: "الإنجليزية",
    arabic: "العربية",

    // ===== MISC =====
    hotel: "الفندق",
    restaurant: "المطعم",
    contact: "اتصل بنا",
    phone: "الهاتف",
    address: "العنوان",
    date: "التاريخ",
    time: "الوقت",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    available: "متاح",
    unavailable: "غير متاح",
    occupied: "مشغولة",
    free: "شاغرة",
    used: "مستخدم",
    estimationOnly: "يُستخدم فقط لتقدير ذكاء الأعمال.",
  },
};

// ======================================================
// LANGUAGE HELPERS
// ======================================================

export function getLanguage() {
  return localStorage.getItem("voilier_lang") || "fr";
}

export function setLanguage(lang) {
  if (!["fr", "en", "ar"].includes(lang)) {
    lang = "fr";
  }

  localStorage.setItem("voilier_lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function translate(key, lang = getLanguage()) {
  return translations[lang]?.[key] ?? translations.fr?.[key] ?? key;
}

// ======================================================
// CATEGORY TRANSLATION
// ======================================================

export function translateCategoryName(name, lang = getLanguage()) {
  if (!name) return "";

  const normalized = String(name).trim().toLowerCase();

  const categories = {
    fr: {
      "les salades du voilier": "LES SALADES DU VOILIER",
      "les entrées chaudes": "LES ENTRÉES CHAUDES",
      "eau minerales": "Eau minérales",
      sirop: "Sirop",
      sodas: "Sodas",
      "boisson energitique": "Boisson énergétique",
    },

    en: {
      "les salades du voilier": "LE VOILIER SALADS",
      "les entrées chaudes": "HOT STARTERS",
      "eau minerales": "Mineral Water",
      sirop: "Syrups",
      sodas: "Soft Drinks",
      "boisson energitique": "Energy Drinks",
    },

    ar: {
      "les salades du voilier": "سلطات لو فوايلييه",
      "les entrées chaudes": "المقبلات الساخنة",
      "eau minerales": "المياه المعدنية",
      sirop: "العصائر المركزة",
      sodas: "المشروبات الغازية",
      "boisson energitique": "مشروبات الطاقة",
    },
  };

  return categories[lang]?.[normalized] || name;
}
// ======================================================
// DISH TRANSLATION
// ======================================================

export function translateDishName(name, lang = getLanguage()) {
  if (!name) return "";

  const normalized = String(name).trim().toLowerCase();

  const dishes = {
    fr: {
      "salade mechouia": "Salade Mechouia",
      "assiette elmehdi": "Assiette Elmehdi",
      "salade aux fruits de mer": "Salade aux fruits de mer",
      "salade tunisienne": "Salade Tunisienne",
      "salade tomate": "Salade Tomate",
      "salade cezar": "Salade Cezar",
      "salade césar": "Salade César",

      "brick au thon": "Brick au thon",
      "brick aux crevettes": "Brick aux crevettes",
      "crêpe fourrée": "Crêpe fourrée",
      "crepe fourree": "Crêpe fourrée",
      "ojja merguez aux chevrettes": "Ojja merguez aux chevrettes",
      "calamar dore": "Calamar doré",
      "calamar doré": "Calamar doré",
      "chevrettes panées": "Chevrettes panées",
      "chevrettes panees": "Chevrettes panées",
      "chevrettes sautées": "Chevrettes sautées",
      "chevrettes sautees": "Chevrettes sautées",
      "seiche grillée": "Seiche grillée",
      "seiche grillee": "Seiche grillée",
      "calamars grillés": "Calamars grillés",
      "calamars grilles": "Calamars grillés",

      "eau naturelle": "Eau naturelle",
      "eau gazeuse": "Eau gazeuse",
      menthe: "Menthe",
      granadine: "Grenadine",
      coca: "Coca",
      boga: "Boga",
      fanta: "Fanta",
      schweppes: "Schweppes",
      "red bull": "Red Bull",
    },

    en: {
      "salade mechouia": "Mechouia Salad",
      "assiette elmehdi": "Elmehdi Plate",
      "salade aux fruits de mer": "Seafood Salad",
      "salade tunisienne": "Tunisian Salad",
      "salade tomate": "Tomato Salad",
      "salade cezar": "Caesar Salad",
      "salade césar": "Caesar Salad",

      "brick au thon": "Tuna Brick",
      "brick aux crevettes": "Shrimp Brick",
      "crêpe fourrée": "Stuffed Crepe",
      "crepe fourree": "Stuffed Crepe",
      "ojja merguez aux chevrettes": "Merguez Ojja with Shrimp",
      "calamar dore": "Fried Calamari",
      "calamar doré": "Fried Calamari",
      "chevrettes panées": "Breaded Shrimp",
      "chevrettes panees": "Breaded Shrimp",
      "chevrettes sautées": "Sautéed Shrimp",
      "chevrettes sautees": "Sautéed Shrimp",
      "seiche grillée": "Grilled Cuttlefish",
      "seiche grillee": "Grilled Cuttlefish",
      "calamars grillés": "Grilled Calamari",
      "calamars grilles": "Grilled Calamari",

      "eau naturelle": "Still Water",
      "eau gazeuse": "Sparkling Water",
      menthe: "Mint",
      granadine: "Grenadine",
      coca: "Coca-Cola",
      boga: "Boga",
      fanta: "Fanta",
      schweppes: "Schweppes",
      "red bull": "Red Bull",
    },

    ar: {
      "salade mechouia": "سلطة مشوية",
      "assiette elmehdi": "طبق المهدي",
      "salade aux fruits de mer": "سلطة فواكه البحر",
      "salade tunisienne": "سلطة تونسية",
      "salade tomate": "سلطة الطماطم",
      "salade cezar": "سلطة سيزار",
      "salade césar": "سلطة سيزار",

      "brick au thon": "بريك بالتن",
      "brick aux crevettes": "بريك بالقمرون",
      "crêpe fourrée": "كريب محشو",
      "crepe fourree": "كريب محشو",
      "ojja merguez aux chevrettes": "عجة مرڨاز بالقمرون",
      "calamar dore": "كالامار مقلي",
      "calamar doré": "كالامار مقلي",
      "chevrettes panées": "قمرون مقلي بالبقسماط",
      "chevrettes panees": "قمرون مقلي بالبقسماط",
      "chevrettes sautées": "قمرون سوتيه",
      "chevrettes sautees": "قمرون سوتيه",
      "seiche grillée": "سيبيا مشوية",
      "seiche grillee": "سيبيا مشوية",
      "calamars grillés": "كالامار مشوي",
      "calamars grilles": "كالامار مشوي",

      "eau naturelle": "مياه معدنية طبيعية",
      "eau gazeuse": "مياه غازية",
      menthe: "نعناع",
      granadine: "غرينادين",
      coca: "كوكاكولا",
      boga: "بوجا",
      fanta: "فانتا",
      schweppes: "شويبس",
      "red bull": "ريد بول",
    },
  };

  return dishes[lang]?.[normalized] || name;
}

// ======================================================
// STATUS TRANSLATION
// ======================================================

export function translateStatus(status, lang = getLanguage()) {
  if (!status) return "";

  const normalized = String(status).trim().toLowerCase();

  const statuses = {
    fr: {
      pending: "En attente",
      confirmed: "Confirmée",
      accepted: "Acceptée",
      cancelled: "Annulée",
      canceled: "Annulée",
      completed: "Terminée",
      refused: "Refusée",
      rejected: "Refusée",
      available: "Disponible",
      unavailable: "Indisponible",
      occupied: "Occupée",
      free: "Libre",
      active: "Actif",
      inactive: "Inactif",
      "no-show": "No-show",
      noshow: "No-show",
    },

    en: {
      pending: "Pending",
      confirmed: "Confirmed",
      accepted: "Accepted",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      completed: "Completed",
      refused: "Refused",
      rejected: "Rejected",
      available: "Available",
      unavailable: "Unavailable",
      occupied: "Occupied",
      free: "Free",
      active: "Active",
      inactive: "Inactive",
      "no-show": "No-show",
      noshow: "No-show",
    },

    ar: {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      accepted: "مقبول",
      cancelled: "ملغى",
      canceled: "ملغى",
      completed: "مكتمل",
      refused: "مرفوض",
      rejected: "مرفوض",
      available: "متاح",
      unavailable: "غير متاح",
      occupied: "مشغولة",
      free: "شاغرة",
      active: "نشط",
      inactive: "غير نشط",
      "no-show": "لم يحضر",
      noshow: "لم يحضر",
    },
  };

  return statuses[lang]?.[normalized] || status;
}
