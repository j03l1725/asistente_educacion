from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from ..services.pdf_utils import extract_pdf_pages, find_relevant_pages
from ..services.prompt_builder import build_activity_prompt
from ..services.llm import generate

actividad_bp = Blueprint('actividad', __name__)

@actividad_bp.route('/actividad', methods=['POST'])
def generate_actividad():
    try:
        plan_id = request.form.get('planId')
        title = request.form.get('titulo')
        objective = request.form.get('objetivoAprendizaje')
        area = request.form.get('areaConocimiento')
        year = request.form.get('anioLectivo')
        topic = request.form.get('temaCentral')
        time_min = request.form.get('tiempoMin', type=int)
        tipo_instrumento = request.form.get('tipoInstrumento')
        preferencias = request.form.get('preferencias')
        file = request.files.get('materialBasePdf')

        if not title or not tipo_instrumento:
            return jsonify({'error': 'Faltan campos requeridos: titulo, tipoInstrumento.'}), 400

        if time_min and time_min < 5:
            return jsonify({'error': 'tiempoMin debe ser al menos 5.'}), 400

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
                query = f"{title} {objective} {area} {topic}"
                relevant_page_nums = find_relevant_pages(pdf_pages, query)
                citations = relevant_page_nums
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo PDF. Asegúrese de que sea un PDF válido.'}), 400
            finally:
                os.remove(filepath)

        prompt = build_activity_prompt(title, objective, area, year, topic, time_min, tipo_instrumento, preferencias, has_pdf, pdf_pages, citations)
        response = generate(prompt)
        markdown = response

        return jsonify({'markdown': markdown})

    except Exception as e:
        return jsonify({'error': 'Error interno del servidor. Inténtelo de nuevo más tarde.'}), 500