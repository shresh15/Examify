import pdfplumber
import sys
import json
import requests
import os
import re

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

def clean_text(text):
    """Removes extra whitespaces and noisy characters."""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_mcqs_from_text(text_content, num_questions):
    """Calls Gemini API to generate MCQs."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    
    if not api_key:
        return {"error": "GEMINI_API_KEY not found in environment variables."}

    # STABLE API ENDPOINT AND MODEL NAME
    # Using 'v1' instead of 'v1beta' for better reliability
    # Using gemini-2.5-flash which is free and available
    model_name = "gemini-2.5-flash" 
    api_url = f"https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={api_key}"

    # Refined prompt for better JSON consistency
    prompt = (
        f"Context: {text_content[:4000]}\n\n" # Limit text to stay within token limits
        f"Task: Based on the text above, generate exactly {num_questions} Multiple Choice Questions (MCQs).\n"
        f"Requirements:\n"
        f"1. Each question must have 4 options (A, B, C, D).\n"
        f"2. Indicate the 'correct_answer' as 'A', 'B', 'C', or 'D'.\n"
        f"3. Return ONLY a valid JSON array of objects with keys: 'question', 'options', and 'correct_answer'.\n"
        f"4. Do not include any text before or after the JSON array. Return only the JSON array.\n"
        f"Example format: [{{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_answer\": \"A\"}}, ...]"
    )

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
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
        
        # Navigate the Google API response structure
        if 'candidates' in result and result['candidates']:
            candidate = result['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                json_string = candidate['content']['parts'][0]['text']
                
                # Try to extract JSON from the response (in case there's extra text)
                # Look for JSON array pattern
                json_match = re.search(r'\[.*\]', json_string, re.DOTALL)
                if json_match:
                    json_string = json_match.group(0)
                
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
        # Read arguments from Node.js execFile
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No PDF file path provided."}))
            sys.exit(1)

        pdf_file_path = sys.argv[1]
        # Default to 10 if not provided or invalid
        try:
            requested_count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        except ValueError:
            requested_count = 10
        
        output = {"text": "", "questions": [], "error": None}

        # 1. Extract
        extracted_text = extract_text_from_pdf(pdf_file_path)
        
        if isinstance(extracted_text, dict) and "error" in extracted_text:
            print(json.dumps(extracted_text))
            sys.exit(1)

        output["text"] = extracted_text
        
        # 2. Clean
        cleaned_content = clean_text(extracted_text)

        # 3. Generate
        if len(cleaned_content) < 50:
            output["error"] = "The PDF contains too little text to generate questions."
        else:
            questions_result = generate_mcqs_from_text(cleaned_content, requested_count)
            
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