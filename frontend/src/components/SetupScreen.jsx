import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SetupScreen = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [qCount, setQCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startAnalysis = async () => {
    if (!file || !role) {
      alert("Please upload a resume and select a role!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role); // Sent to Backend
    formData.append('difficulty', difficulty); // Sent to Backend

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/analyze-resume', formData);

      navigate('/interview', {
        state: {
          summary: response.data.candidate_summary,
          feedback: response.data.resume_feedback,
          score: response.data.match_score,
          role: role,
          difficulty: difficulty,
          totalQuestions: qCount
        }
      });
    } catch (error) {
      alert("Server error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: '#00d2ff' }}>Mock Interview Setup</h2>

        <label>Select Role (Technical or Non-Tech)</label>
        <input
          list="roles"
          placeholder="Type or select a role"
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        />
        <datalist id="roles">
          <option value="Software Engineer" /><option value="HR Manager" />
          <option value="Sales Executive" /><option value="Data Analyst" />
          <option value="Product Designer" /><option value="Marketing Lead" />
        </datalist>

        <label>Difficulty</label>
        <select onChange={(e) => setDifficulty(e.target.value)} style={styles.input}>
          <option>Entry Level</option><option>Intermediate</option><option>Senior</option>
        </select>

        <label>Questions</label>
        <input type="number" value={qCount} onChange={(e) => setQCount(e.target.value)} style={styles.input} />

        <label>Resume (PDF)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />

        <button onClick={startAnalysis} disabled={loading} style={styles.button}>
          {loading ? "Analyzing Profile..." : "Start Interview"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#121212', color: 'white' },
  card: { background: '#1e1e1e', padding: '40px', borderRadius: '15px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '10px', borderRadius: '5px', background: '#2a2a2a', color: 'white', border: '1px solid #444' },
  button: { padding: '15px', borderRadius: '8px', background: '#00d2ff', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};

export default SetupScreen;