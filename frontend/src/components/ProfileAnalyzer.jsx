import React from 'react';

const ProfileAnalyzer = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="glow-text" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Profile Analysis</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Analyze your GitHub and Coding Profiles</p>
      </div>

      <div className="glass-panel" style={{ width: '500px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>GitHub Username</label>
          <input
            type="text"
            placeholder="Enter username (e.g. torvalds)"
            className="input-field"
          />
        </div>

        <button className="btn-primary pulse-dot" style={{ marginTop: '10px' }} onClick={() => alert("Backend integration coming soon!")}>
          Analyze Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileAnalyzer;
