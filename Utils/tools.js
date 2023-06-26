function drawFigure() {
    const svgContent = svgOutput.value;
    const canvas = document.getElementById("canvas_svg");
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;
    let zoom=1;

    // Reemplazar el SVG existente en lugar de eliminar y agregar elementos
    if (canvas.firstChild) {
        canvas.replaceChild(svgElement, canvas.firstChild);
    } else {
        canvas.appendChild(svgElement);
    }

    const draggableCircles = d3
        .selectAll("#canvas_svg circle[stroke='black']")
        .classed("draggable-circle", true)
        .on("mousedown", dragStarted)
        .on("wheel", wheel);
    svgElement.addEventListener("wheel", wheel);

    let activeCircle = null;
    let initialX, initialY, deltaX, deltaY;
    let isDragging = false;
    let animationFrameId = null;
    let hasDataChanged = false;
    function dragStarted(event) {
        activeCircle = this;

        initialX = parseFloat(activeCircle.getAttribute("cx"));
        initialY = parseFloat(activeCircle.getAttribute("cy"));
        deltaX = event.clientX - initialX;
        deltaY = event.clientY - initialY;

        document.addEventListener("mousemove", dragged);
        document.addEventListener("mouseup", dragEnded);
        document.addEventListener("wheel", wheel); // Añadir listener para el evento wheel

    }

    function dragged(event) {
        if (!activeCircle) return;

        const speed = 2;
        const offsetX = (event.clientX - deltaX - initialX) * speed;
        const offsetY = (event.clientY - deltaY - initialY) * speed;
        const newX = initialX + offsetX;
        const newY = initialY + offsetY;
        activeCircle.setAttribute("cx", newX);
        activeCircle.setAttribute("cy", newY);
        isDragging = true;
        updateCircleData(activeCircle, newX, newY);

    }
    function wheel(event) {
        // Verificar si se movió la rueda del ratón hacia arriba o hacia abajo
        const isScrollUp = event.deltaY < 0;
        const isScrollDown = event.deltaY > 0;
        const isShiftPressed = event.shiftKey;
        if (!activeCircle){
            const canvasRect = canvas.getBoundingClientRect();
            const mouseX = (event.clientX   - canvasRect.left + window.scrollX);
            const mouseY = (event.clientY   - canvasRect.top + window.scrollY);

            const zoomCenterX = (mouseX - window.scrollX) / canvasRect.width;
            const zoomCenterY = (mouseY - window.scrollY) / canvasRect.height;

            const transformOrigin = `${zoomCenterX * 100}% ${zoomCenterY * 100}%`;

            if (isScrollUp) {
                zoom += 0.06;
            } else {
                zoom -= 0.06;
            }

            svgElement.style.transformOrigin = transformOrigin;
            svgElement.style.transform = `scale(${zoom})`;
        } else {
            if (!isShiftPressed && (isScrollUp || isScrollDown)) {
                const currentRadius = parseFloat(activeCircle.getAttribute("r"));
                const scaleFactor = isScrollUp ? 2 : -2; // Factor de escala para el cambio de radio

                const newRadius = Math.max(currentRadius + scaleFactor, 1); // Asegurarse de que el radio no sea menor que 1

                activeCircle.setAttribute("r", newRadius);
                updateCircleData(activeCircle, null, null, newRadius);
            } else if (isShiftPressed && (isScrollUp || isScrollDown)) {
                const smoothFactor = isScrollUp ? 0.2 : -0.2; // Factor de cambio de suavizado

                updateCircleData(activeCircle, null, null, undefined, smoothFactor);
            }
        }
    }



    function updateCircleData(circle, newX, newY, newRadius,smoothFactor) {
        const shapeInput = document.getElementById("shapeInput");
        const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle);
        const lines = shapeInput.value.split("\n");
        const firstLine = lines[0].trim(); // Obtener el valor de la primera línea y eliminar espacios en blanco

        if (newX !== null && newY !== null) {
            // Actualizar las coordenadas del círculo en el textarea
            lines[circleIndex + 1] = `${newX} ${newY}`;
            hasDataChanged = true; // Los datos han cambiado
        }

        if (newRadius !== undefined) {
            // Actualizar el radio del círculo en el textarea
            lines[circleIndex + parseInt(firstLine) + 1] = `${newRadius}`;
            hasDataChanged = true; // Los datos han cambiado
        }

        if (smoothFactor !== undefined) {
            // Actualizar el radio del círculo en el textarea
            const currentSmooth = parseFloat(lines[circleIndex + (parseInt(firstLine)*2) + 1]);
             // Convertir a cadena de texto
            lines[circleIndex + (parseInt(firstLine)*2) + 1] = Math.max(Math.min(currentSmooth + smoothFactor, 2), 0).toString();
            hasDataChanged = true; // Los datos han cambiado
        }

        shapeInput.value = lines.join("\n");
        if (isDragging && !animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
        } else if (!isDragging && animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }


    function dragEnded() {
        isDragging = false;
        activeCircle = null;

        document.removeEventListener("mousemove", dragged);
        document.removeEventListener("mouseup", dragEnded);
    }

    function animate() {
        if (isDragging) {
            if (hasDataChanged) {
                computeShape();
                hasDataChanged = false; // Reiniciar el indicador de cambios
            }
            requestAnimationFrame(animate);
        } else {
            // Detener el ciclo de animación
            animationFrameId = null;
        }
    }
}

//Prevent mouse
const svgElement = document.getElementById("canvas_svg");

// Agrega un listener para el evento wheel en el elemento SVG
svgElement.addEventListener("wheel", handleWheelEvent, { passive: false });

// Función para manejar el evento wheel
function handleWheelEvent(event) {
    if (isMouseOverSVG(event)) {
        event.preventDefault(); // Evita el desplazamiento predeterminado de la página

    }
}

// Función para verificar si el ratón está sobre el elemento SVG
function isMouseOverSVG(event) {
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    return (
        mouseX >= svgRect.left &&
        mouseX <= svgRect.right &&
        mouseY >= svgRect.top &&
        mouseY <= svgRect.bottom
    );
}

function addNewCircleToShapeInput(x, y) {

}

function downloadsvg(){
    var svgContent = document.getElementById('svgOutput').value; // Obtener el contenido del textarea

    // Crear un elemento <a> para descargar el archivo
    var enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent));
    enlaceDescarga.setAttribute('download', 'imagen.svg');
    enlaceDescarga.style.display = 'none';

    // Agregar el elemento <a> al documento
    document.body.appendChild(enlaceDescarga);

    // Simular un clic en el enlace de descarga
    enlaceDescarga.click();

    // Eliminar el elemento <a> del documento
    document.body.removeChild(enlaceDescarga);
}