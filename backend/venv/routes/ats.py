import fitz  # PyMuPDF
import os
from flask import Blueprint, request, jsonify
from groq import Groq

ats_bp = Blueprint('ats', __name__)

def extract_text_from_pdf(file_storage):
    doc = fitz.open(stream=file_storage.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@ats_bp.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return jsonify({"error": "Missing API Key"}), 500
    
    client = Groq(api_key=api_key)

    if 'resume' not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400
    
    # We now pull 'role' and 'difficulty' instead of 'job_description'
    target_role = request.form.get('role', 'Software Engineer')
    difficulty = request.form.get('difficulty', 'Intermediate')
    resume_file = request.files['resume']
    
    try:
        resume_text = extract_text_from_pdf(resume_file)

        # AI Prompt: Act as an Industry Expert ATS
        analysis_prompt = (
            f"Role: {target_role}\n"
            f"Target Level: {difficulty}\n"
            f"Resume Content: {resume_text[:3000]}\n\n"
            "Task: Evaluate this resume against industry standards for the role and level above.\n"
            "Provide a response in exactly this format:\n"
            "SCORE: [Provide a number from 0-100 based on role fit]\n"
            "SUMMARY: [A 2-sentence summary of strengths/weaknesses for the interviewer]\n"
            "IMPROVEMENTS: [3 bullet points of specific technical/professional things missing from this resume]"
        )
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": analysis_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5 # Lower temperature for more consistent scoring
        )
        
        raw_output = response.choices[0].message.content

        # Robust Parsing
        score = 0
        summary = "No summary generated."
        improvements = "No specific improvements found."

        try:
            score = raw_output.split("SUMMARY:")[0].replace("SCORE:", "").strip()
            summary = raw_output.split("SUMMARY:")[1].split("IMPROVEMENTS:")[0].strip()
            improvements = raw_output.split("IMPROVEMENTS:")[1].strip()
        except:
            # Fallback if AI messes up the format
            summary = raw_output

        return jsonify({
            "match_score": score,
            "candidate_summary": summary,
            "resume_feedback": improvements,
            "status": "Success"
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Internal processing error"}), 500