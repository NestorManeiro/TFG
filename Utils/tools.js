function drawFigure() {
    const svgContent = svgOutput.value;
    const canvas = document.getElementById("canvas_svg");
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");

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
        .on("wheel", changeRadius);

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
        document.addEventListener("wheel", changeRadius); // Añadir listener para el evento wheel

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

    function changeRadius(event) {
        if (!activeCircle) return;

        // Verificar si se movió la rueda del ratón hacia arriba o hacia abajo
        const isScrollUp = event.deltaY < 0;
        const isScrollDown = event.deltaY > 0;

        if (isScrollUp || isScrollDown) {
            event.preventDefault(); // Evitar el comportamiento predeterminado del desplazamiento de la página

            const currentRadius = parseFloat(activeCircle.getAttribute("r"));
            const scaleFactor = isScrollUp ? 2 : -2; // Factor de escala para el cambio de radio

            const newRadius = Math.max(currentRadius + scaleFactor, 1); // Asegurarse de que el radio no sea menor que 1

            activeCircle.setAttribute("r", newRadius);
            updateCircleData(activeCircle, null, null, newRadius);
        }
    }



    function updateCircleData(circle, newX, newY, newRadius) {
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
    const shapeInput = document.getElementById("shapeInput");
    const lines = shapeInput.value.split("\n");

    // Obtener el número de círculos existentes
    const numCircles = parseInt(lines[0]);
    const lastCircle = numCircles+1;
    const lastRadius = lastCircle+lastCircle;
    // Incrementar el número de círculos en 1
    lines[0] = (numCircles + 1).toString();

    // Agregar las coordenadas del nuevo círculo al final
    lines.splice(lastCircle, 0, `${x} ${y}`);

    // Agregar el radio del nuevo círculo al final
    lines.splice(lastRadius, 0, "50");

    // Actualizar el contenido del textarea
    shapeInput.value = lines.join("\n");
}