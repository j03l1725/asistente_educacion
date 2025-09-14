from flask import Flask, jsonify, render_template, send_file, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from io import BytesIO

load_dotenv()

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    CORS(app, origins=['http://localhost:5000'])

    # Register blueprints
    from .blueprints.plan import plan_bp
    from .blueprints.actividad import actividad_bp
    from .blueprints.calificar import calificar_bp

    app.register_blueprint(plan_bp, url_prefix='/api')
    app.register_blueprint(actividad_bp, url_prefix='/api')
    app.register_blueprint(calificar_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return render_template('plan.html')

    @app.route('/plan')
    def plan_page():
        return render_template('plan.html')

    @app.route('/actividad')
    def actividad_page():
        return render_template('actividad.html')

    @app.route('/calificar')
    def calificar_page():
        return render_template('calificar.html')

    @app.route('/convertir')
    def convertir_page():
        return render_template('convertir.html')

    @app.route('/api/download_pdf', methods=['POST'])
    def download_pdf():
        from .services.pdf_generator import generate_pdf_from_markdown
        data = request.get_json()
        markdown = data.get('markdown', '')
        pdf_buffer = generate_pdf_from_markdown(markdown)
        return send_file(pdf_buffer, as_attachment=True, download_name='generated_content.pdf', mimetype='application/pdf')

    @app.route('/api/convert', methods=['POST'])
    def convert_file():
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file provided'}), 400
        filename = secure_filename(file.filename)
        filepath = os.path.join('uploads', filename)
        file.save(filepath)
        try:
            if filename.lower().endswith('.pdf'):
                with open(filepath, 'rb') as f:
                    pdf_data = f.read()
                return send_file(BytesIO(pdf_data), as_attachment=True, download_name='converted.pdf', mimetype='application/pdf')
            elif filename.lower().endswith('.txt'):
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read()
                from .services.pdf_generator import generate_pdf_from_text
                pdf_buffer = generate_pdf_from_text(text)
                return send_file(pdf_buffer, as_attachment=True, download_name='converted.pdf', mimetype='application/pdf')
            else:
                return jsonify({'error': 'Unsupported file type. Only .txt and .pdf are supported.'}), 400
        finally:
            os.remove(filepath)

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Solicitud incorrecta. Verifique los datos enviados.'}), 400

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Error interno del servidor. Inténtelo de nuevo más tarde.'}), 500

    return app