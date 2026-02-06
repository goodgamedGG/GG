import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
    en: {
        home: 'Home',
        games: 'Games',
        categories: 'Categories',
        about: 'About',
        privacyPolicy: 'Privacy Policy',
        newsletter: 'Newsletter',
        login: 'Login',
        signIn: 'Sign In',
        signup: 'Sign Up',
        search: 'Search games...',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        new: 'NEW',
        sale: 'SALE',
        featured: 'Featured',
        popular: 'Popular',
        all: 'All',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        rightsReserved: 'All rights reserved.',
        // Cart Translations
        cartTitle: 'Shopping Cart',
        emptyCart: 'Your cart is empty',
        browseGames: 'Browse Games',
        checkout: 'Checkout',
        subtotal: 'Subtotal',
        total: 'Total',
        remove: 'Remove',
        quantity: 'Quantity',
        price: 'Price',
        clearCart: 'Clear Cart',
        summary: 'Order Summary'
    },
    ar: {
        home: 'الرئيسية',
        games: 'الألعاب',
        categories: 'التصنيفات',
        about: 'من نحن',
        privacyPolicy: 'سياسة الخصوصية',
        newsletter: 'النشرة البريدية',
        login: 'تسجيل الدخول',
        signIn: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        search: 'ابحث عن الألعاب...',
        addToCart: 'أضف للسلة',
        buyNow: 'شراء الآن',
        new: 'جديد',
        sale: 'خصم',
        featured: 'متميز',
        popular: 'شائع',
        all: 'الكل',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تم بنجاح',
        rightsReserved: 'جميع الحقوق محفوظة.',
        // Cart Translations
        cartTitle: 'سلة التسوق',
        emptyCart: 'سلة التسوق فارغة',
        browseGames: 'تصفح الألعاب',
        checkout: 'إتمام الشراء',
        subtotal: 'المجموع الفرعي',
        total: 'المجموع الإجمالي',
        remove: 'حذف',
        quantity: 'الكمية',
        price: 'السعر',
        clearCart: 'إفراغ السلة',
        summary: 'ملخص الطلب'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const t = (key) => {
        return translations[language][key] || key;
    };

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

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
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
