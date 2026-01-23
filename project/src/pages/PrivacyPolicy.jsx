import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
    const { t, isRTL } = useLanguage();

    return (
        <>
            <Header />
            <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', maxWidth: '800px', direction: isRTL ? 'rtl' : 'ltr' }}>
                <h1 style={{ 
                    fontFamily: 'Orbitron, sans-serif', 
                    fontSize: '32px', 
                    color: 'var(--color-cyan-primary)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    {t('privacyTitle')}
                </h1>

                <div style={{
                    background: 'var(--color-bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: 'var(--spacing-xl)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.8'
                }}>
                    <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-muted)' }}>
                        {isRTL ? 'آخر تحديث:' : 'Last updated:'} {new Date().toLocaleDateString()}
                    </p>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            1. {t('introduction')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'مرحبًا بك في SUB HUB Gaming. نحن ملتزمون بحماية خصوصيتك وضمان حصولك على تجربة إيجابية على موقعنا. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها.'
                                : 'Welcome to SUB HUB Gaming. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, and safeguard your personal information.'
                            }
                        </p>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            2. {t('informationWeCollect')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL ? 'نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك:' : 'We collect information that you provide directly to us, including:'}
                        </p>
                        <ul style={{ marginLeft: isRTL ? '0' : 'var(--spacing-lg)', marginRight: isRTL ? 'var(--spacing-lg)' : '0', marginBottom: 'var(--spacing-md)' }}>
                            <li>{isRTL ? 'الاسم ومعلومات الاتصال (البريد الإلكتروني، رقم الهاتف)' : 'Name and contact information (email, phone number)'}</li>
                            <li>{isRTL ? 'بيانات اعتماد الحساب ومعلومات الملف الشخصي' : 'Account credentials and profile information'}</li>
                            <li>{isRTL ? 'معلومات الدفع وسجل المعاملات' : 'Payment information and transaction history'}</li>
                            <li>{isRTL ? 'سجل الطلبات والتفضيلات' : 'Order history and preferences'}</li>
                            <li>{isRTL ? 'تفضيلات الاتصال' : 'Communication preferences'}</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            3. {t('howWeUse')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL ? 'نستخدم المعلومات التي نجمعها لـ:' : 'We use the information we collect to:'}
                        </p>
                        <ul style={{ marginLeft: isRTL ? '0' : 'var(--spacing-lg)', marginRight: isRTL ? 'var(--spacing-lg)' : '0', marginBottom: 'var(--spacing-md)' }}>
                            <li>{isRTL ? 'معالجة وتنفيذ طلباتك' : 'Process and fulfill your orders'}</li>
                            <li>{isRTL ? 'إرسال تأكيدات الطلبات والتحديثات' : 'Send you order confirmations and updates'}</li>
                            <li>{isRTL ? 'الرد على استفساراتك وتقديم دعم العملاء' : 'Respond to your inquiries and provide customer support'}</li>
                            <li>{isRTL ? 'تحسين خدماتنا وتجربة المستخدم' : 'Improve our services and user experience'}</li>
                            <li>{isRTL ? 'إرسال رسائل ترويجية (بموافقتك)' : 'Send you promotional communications (with your consent)'}</li>
                            <li>{isRTL ? 'اكتشاف ومنع الاحتيال وإساءة الاستخدام' : 'Detect and prevent fraud and abuse'}</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            4. {t('informationSharing')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك فقط في الحالات التالية:'
                                : 'We do not sell your personal information. We may share your information only in the following circumstances:'
                            }
                        </p>
                        <ul style={{ marginLeft: isRTL ? '0' : 'var(--spacing-lg)', marginRight: isRTL ? 'var(--spacing-lg)' : '0', marginBottom: 'var(--spacing-md)' }}>
                            <li>{isRTL ? 'مع مقدمي الخدمات الذين يساعدوننا في تشغيل موقعنا' : 'With service providers who assist us in operating our website'}</li>
                            <li>{isRTL ? 'عندما يقتضي القانون أو لحماية حقوقنا' : 'When required by law or to protect our rights'}</li>
                            <li>{isRTL ? 'في اتصال بنقل تجاري أو اندماج' : 'In connection with a business transfer or merger'}</li>
                            <li>{isRTL ? 'بموافقتك الصريحة' : 'With your explicit consent'}</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            5. {t('dataSecurity')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية ضد الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.'
                                : 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.'
                            }
                        </p>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            6. {t('yourRights')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL ? 'لديك الحق في:' : 'You have the right to:'}
                        </p>
                        <ul style={{ marginLeft: isRTL ? '0' : 'var(--spacing-lg)', marginRight: isRTL ? 'var(--spacing-lg)' : '0', marginBottom: 'var(--spacing-md)' }}>
                            <li>{isRTL ? 'الوصول والحصول على نسخة من بياناتك الشخصية' : 'Access and receive a copy of your personal data'}</li>
                            <li>{isRTL ? 'تصحيح البيانات غير الدقيقة أو غير الكاملة' : 'Rectify inaccurate or incomplete data'}</li>
                            <li>{isRTL ? 'طلب حذف بياناتك الشخصية' : 'Request deletion of your personal data'}</li>
                            <li>{isRTL ? 'الاعتراض على معالجة بياناتك الشخصية' : 'Object to processing of your personal data'}</li>
                            <li>{isRTL ? 'سحب الموافقة في أي وقت' : 'Withdraw consent at any time'}</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            7. {t('cookies')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربتك وتحليل الاستخدام والمساعدة في جهود التسويق. يمكنك التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح.'
                                : 'We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist in marketing efforts. You can control cookie preferences through your browser settings.'
                            }
                        </p>
                    </section>

                    <section>
                        <h2 style={{ 
                            color: 'var(--color-cyan-primary)',
                            fontFamily: 'Orbitron, sans-serif',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            8. {t('contactUs')}
                        </h2>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى الاتصال بنا على:'
                                : 'If you have any questions about this Privacy Policy or our data practices, please contact us at:'
                            }
                        </p>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL ? 'البريد الإلكتروني:' : 'Email:'} privacy@subhub.com<br />
                            {isRTL ? 'العنوان:' : 'Address:'} SUB HUB Gaming, Egypt
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
