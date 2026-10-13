# Vibe Report — EcoTrack

## Cómo configuré las reglas del agente

El `.cursorrules` no lo escribí como una lista de preferencias de estilo sueltas, sino como las reglas que yo mismo necesitaba para no tener que revisar cada línea: separar lógica de negocio de interfaz (para poder testear sin levantar Streamlit), prohibir dependencias pesadas para un parser que resuelve regex y diccionarios, y, la regla que más usé en la práctica, "no corrijas silenciosamente requisitos ambiguos: preguntá o declará el supuesto". Esa última regla cambió el tono de toda la sesión: en vez de recibir código que "adivinaba" lo que yo quería, recibí decisiones explícitas (ej. "voy a tratar una ventana de un día como el recorte temporal del historial, avisame si querés otra cosa") que podía aprobar o corregir en segundos.

## Dificultades al delegar

La dificultad real no fue que la IA escribiera mal el código — fue describir bien el síntoma cuando algo fallaba. La primera vez que el parser duplicó la emisión de "carne de res" (contando "carne" y la frase completa por separado), mi primer impulso fue abrir el archivo y arreglarlo yo mismo. Forzarme a describir el síntoma, sin proponer la solución, resultó en un fix distinto al que tenía en mente (ordenar las palabras clave por longitud y descartar solapamientos) y más robusto, porque cubría casos que no había considerado. La lección: delegar no es "pedir una solución", es describir el problema con precisión y dejar espacio para que la solución no sea la que yo imaginaba.

El otro límite real, y el más importante de nombrar con honestidad: hay pasos de este ejercicio que un agente de código no puede ejecutar por mí, porque ocurren fuera de cualquier terminal o editor — instalar Cursor como aplicación de escritorio, crear una cuenta de Replit, y tomar una captura de pantalla de ambas herramientas abiertas en mi propia máquina. Delegar funciona para la lógica, la arquitectura y el testing; no funciona para acciones que requieren mis propias credenciales y mi propia pantalla. Documenté esos pasos exactos para ejecutarlos yo mismo, en vez de simular que "ya estaban hechos".

## De escribir código a orquestar una visión

La diferencia se nota en qué ocupa la atención. Dejé de pensar en "¿cómo escribo este regex?" y empecé a pensar en "¿qué pasa si el usuario escribe una frase ambigua?", "¿qué necesito ver en el historial para que esto se sienta útil?". Es un cambio de nivel de abstracción real: la calidad del resultado dependió menos de mi habilidad para escribir Python y más de mi habilidad para anticipar casos de borde y comunicarlos con precisión. También es incómodo al principio — se siente como perder control — hasta que el ciclo de "describir, revisar, aprobar o corregir" se vuelve más rápido que escribir y depurar a mano, y ahí el vibe coding deja de ser una curiosidad y se vuelve la forma más eficiente de llegar al mismo resultado.
