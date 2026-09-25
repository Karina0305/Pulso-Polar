# Pulso Polar — primeras dos pantallas

Abre `index.html` en tu navegador. Conserva la estructura de carpetas al copiar o subir el proyecto. No requiere instalación ni compilación.

## Archivos
- `index.html`: pantalla 1, introducción a las auroras y al campo magnético.
- `pantalla2.html`: pantalla 2, visualización interactiva del índice Kp.
- `css/styles.css`: estilos compartidos, adaptación a celulares y animación.
- `js/script.js`: consulta a NOAA, cambios de color y ritmo, simulación y pausa.
- `assets/cosmos.png`: fondo artístico inspirado en las referencias proporcionadas.
- `assets/favicon.svg`: icono del sitio.

Los textos son HTML editable. El fondo es una recreación artística; no una reproducción exacta de las imágenes originales.

## Datos e interpretación
Fuente: https://www.swpc.noaa.gov/products/planetary-k-index
JSON: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json

Se consulta al abrir la segunda pantalla y cada cinco minutos mientras está visible en modo NOAA. Se muestra la fecha del registro en UTC, no se confunde con la hora de consulta. El Kp observado corresponde a intervalos de tres horas. Un registro con más de seis horas se identifica como antiguo. La consulta requiere internet y que la fuente permita el acceso desde el navegador. Si falla, aparece un aviso; nunca se inventan datos observados.

La relación de Kp con el corazón es una interpretación artística: menos de 3 = verde/lento; de 3 a menos de 5 = amarillo/normal; de 5 a menos de 7 = naranja/rápido; de 7 a 9 = rojo/muy rápido. No es la escala oficial de tormentas de NOAA ni una predicción local de auroras. El control deslizante activa una simulación explícita.

## Energía del pulso (pantalla 2)
El índice Kp es planetario (global, un solo valor). La energía del pulso es la potencia auroral (HPI en GW, modelo Ovation) de la misma fuente NOAA SWPC que el Kp: http://services.swpc.noaa.gov/text/aurora-nowcast-hemi-power.txt — Se muestra como un único valor, media en vivo de ambos hemisferios, junto al BPM como segunda dimensión del mismo latido (frecuencia + fuerza), y se actualiza cada 60 segundos con el resto de los datos. Si la fuente no responde, se muestra "cargando" o "sin datos" y la onda conserva el Kp planetario; nunca se inventan valores.

## Subir a GitHub
En tu repositorio, sube el contenido de esta carpeta manteniendo `index.html` en la raíz y las carpetas `css`, `js` y `assets` junto a él. No se ha creado ni publicado un repositorio desde esta entrega; la dirección de tu repositorio no fue incluida en el mensaje.

## Alcance de esta entrega
Incluye las primeras dos pantallas solicitadas. La cédula de referencia menciona tres pantallas y documentación del proceso; la tercera pantalla y esa documentación quedan fuera de esta entrega. `index.html` cuenta como la primera de las dos páginas HTML, no como una página adicional.

## Fondo
Generado con la herramienta integrada ImageGen, a partir de la referencia visual del usuario. Prompt utilizado: crear un fondo cósmico horizontal de 1920 × 1134 inspirado en Pulso Polar, con textura granulada, auroras azules, violetas y turquesas, estrellas, montañas oscuras abajo y un globo terrestre azul en la mitad derecha; retirar todos los textos, flechas, botones y paneles, dejando la mitad izquierda más oscura para superponer texto HTML.

## Corrección de la segunda pantalla
La segunda pantalla ahora utiliza `assets/pantalla-2-original.jpg`, la imagen original proporcionada por el usuario, sin regenerar el fondo ni cambiar sus recuadros. Se muestra completa y se escala proporcionalmente. Los textos fijos y marcadores entre corchetes forman parte de esa imagen y no son texto HTML editable. Pulsa el recuadro superior derecho para abrir los datos reales y los controles; esos elementos sí son HTML. Para reconstruir todos los textos como HTML sin alterar la ilustración, se necesita el fondo original sin textos ni recuadros. La primera pantalla no se modificó en esta corrección.

## Cursor de partículas
Ambas páginas incluyen `css/particulas.css` y `js/particulas.js`. El cursor se convierte en destellos dispersos verdes, azules y violetas con movimiento suave y estela. Los destellos utilizan fragmentos de `assets/particulas-original.png`, el archivo original proporcionado, sin modificarlo. Un pequeño punto luminoso marca el lugar exacto del clic. La capa no intercepta clics y funciona también dentro del panel de datos. En pantallas táctiles y con la preferencia de movimiento reducido se conserva el comportamiento normal. No cambia el diseño ni el fondo de las pantallas. La nube dibujada en la imagen fija de la pantalla 2 sigue siendo parte de esa imagen; la nueva animación es la que acompaña al cursor.

## Tierra animada en la primera pantalla
Se utiliza `assets/tierra-original.png`, la imagen proporcionada por el usuario, superpuesta al planeta del fondo y recortada mediante CSS. `css/tierra.css` aplica un giro 2D horario, de 360 grados cada 480 segundos. El texto se mantiene fijo y la segunda pantalla no cambia. Se respeta la preferencia de movimiento reducido. Para cambiar la velocidad, modifica `480s` en `.tierra-giro`.




## Aurora original restaurada
Se retiró el fondo procedural. El fondo utiliza nuevamente las imágenes separadas entregadas por el usuario: `aurora-separada.jpg` y `cielo-montanas.jpg`. Se conservan sus colores, curvas y textura. La aurora completa sube y baja con un ciclo de ocho segundos; un filtro SVG añade ondulación continua. Las estrellas se desplazan lateralmente y las montañas permanecen fijas. El botón permite animar o pausar el fondo, incluso si el sistema solicita movimiento reducido.
Abre `fondo.html` para revisar solo el fondo o `index.html` para ver la página completa.

## Aurora sonora (nueva página de prueba)
Abre `aurora-sonora.html`. Esta página independiente desarrolla la nueva idea sin reemplazar las pantallas anteriores.
- En silencio: cinta recta, sin oscilación.
- Micrófono: pulsa «Usar micrófono» y concede permiso. No se conecta a los altavoces, para evitar realimentación; no se graba ni se transmite.
- Archivo: elige un audio y pulsa reproducir en el reproductor. Se analiza y reproduce localmente.
- Demostración: muestra curvas simuladas y está identificada como tal.
- Detener: pausa el audio, cierra el micrófono y devuelve la cinta al reposo.
- Sensibilidad: ajusta la respuesta al volumen de entrada.

La forma es una interpretación artística, no un osciloscopio exacto: la amplitud sigue el volumen RMS y el ritmo de desplazamiento varía con las bandas de frecuencia. El silencio real tiene una pequeña puerta de ruido para mantener la línea estable. La cinta se dibuja en un canvas transparente y se puede integrar sobre el fondo de la página; su fondo oscuro pertenece al CSS de la vista de prueba.

La captura de micrófono requiere un navegador compatible y un contexto que la permita (HTTPS, localhost o archivo local según navegador). Si no está disponible, la página explica cómo continuar con un archivo o demostración. Validación: archivo WAV con tono, silencio y tono; reposo; demostración; detener y pantalla móvil. No se capturó un micrófono físico durante las pruebas.

Archivos: `aurora-sonora.html`, `css/aurora-sonora.css`, `js/aurora-sonora.js`.
Documentación técnica: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatTimeDomainData y https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

### Ajuste de estilo de la aurora sonora
La cinta ahora tiene textura granulada generada en un canvas auxiliar, colores verde menta, azul y violeta mezclados, grosor irregular y bordes transparentes difusos. El dibujo sigue la misma curva y respuesta sonora aprobadas; no incorpora el patrón de cuadros de la referencia. Se verificó la respuesta a tono, silencio y tono, así como detener y la vista móvil.

### Movimiento fluido y dispersión de color
La aurora usa ahora `assets/aurora-textura.png`, una textura creada con la herramienta integrada ImageGen a partir de la referencia. Su preparación y deformación se hacen en el canvas sin modificar el PNG. Se suavizan los cambios de velocidad; la cinta se ensancha al acercarse las crestas a los extremos y los colores se desplazan dentro de ella. Una capa difusa se mueve por separado para dispersar los pigmentos alrededor del borde. El reposo continúa siendo una línea recta, con una circulación suave de color.

La demostración es simulada; micrófono y archivo siguen usando la señal de audio real. Se verificaron tono, silencio, reanudación, detener y vista móvil.

### Mayor mezcla en la dispersión
Dos corrientes adicionales de la textura cruzan distintos colores y alturas dentro de la nube, moviéndose en sentidos diferentes. La mezcla luminosa se distribuye en manchas suaves; conserva el control del volumen, el ensanchamiento y el retorno al silencio.

### Rosa y luminosidad
Se agregó una corriente rosa que atraviesa el cuerpo de la aurora y se mezcla con el azul y el verde. El halo y la luz del pigmento aumentan de intensidad, conservando los colores y la respuesta al sonido.

### Luces y partículas de la onda
Se añadieron 760 partículas finas de color menta, azul, rosa y lila que recorren el interior de la cinta y acompañan su curvatura. Algunas tienen halos suaves; su brillo y dispersión aumentan con la amplitud sonora. La interacción de audio se conserva.

### Textura de filamentos luminosos
Se añadieron 1800 trazos cortos y curvos dentro de la cinta, inspirados en los filamentos de la nueva referencia. Se combinan con las partículas y halos existentes, con brillos menta, turquesa, rosa y lila que acompañan la onda y aumentan con el sonido.

Aurora integrada: abre index.html y entra a la pantalla 02. Usa Probar movimiento, Elegir audio o Usar micrófono. La onda responde al sonido; los datos NOAA se consultan por separado en el recuadro superior derecho.


Pantalla 03: auroras animadas sobre la imagen original de la Tierra. Accesible desde la pantalla 02 y el enlace 03 del inicio. Incluye pausa y respeta la preferencia de movimiento reducido.


CORRECCIÓN PANTALLA 2: abrir index.html > 02. Ahora carga js/script.js (NOAA/cámara/latidos) y js/aurora-kp.js (onda). Sin micrófono ni carga de audio. Escuchar latidos habilita la síntesis local de sonido. Kp 0=40 BPM, Kp 2=71 BPM, Kp 8=164 BPM sin movimiento. Probar Kp activa una simulación explícita; Volver a NOAA restaura la fuente. Consulta cada 60 segundos. Cámara: HTTPS o localhost. Los archivos aurora-sonora corresponden al prototipo anterior y no se cargan en esta pantalla.


INTERACCIÓN: pantalla 02 permite tocar y arrastrar la aurora. Con cámara activa, la vista previa confirma la captura; mover la mano cambia el color, deforma la onda y eleva el BPM. Si falla, se explica el error y NO se simula movimiento. Para permisos de cámara, servir mediante HTTPS o localhost. Latidos: botón Escuchar latidos y volumen ajustable; se añadieron frecuencias medias para altavoces pequeños. Validación con flujo de vídeo de prueba, no con cámara o altavoces físicos del usuario.

