import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

def generate(prompt, max_output_tokens=2800, temperature=0.3, top_p=0.9):
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=max_output_tokens,
                temperature=temperature,
                top_p=top_p
            )
        )
        return response.text
    except Exception as e:
        raise Exception(f"Error generating content: {str(e)}")