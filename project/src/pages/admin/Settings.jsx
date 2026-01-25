import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, X } from 'lucide-react';
import adminAPI from '../../api/admin';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingKey, setEditingKey] = useState(null);
    const [editFormData, setEditFormData] = useState({
        value: '',
        description: '',
        isPublic: false
    });
    const [newSetting, setNewSetting] = useState({
        key: '',
        value: '',
        category: 'general',
        description: '',
        isPublic: false
    });
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getSettings();
            setSettings(result?.data?.settings || {});
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (key, setting) => {
        setEditingKey(key);
        setEditFormData({
            value: typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value),
            description: setting.description || '',
            isPublic: setting.isPublic || false
        });
    };

    const handleSave = async () => {
        if (!editingKey) return;

        try {
            setSaving(true);
            let value = editFormData.value;
            
            // Try to parse as JSON if it looks like JSON
            if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // Not valid JSON, use as string
                }
            }
            // Try to parse as number
            else if (!isNaN(value) && value.trim() !== '') {
                value = parseFloat(value);
            }
            // Try to parse as boolean
            else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                value = value.toLowerCase() === 'true';
            }

            await adminAPI.updateSetting(editingKey, value, editFormData.description, editFormData.isPublic);
            setEditingKey(null);
            loadSettings();
        } catch (error) {
            alert('Failed to save setting: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            let value = newSetting.value;
            
            // Try to parse as JSON, number, or boolean
            if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                try {
                    value = JSON.parse(value);
                } catch (e) {}
            } else if (!isNaN(value) && value.trim() !== '') {
                value = parseFloat(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                value = value.toLowerCase() === 'true';
            }

            await adminAPI.updateSetting(newSetting.key, value, newSetting.description, newSetting.isPublic);
            setIsNewModalOpen(false);
            setNewSetting({ key: '', value: '', category: 'general', description: '', isPublic: false });
            loadSettings();
        } catch (error) {
            alert('Failed to create setting: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const renderValue = (value) => {
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        if (typeof value === 'boolean') {
            return value ? 'true' : 'false';
        }
        return String(value);
    };

    const getValueType = (value) => {
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'object') return 'object';
        return 'string';
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Configure system settings
                    </p>
                </div>
                <button onClick={() => setIsNewModalOpen(true)} className="btn-primary">
                    <SettingsIcon size={18} />
                    Add Setting
                </button>
            </header>

            {loading ? (
                <div className="empty-state">Loading settings...</div>
            ) : Object.keys(settings).length === 0 ? (
                <div className="empty-state">
                    <SettingsIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No settings found.</p>
                    <button onClick={() => setIsNewModalOpen(true)} className="btn-primary" style={{ marginTop: '16px' }}>
                        Add Your First Setting
                    </button>
                </div>
            ) : (
                <div>
                    {Object.entries(settings).map(([category, categorySettings]) => (
                        <div key={category} style={{ marginBottom: '30px' }}>
                            <h2 style={{ 
                                fontFamily: 'Orbitron, sans-serif', 
                                fontSize: '18px', 
                                marginBottom: '16px',
                                textTransform: 'capitalize',
                                color: 'var(--color-cyan-primary)'
                            }}>
                                {category}
                            </h2>
                            <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Key</th>
                                            <th>Value</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Public</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categorySettings.map((setting, idx) => (
                                            <tr key={setting._id || idx}>
                                                <td>
                                                    <code style={{ 
                                                        background: 'var(--color-bg-secondary)', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '4px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '12px'
                                                    }}>
                                                        {setting.key}
                                                    </code>
                                                </td>
                                                <td>
                                                    {editingKey === setting.key ? (
                                                        <input
                                                            type={getValueType(setting.value) === 'number' ? 'number' : 'text'}
                                                            className="form-input"
                                                            value={editFormData.value}
                                                            onChange={e => setEditFormData({ ...editFormData, value: e.target.value })}
                                                            style={{ minWidth: '200px' }}
                                                        />
                                                    ) : (
                                                        <span style={{ 
                                                            fontFamily: 'monospace', 
                                                            fontSize: '13px',
                                                            color: typeof setting.value === 'boolean' 
                                                                ? (setting.value ? '#00ff80' : '#ff6464')
                                                                : 'var(--color-text-primary)'
                                                        }}>
                                                            {renderValue(setting.value)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ 
                                                        fontSize: '11px', 
                                                        padding: '2px 8px', 
                                                        background: 'var(--color-bg-secondary)', 
                                                        borderRadius: '12px',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {getValueType(setting.value)}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {setting.description || '-'}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${setting.isPublic ? 'status-active' : 'status-inactive'}`}>
                                                        {setting.isPublic ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {editingKey === setting.key ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button 
                                                                onClick={handleSave} 
                                                                className="icon-btn"
                                                                disabled={saving}
                                                                title="Save"
                                                            >
                                                                <Save size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingKey(null)} 
                                                                className="icon-btn"
                                                                title="Cancel"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleEdit(setting.key, setting)} 
                                                            className="icon-btn"
                                                            title="Edit"
                                                        >
                                                            <Save size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Setting Modal */}
            {isNewModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Setting</h2>
                            <button onClick={() => setIsNewModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Setting Key *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newSetting.key}
                                    onChange={e => setNewSetting({ ...newSetting, key: e.target.value })}
                                    required
                                    placeholder="e.g., site.name"
                                    style={{ fontFamily: 'monospace' }}
                                />
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Use dot notation for categories (e.g., site.name, email.enabled)
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Value *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newSetting.value}
                                    onChange={e => setNewSetting({ ...newSetting, value: e.target.value })}
                                    required
                                    placeholder="Setting value"
                                />
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Use "true"/"false" for booleans, numbers for numbers, JSON for objects
                                </p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newSetting.category}
                                    onChange={e => setNewSetting({ ...newSetting, category: e.target.value })}
                                    placeholder="general"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={newSetting.description}
                                    onChange={e => setNewSetting({ ...newSetting, description: e.target.value })}
                                    placeholder="Setting description"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newSetting.isPublic}
                                        onChange={e => setNewSetting({ ...newSetting, isPublic: e.target.checked })}
                                    />
                                    <span>Public (accessible without authentication)</span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsNewModalOpen(false)} 
                                    className="btn-secondary" 
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary" 
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    disabled={saving}
                                >
                                    <Save size={18} />
                                    Create Setting
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
