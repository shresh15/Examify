import pdfplumber
import sys
import json
import requests
import os
import re
import spacy

# Load spaCy English model once globally
nlp = spacy.load("en_core_web_sm")

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                # Extract text or empty if None
                text += page.extract_text() or ""
            return text
    except Exception as e:
        print(f"ERROR: Failed to extract text from PDF: {str(e)}", file=sys.stderr)
        return {"error": f"Failed to extract text from PDF: {str(e)}"}

# Regex-based cleaning and splitting
def clean_text(text):
    # Remove page numbers and multiple line breaks
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'Page \d+', '', text, flags=re.IGNORECASE)
    return text.strip()

def split_into_question_blocks(text):
    # Split on lines starting with numbers for question boundaries (e.g., "1.", "2.", ...)
    blocks = re.split(r'\n\d+\.\s', text)
    return [b.strip() for b in blocks if b.strip()]

def preprocess_question_text(text):
    # NLP-based normalization: lemmatization, lowercasing, remove stopwords, punctuation
    doc = nlp(text)
    tokens = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]
    return " ".join(tokens)

# Function to generate MCQ questions using the Gemini API
def generate_mcqs_from_text(text_content):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable not set.", file=sys.stderr)
        return {"error": "API key missing"}

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

    prompt = (
        f"Generate 10 multiple-choice questions (MCQs) from the following text. "
        f"Each question should have 4 options (A, B, C, D) and specify the correct answer letter. "
        f"Ensure questions are clear, concise, and directly related to the text. "
        f"Return the output as a JSON array of objects, each with 'question', 'options' (array of strings), and 'correct_answer' (string: 'A', 'B', 'C', or 'D').\n\n"
        f"Text:\n{text_content}"
    )

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "question": {"type": "STRING"},
                        "options": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                            "minItems": 4,
                            "maxItems": 4
                        },
                        "correct_answer": {"type": "STRING"}
                    },
                    "required": ["question", "options", "correct_answer"]
                }
            }
        }
    }

    try:
        response = requests.post(api_url, headers={'Content-Type': 'application/json'}, json=payload)
        response.raise_for_status()
        result = response.json()

        if (
            result.get('candidates')
            and len(result['candidates']) > 0
            and result['candidates'][0].get('content')
            and 'parts' in result['candidates'][0]['content']
            and len(result['candidates'][0]['content']['parts']) > 0
        ):
            json_string = result['candidates'][0]['content']['parts'][0]['text']
            return json.loads(json_string)
        else:
            print(f"ERROR: Unexpected Gemini API response structure: {result}", file=sys.stderr)
            return []
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Gemini API request failed: {e}", file=sys.stderr)
        return {"error": f"API request failed: {str(e)}"}
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse Gemini API JSON: {e}", file=sys.stderr)
        return {"error": f"JSON parsing error: {str(e)}"}
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}", file=sys.stderr)
        return {"error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF file path provided."}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    full_output = {}

    # Step 1: Extract text from the PDF
    extracted_text_result = extract_text_from_pdf(pdf_path)

    # Check if error occurred during text extraction
    if isinstance(extracted_text_result, dict) and "error" in extracted_text_result:
        print(json.dumps({"error": extracted_text_result["error"], "text": "", "questions": []}))
        sys.exit(1)

    raw_text = extracted_text_result
    full_output["text"] = raw_text

    # Step 2: Clean the raw text
    cleaned_text = clean_text(raw_text)

    # Step 3: Split into question blocks
    question_blocks = split_into_question_blocks(cleaned_text)

    # Step 4: Preprocess each question block using NLP
    preprocessed_blocks = [preprocess_question_text(q) for q in question_blocks]

    # Join preprocessed blocks into one string to send to Gemini API
    text_for_gemini = "\n\n".join(preprocessed_blocks)

    MIN_TEXT_LENGTH = 100
    if len(text_for_gemini.strip()) < MIN_TEXT_LENGTH:
        full_output["questions"] = []
        full_output["warning"] = f"Text too short ({len(text_for_gemini.strip())} chars) for question generation."
        print(json.dumps(full_output))
        sys.exit(0)

    # Step 5: Generate MCQs using Gemini API
    generated_mcqs = generate_mcqs_from_text(text_for_gemini)

    # Handling the API response
    full_output["error"] = ""
    if isinstance(generated_mcqs, dict) and "error" in generated_mcqs:
        full_output["questions"] = []
        full_output["error"] = generated_mcqs["error"]
    elif isinstance(generated_mcqs, list):
        full_output["questions"] = generated_mcqs
    else:
        full_output["questions"] = []
        full_output["error"] = "Unknown error: Unexpected Gemini API response format."

    # Output the final combined JSON result
    print(json.dumps(full_output))
