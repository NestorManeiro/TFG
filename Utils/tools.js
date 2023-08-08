var circulitos;
let isDragging = false;
var selectedcircle = null;
var draggableCircles;
var deltaX, deltaY;
var initialX = 0;
var initialY = 0;
var activeCircle = false;
var hasDataChanged;
const popup = document.getElementById("popup");
const popup2 = document.getElementById("popupall");
const waitingMessage = document.getElementById("waiting-message"); // Reemplaza "waiting-message" con el ID correspondiente a tu elemento HTML
const canvas = document.getElementById("canvas_svg");
var isCanvasClicked = false;
let currentShapeIndex = -1;
const shapesArray = [];

function fixit() {
    transform(1, null, null, 0, 0)
}
function addShape() {
    const newShape = shapeInput.value.split('\n');
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
    // Verifica si ambos arreglos tienen una longitud antes de compararlos
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
        shapeInput.value = shapesArray[currentShapeIndex].slice().join('\n');
    } else if (currentShapeIndex === 0) {
        shapeInput.value = shapesArray[0].join('\n');
    } else {
        shapeInput.value = '';
    }
    computeShape();
}

function redoShapeInput() {
    const shapeInput = document.getElementById("shapeInput");
    if (currentShapeIndex < shapesArray.length - 1) {
        currentShapeIndex++;
        shapeInput.value = shapesArray[currentShapeIndex].slice().join('\n');
        computeShape();
    }
}

document.addEventListener("keydown", function(event) {
    // Verificar si se presionó la tecla "Control" (código 17) y la letra "z" (código 90)
    if (event.ctrlKey && event.keyCode === 90) {
        updateShapeInput();
    }
    // Verificar si se presionó la tecla "Control" (código 17) y la letra "y" (código 89)
    else if (event.ctrlKey && event.keyCode === 89) {
        redoShapeInput();
    }
});
canvas.addEventListener("mousedown", function (event) {
    if (!isRightClick(event) || popup.style.display === "block") return;
    initialClickX = event.clientX - canvas.getBoundingClientRect().left;
    initialClickY = event.clientY - canvas.getBoundingClientRect().top;
    isCanvasClicked = true;
});
function unselect() {
    selectedcircle.setAttribute("stroke", "black");
    selectedcircle.setAttribute("stroke-width", "1");
    selectedcircle = null;
    popup.style.display = "none";
    popup2.style.display = "none";
    drawFigure();
}
canvas.addEventListener("mouseup", function () {
    isCanvasClicked = false;
});

canvas.addEventListener("wheel", wheelcanvas);
canvas.addEventListener("mousemove", movecanvas);

const uploadButton = document.getElementById("upload");
uploadButton.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return; // Si no se seleccionó ningún archivo, salimos de la función.

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;
         // Eliminar espacios en blanco y saltos de línea al inicio y al final
        shapeInput.value = fileContent.trim();
        computeShape();
    };

    // Leer el contenido del archivo como texto
    reader.readAsText(file, "UTF-8");
});

function uploadFile() {
    document.getElementById("upload").click();
}
canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    openPopup(event.clientX, event.clientY);
});

var popupallAux = false;
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
                popup.style.left = event.clientX - offsetX + "px";
                popup.style.top = event.clientY - offsetY + "px";
            }
        });
        popup2.addEventListener("mouseup", function () {
            isDragging = false;
            popup2.style.cursor = "grab";
        });
        var radiusInput = document.getElementById("radius");
        var smoothInput = document.getElementById("smooth");
        if (popupallAux === false) {
            radiusInput.addEventListener("input", function (event) {
                event.stopPropagation();
                // Calcular la diferencia entre la posición anterior y la posición actual del slider
                const currentRadiusValue = radiusInput.value;
                const radiusDifference =
                    currentRadiusValue - previousRadiusValue;

                allcircles(radiusDifference, 0); // Enviar la diferencia a la función allcircles
                previousRadiusValue = currentRadiusValue; // Actualizar el valor anterior
            });

            smoothInput.addEventListener("input", function () {
                event.stopPropagation();
                // Calcular la diferencia entre la posición anterior y la posición actual del slider
                const currentSmoothValue = smoothInput.value;
                const smoothDifference =
                    currentSmoothValue - previousSmoothValue;

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
    const circleIndex =
        Array.from(draggableCircles.nodes()).indexOf(circle) + 1;
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

function wheelcanvas(event) {
    if (selectedcircle == null) {
        var isScrollUp = event.deltaY < 0;
        var offsetX = event.clientX;
        var offsetY = event.clientY;
        var rect = canvas.getBoundingClientRect();
        offsetX -= rect.left;
        offsetY -= rect.top;
        var zoom = isScrollUp ? 1.03 : 0.97;
        transform(zoom, offsetX, offsetY, 0, 0);
        computeShape();
    }
}
var initialMouseX = 0;
var initialMouseY = 0;

function movecanvas(event) {
    if (!isRightClick(event) || popup.style.display === "block") return;
    if (isCanvasClicked) {
        if (activeCircle === false) {
            var rect = canvas.getBoundingClientRect();
            var currentMouseX = event.clientX - rect.left;
            var currentMouseY = event.clientY - rect.top;

            var movementX = currentMouseX - initialMouseX;
            var movementY = currentMouseY - initialMouseY;

            transform(1, null, null, movementX, movementY);
            computeShape();

            initialMouseX = currentMouseX;
            initialMouseY = currentMouseY;
        }
    }
}

canvas.addEventListener("mouseup", canvasMouseUp); // Agrega el evento mouseup
function canvasMouseUp(event) {
    addShape();
}
canvas.addEventListener("mousedown", function (event) {
    var rect = canvas.getBoundingClientRect();
    initialMouseX = event.clientX - rect.left;
    initialMouseY = event.clientY - rect.top;
});

canvas.addEventListener("wheel", wheelcanvas);

function animate() {
    if (hasDataChanged) {
        computeShape();
        hasDataChanged = false;
    }
    requestAnimationFrame(animate);
}

//Prevent mouse
const svgElement = document.getElementById("canvas_svg");

// Agrega un listener para el evento wheel en el elemento SVG
svgElement.addEventListener("wheel", handleWheelEvent, {
    passive: false,
});

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
function removeAllCanvasEvents() {
    if (selectedcircle) unselect();
    canvas.removeEventListener("mousemove", movecanvas);
    canvas.removeEventListener("wheel", wheelcanvas);
    canvas.removeEventListener("click", addcircle);
    draggableCircles.on("mousedown", null).on("mouseup", null);
}

var eraseButton = document.getElementById("eraseButton");
eraseButton.addEventListener("click", function () {
    // Cambiar el color del botón "eraseButton" para remarcar que está seleccionado
    eraseButton.style.backgroundColor = "#ff9800"; // Puedes usar cualquier color que desees

    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            erasePoint(circleIndex);
            waitingMessage.style.display = "none";

            // Restablecer el color del botón "eraseButton" después de completar la lógica
            eraseButton.style.backgroundColor = "#4CAF50"; // Color inicial
        });
    }
});

function addAllCanvasEvents() {
    canvas.addEventListener("mousemove", movecanvas);
    canvas.addEventListener("wheel", wheelcanvas);
    draggableCircles.on("mousedown", dragStarted).on("contextmenu", rightClick);
    circulitos.on("click", function () {});
    waitingMessage.style.display = "none";
}
var noaction = document.getElementById("noAction");
noaction.addEventListener("click", function () {
    removeAllCanvasEvents();
    addAllCanvasEvents();
    setButtonStyle();
});

function setButtonStyle() {
    // Obtener todos los elementos de botón en el documento
    const buttons = document.getElementsByTagName("button");

    // Aplicar el estilo de fondo verde (#4CAF50) a todos los botones
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "#4CAF50";
    }
}
var bpreview = document.getElementById("preview");

bpreview.addEventListener("mousedown", function () {
    svgOutput.value = preview();
    drawFigure();
});

bpreview.addEventListener("mouseup", function () {
    computeShape();
});

var addButton = document.getElementById("addcircle");

// Agrega el evento de escucha al botón
addButton.addEventListener("click", function () {
    // Cambiar el color del botón "addButton" para remarcar que está seleccionado
    addButton.style.backgroundColor = "#ff9800"; // Puedes usar cualquier color que desees

    // Muestra el elemento de espera
    waitingMessage.style.display = "block";
    removeAllCanvasEvents();

    canvas.addEventListener("click", addcircle, { once: true });
});

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

function erasePoint(i) {
    shapeInput.value = Module.ccall(
        "_Z10erasepointi",
        "string",
        ["number"],
        [i],
    );
    computeShape();
}

function preview() {
    return Module.ccall("_Z11downloadsvgv", "string", ["number"], []);
}

function downloadsvg() {
    var aux = Module.ccall("_Z11downloadsvgv", "string", ["number"], []);

    var enlaceDescarga = document.createElement("a");
    enlaceDescarga.setAttribute(
        "href",
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(aux),
    );
    enlaceDescarga.setAttribute("download", "shape.svg");
    enlaceDescarga.style.display = "none";

    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
}

// Declara una variable global para almacenar el puntero al SVG generado
let svgPtr;

function randomGenerate() {
    // Antes de generar un nuevo SVG, verifica si ya hay uno previo y libera la memoria
    if (typeof svgPtr !== "undefined") {
        Module["_free"](svgPtr); // Liberar la memoria del SVG anterior
    }

    shapeInput.value = Module.ccall("_Z16randomgenerationv", "string");
    computeShape();

    // Guarda el nuevo puntero a la memoria del SVG generado
    svgPtr = Module.ccall(
        "_Z19ComputeSVGFromShapePc",
        "number",
        ["string"],
        [shapeInput.value],
    );
    fixit();
}

function similarGenerate() {
    // Antes de generar un nuevo SVG, verifica si ya hay uno previo y libera la memoria
    if (typeof svgPtr !== "undefined") {
        Module["_free"](svgPtr); // Liberar la memoria del SVG anterior
    }

    shapeInput.value = Module.ccall("_Z17similargenerationv", "string");
    computeShape();

    // Guarda el nuevo puntero a la memoria del SVG generado
    svgPtr = Module.ccall(
        "_Z19ComputeSVGFromShapePc",
        "number",
        ["string"],
        [shapeInput.value],
    );
    fixit();
}

var createcon = document.getElementById("createconection");
createcon.addEventListener("click", function () {
    // Cambiar el color del botón "createcon" para remarcar que está seleccionado
    createcon.style.backgroundColor = "#ff9800"; // Puedes usar cualquier color que desees

    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof createconection.firstCircleIndex === "undefined") {
                createconection.firstCircleIndex = circleIndex;
            } else {
                createconection(createconection.firstCircleIndex, circleIndex);
                delete createconection.firstCircleIndex;
                waitingMessage.style.display = "none";

                // Restablecer el color del botón "createcon" después de completar la lógica
                createcon.style.backgroundColor = "#4CAF50"; // Color inicial
            }
        });
    }
});

function createconection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z12connectnodesii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2],
    );
    computeShape();
}

var erasecon = document.getElementById("eraseconection");
erasecon.addEventListener("click", function () {
    // Cambiar el color del botón "erasecon" para remarcar que está seleccionado
    erasecon.style.backgroundColor = "#ff9800"; // Puedes usar cualquier color que desees

    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof eraseConnection.firstCircleIndex === "undefined") {
                eraseConnection.firstCircleIndex = circleIndex;
            } else {
                eraseConnection(eraseConnection.firstCircleIndex, circleIndex);
                delete eraseConnection.firstCircleIndex;
                waitingMessage.style.display = "none";

                // Restablecer el color del botón "erasecon" después de completar la lógica
                erasecon.style.backgroundColor = "#4CAF50"; // Color inicial
            }
        });
    }
});

function eraseConnection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z15disconnectnodesii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2],
    );
    computeShape();
}

var middlecircle = document.getElementById("middlecircle");
middlecircle.addEventListener("click", function () {
    if (circulitos) {
        // Cambiar el color del botón para remarcar que está seleccionado
        middlecircle.style.backgroundColor = "#ff9800"; // Puedes usar cualquier color que desees

        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof erasecon.firstCircleIndex === "undefined") {
                erasecon.firstCircleIndex = circleIndex;
            } else {
                middleCircle(erasecon.firstCircleIndex, circleIndex);
                delete erasecon.firstCircleIndex;
                waitingMessage.style.display = "none";

                // Restablecer el color del botón después de completar la lógica
                middlecircle.style.backgroundColor = "#4CAF50"; // Color inicial
            }
        });
    }
});

function middleCircle(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z17insertpointmiddleii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2],
    );
    computeShape();
}

function addpoint(x, r) {
    shapeInput.value = Module.ccall(
        "_Z11insertpointii",
        "string",
        ["number", "number"],
        [x, r],
    );
    computeShape();
}

function transform(zoom_factor, zx, zy, dx, dy) {
    shapeInput.value = Module.ccall(
        "_Z9transformfffff",
        "string",
        ["float", "float", "float", "float", "float"],
        [zoom_factor, zx, zy, dx, dy],
    );
}

const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", exportShape);

function exportShape() {
    const shapeContent = shapeInput.value;

    const blob = new Blob([shapeContent], {
        type: "text/plain",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "shape.txt";
    a.style.display = "none";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
var helpButton = document.getElementById("helpButton");
var closeBtn = document.getElementsByClassName("close")[0];

helpButton.addEventListener("click", function () {
    popuphelp.style.display = "block";
});

closeBtn.addEventListener("click", function () {
    popuphelp.style.display = "none";
});
