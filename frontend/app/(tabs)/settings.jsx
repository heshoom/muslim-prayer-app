import React, { useState } from 'react';

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState('light');
    const [language, setLanguage] = useState('en');

    return (
        <div style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
            <h2>Settings</h2>
            
            <div style={{ marginBottom: 24 }}>
                <label>
                    <strong>Prayer Notifications</strong>
                    <br />
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                    /> Enable notifications
                </label>
            </div>

            <div style={{ marginBottom: 24 }}>
                <label>
                    <strong>Theme</strong>
                    <br />
                    <select value={theme} onChange={e => setTheme(e.target.value)}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: 24 }}>
                <label>
                    <strong>Language</strong>
                    <br />
                    <select value={language} onChange={e => setLanguage(e.target.value)}>
                        <option value="en">English</option>
                        <option value="ar">Arabic</option>
                        <option value="ur">Urdu</option>
                        <option value="tr">Turkish</option>
                    </select>
                </label>
            </div>

            <div>
                <button style={{ padding: '8px 16px', borderRadius: 4, background: '#2d8f6f', color: '#fff', border: 'none' }}>
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;