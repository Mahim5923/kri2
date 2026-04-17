import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InterviewRoom = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { summary, feedback, score, role, difficulty, totalQuestions } = location.state || {};

    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null); // For Recording
    const [recordedChunks, setRecordedChunks] = useState([]);

    const [question, setQuestion] = useState("Hello! Let's begin the interview.");
    const [transcript, setTranscript] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [isListening, setIsListening] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // --- 1. SPEECH TO TEXT (TRANSCRIPTION) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
    }

    // --- 2. RECORDING LOGIC (VIDEO + AUDIO) ---
    const startRecording = (stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
    };

    const stopAndSaveVideo = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `interview_recording_${role}.webm`;
            a.click(); // Automatically downloads for the user
        }
    };

    // --- 3. INITIALIZATION ---
    useEffect(() => {
        const initSession = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                startRecording(stream); // Start recording as soon as camera starts
            } catch (err) { console.error("Hardware access error:", err); }
        };
        initSession();
    }, []);

    // --- 4. HANDLING ANSWERS ---
    const toggleListening = () => {
        if (isListening) {
            recognition.stop();
            setIsListening(false);
            // Move to next question after stopping
            if (currentStep < totalQuestions) {
                setCurrentStep(prev => prev + 1);
                fetchNextQuestion();
            } else {
                handleFinish();
            }
        } else {
            setTranscript(""); // Reset for new answer
            recognition.start();
            setIsListening(true);
        }
    };

    if (recognition) {
        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            setTranscript(text);
        };
    }

    const fetchNextQuestion = async () => {
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/generate-question', {
                summary, role, difficulty, currentStep: currentStep + 1
            });
            setQuestion(res.data.question);
        } catch (err) { console.error("Fetch error", err); }
    };

    const handleFinish = () => {
        stopAndSaveVideo();
        setIsFinished(true);
    };

    if (isFinished) {
        return (
            <div style={styles.reportContainer}>
                <h1>Interview Complete</h1>
                <p>ATS Match Score: {score}%</p>
                <div style={styles.feedbackCard}>
                    <h3>Resume Feedback:</h3>
                    <p>{feedback}</p>
                </div>
                <button onClick={() => navigate('/')} style={styles.button}>Restart</button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>{role} Mock Interview</h2>
            <div style={styles.mainLayout}>
                <div style={styles.videoWrapper}>
                    <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
                    {isListening && <div style={styles.recordingDot}>● Transcribing Audio</div>}
                </div>

                <div style={styles.aiBox}>
                    <p style={styles.questionText}>{question}</p>
                    <div style={styles.transcriptBox}>
                        <strong>Your Answer:</strong>
                        <p>{transcript || "Waiting for you to speak..."}</p>
                    </div>
                    <button onClick={toggleListening} style={{ ...styles.button, background: isListening ? '#ff4b2b' : '#00d2ff' }}>
                        {isListening ? "Stop & Submit Answer" : "Start Answering"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', background: '#121212', color: 'white', minHeight: '100vh' },
    mainLayout: { display: 'flex', gap: '20px', marginTop: '20px' },
    videoWrapper: { width: '50%', position: 'relative', borderRadius: '15px', overflow: 'hidden', background: '#000' },
    video: { width: '100%', transform: 'scaleX(-1)' },
    recordingDot: { position: 'absolute', top: '20px', left: '20px', color: 'red', fontWeight: 'bold' },
    aiBox: { width: '50%', padding: '30px', background: '#1e1e1e', borderRadius: '15px' },
    questionText: { fontSize: '1.4rem', color: '#00ffcc', marginBottom: '20px' },
    transcriptBox: { background: '#2a2a2a', padding: '15px', borderRadius: '10px', height: '150px', overflowY: 'auto', marginBottom: '20px', fontSize: '0.9rem' },
    button: { padding: '15px 30px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    reportContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#121212', color: 'white' },
    feedbackCard: { background: '#1e1e1e', padding: '20px', borderRadius: '10px', maxWidth: '600px', margin: '20px' }
};

export default InterviewRoom;