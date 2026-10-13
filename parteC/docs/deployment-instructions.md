# Pasos manuales pendientes (Fase 1 y despliegue)

Estos pasos requieren tu propia máquina/cuenta y **no pueden ser ejecutados por un agente de código en un contenedor cloud** (no hay GUI, no hay acceso a tus credenciales de Replit, no hay forma de instalar un IDE de escritorio en este entorno). Quedan documentados aquí en vez de simular que ya están hechos.

## 1. Cursor (Fase 1)

1. Descargá Cursor desde https://cursor.com e instalalo.
2. Abrí la carpeta `parteC/` como workspace del proyecto.
3. Cursor detecta automáticamente el archivo `.cursorrules` en la raíz de `parteC/` — no necesitás configurarlo manualmente, el IDE lo lee solo al abrir el proyecto.
4. Probá el flujo del enunciado: abrí el Composer (`Cmd+I` / `Ctrl+I`) y pedile algo como "agregá un nuevo tipo de transporte, patineta eléctrica, con su factor de emisión" — deberías ver que respeta las reglas del `.cursorrules` (separación de capas, tests, sin dependencias pesadas).

## 2. Replit (despliegue)

1. Entrá a https://replit.com y creá una cuenta (o iniciá sesión).
2. "Create Repl" → "Import from GitHub" → pegá la URL de este repositorio.
3. En la raíz del Repl, configurá el comando de arranque (archivo `.replit` o el botón "Run") para que ejecute:
   ```bash
   pip install -r parteC/requirements.txt
   streamlit run parteC/app/streamlit_app.py --server.port $PORT --server.address 0.0.0.0
   ```
4. Dale a "Run". Replit expone automáticamente una URL pública (`https://<tu-repl>.<tu-usuario>.repl.co`) mientras el proceso esté corriendo.
5. Esa URL es el entregable "URL del Repl" pedido en el enunciado.

## 3. Captura de pantalla

Con Cursor abierto en una ventana (mostrando `.cursorrules` cargado y el Composer activo) y la URL de Replit abierta en el navegador en otra, tomá una captura con ambas visibles — es el entregable de "captura de pantalla del entorno operando en conjunto".

## Por qué esto no está ya hecho en la entrega

Un agente de código como el que generó este repositorio corre en un contenedor sin interfaz gráfica: puede escribir, testear y versionar código real (lo cual sí se hizo, con los 8 tests pasando), pero no puede abrir una ventana de Cursor, loguearse en Replit en tu nombre, ni tomar una captura de tu pantalla. Son, por diseño, los tres pasos de este ejercicio donde la "orquestación" vuelve a tus manos.
