import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { forgotPassword } = useAuth();
    const { t, isRTL } = useLanguage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || err.message || (isRTL ? 'فشل إرسال بريد إعادة التعيين. يرجى المحاولة مرة أخرى.' : 'Failed to send reset email. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#fff' }}>
                {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {isRTL 
                    ? 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.'
                    : 'Enter your email address and we\'ll send you a link to reset your password.'
                }
            </p>
            
            {error && <div className="error-message">{error}</div>}
            
            {success ? (
                <div style={{ 
                    background: 'rgba(0, 217, 255, 0.1)', 
                    color: 'var(--color-cyan-primary)', 
                    padding: '15px', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    marginBottom: '20px',
                    borderLeft: '3px solid var(--color-cyan-primary)'
                }}>
                    {isRTL 
                        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.'
                        : 'Password reset link has been sent to your email. Please check your inbox.'
                    }
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">{isRTL ? 'عنوان البريد الإلكتروني' : 'Email Address'}</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? (isRTL ? 'جاري الإرسال...' : 'Sending...') : (isRTL ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')}
                    </button>
                </form>
            )}

            <div className="auth-footer">
                <Link to="/login" className="auth-link">{isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
