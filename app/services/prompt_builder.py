def build_plan_prompt(area, year, topic, objective, time_min, mode, has_pdf, pages, relevant_pages):
    time_line = f"**Tiempo total disponible:** {time_min} minutos" if time_min else ""
    source = "PDF adjunto" if has_pdf else "Instrucciones generales (sin PDF)"
    
    pdf_context = ""
    if has_pdf and pages:
        pdf_context = "\n\nContenido del PDF (páginas relevantes):\n"
        for page in pages:
            if page['page'] in relevant_pages:
                text = page['text'][:1000]  # trim to ~1000 chars
                pdf_context += f"Página {page['page']}: {text}\n\n"
    
    prompt = f"""
You are EduPlanner AI (Ecuador). Generate a clear, actionable LESSON PLAN in **Spanish** (neutral). 
If PDF context is provided, anchor definitions/examples to that PDF and **cite pages** like `[Fuente: PDF, p. X]`.
If no PDF is present, generate using only the form inputs and DO NOT include any citations; add the note: 
"Basado en instrucciones generales (sin PDF)".

Constraints:
- 2–4 sequential strategies tailored to {year} and {area}; 
- if {time_min} is provided, assign time per strategy and do not exceed it;
- at most 1 external link; 
- simple, direct, imperative instructions.

Output (strict Markdown):
# Plan de Clase: {topic}
**Área:** {area}  
**Año:** {year}  
**Objetivo de Aprendizaje:** {objective}  
{time_line}
**Fuente principal:** {source}

## Mapa de Contenidos desde el PDF
{pdf_context if has_pdf else "> (Sección no aplicable; sin PDF)"}

## Estrategia 1: *[título breve]*
### (1) Guía para el Docente
- …
{ " (Tiempo estimado: X min)" if time_min else ""}
### (2) Instrucciones para el Estudiante
- …
### (3) Instrumento de Evaluación
- Rúbrica (3 niveles) or Cuestionario (3–5 ítems) with respuestas esperadas.

## Estrategia 2: *[título breve]*
- …

{ "> **Ajustes de interactividad aplicados**: …" if mode == "más interactivo" else "" }

## Diferenciación
- Apoyos: …
- Extensiones: …

## Errores Frecuentes y Correcciones
- …

## Cierre y Verificación Rápida
- Mini-quiz (2–3 ítems) alineado al objetivo.

## Recursos y Materiales
{ "- Ítems del PDF — [Fuente: PDF, p. X]\n - (Máx. 1 enlace externo)" if has_pdf else " - (Máx. 1 enlace externo)" }
"""
    return prompt

def build_activity_prompt(title, objective, area, year, topic, time_min, tipo_instrumento, preferencias, has_pdf, pages, relevant_pages):
    time_hint = f"**Tiempo estimado:** {time_min} minutos" if time_min else ""
    
    pdf_context = ""
    if has_pdf and pages:
        pdf_context = "\n\nContenido del PDF (páginas relevantes):\n"
        for page in pages:
            if page['page'] in relevant_pages:
                text = page['text'][:1000]
                pdf_context += f"Página {page['page']}: {text}\n\n"
    
    prompt = f"""
You are EduPlanner AI. Generate ONE learning activity in **Spanish** (neutral). 
If PDF context is provided, anchor relevant facts and **cite pages** `[Fuente: PDF, p. X]`. 
If no PDF, generate from inputs only (no citations).

Strict Markdown:
## Actividad: {title}
**Objetivo vinculado:** {objective}  
{time_hint}

### (1) Guía para el Docente
- Apertura → Desarrollo → Cierre; chequeos de comprensión.

### (2) Instrucciones para el Estudiante
- Imperativos listos para leer en clase.

### (3) Instrumento de Evaluación — {tipo_instrumento}
- If rúbrica: 2–4 criterios; 3 niveles (Excelente / Satisfactorio / En progreso) with descriptors.
- If cuestionario: 3–5 ítems + respuestas esperadas.
- If estudio de caso: scenario, guiding questions, and achievement criteria.
{pdf_context if has_pdf else ""}
"""
    return prompt

def build_grading_prompt(rubrica, evidencia):
    prompt = f"""
You are "Calificador Rúbrica AI". Evaluate in **Spanish** (neutral). 
Use EXACTLY the rubric provided; do not invent criteria. 
For each criterion, choose ONE level, give a brief specific comment, 
and compute the weighted total on a 0–100 scale.

Rubric: {rubrica}
Evidence: {evidencia}

Output:
# Resultado de Evaluación — {rubrica['nombre']}

## Detalle por criterio
- **Criterio:** {{criterio.nombre}}
  - Nivel seleccionado: {{nivel.nombre}}
  - Puntaje: {{nivel.puntaje}} / {{nivel.puntaje}}
  - Comentario: {{comentario}}

## Puntaje total
- **Total ponderado:** {{total}}/100

## Feedback global
- {{feedback_global}}

Also include a machine-readable JSON object after the Markdown:
{{
  "criterios":[{{"criterio":"…","nivel":"…","puntaje":..., "comentario":"…"}}],
  "total": ...,
  "feedback_global": "…"
}}
"""
    return prompt