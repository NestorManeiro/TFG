function drawFigure() {
    const svgContent = svgOutput.value;

    const canvas = document.getElementById("canvas_svg");
    canvas.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");

    canvas.appendChild(svgElement);

    const draggableCircles = d3.selectAll("#canvas_svg circle[stroke='black']")
        .classed("draggable-circle", true);

    draggableCircles.on("mousedown", dragStarted);
    draggableCircles.on("wheel", changeRadius);

    let activeCircle = null;
    let initialX, initialY, deltaX, deltaY;

    function dragStarted(event) {
        activeCircle = this;
        activeCircle.classList.add("active");

        initialX = parseFloat(activeCircle.getAttribute("cx"));
        initialY = parseFloat(activeCircle.getAttribute("cy"));
        deltaX = event.clientX - initialX;
        deltaY = event.clientY - initialY;

        document.addEventListener("mousemove", dragged);
        document.addEventListener("mouseup", dragEnded);
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
        updateCircleData(activeCircle, newX, newY);
        computeShape();
    }

    function changeRadius(event) {
        if (!activeCircle) return;

        // Verificar si se mantiene presionada la tecla Shift
        const isShiftPressed = event.shiftKey;

        if (isShiftPressed) {
            event.preventDefault(); // Evitar el comportamiento predeterminado del desplazamiento de la página

            const currentRadius = parseFloat(activeCircle.getAttribute("r"));
            const wheelDelta = event.deltaY;

            const scaleFactor = 1; // Factor de escala para el cambio de radio
            const deltaRadius = wheelDelta < 0 ? scaleFactor : -scaleFactor; // Cambio positivo o negativo del radio

            const newRadius = Math.max(currentRadius + deltaRadius, 1); // Asegurarse de que el radio no sea menor que 1

            activeCircle.setAttribute("r", newRadius);
            updateCircleData(activeCircle, null, null, newRadius);
        }
        computeShape();
    }

    function updateCircleData(circle, newX, newY, newRadius) {
        const shapeInput = document.getElementById("shapeInput");
        const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle);
        const lines = shapeInput.value.split("\n");
        const firstLine = lines[0].trim(); // Obtener el valor de la primera línea y eliminar espacios en blanco

        if (newX !== null && newY !== null) {
            // Actualizar las coordenadas del círculo en el textarea
            lines[circleIndex + 1] = `${newX} ${newY}`;
        }

        if (newRadius !== undefined) {
            // Actualizar el radio del círculo en el textarea
            lines[circleIndex + parseInt(firstLine)+1] = `${newRadius}`;
        }

        shapeInput.value = lines.join("\n");
    }

    function dragEnded() {
        if (!activeCircle) return;

        activeCircle.classList.remove("active");
        activeCircle = null;

        document.removeEventListener("mousemove", dragged);
        document.removeEventListener("mouseup", dragEnded);
    }
}
