from flask import Blueprint, request, jsonify
import os
import json
from werkzeug.utils import secure_filename
from ..services.pdf_utils import extract_pdf_pages
from ..services.prompt_builder import build_grading_prompt
from ..services.llm import generate

calificar_bp = Blueprint('calificar', __name__)

@calificar_bp.route('/calificar', methods=['POST'])
def calificar():
    try:
        # Handle JSON or multipart
        if request.is_json:
            data = request.get_json()
            rubrica = data.get('rubrica')
            evidencia = data.get('evidencia')
        else:
            rubrica = json.loads(request.form.get('rubrica'))
            evidencia = json.loads(request.form.get('evidencia'))
            # If tipo=archivo, get the file
            if evidencia.get('tipo') == 'archivo':
                file = request.files.get('contenido')
                if file:
                    filename = secure_filename(file.filename)
                    filepath = os.path.join('uploads', filename)
                    file.save(filepath)
                    try:
                        pages, _ = extract_pdf_pages(filepath)
                        evidencia['contenido'] = ' '.join([p['text'] for p in pages])
                    except:
                        evidencia['contenido'] = 'Error al procesar el archivo.'
                    finally:
                        os.remove(filepath)

        if not rubrica or not evidencia:
            return jsonify({'error': 'Faltan rubrica o evidencia.'}), 400

        prompt = build_grading_prompt(rubrica, evidencia)
        response = generate(prompt)

        # Split markdown and JSON
        parts = response.split('```json')
        markdown = parts[0].strip()
        json_str = parts[1].split('```')[0].strip() if len(parts) > 1 else '{}'
        json_data = json.loads(json_str)

        return jsonify({
            'markdown': markdown,
            'json': json_data
        })

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor. Inténtelo de nuevo más tarde.'}), 500