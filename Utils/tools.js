var circulitos;
let isDragging = false;
var selectedcircle = null;
var draggableCircles;
var deltaX, deltaY;
var initialX = 0;
var initialY = 0;
var activeCircle = false;
var hasDataChanged;
const waitingMessage = document.getElementById("waiting-message"); // Reemplaza "waiting-message" con el ID correspondiente a tu elemento HTML

const canvas = document.getElementById("canvas_svg");

var isCanvasClicked = false;

canvas.addEventListener('mousedown', function(event) {
    if(selectedcircle) unselect();
    initialClickX = event.clientX - canvas.getBoundingClientRect().left;
    initialClickY = event.clientY - canvas.getBoundingClientRect().top;
    isCanvasClicked = true;
});

canvas.addEventListener('mouseup', function() {
    isCanvasClicked = false;
});

canvas.addEventListener("wheel", wheelcanvas);
canvas.addEventListener('mousemove', function(event) {
    if (isCanvasClicked) {
        movecanvas(event);
    }
});

canvas.addEventListener("wheel", wheelcanvas);

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
    if (selectedcircle) {
        const cx = parseFloat(selectedcircle.getAttribute("cx"));
        const cy = parseFloat(selectedcircle.getAttribute("cy"));
        const circles = canvas.querySelectorAll("circle.draggable-circle");

        circles.forEach(circle => {
            const circleCx = parseFloat(circle.getAttribute("cx"));
            const circleCy = parseFloat(circle.getAttribute("cy"));

            if (cx === circleCx && cy === circleCy) {
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
    draggableCircles = circulitos.on("mousedown", dragStarted).on("dblclick", doubleClick);


}

function unselect(){
    selectedcircle.setAttribute("stroke", "black");
    selectedcircle.setAttribute("stroke-width", "1");
    selectedcircle=null;
    drawFigure()
    popup.style.display = "none";
}
function showPopup(mouseX, mouseY) {
    const popup = document.getElementById("popup");
    var shapeInput = document.getElementById("shapeInput");
    var circleIndex = Array.from(draggableCircles.nodes()).indexOf(selectedcircle);
    var lines = shapeInput.value.split("\n");
    var currentRadius = parseFloat(selectedcircle.getAttribute("r")).toFixed(2);
    var currentX = parseFloat(selectedcircle.getAttribute("cx")).toFixed(2);
    var currentY = parseFloat(selectedcircle.getAttribute("cy")).toFixed(2);
    var currentSmooth = parseFloat(lines[circleIndex + parseInt(lines[0].trim()) * 2 + 1]);

    popup.style.display = "block";
    popup.style.left = mouseX + "px";
    popup.style.top = mouseY + "px";

    popup.innerHTML = `<label>Radio:</label>
    <input type="number" id="radiusInput" value="${currentRadius}" step="0.01" min="0"><br>
    <label>Suavidad:</label>
    <input type="range" id="smoothInput" value="${currentSmooth}" min="0" max="2" step="0.1"><br>
    <label>X:</label>
    <input type="number" id="xInput" value="${currentX}" step="0.01"><br>
    <label>Y:</label>
    <input type="number" id="yInput" value="${currentY}" step="0.01"><br>
    <label>Índice:</label>
    ${circleIndex}`;

    // Agrega eventos a los campos del popup para actualizar los datos del círculo seleccionado
    const radiusInput = document.getElementById("radiusInput");
    const smoothInput = document.getElementById("smoothInput");
    const xInput = document.getElementById("xInput");
    const yInput = document.getElementById("yInput");

    radiusInput.addEventListener("input", function () {
        const newRadius = parseFloat(this.value);
        selectedcircle.setAttribute("r", newRadius);
        hasDataChanged = true;
        updateCircleData(selectedcircle, null, null, newRadius);
    });

    smoothInput.addEventListener("input", function () {
        const smoothFactor = parseFloat(smoothInput.value);
        hasDataChanged = true;
        updateCircleData(selectedcircle, null, null, null, smoothFactor);
    });

    xInput.addEventListener("input", function () {
        const newX = parseFloat(this.value);
        selectedcircle.setAttribute("cx", newX);
        hasDataChanged = true;
        updateCircleData(selectedcircle, newX, currentY);
    });

    yInput.addEventListener("input", function () {
        const newY = parseFloat(this.value);
        selectedcircle.setAttribute("cy", newY);
        hasDataChanged = true;
        updateCircleData(selectedcircle, currentX, newY );
    });
}

function doubleClick(event) {
    if (selectedcircle == null) {
        selectedcircle = this;
        selectedcircle.setAttribute("stroke", "blue");
        selectedcircle.setAttribute("stroke-width", "3");
        showPopup(event.clientX, event.clientY);
    } else {
        unselect()
    }
}

function dragStarted(event) {
    activeCircle = this;
    initialX = parseFloat(activeCircle.getAttribute("cx"));
    initialY = parseFloat(activeCircle.getAttribute("cy"));

    deltaX = event.clientX;
    deltaY = event.clientY;

    if (selectedcircle != null) {
        selectedcircle.setAttribute("stroke", "black");
        selectedcircle.setAttribute("stroke-width", "1");
        selectedcircle = null;
        popup.style.display = "none";
    }
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

function wheel(event) {
    const isScrollUp = event.deltaY < 0;
    if (selectedcircle) {
        const currentRadius = parseFloat(selectedcircle.getAttribute("r"));
        const scaleFactor = isScrollUp ? 2 : -2;
        const newRadius = Math.max(currentRadius + scaleFactor, 1);
        hasDataChanged = true;
        selectedcircle.setAttribute("r", newRadius);
        updateCircleData(selectedcircle, null, null, newRadius);
    }
}

function updateCircleData(circle, newX, newY, newRadius, smoothFactor) {
    const shapeInput = document.getElementById("shapeInput");
    const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle);
    if (circleIndex === -1) return;
    const lines = shapeInput.value.split("\n");
    const firstLine = lines[0].trim();

    if (newX !== null && newY !== null) {
        lines[circleIndex + 1] = `${newX} ${newY}`;
    }

    if (newRadius !== undefined && newRadius !== null) {
        lines[circleIndex + parseInt(firstLine) + 1] = `${newRadius}`;
    }

    if (smoothFactor !== null && smoothFactor !== undefined) {
        lines[circleIndex + parseInt(firstLine) * 2 + 1] = smoothFactor;
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
    }
}

var initialMouseX = 0;
var initialMouseY = 0;

function movecanvas(event) {
    if (activeCircle === false) {
        var rect = canvas.getBoundingClientRect();
        var currentMouseX = event.clientX - rect.left;
        var currentMouseY = event.clientY - rect.top;

        var movementX = currentMouseX - initialMouseX;
        var movementY = currentMouseY - initialMouseY;

        transform(1, null, null, movementX, movementY);

        initialMouseX = currentMouseX;
        initialMouseY = currentMouseY;
    }
}

canvas.addEventListener("mousedown", function (event) {
    var rect = canvas.getBoundingClientRect();
    initialMouseX = event.clientX - rect.left;
    initialMouseY = event.clientY - rect.top;
});

canvas.addEventListener("wheel", wheelcanvas);

function dragEnded() {
    isDragging = false;
    activeCircle = false;
    document.removeEventListener("mouseup", dragEnded);
    document.removeEventListener("mousemove", dragged);
    addEvents();
}

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

var eraseButton = document.getElementById("eraseButton");
eraseButton.addEventListener("click", function () {
    if (circulitos) {
        waitingMessage.style.display = "block";
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            erasePoint(circleIndex);
            waitingMessage.style.display = "none";
        });
    }

});
var bpreview = document.getElementById("preview");

bpreview.addEventListener("mousedown", function() {
    svgOutput.value = preview();
    drawFigure();
});

bpreview.addEventListener("mouseup", function() {
    computeShape();
});


var addButton = document.getElementById("addcircle");

// Agrega el evento de escucha al botón
addButton.addEventListener("click", function () {
    // Muestra el elemento de espera
    waitingMessage.style.display = "block";

    const rect = canvas.getBoundingClientRect();
    const divOffsetX = rect.left;
    const divOffsetY = rect.top;

    canvas.addEventListener("click", function (event) {
        const offsetX = event.clientX - divOffsetX;
        const offsetY = event.clientY - divOffsetY;

        addpoint(offsetX, offsetY);

        // Oculta el elemento de espera después de agregar el punto
        waitingMessage.style.display = "none";
    }, { once: true });
});

function erasePoint(i) {
    shapeInput.value = Module.ccall(
        "_Z10erasepointi",
        "string",
        ["number"],
        [i]
    );
    computeShape();
}

function preview() {
    return Module.ccall(
        "_Z11downloadsvgv",
        "string",
        ["number"],
        []
    );
}
function downloadsvg() {
    var aux = Module.ccall(
        "_Z11downloadsvgv",
        "string",
        ["number"],
        []
    );

    var enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(aux));
    enlaceDescarga.setAttribute('download', 'imagen.svg');
    enlaceDescarga.style.display = 'none';

    document.body.appendChild(enlaceDescarga);
    enlaceDescarga.click();
    document.body.removeChild(enlaceDescarga);
}

function randomGenerate() {
    shapeInput.value = Module.ccall(
        "_Z16randomgenerationv",
        "string"
    );
    computeShape();
}

function similarGenerate() {
    shapeInput.value = Module.ccall(
        "_Z17similargenerationv",
        "string"
    );
    computeShape();
}

var createcon = document.getElementById("createconection");
createcon.addEventListener("click", function () {
    if (circulitos) {
        waitingMessage.style.display = "block";
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof createconection.firstCircleIndex === "undefined") {
                createconection.firstCircleIndex = circleIndex;
            } else {
                createconection(createconection.firstCircleIndex, circleIndex);
                delete createconection.firstCircleIndex;
                waitingMessage.style.display = "none";
            }
        });
    }
});

function createconection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z12connectnodesii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2]
    );
    computeShape();
}

var erasecon = document.getElementById("eraseconection");
erasecon.addEventListener("click", function () {
    if (circulitos) {
        waitingMessage.style.display = "block";
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof eraseConnection.firstCircleIndex === "undefined") {
                eraseConnection.firstCircleIndex = circleIndex;
            } else {
                eraseConnection(eraseConnection.firstCircleIndex, circleIndex);
                delete eraseConnection.firstCircleIndex;
                waitingMessage.style.display = "none";
            }
        });
    }
});

function eraseConnection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z15disconnectnodesii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2]
    );
    computeShape();
}

var middlecircle = document.getElementById("middlecircle");
middlecircle.addEventListener("click", function () {
    if (circulitos) {
        waitingMessage.style.display = "block";
        circulitos.on("click", function () {
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            if (typeof erasecon.firstCircleIndex === "undefined") {
                erasecon.firstCircleIndex = circleIndex;
            } else {
                middleCircle(erasecon.firstCircleIndex, circleIndex);
                delete erasecon.firstCircleIndex;
                waitingMessage.style.display = "none";
            }
        });
    }
});

function middleCircle(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z17insertpointmiddleii",
        "string",
        ["number", "number"],
        [circleIndex1, circleIndex2]
    );
    computeShape();
}

function addpoint(x, r) {
    shapeInput.value = Module.ccall(
        "_Z11insertpointii",
        "string",
        ["number", "number"],
        [x, r]
    );
    computeShape();
}

function transform(zoom_factor, zx, zy, dx, dy) {
    shapeInput.value = Module.ccall(
        "_Z9transformfffff",
        "string",
        ["float", "float", "float", "float", "float"],
        [zoom_factor, zx, zy, dx, dy]
    );
    computeShape();
}

const exportButton = document.getElementById('exportButton');
exportButton.addEventListener('click', exportShape);

function exportShape() {
    const shapeInput = document.getElementById('shapeInput');
    const shapeContent = shapeInput.value;

    const blob = new Blob([shapeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'shape.txt';
    a.style.display = 'none';
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
