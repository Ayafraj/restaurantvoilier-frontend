// src/translations.js

import { useEffect, useState } from "react";

// ======================================================
// TRANSLATIONS
// ======================================================

export const translations = {
  // ====================================================
  // FRANÇAIS
  // ====================================================

  fr: {
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

    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    moreOptions: "Plus d’options",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",

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

    segmentation: "Segmentation",
    customerSegmentation: "Segmentation clients",
    vip: "VIP",
    vipDescription: "10+ visites",
    regularCustomers: "Réguliers",
    regularDescription: "3 à 9 visites",
    newCustomers: "Nouveaux",
    newDescription: "0 à 1 visite",
    noShow: "Client absent",

    promoCodes: "Codes promo",
    promoCode: "Code promo",
    createPromoCode: "Créer un code promo",
    promoCodeCreated: "Code promo créé",
    promoCodeError: "Erreur lors de la création du code promo.",

    specialOffers: "Offres spéciales",
    dailyMenu: "Menu du jour",
    dailyMenuAdded: "Offre ajoutée au menu du jour",

    addTable: "Ajouter une table",
    addMultipleTables: "Ajouter plusieurs tables",
    tableNumber: "Numéro de table",
    startingNumber: "Numéro de départ",
    tableQuantity: "Quantité",
    tableAdded: "Table ajoutée avec succès.",
    tablesAdded: "Tables ajoutées avec succès.",
    tableDeleted: "Table supprimée avec succès.",

    categoryAlreadyExists: "Cette catégorie existe déjà.",
    categoryAdded: "Catégorie ajoutée avec succès.",
    categoryDeleted: "Catégorie supprimée avec succès.",

    sendComplaint: "Envoyer une réclamation",
    complaintSubject: "Sujet",
    complaintMessage: "Message",
    complaintSent: "Réclamation envoyée avec succès.",
    noComplaints: "Aucune réclamation.",

    leaveReview: "Laisser un avis",
    rating: "Note",
    comment: "Commentaire",
    reviewSent: "Avis envoyé avec succès.",
    noReviews: "Aucun avis.",

    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    requiredField: "Ce champ est obligatoire.",
    serverError: "Une erreur serveur est survenue.",
    networkError: "Erreur de connexion au serveur.",

    language: "Langue",
    french: "Français",
    english: "Anglais",
    arabic: "Arabe",

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

    accountEmail: "Email du compte",
    accountRestaurant: "Restaurant",
    accountRole: "Rôle",
    activate: "Activer",

    adminSettingsSubtitle:
      "Gérez les informations de votre compte administrateur.",

    allReservationsNav: "Toutes les réservations",
    allReservationsSubtitle:
      "Consultez, recherchez et filtrez toutes les réservations.",

    allStatuses: "Tous les statuts",
    availableQuantity: "Quantité disponible",

    businessEngagement: "Activité et engagement",
    businessEngagementSubtitle:
      "Analysez l’activité, les revenus estimés et la fidélisation des clients.",

    cancelled: "Annulée",
    capacity: "Capacité",
    changesSaved: "Modifications enregistrées.",

    clientAccounts: "Comptes clients",
    clientAccountsSubtitle: "Consultez et gérez les comptes clients.",

    complaintDescription: "Description",
    complaintsSubtitleAdmin: "Consultez et gérez les réclamations des clients.",

    confirmDelete: "Confirmer la suppression de",
    confirmed: "Confirmée",
    deactivate: "Désactiver",
    deleteIrreversible: "Cette action est irréversible.",

    deleteTable: "Supprimer la table",

    dishAdded: "Plat ajouté avec succès.",
    dishAvailable: "Disponible",
    dishDeleted: "Plat supprimé avec succès.",
    dishDescriptionPlaceholder: "Description du plat",
    dishImage: "Image du plat",
    dishName: "Nom du plat",

    dishReviewsNav: "Avis sur les plats",
    dishReviewsSubtitle: "Consultez les avis laissés sur les plats.",

    dishUnavailable: "Indisponible",
    emptyMenu: "Le menu est vide.",
    impossibleLoad: "Impossible de charger les données.",

    manageMenuNav: "Gérer le menu",
    manageMenuSubtitle:
      "Ajoutez, modifiez et gérez les plats et les catégories.",

    manageTablesNav: "Gérer les tables",
    manageTablesSubtitle:
      "Ajoutez, modifiez et gérez les tables du restaurant.",

    noClients: "Aucun client.",
    noDescriptionAvailable: "Aucune description disponible.",
    noDishes: "Aucun plat.",
    noDishesCategory: "Aucun plat dans cette catégorie.",
    noPhone: "Aucun téléphone",

    people: "personnes",
    person: "personne",

    refresh: "Actualiser",
    reservationsByStatus: "Réservations par statut",
    resolved: "Résolue",
    results: "résultat(s)",
    saving: "Enregistrement...",

    searchClient: "Rechercher un client...",
    searchReservationPlaceholder: "Client, table, date...",

    settings: "Paramètres",
    settingsTitle: "Paramètres",

    statisticsOverview: "Vue d’ensemble des statistiques du restaurant.",

    statisticsTitle: "Statistiques",

    statusActive: "Actif",
    statusInProgress: "En cours",
    statusInactive: "Inactif",

    tableStatus: "Statut de la table",
    tablesByState: "Tables par état",

    totalRevenue: "Chiffre d’affaires estimé",

    noShowFollowup: "Prévoir des relances / une liste de suivi côté serveur.",

    vsPreviousMonth: "vs mois précédent",

    popularDishesApiHint:
      "L’API doit fournir les commandes/ventes pour ce classement.",

    promoCodeExample: "Ex : ANNIV10",
    offerName: "Nom de l’offre",
    priceDT: "Prix DT",

    addTheseTables: "Ajouter ces tables",
    deleteAll: "Tout supprimer",
    confirmDeleteAllTables: "Supprimer les",

    tablesAddedShort: "table(s) ajoutée(s)",
    failuresShort: "échec(s)",
    tablesDeletedShort: "table(s) supprimée(s)",

    linkedReservationFailures:
      "table(s) non supprimée(s) car liée(s) à des réservations",

    tableAddedShort: "Table ajoutée :",
    tableDeletedShort: "Table supprimée :",

    noComplaintsAdminSubtitle: "Aucune réclamation n’a été déposée.",

    complaintStatusUpdated: "Réclamation marquée",

    noDishReviewsYet: "Aucun avis sur les plats pour le moment.",

    viewDetails: "Voir les détails",
    hideDetails: "Masquer les détails",

    exampleTableNumber: "Ex : 15",
    exampleCapacity: "Ex : 4 personnes",
    exampleQuantity: "Ex : 5",
    examplePeople: "Ex : 4",
    exampleDishName: "Ex : Couscous royal",
    exampleCategoryName: "Ex : Pizzas",

    bulkTablesDescription:
      "Crée plusieurs tables avec le même nombre de places et des numéros consécutifs.",

    statisticsPdfTitle: "Statistiques — Le Voilier",
    statisticsSheetName: "Statistiques",
    averageRating: "Note moyenne",
    printPdf: "PDF / Imprimer",
    excel: "Excel",
  },

  // ====================================================
  // ARABE
  // ====================================================

  ar: {
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

    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    moreOptions: "خيارات إضافية",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",

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

    segmentation: "التقسيم",
    customerSegmentation: "تقسيم العملاء",
    vip: "عملاء VIP",
    vipDescription: "أكثر من 10 زيارات",
    regularCustomers: "العملاء المنتظمون",
    regularDescription: "من 3 إلى 9 زيارات",
    newCustomers: "العملاء الجدد",
    newDescription: "من 0 إلى زيارة واحدة",
    noShow: "لم يحضر",

    promoCodes: "رموز الخصم",
    promoCode: "رمز الخصم",
    createPromoCode: "إنشاء رمز خصم",
    promoCodeCreated: "تم إنشاء رمز الخصم",
    promoCodeError: "حدث خطأ أثناء إنشاء رمز الخصم.",

    specialOffers: "العروض الخاصة",
    dailyMenu: "قائمة اليوم",
    dailyMenuAdded: "تمت إضافة العرض إلى قائمة اليوم",

    addTable: "إضافة طاولة",
    addMultipleTables: "إضافة عدة طاولات",
    tableNumber: "رقم الطاولة",
    startingNumber: "رقم البداية",
    tableQuantity: "الكمية",
    tableAdded: "تمت إضافة الطاولة بنجاح.",
    tablesAdded: "تمت إضافة الطاولات بنجاح.",
    tableDeleted: "تم حذف الطاولة بنجاح.",

    categoryAlreadyExists: "هذه الفئة موجودة بالفعل.",
    categoryAdded: "تمت إضافة الفئة بنجاح.",
    categoryDeleted: "تم حذف الفئة بنجاح.",

    sendComplaint: "إرسال شكوى",
    complaintSubject: "الموضوع",
    complaintMessage: "الرسالة",
    complaintSent: "تم إرسال الشكوى بنجاح.",
    noComplaints: "لا توجد شكاوى.",

    leaveReview: "إضافة تقييم",
    rating: "التقييم",
    comment: "التعليق",
    reviewSent: "تم إرسال التقييم بنجاح.",
    noReviews: "لا توجد تقييمات.",

    error: "خطأ",
    success: "نجاح",
    warning: "تنبيه",
    requiredField: "هذا الحقل مطلوب.",
    serverError: "حدث خطأ في الخادم.",
    networkError: "حدث خطأ في الاتصال بالخادم.",

    language: "اللغة",
    french: "الفرنسية",
    english: "الإنجليزية",
    arabic: "العربية",

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

    accountEmail: "البريد الإلكتروني للحساب",
    accountRestaurant: "المطعم",
    accountRole: "الدور",
    activate: "تفعيل",

    adminSettingsSubtitle: "إدارة معلومات حساب المسؤول.",

    allReservationsNav: "جميع الحجوزات",
    allReservationsSubtitle: "عرض جميع الحجوزات والبحث فيها وتصفيتها.",

    allStatuses: "جميع الحالات",
    availableQuantity: "الكمية المتاحة",

    businessEngagement: "الأعمال وتفاعل العملاء",
    businessEngagementSubtitle:
      "تحليل النشاط والإيرادات المقدرة وتفاعل العملاء.",

    cancelled: "ملغاة",
    capacity: "السعة",
    changesSaved: "تم حفظ التعديلات.",

    clientAccounts: "حسابات العملاء",
    clientAccountsSubtitle: "عرض وإدارة حسابات العملاء.",

    complaintDescription: "الوصف",
    complaintsSubtitleAdmin: "عرض وإدارة شكاوى العملاء.",

    confirmDelete: "تأكيد حذف",
    confirmed: "مؤكد",
    deactivate: "إلغاء التفعيل",
    deleteIrreversible: "هذا الإجراء لا يمكن التراجع عنه.",

    deleteTable: "حذف الطاولة",

    dishAdded: "تمت إضافة الطبق بنجاح.",
    dishAvailable: "متاح",
    dishDeleted: "تم حذف الطبق بنجاح.",
    dishDescriptionPlaceholder: "وصف الطبق",
    dishImage: "صورة الطبق",
    dishName: "اسم الطبق",

    dishReviewsNav: "تقييمات الأطباق",
    dishReviewsSubtitle: "عرض التقييمات التي تركها العملاء على الأطباق.",

    dishUnavailable: "غير متاح",
    emptyMenu: "القائمة فارغة.",
    impossibleLoad: "تعذر تحميل البيانات.",

    manageMenuNav: "إدارة القائمة",
    manageMenuSubtitle: "إضافة وتعديل وإدارة الأطباق والفئات.",

    manageTablesNav: "إدارة الطاولات",
    manageTablesSubtitle: "إضافة وتعديل وإدارة طاولات المطعم.",

    noClients: "لا يوجد عملاء.",
    noDescriptionAvailable: "لا يوجد وصف متاح.",
    noDishes: "لا توجد أطباق.",
    noDishesCategory: "لا توجد أطباق في هذه الفئة.",
    noPhone: "لا يوجد هاتف",

    people: "أشخاص",
    person: "شخص",

    refresh: "تحديث",
    reservationsByStatus: "الحجوزات حسب الحالة",
    resolved: "تم الحل",
    results: "نتيجة",
    saving: "جارٍ الحفظ...",

    searchClient: "البحث عن عميل...",
    searchReservationPlaceholder: "العميل، الطاولة، التاريخ...",

    settings: "الإعدادات",
    settingsTitle: "الإعدادات",

    statisticsOverview: "نظرة عامة على إحصائيات المطعم.",

    statisticsTitle: "الإحصائيات",

    statusActive: "نشط",
    statusInProgress: "قيد المعالجة",
    statusInactive: "غير نشط",

    tableStatus: "حالة الطاولة",
    tablesByState: "الطاولات حسب الحالة",

    totalRevenue: "الإيرادات المقدرة",

    noShowFollowup: "إعداد المتابعة / قائمة متابعة على مستوى الخادم.",

    vsPreviousMonth: "مقارنة بالشهر السابق",

    popularDishesApiHint:
      "يجب أن توفر الواجهة البرمجية بيانات الطلبات/المبيعات لهذا الترتيب.",

    promoCodeExample: "مثال: ANNIV10",
    offerName: "اسم العرض",
    priceDT: "السعر (د.ت)",

    addTheseTables: "إضافة هذه الطاولات",
    deleteAll: "حذف الكل",
    confirmDeleteAllTables: "حذف",

    tablesAddedShort: "طاولة تمت إضافتها",
    failuresShort: "حالات فشل",
    tablesDeletedShort: "طاولة تمت إزالتها",

    linkedReservationFailures: "طاولات لم يتم حذفها لأنها مرتبطة بحجوزات",

    tableAddedShort: "تمت إضافة الطاولة:",
    tableDeletedShort: "تم حذف الطاولة:",

    noComplaintsAdminSubtitle: "لم يتم تقديم أي شكوى.",

    complaintStatusUpdated: "تم تغيير حالة الشكوى إلى",

    noDishReviewsYet: "لا توجد تقييمات للأطباق حالياً.",

    viewDetails: "عرض التفاصيل",
    hideDetails: "إخفاء التفاصيل",

    exampleTableNumber: "مثال: 15",
    exampleCapacity: "مثال: 4 أشخاص",
    exampleQuantity: "مثال: 5",
    examplePeople: "مثال: 4",
    exampleDishName: "مثال: كسكسي ملكي",
    exampleCategoryName: "مثال: البيتزا",

    bulkTablesDescription: "إنشاء عدة طاولات بنفس عدد المقاعد وبأرقام متتالية.",

    statisticsPdfTitle: "إحصائيات — لو فوايلييه",
    statisticsSheetName: "الإحصائيات",
    averageRating: "متوسط التقييم",
    printPdf: "PDF / طباعة",
    excel: "Excel",
  },
};

// ======================================================
// LANGUAGE CONFIGURATION
// ======================================================

const LANGUAGE_KEY = "voilier_lang";
const LANGUAGE_EVENT = "voilier-language-changed";
const SUPPORTED_LANGUAGES = ["fr", "ar"];

// ======================================================
// GET CURRENT LANGUAGE
// ======================================================

export function getLanguage() {
  const saved = localStorage.getItem(LANGUAGE_KEY);

  if (SUPPORTED_LANGUAGES.includes(saved)) {
    return saved;
  }

  return "fr";
}

// ======================================================
// SET LANGUAGE
// ======================================================

export function setLanguage(lang) {
  const newLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : "fr";

  localStorage.setItem(LANGUAGE_KEY, newLang);

  document.documentElement.lang = newLang;
  document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";

  document.body.classList.toggle("rtl", newLang === "ar");

  window.dispatchEvent(
    new CustomEvent(LANGUAGE_EVENT, {
      detail: newLang,
    })
  );
}

// ======================================================
// TRANSLATION FUNCTION
// ======================================================

export function translate(key, lang = getLanguage()) {
  return translations[lang]?.[key] ?? translations.fr?.[key] ?? key;
}

// ======================================================
// TRANSLATION HOOK
// ======================================================

export function useTranslation() {
  const [lang, setLang] = useState(getLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.body.classList.toggle("rtl", lang === "ar");

    const updateLanguage = (event) => {
      const newLang = event.detail;

      if (SUPPORTED_LANGUAGES.includes(newLang)) {
        setLang(newLang);
      }
    };

    window.addEventListener(LANGUAGE_EVENT, updateLanguage);

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, updateLanguage);
    };
  }, [lang]);

  const t = (key) => {
    const currentTranslation = translations[lang]?.[key];

    if (currentTranslation !== undefined) {
      return currentTranslation;
    }

    return translations.fr?.[key] ?? key;
  };

  return {
    lang,
    t,
    setLanguage,
  };
}

// ======================================================
// TRANSLATE CATEGORY NAME
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
// TRANSLATE DISH NAME
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
// TRANSLATE STATUS
// ======================================================

export function translateStatus(status, lang = getLanguage()) {
  if (!status) return "";

  const normalized = String(status).trim().toLowerCase();

  const statuses = {
    fr: {
      pending: "En attente",
      "en attente": "En attente",
      confirmed: "Confirmée",
      confirmée: "Confirmée",
      accepted: "Acceptée",
      acceptée: "Acceptée",
      cancelled: "Annulée",
      canceled: "Annulée",
      annulée: "Annulée",
      completed: "Terminée",
      terminée: "Terminée",
      refused: "Refusée",
      refusée: "Refusée",
      rejected: "Refusée",
      nouvelle: "Nouvelle",
      "en cours": "En cours",
      résolue: "Résolue",
      résolu: "Résolu",
      réservée: "Réservée",
      libre: "Libre",
      occupée: "Occupée",
      available: "Disponible",
      unavailable: "Indisponible",
      occupied: "Occupée",
      free: "Libre",
      active: "Actif",
      inactive: "Inactif",
      "no-show": "No-show",
      noshow: "No-show",
    },

    ar: {
      pending: "قيد الانتظار",
      "en attente": "قيد الانتظار",
      confirmed: "مؤكد",
      confirmée: "مؤكد",
      accepted: "مقبول",
      acceptée: "مقبول",
      cancelled: "ملغى",
      canceled: "ملغى",
      annulée: "ملغى",
      completed: "مكتمل",
      terminée: "مكتمل",
      refused: "مرفوض",
      refusée: "مرفوض",
      rejected: "مرفوض",
      nouvelle: "جديدة",
      "en cours": "قيد المعالجة",
      résolue: "تم الحل",
      résolu: "تم الحل",
      réservée: "محجوزة",
      libre: "شاغرة",
      occupée: "مشغولة",
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
