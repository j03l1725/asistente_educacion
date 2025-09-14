from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from ..services.pdf_utils import extract_pdf_pages, find_relevant_pages
from ..services.prompt_builder import build_plan_prompt
from ..services.llm import generate

plan_bp = Blueprint('plan', __name__)

@plan_bp.route('/plan', methods=['POST'])
def generate_plan():
    try:
        area = request.form.get('areaConocimiento')
        year = request.form.get('anioLectivo')
        topic = request.form.get('temaCentral')
        objective = request.form.get('objetivoAprendizaje')
        time_min = request.form.get('tiempoDisponibleMin', type=int)
        mode = request.form.get('modo', 'estándar')
        file = request.files.get('materialBasePdf')

        if not all([area, year, topic, objective]):
            return jsonify({'error': 'Faltan campos requeridos: areaConocimiento, anioLectivo, temaCentral, objetivoAprendizaje.'}), 400

        pdf_pages = []
        has_pdf = False
        citations = []
        if file and file.filename:
            filename = secure_filename(file.filename)
            filepath = os.path.join('uploads', filename)
            file.save(filepath)
            try:
                pdf_pages, _ = extract_pdf_pages(filepath)
                has_pdf = True
                query = f"{area} {topic} {objective}"
                relevant_page_nums = find_relevant_pages(pdf_pages, query)
                citations = relevant_page_nums
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo PDF. Asegúrese de que sea un PDF válido.'}), 400
            finally:
                os.remove(filepath)

        prompt = build_plan_prompt(area, year, topic, objective, time_min, mode, has_pdf, pdf_pages, citations)
        response = generate(prompt)
        markdown = response

        return jsonify({
            'markdown': markdown,
            'citations': citations,
            'hasPdf': has_pdf
        })

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor. Inténtelo de nuevo más tarde.'}), 500