# EduPlanner AI

A multi-page Flask app for teachers in Ecuador to generate lesson plans, activities, and grade with rubrics using AI.

## Setup

1. Create venv: `python -m venv venv`
2. Activate: `source venv/bin/activate`
3. Install: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`
5. Run: `python run.py`

## Usage

Open `http://localhost:5000`. Use tabs for Plan, Activities, Grade.

## API Examples

### Plan (with PDF)
```bash
curl -X POST -F "areaConocimiento=Ciencias Naturales" -F "anioLectivo=1er Grado" -F "temaCentral=Fotosíntesis" -F "objetivoAprendizaje=Comprender el proceso" -F "materialBasePdf=@file.pdf" http://localhost:5000/api/plan
```

### Plan (without PDF)
```bash
curl -X POST -d "areaConocimiento=Matemáticas&anioLectivo=2do Grado&temaCentral=Suma&objetivoAprendizaje=Resolver sumas" http://localhost:5000/api/plan
```

### Activity
```bash
curl -X POST -F "titulo=Actividad de Suma" -F "tipoInstrumento=rubrica" http://localhost:5000/api/actividad
```

### Grade
```bash
curl -X POST -H "Content-Type: application/json" -d '{"rubrica":{"nombre":"Test","criterios":[{"nombre":"Content","peso":0.5,"niveles":[{"nombre":"Good","descriptor":"...","puntaje":10}]}]},"evidencia":{"tipo":"texto","contenido":"Sample"}}' http://localhost:5000/api/calificar