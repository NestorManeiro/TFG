var circulitos;
let isDragging = false;
var selectedcircle = null;
var draggableCircles;
var deltaX, deltaY;
var initialX = 0;
var initialY = 0;
const canvas = document.getElementById("canvas_svg");
var windowSize = Math.min(window.innerWidth, window.innerHeight);
var canvasSize = Math.min(canvas.offsetWidth, canvas.offsetHeight);
var proportion = windowSize / canvasSize;
var activeCircle=false;
var hasDataChanged;
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
}



function addEvents(){
    if(activeCircle) return;
    circulitos = d3.selectAll("#canvas_svg circle.draggable-circle");
    draggableCircles = circulitos.on("mousedown", dragStarted).on("dblclick", doubleClick);
    canvas.addEventListener("wheel", wheelcanvas);

}

function showPopup(mouseX, mouseY) {
    const popup = document.getElementById("popup");
    const circleData = selectedcircle.getAttribute("data-info");

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
    <input type="number" value="${currentRadius}" step="0.01" min="0"><br>
    <label>Suavidad:</label>
    <input type="range" value="${currentSmooth}" min="0" max="2" step="0.1"><br>
    <label>X:</label>
    <input type="number" value="${currentX}" step="0.01"><br>
    <label>Y:</label>
    <input type="number" value="${currentY}" step="0.01"><br>
    <label>Índice:</label>
    ${circleIndex}`;
}




function doubleClick(event) {
    if (selectedcircle == null) {
        selectedcircle = this;
        selectedcircle.setAttribute("stroke", "blue");
        selectedcircle.setAttribute("stroke-width", "3");
        showPopup(event.clientX, event.clientY);
    } else {
        selectedcircle.setAttribute("stroke", "black");
        selectedcircle.setAttribute("stroke-width", "1");
        selectedcircle = null;
        popup.style.display = "none";
    }
}


function dragStarted(event) {
    activeCircle = this;
    initialX = parseFloat(activeCircle.getAttribute("cx"));
    initialY = parseFloat(activeCircle.getAttribute("cy"));

    deltaX = event.clientX;
    deltaY = event.clientY;

    if(selectedcircle!=null){
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
        const offsetX = (event.clientX - deltaX) * proportion;
        const offsetY = (event.clientY - deltaY) * proportion;
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
    if (activeCircle) {
        const currentRadius = parseFloat(activeCircle.getAttribute("r"));
        const scaleFactor = isScrollUp ? 2 : -2;
        const newRadius = Math.max(currentRadius + scaleFactor, 1);
        hasDataChanged=true;
        activeCircle.setAttribute("r", newRadius);
        updateCircleData(activeCircle, null, null, newRadius);
    }
}

function updateCircleData(circle, newX, newY, newRadius, smoothFactor) {
    const shapeInput = document.getElementById("shapeInput");
    const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle);
    if (circleIndex == -1) return;
    const lines = shapeInput.value.split("\n");
    const firstLine = lines[0].trim();

    if (newX !== null && newY !== null) {
        lines[circleIndex + 1] = `${newX} ${newY}`;
    }

    if (newRadius !== undefined) {
        lines[circleIndex + parseInt(firstLine) + 1] = `${newRadius}`;
    }

    if (smoothFactor !== undefined) {
        const currentSmooth = parseFloat(lines[circleIndex + parseInt(firstLine) * 2 + 1]);
        lines[circleIndex + parseInt(firstLine) * 2 + 1] = Math.max(Math.min(currentSmooth + smoothFactor, 2), 0).toString();
    }

    shapeInput.value = lines.join("\n");

    animationFrameId = requestAnimationFrame(animate);
}

function wheelcanvas(event) {
    // Tu lógica para el zoom y la transformación usando las coordenadas X e Y
    // var canvas = document.getElementById("canvas_svg");
    // var offsetX = event.clientX;
    // var offsetY = event.clientY;
    // var rect = canvas.getBoundingClientRect();
    // offsetX -= rect.left;
    // offsetY -= rect.top;
    // zoom += isScrollUp ? 0.06 : -0.06;
    // transform(zoom, offsetX * proportion, offsetY * proportion, 0, 0);
}

function dragEnded() {

    isDragging = false;
    activeCircle=false;
    document.removeEventListener("mouseup", dragEnded);
    document.removeEventListener("mousemove", dragged);
    addEvents()

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
eraseButton.addEventListener("click", function() {
    if (circulitos) {
        // Asigna el evento click a los círculos
        circulitos.on("click", function() {
            // Obtiene el índice del círculo en el array de nodos
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            // Realiza cualquier acción que necesites con el índice del círculo
            erasePoint(circleIndex);
        });
    }
});

//New functionalities
function erasePoint(i) {
    shapeInput.value = Module.ccall(
        "_Z10erasepointi", // nombre de la función C
        "string", // tipo de retorno
        ["number"], // tipos de argumentos
        [i] // argumentos
    );
    computeShape();
}
function downloadsvg(){
    var aux =  Module.ccall(
        "_Z11downloadsvgv", // nombre de la función C
        "string", // tipo de retorno
        ["number"], // tipos de argumentos
        [] // argumentos
    );

    // Crear un elemento <a> para descargar el archivo
    var enlaceDescarga = document.createElement('a');
    enlaceDescarga.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(aux));
    enlaceDescarga.setAttribute('download', 'imagen.svg');
    enlaceDescarga.style.display = 'none';

    // Agregar el elemento <a> al documento
    document.body.appendChild(enlaceDescarga);

    // Simular un clic en el enlace de descarga
    enlaceDescarga.click();

    // Eliminar el elemento <a> del documento
    document.body.removeChild(enlaceDescarga);
}
function randomGenerate() {
    shapeInput.value = Module.ccall(
        "_Z16randomgenerationv", // nombre de la función C
        "string", // tipo de retorno
    );
    computeShape();
}

function similarGenerate() {
    shapeInput.value = Module.ccall(
        "_Z17similargenerationv", // nombre de la función C
        "string", // tipo de retorno
    );
    computeShape();
}

var createcon = document.getElementById("createconection");
createcon.addEventListener("click", function() {
    if (circulitos) {
        // Asigna el evento click a los círculos
        circulitos.on("click", function() {
            // Obtiene el índice del círculo en el array de nodos
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            // Realiza cualquier acción que necesites con el índice del círculo
            if (typeof createconection.firstCircleIndex === "undefined") {
                // Almacena el índice del primer círculo
                createconection.firstCircleIndex = circleIndex;
            } else {
                // Almacena el índice del segundo círculo
                const secondCircleIndex = circleIndex;
                // Llama a la función createconection con los índices de los círculos como parámetros
                createconection(createconection.firstCircleIndex, secondCircleIndex);
                // Reinicia el primer índice almacenado para futuras conexiones
                delete createconection.firstCircleIndex;
            }
        });
    }
});

// Nuevas funcionalidades
function createconection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z12connectnodesii", // nombre de la función C
        "string", // tipo de retorno
        ["number", "number"], // tipos de argumentos
        [circleIndex1, circleIndex2] // argumentos
    );
    computeShape();
}

var erasecon = document.getElementById("eraseconection");
erasecon.addEventListener("click", function() {
    if (circulitos) {
        // Asigna el evento click a los círculos
        circulitos.on("click", function() {
            // Obtiene el índice del círculo en el array de nodos
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            // Realiza cualquier acción que necesites con el índice del círculo
            if (typeof eraseConnection.firstCircleIndex === "undefined") {
                // Almacena el índice del primer círculo
                eraseConnection.firstCircleIndex = circleIndex;
            } else {
                // Almacena el índice del segundo círculo
                const secondCircleIndex = circleIndex;
                // Llama a la función eraseconection con los índices de los círculos como parámetros
                eraseConnection(eraseConnection.firstCircleIndex, secondCircleIndex);
                // Reinicia el primer índice almacenado para futuras conexiones
                delete eraseConnection.firstCircleIndex;
            }
        });
    }
});

// Nuevas funcionalidades
function eraseConnection(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z15disconnectnodesii", // nombre de la función C
        "string", // tipo de retorno
        ["number", "number"], // tipos de argumentos
        [circleIndex1, circleIndex2] // argumentos
    );
    computeShape();
}

var middlecircle = document.getElementById("middlecircle");
middlecircle.addEventListener("click", function() {
    if (circulitos) {
        // Asigna el evento click a los círculos
        circulitos.on("click", function() {
            // Obtiene el índice del círculo en el array de nodos
            const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
            // Realiza cualquier acción que necesites con el índice del círculo
            if (typeof erasecon.firstCircleIndex === "undefined") {
                erasecon.firstCircleIndex = circleIndex;
            } else {
                // Almacena el índice del segundo círculo
                const secondCircleIndex = circleIndex;
                // Llama a la función eraseconection con los índices de los círculos como parámetros
                middleCircle(erasecon.firstCircleIndex, secondCircleIndex);
                // Reinicia el primer índice almacenado para futuras conexiones
                delete erasecon.firstCircleIndex;
            }
        });
    }
});

// Nuevas funcionalidades
function middleCircle(circleIndex1, circleIndex2) {
    shapeInput.value = Module.ccall(
        "_Z17insertpointmiddleii", // nombre de la función C
        "string", // tipo de retorno
        ["number", "number"], // tipos de argumentos
        [circleIndex1, circleIndex2] // argumentos
    );
    computeShape();
}
function addpoint(x, r,s) {
    shapeInput.value = Module.ccall(
        "_Z11insertpointiii", // nombre de la función C
        "string", // tipo de retorno
        ["number", "number"], // tipos de argumentos
        [x, r,s] // argumentos
    );
    computeShape();
}

function transform(zoom_factor, zx, zy, dx, dy) {
    shapeInput.value = Module.ccall(
        "_Z9transformfffff", // nombre de la función C
        "string", // tipo de retorno
        ["float", "float", "float", "float", "float"], // tipos de argumentos
        [zoom_factor, zx, zy, dx, dy] // argumentos
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