from flask import Blueprint, request, jsonify
from groq import Groq
import os

question_bp = Blueprint('question', __name__)

@question_bp.route('/generate-question', methods=['POST'])
def generate_question():
    data = request.json
    summary = data.get('summary')
    role = data.get('role')
    difficulty = data.get('difficulty')
    step = data.get('currentStep', 1)

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    # The AI now knows the role and the resume summary
    prompt = (
        f"You are an expert interviewer for a {role} position. "
        f"The candidate is at a {difficulty} level. "
        f"Candidate Resume Summary: {summary}. "
        f"This is question #{step}. Ask a deep, practical question to test their skills. "
        "Keep the question under 30 words."
    )

    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
    )
    
    return jsonify({"question": response.choices[0].message.content})