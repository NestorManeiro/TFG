//Functionality
function fixit() {
    transform(1, null, null, 0, 0);
}
function addShape() {
    const newShape = shapeInput.value.split("\n");
    if (currentShapeIndex < shapesArray.length - 1) {
        shapesArray.splice(currentShapeIndex + 1); // Eliminar figuras por encima de currentShapeIndex
    }
    if (shapesArray.length >= 10) {
        shapesArray.shift(); // Eliminar el primer elemento si ya hay 10
    }
    const lastShape = shapesArray[shapesArray.length - 1];

    // Compara si el nuevo shape es igual al último shape almacenado
    const shapesAreEqual = lastShape && arraysAreEqual(newShape, lastShape);

    // Si los shapes son iguales, no lo agregues al historial
    if (!shapesAreEqual) {
        shapesArray.push(newShape);
        currentShapeIndex = shapesArray.length - 1; // Actualizar el puntero al nuevo índice
    }
}

function arraysAreEqual(arr1, arr2) {
    // Verifica si ambos arreglos tienen una longitud antes de comparar  los
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function updateShapeInput() {
    const shapeInput = document.getElementById("shapeInput");
    if (currentShapeIndex > 0) {
        currentShapeIndex--;
        shapeInput.value = shapesArray[currentShapeIndex].slice().join("\n");
    } else if (currentShapeIndex === 0) {
        shapeInput.value = shapesArray[0].join("\n");
    } else {
        shapeInput.value = "";
    }
    computeShape();
}

function redoShapeInput() {
    const shapeInput = document.getElementById("shapeInput");
    if (currentShapeIndex < shapesArray.length - 1) {
        currentShapeIndex++;
        shapeInput.value = shapesArray[currentShapeIndex].slice().join("\n");
        computeShape();
    }
}

function unselect() {
    selectedcircle.setAttribute("stroke", "black");
    selectedcircle.setAttribute("stroke-width", "1");
    selectedcircle = null;
    popup.style.display = "none";
    popup2.style.display = "none";
    drawFigure();
}

function openPopup(mouseX, mouseY) {
    event.stopPropagation();
    if (!selectedcircle) {
        removeAllCanvasEvents();
        popup2.style.display = "block";
        popup2.style.left = mouseX + "px";
        popup2.style.top = mouseY + "px";

        popup2.addEventListener("mousedown", function (event) {
            isDragging = true;
            offsetX = event.clientX - popup2.getBoundingClientRect().left;
            offsetY = event.clientY - popup2.getBoundingClientRect().top;
            popup2.style.cursor = "grabbing";
        });

        popup2.addEventListener("mousemove", function (event) {
            if (isDragging) {
                popup2.style.left = event.clientX - offsetX + "px";
                popup2.style.top = event.clientY - offsetY + "px";
            }
        });

        popup2.addEventListener("mouseup", function () {
            isDragging = false;
            popup2.style.cursor = "grab";
        });
        var radiusInput = document.getElementById("radius");
        var smoothInput = document.getElementById("smooth");
        if (popupallAux === false) {
            radiusInput.addEventListener("mousemove", function (event) {
                event.stopPropagation();
                // Calcular la diferencia entre la posición anterior y la posición actual del slider
                const currentRadiusValue = radiusInput.value;
                const radiusDifference = currentRadiusValue - previousRadiusValue;

                allcircles(radiusDifference, 0); // Enviar la diferencia a la función allcircles
                previousRadiusValue = currentRadiusValue; // Actualizar el valor anterior
            });

            smoothInput.addEventListener("mousemove", function () {
                event.stopPropagation();
                // Calcular la diferencia entre la posición anterior y la posición actual del slider
                const currentSmoothValue = smoothInput.value;
                const smoothDifference = currentSmoothValue - previousSmoothValue;

                allcircles(0, smoothDifference); // Enviar la diferencia a la función allcircles
                previousSmoothValue = currentSmoothValue; // Actualizar el valor anterior
            });
            popupallAux = true;
        }

        let previousRadiusValue = radiusInput.value; // Variable para almacenar el valor anterior del slider
        let previousSmoothValue = smoothInput.value; // Variable para almacenar el valor anterior del slider
    }
}
function closePopup() {
    addShape();
    addAllCanvasEvents();
    popup2.style.display = "none";
}
function allcircles(radius, smooth) {
    var lines = shapeInput.value.split("\n");
    var numberCircles = parseInt(lines[0].trim());
    for (var i = 0; i < numberCircles; i++) {
        var currentRadiusIndex = numberCircles + 1 + i;
        var currentSmoothIndex = currentRadiusIndex + numberCircles;

        var currentRadius = parseFloat(lines[currentRadiusIndex].trim());
        var currentSmooth = parseFloat(lines[currentSmoothIndex].trim());

        var newRadius = Math.max(currentRadius + radius, 0);
        var newSmooth = Math.max(Math.min(currentSmooth + smooth, 2), 0);

        lines[currentRadiusIndex] = newRadius.toString();
        lines[currentSmoothIndex] = newSmooth.toString();
    }
    // Actualizar el valor de shapeInput con los radios y smooth actualizados
    shapeInput.value = lines.join("\n");
    computeShape();
}

function drawFigure() {
    const svgContent = svgOutput.value;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    if (canvas.firstChild) {
        canvas.replaceChild(svgElement, canvas.firstChild);
    } else {
        canvas.appendChild(svgElement);
    }
    addEvents();
    highlightCircles(
        activeCircle,
        canvas.querySelectorAll("circle.draggable-circle"),
    );
    highlightCircles(
        selectedcircle,
        canvas.querySelectorAll("circle.draggable-circle"),
    );

    addAllCanvasEvents();
}

function highlightCircles(centerCircle, circlesToHighlight) {
    if (centerCircle && centerCircle.tagName === "circle") {
        const cx = parseFloat(centerCircle.getAttribute("cx"));
        const cy = parseFloat(centerCircle.getAttribute("cy"));
        const tolerance = 0.1;

        circlesToHighlight.forEach((circle) => {
            const circleCx = parseFloat(circle.getAttribute("cx"));
            const circleCy = parseFloat(circle.getAttribute("cy"));

            const dx = Math.abs(cx - circleCx);
            const dy = Math.abs(cy - circleCy);

            if (dx <= tolerance && dy <= tolerance) {
                circle.setAttribute("stroke", "blue");
                circle.setAttribute("stroke-width", "3");
            } else {
                circle.setAttribute("stroke", "black");
                circle.setAttribute("stroke-width", "1");
            }
        });
    }
}

function addEvents() {
    if (activeCircle || selectedcircle != null) return;
    circulitos = d3.selectAll("#canvas_svg circle.draggable-circle");

    // Actualiza el radio mínimo de los círculos
    circulitos.attr("r", function () {
        // Obtiene el radio actual del círculo
        const currentRadius = parseFloat(d3.select(this).attr("r"));

        // Calcula el nuevo radio usando Math.max() para asegurarte de que sea al menos MIN_RADIUS
        // Devuelve el nuevo radio para actualizar el atributo "r" del círculo
        return Math.max(currentRadius, 10);
    });

    draggableCircles = circulitos
        .on("mousedown", dragStarted)
        .on("touchstart", touchStarted)
        .on("contextmenu", rightClick);
}

function showPopup(mouseX, mouseY) {
    var shapeInput = document.getElementById("shapeInput");
    var circleIndex =
        Array.from(draggableCircles.nodes()).indexOf(selectedcircle) + 1;
    var lines = shapeInput.value.split("\n");
    var currentRadius = parseFloat(
        lines[circleIndex + parseInt(lines[0].trim())],
    );
    var currentX = parseFloat(selectedcircle.getAttribute("cx")).toFixed(2);
    var currentY = parseFloat(selectedcircle.getAttribute("cy")).toFixed(2);
    var currentSmooth = parseFloat(
        lines[circleIndex + parseInt(lines[0].trim()) * 2],
    );

    popup.style.display = "block";
    popup.style.left = mouseX + "px";
    popup.style.top = mouseY + "px";
    popup.addEventListener("mousedown", function (event) {
        isDragging = true;
        offsetX = event.clientX - popup.getBoundingClientRect().left;
        offsetY = event.clientY - popup.getBoundingClientRect().top;
        popup.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function (event) {
        if (isDragging) {
            popup.style.left = event.clientX - offsetX + "px";
            popup.style.top = event.clientY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        popup.style.cursor = "grab";
    });
    popup.innerHTML = `<label>Radius:</label>
    <input type="number" id="radiusInput" value="${currentRadius}" step="1" min="0"><br>
    <label>Smooth:</label>
    <input type="range" id="smoothInput" value="${currentSmooth}" min="0" max="2" step="0.1"><br>
    <label>X:</label>
    <input type="number" id="xInput" value="${currentX}" step="1"><br>
    <label>Y:</label>
    <input type="number" id="yInput" value="${currentY}" step="1"><br>
    <label>Index:</label>
    ${circleIndex}
    <button id="closeButton">Close</button>`;

    // Agregamos el evento click al botón "Cerrar" para ocultar el popup
    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", function () {
        addShape();
        unselect();
    });

    // Agrega eventos a los campos del popup para actualizar los datos del círculo seleccionado
    const radiusInput = document.getElementById("radiusInput");
    const smoothInput = document.getElementById("smoothInput");
    const xInput = document.getElementById("xInput");
    const yInput = document.getElementById("yInput");
    var newX = currentX;
    var newY = currentY;
    radiusInput.addEventListener("input", function () {
        const newRadius = parseFloat(this.value);
        selectedcircle.setAttribute("r", newRadius);
        hasDataChanged = true;
        updateCircleData(selectedcircle, null, null, newRadius);
    });

    smoothInput.addEventListener("mousemove", function () {
        event.stopPropagation();
        const smoothFactor = parseFloat(smoothInput.value);
        hasDataChanged = true;
        updateCircleData(selectedcircle, null, null, null, smoothFactor);
    });

    xInput.addEventListener("input", function () {
        newX = parseFloat(this.value);
        selectedcircle.setAttribute("cx", newX);
        hasDataChanged = true;
        updateCircleData(selectedcircle, newX, newY);
    });

    yInput.addEventListener("input", function () {
        newY = parseFloat(this.value);
        selectedcircle.setAttribute("cy", newY);
        hasDataChanged = true;
        updateCircleData(selectedcircle, newX, newY);
    });
}

function rightClick(event) {
    if (popup2.style.display === "block") return;
    event.preventDefault();
    if (selectedcircle == null) {
        selectedcircle = this;
        selectedcircle.setAttribute("stroke", "blue");
        selectedcircle.setAttribute("stroke-width", "3");
        showPopup(event.clientX, event.clientY);
    }
}

function isRightClick(event) {
    // Verificar si es el botón derecho o izquierdo del ratón
    if ("which" in event) {
        if (event.which === 3) {
            return false;
        } else if (event.which === 1) {
            return true;
        }
    } else if ("button" in event) {
        if (event.button === 2) {
            return false;
        } else if (event.button === 0) {
            return true;
        }
    }
}

function touchStarted(event) {
    if ( popup.style.display === "block") return;

    event.preventDefault(); // Evita el comportamiento predeterminado de la pulsación táctil
    activeCircle = this;
    selectedcircle = activeCircle;
    initialX = parseFloat(activeCircle.getAttribute("cx"));
    initialY = parseFloat(activeCircle.getAttribute("cy"));
    activeCircle.setAttribute("stroke", "blue");
    activeCircle.setAttribute("stroke-width", "3");
    const touch = event.touches[0]; // Obtén el primer toque
    deltaX = touch.clientX;
    deltaY = touch.clientY;
    isDragging = true;
    document.addEventListener("touchmove", touchMoved);
    document.addEventListener("touchend", touchEnded);
    document.addEventListener("touchcancel", touchEnded);
}

function touchMoved(event) {
    if (isDragging && activeCircle) {
        const touch = event.touches[0]; // Obtén el primer toque
        const offsetX = touch.clientX - deltaX;
        const offsetY = touch.clientY - deltaY;
        const newX = initialX + offsetX;
        const newY = initialY + offsetY;

        activeCircle.setAttribute("cx", newX);
        activeCircle.setAttribute("cy", newY);
        hasDataChanged = true;
        updateCircleData(activeCircle, newX, newY);
    }
}

function touchEnded() {
    isDragging = false;
    activeCircle = null;
    document.removeEventListener("touchend", touchEnded);
    document.removeEventListener("touchmove", touchMoved);
    drawFigure();
    unselect();
}
function dragStarted(event) {
    if (!isRightClick(event) || popup.style.display === "block") return;
    activeCircle = this;
    selectedcircle = activeCircle;
    initialX = parseFloat(activeCircle.getAttribute("cx"));
    initialY = parseFloat(activeCircle.getAttribute("cy"));
    activeCircle.setAttribute("stroke", "blue");
    activeCircle.setAttribute("stroke-width", "3");
    deltaX = event.clientX;
    deltaY = event.clientY;
    isDragging = true; // Marcar como arrastrando
    document.addEventListener("mousemove", dragged);
    document.addEventListener("mouseup", dragEnded);
    document.addEventListener("wheel", wheel);
}

function dragged(event) {
    if (isDragging && activeCircle) {
        const offsetX = event.clientX - deltaX;
        const offsetY = event.clientY - deltaY;
        const newX = initialX + offsetX;
        const newY = initialY + offsetY;

        activeCircle.setAttribute("cx", newX);
        activeCircle.setAttribute("cy", newY);
        hasDataChanged = true; // Marcar como datos modificados
        updateCircleData(activeCircle, newX, newY);
    }
}

function dragEnded() {
    isDragging = false;
    activeCircle = false;
    document.removeEventListener("mouseup", dragEnded);
    document.removeEventListener("mousemove", dragged);
    drawFigure();
    unselect();
}
function wheel(event) {
    const isScrollUp = event.deltaY < 0;
    if (activeCircle) {
        const circleIndex =
            Array.from(draggableCircles.nodes()).indexOf(activeCircle) + 1;
        const lines = shapeInput.value.split("\n");
        const currentRadius = parseFloat(
            lines[circleIndex + parseInt(lines[0].trim())],
        );
        const scaleFactor = isScrollUp ? 2 : -2;
        const newRadius = Math.max(currentRadius + scaleFactor, 1);
        hasDataChanged = true;
        activeCircle.setAttribute("r", newRadius);
        updateCircleData(activeCircle, null, null, newRadius);
    }
}

function updateCircleData(circle, newX, newY, newRadius, smoothFactor) {
    const shapeInput = document.getElementById("shapeInput");
    const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle) + 1;
    if (circleIndex === -1) return;
    const lines = shapeInput.value.split("\n");
    const firstLine = lines[0].trim();

    if (newX !== null && newY !== null) {
        lines[circleIndex] = `${newX} ${newY}`;
    }

    if (newRadius !== undefined && newRadius !== null) {
        lines[circleIndex + parseInt(firstLine)] = `${newRadius}`;
    }

    if (smoothFactor !== null && smoothFactor !== undefined) {
        lines[circleIndex + parseInt(firstLine) * 2] = smoothFactor;
    }

    shapeInput.value = lines.join("\n");

    animationFrameId = requestAnimationFrame(animate);
}

function animate() {
    if (hasDataChanged) {
        computeShape();
        hasDataChanged = false;
    }
    requestAnimationFrame(animate);
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
function removeAllCanvasEvents() {
    if (selectedcircle) unselect();
    canvas.removeEventListener("mousemove", HandleMovecanvas);
    canvas.removeEventListener("wheel", handleWheelCanvas);
    canvas.removeEventListener("click", addcircle);
    draggableCircles.on("mousedown", null).on("mouseup", null);
}

function addAllCanvasEvents() {
    canvas.addEventListener("mousemove", HandleMovecanvas);
    canvas.addEventListener("wheel", handleWheelCanvas);
    draggableCircles.on("mousedown", dragStarted).on("contextmenu", rightClick);
    circulitos.on("click", function () {});
    waitingMessage.style.display = "none";
}

function setButtonStyle() {
    // Obtener todos los elementos de botón en el documento
    const buttons = document.getElementsByTagName("button");

    // Aplicar el estilo de fondo verde (#4CAF50) a todos los botones
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "#4CAF50";
    }
}

function addcircle(event) {
    const rect = canvas.getBoundingClientRect();
    const divOffsetX = rect.left;
    const divOffsetY = rect.top;
    const offsetX = event.clientX - divOffsetX;
    const offsetY = event.clientY - divOffsetY;

    addpoint(offsetX, offsetY);

    // Restablecer el color del botón "addButton" después de completar la lógica
    addButton.style.backgroundColor = "#4CAF50"; // Color inicial

    // Oculta el elemento de espera después de agregar el punto
    waitingMessage.style.display = "none";
}

function buttonColor(elementoBoton, color) {
    elementoBoton.style.backgroundColor = color;
}
