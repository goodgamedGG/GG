import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        // Navigation
        home: 'HOME',
        games: 'GAMES',
        giftCards: 'GIFT CARDS',
        signIn: 'SIGN IN',
        signUp: 'SIGN UP',
        createAccount: 'CREATE ACCOUNT',
        logout: 'LOGOUT',
        dashboard: 'DASHBOARD',
        cart: 'CART',
        checkout: 'CHECKOUT',
        about: 'ABOUT',
        privacyPolicy: 'PRIVACY POLICY',
        
        // Common
        searchGames: 'Search games...',
        signedInAs: 'Signed in as',
        language: 'Language',
        
        // Games Section
        bestSeller: 'Best Seller',
        noGamesFound: 'No games found.',
        checkAdminDashboard: 'Check the Admin Dashboard to add games.',
        loadingGames: 'Loading Games...',
        
        // Footer
        newsletter: 'Newsletter $99UP',
        
        // Pages
        aboutTitle: 'About SUB HUB',
        privacyTitle: 'Privacy Policy',
        cartTitle: 'Shopping Cart',
        checkoutTitle: 'Checkout',
        
        // Cart
        emptyCart: 'Your cart is empty',
        browseGames: 'Browse Games',
        subtotal: 'Subtotal',
        discount: 'Discount',
        total: 'Total',
        proceedToCheckout: 'Proceed to Checkout',
        removeItem: 'Remove item',
        updateQuantity: 'Update quantity',
        
        // Checkout
        orderInformation: 'Order Information',
        fullName: 'Full Name',
        email: 'Email',
        phoneNumber: 'Phone Number',
        paymentMethod: 'Payment Method',
        placeOrder: 'Place Order',
        orderSummary: 'Order Summary',
        
        // About
        whoWeAre: 'Who We Are',
        whatWeOffer: 'What We Offer',
        ourValues: 'Our Values',
        contactUs: 'Contact Us',
        joinCommunity: 'Join Our Community',
        
        // Privacy
        introduction: 'Introduction',
        informationWeCollect: 'Information We Collect',
        howWeUse: 'How We Use Your Information',
        informationSharing: 'Information Sharing',
        dataSecurity: 'Data Security',
        yourRights: 'Your Rights',
        cookies: 'Cookies',
    },
    ar: {
        // Navigation
        home: 'الرئيسية',
        games: 'الألعاب',
        giftCards: 'بطاقات الهدايا',
        signIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        createAccount: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        dashboard: 'لوحة التحكم',
        cart: 'السلة',
        checkout: 'الدفع',
        about: 'من نحن',
        privacyPolicy: 'سياسة الخصوصية',
        
        // Common
        searchGames: 'ابحث عن الألعاب...',
        signedInAs: 'تم تسجيل الدخول كـ',
        language: 'اللغة',
        
        // Games Section
        bestSeller: 'الأكثر مبيعاً',
        noGamesFound: 'لا توجد ألعاب.',
        checkAdminDashboard: 'تحقق من لوحة التحكم لإضافة ألعاب.',
        loadingGames: 'جاري تحميل الألعاب...',
        
        // Footer
        newsletter: 'النشرة الإخبارية $99UP',
        
        // Pages
        aboutTitle: 'من نحن - SUB HUB',
        privacyTitle: 'سياسة الخصوصية',
        cartTitle: 'سلة التسوق',
        checkoutTitle: 'الدفع',
        
        // Cart
        emptyCart: 'سلة التسوق فارغة',
        browseGames: 'تصفح الألعاب',
        subtotal: 'المجموع الفرعي',
        discount: 'الخصم',
        total: 'الإجمالي',
        proceedToCheckout: 'المتابعة للدفع',
        removeItem: 'إزالة العنصر',
        updateQuantity: 'تحديث الكمية',
        
        // Checkout
        orderInformation: 'معلومات الطلب',
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phoneNumber: 'رقم الهاتف',
        paymentMethod: 'طريقة الدفع',
        placeOrder: 'تأكيد الطلب',
        orderSummary: 'ملخص الطلب',
        
        // About
        whoWeAre: 'من نحن',
        whatWeOffer: 'ما نقدمه',
        ourValues: 'قيمنا',
        contactUs: 'اتصل بنا',
        joinCommunity: 'انضم إلى مجتمعنا',
        
        // Privacy
        introduction: 'مقدمة',
        informationWeCollect: 'المعلومات التي نجمعها',
        howWeUse: 'كيف نستخدم معلوماتك',
        informationSharing: 'مشاركة المعلومات',
        dataSecurity: 'أمان البيانات',
        yourRights: 'حقوقك',
        cookies: 'ملفات تعريف الارتباط',
    }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL: language === 'ar'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export default LanguageContext;
