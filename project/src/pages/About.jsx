import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const About = () => {
    const { t, isRTL } = useLanguage();

    return (
        <div className="container" style={{ minHeight: '60vh', padding: 'var(--spacing-xl) 0', maxWidth: '800px', direction: isRTL ? 'rtl' : 'ltr' }}>
            <h1 style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '32px',
                color: 'var(--color-cyan-primary)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {t('aboutTitle')}
            </h1>

            <div style={{
                background: 'var(--color-bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: 'var(--spacing-xl)',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.8'
            }}>
                <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{
                        color: 'var(--color-cyan-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {t('whoWeAre')}
                    </h2>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                        {isRTL
                            ? 'SUB HUB هو وجهتك المميزة للحصول على أفضل تجربة ألعاب. نحن متخصصون في توفير أحدث وأروع الألعاب وبطاقات الهدايا وخدمات الألعاب للاعبين المتحمسين في مصر وما بعدها.'
                            : 'SUB HUB is your premier destination for premium gaming access. We specialize in providing the latest and greatest games, gift cards, and gaming services to passionate gamers across Egypt and beyond.'
                        }
                    </p>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                        {isRTL
                            ? 'مهمتنا هي جعل الألعاب في متناول الجميع وبأسعار معقولة وممتعة. سواء كنت لاعبًا عاديًا أو محترفًا، SUB HUB لديه شيء لك.'
                            : 'Our mission is to make gaming accessible, affordable, and enjoyable for everyone. Whether you\'re a casual player or a hardcore enthusiast, SUB HUB has something for you.'
                        }
                    </p>
                </section>

                <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{
                        color: 'var(--color-cyan-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {t('whatWeOffer')}
                    </h2>
                    <ul style={{ marginLeft: isRTL ? '0' : 'var(--spacing-lg)', marginRight: isRTL ? 'var(--spacing-lg)' : '0', marginBottom: 'var(--spacing-md)' }}>
                        <li><strong>{isRTL ? 'ألعاب مميزة:' : 'Premium Games:'}</strong> {isRTL ? 'الوصول إلى أحدث العناوين AAA والألعاب المستقلة' : 'Access to the latest AAA titles and indie gems'}</li>
                        <li><strong>{isRTL ? 'بطاقات الهدايا:' : 'Gift Cards:'}</strong> {isRTL ? 'بطاقات الهدايا الرقمية لجميع منصات الألعاب الرئيسية' : 'Digital gift cards for all major gaming platforms'}</li>
                        <li><strong>{isRTL ? 'معاملات آمنة:' : 'Secure Transactions:'}</strong> {isRTL ? 'معالجة دفع آمنة وموثوقة' : 'Safe and reliable payment processing'}</li>
                        <li><strong>{isRTL ? 'تسليم سريع:' : 'Fast Delivery:'}</strong> {isRTL ? 'تسليم رقمي فوري لمعظم المنتجات' : 'Instant digital delivery for most products'}</li>
                        <li><strong>{isRTL ? 'دعم العملاء:' : 'Customer Support:'}</strong> {isRTL ? 'فريق دعم مخصص جاهز للمساعدة' : 'Dedicated support team ready to help'}</li>
                    </ul>
                </section>

                <section style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h2 style={{
                        color: 'var(--color-cyan-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {t('ourValues')}
                    </h2>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>{isRTL ? 'الجودة' : 'Quality'}</h3>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'نحن نقدم فقط منتجات أصلية عالية الجودة من الناشرين والمطورين الموثوقين.'
                                : 'We only offer authentic, high-quality products from trusted publishers and developers.'
                            }
                        </p>
                    </div>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>{isRTL ? 'الأمان' : 'Security'}</h3>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'الأمان والخصوصية لديكم هي أولوياتنا القصوى. نستخدم تشفيرًا ومعايير أمان على مستوى الصناعة.'
                                : 'Your security and privacy are our top priorities. We use industry-standard encryption and security measures.'
                            }
                        </p>
                    </div>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>{isRTL ? 'العميل أولاً' : 'Customer First'}</h3>
                        <p style={{ marginBottom: 'var(--spacing-md)' }}>
                            {isRTL
                                ? 'نحن ملتزمون بتقديم خدمة عملاء ودعم استثنائي.'
                                : 'We\'re committed to providing exceptional customer service and support.'
                            }
                        </p>
                    </div>
                </section>

                <section>
                    <h2 style={{
                        color: 'var(--color-cyan-primary)',
                        fontFamily: 'Orbitron, sans-serif',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        {t('contactUs')}
                    </h2>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                        {isRTL ? 'لديك أسئلة أو تحتاج إلى مساعدة؟ نحن هنا للمساعدة!' : 'Have questions or need assistance? We\'re here to help!'}
                    </p>
                    <p style={{ marginBottom: 'var(--spacing-md)' }}>
                        <strong>{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</strong> support@subhub.com<br />
                        <strong>{isRTL ? 'الهاتف:' : 'Phone:'}</strong> +20 XXX XXX XXXX<br />
                        <strong>{isRTL ? 'العنوان:' : 'Address:'}</strong> SUB HUB Gaming, Egypt
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
