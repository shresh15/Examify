import pdfplumber
import spacy
import sys
import json
import requests
import os
import re

# Load spaCy English model locally (fast, zero API cost)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = None  # Handled cleanly in main() if model isn't downloaded yet

def extract_text_from_pdf(pdf_path):
    """Extracts raw text from the provided PDF path."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
    except Exception as e:
        return {"error": f"PDF Extraction Failed: {str(e)}"}

def regex_clean_text(text):
    """Fixes PDF extraction artifacts using regex."""
    # Rejoin words split across lines with a hyphen (e.g., "infor-\nmation" -> "information")
    text = re.sub(r'([a-zA-Z])-\s*\n\s*([a-zA-Z])', r'\1\2', text)
    # Remove standalone page numbers (e.g., lines containing only digits or "Page 1 of 10")
    text = re.sub(r'(?im)^\s*(?:page\s*)?\d+(?:\s*(?:of|/)\s*\d+)?\s*$', '', text)
    # Collapse multiple newlines into a single space so spaCy sees continuous paragraphs
    text = re.sub(r'\n+', ' ', text)
    # Collapse multiple spaces/tabs
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def extract_high_value_context(cleaned_text, max_chars=18000):
    """Uses spaCy to filter noise and select the most informative sentences."""
    if not nlp:
        return cleaned_text[:max_chars]

    # Process up to 100k chars locally to keep execution fast
    doc = nlp(cleaned_text[:100000])
    
    valid_sentences = []
    for idx, sent in enumerate(doc.sents):
        sent_text = sent.text.strip()
        
        # 1. Skip very short fragments or overly long garbage strings
        words = [token for token in sent if not token.is_space and not token.is_punct]
        if len(words) < 6 or len(words) > 120:
            continue
            
        # 2. Must contain at least one verb/auxiliary (filters out titles, headers, TOC entries)
        has_verb = any(token.pos_ in ("VERB", "AUX") for token in sent)
        if not has_verb:
            continue

        # 3. Score information density (Named Entities + Noun Chunks + Numbers/Acronyms)
        entity_score = len(sent.ents) * 2
        noun_chunk_score = len(list(sent.noun_chunks))
        density_score = (entity_score + noun_chunk_score) / len(words)
        
        valid_sentences.append((idx, density_score, sent_text))

    # Fallback if text had unusual formatting
    if not valid_sentences:
        return cleaned_text[:max_chars]

    # If the entire valid text fits within max_chars, keep all of it in original order
    total_len = sum(len(s[2]) + 1 for s in valid_sentences)
    if total_len <= max_chars:
        return " ".join(s[2] for s in valid_sentences)

    # Otherwise, pick the highest-density sentences up to max_chars, then restore document order
    ranked = sorted(valid_sentences, key=lambda x: x[1], reverse=True)
    selected = []
    current_len = 0
    for item in ranked:
        if current_len + len(item[2]) + 1 <= max_chars:
            selected.append(item)
            current_len += len(item[2]) + 1

    # Re-sort by original index so narrative flow stays intact for Gemini
    selected.sort(key=lambda x: x[0])
    return " ".join(s[2] for s in selected)

def generate_mcqs_from_text(text_content, num_questions):
    """Single call to Gemini 3.8 Flash with Structured Outputs to generate MCQs."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return {"error": "GEMINI_API_KEY not found in environment variables."}

    model_name = "gemini-3.8-flash"
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"

    prompt = (
        f"Context:\n{text_content}\n\n"
        f"Task: Based strictly on the context above, generate exactly {num_questions} high-quality "
        f"Multiple Choice Questions (MCQs).\n"
        f"Requirements:\n"
        f"1. Test key concepts, facts, and relationships present in the text.\n"
        f"2. Each question must have 4 distinct, plausible options (do not prefix options with 'A.', 'B.', etc.).\n"
        f"3. Set 'correct_answer' to 'A' (index 0), 'B' (index 1), 'C' (index 2), or 'D' (index 3)."
    )

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "ARRAY",
                "description": f"List of {num_questions} multiple choice questions.",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "question": {
                            "type": "STRING",
                            "description": "The question text."
                        },
                        "options": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                            "description": "Exactly 4 answer choices corresponding to A, B, C, and D."
                        },
                        "correct_answer": {
                            "type": "STRING",
                            "enum": ["A", "B", "C", "D"],
                            "description": "The letter of the correct option."
                        }
                    },
                    "required": ["question", "options", "correct_answer"]
                }
            }
        }
    }

    try:
        response = requests.post(
            api_url,
            headers={'Content-Type': 'application/json'},
            json=payload,
            timeout=90
        )

        if response.status_code != 200:
            try:
                error_data = response.json()
                error_msg = error_data.get('error', {}).get('message', 'Unknown API Error')
            except (ValueError, json.JSONDecodeError):
                error_msg = response.text[:200] if response.text else 'Unknown API Error'
            return {"error": f"Google API {response.status_code}: {error_msg}"}

        result = response.json()
        if 'candidates' in result and result['candidates']:
            candidate = result['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                json_string = candidate['content']['parts'][0]['text']
                try:
                    return json.loads(json_string)
                except json.JSONDecodeError as e:
                    return {"error": f"Failed to parse JSON response: {str(e)}. Response: {json_string[:200]}"}

        return {"error": "API returned an empty or invalid response structure."}

    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

if __name__ == "__main__":
    # Ensure standard output uses UTF-8 to prevent encoding crashes on Windows
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No PDF file path provided."}))
            sys.exit(1)

        if nlp is None:
            print(json.dumps({"error": "spaCy model 'en_core_web_sm' not found. Run: python -m spacy download en_core_web_sm"}))
            sys.exit(1)

        pdf_file_path = sys.argv[1]
        try:
            requested_count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        except ValueError:
            requested_count = 10

        output = {"text": "", "questions": [], "error": None}

        # 1. Extract raw text from PDF
        extracted_text = extract_text_from_pdf(pdf_file_path)
        if isinstance(extracted_text, dict) and "error" in extracted_text:
            print(json.dumps(extracted_text))
            sys.exit(1)

        # 2. Local Regex + spaCy NLP Pipeline (0 API calls)
        regex_cleaned = regex_clean_text(extracted_text)
        curated_context = extract_high_value_context(regex_cleaned, max_chars=18000)
        output["text"] = curated_context

        # 3. Single Gemini API Call for MCQ Generation
        if len(curated_context) < 50:
            output["error"] = "The PDF contains too little valid text to generate questions."
        else:
            questions_result = generate_mcqs_from_text(curated_context, requested_count)
            
            if isinstance(questions_result, dict) and "error" in questions_result:
                output["error"] = questions_result["error"]
            else:
                output["questions"] = questions_result

        # Final Output to Node.js
        print(json.dumps(output))

    except Exception as e:
        error_output = {
            "error": f"Unexpected error in Python script: {str(e)}",
            "text": "",
            "questions": []
        }
        print(json.dumps(error_output))
        sys.exit(1)