var circulitos;
const speed = 2.6;
function drawFigure() {
    const svgContent = svgOutput.value;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;
    let zoom = 1;

    // Reemplazar el SVG existente en lugar de eliminar y agregar elementos
    const canvas = document.getElementById("canvas_svg");
    if (canvas.firstChild) {
        canvas.replaceChild(svgElement, canvas.firstChild);
    } else {
        canvas.appendChild(svgElement);
    }
    circulitos = d3.selectAll("#canvas_svg circle.draggable-circle");

    var draggableCircles = circulitos
        .on("mousedown", dragStarted)
        .on("wheel", wheel);

    svgElement.addEventListener("wheel", wheel);
    //svgElement.addEventListener("mousemove", X);

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
        document.addEventListener("wheel", wheel);
    }

    function dragged(event) {
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
        const isScrollUp = event.deltaY < 0;
        const isScrollDown = event.deltaY > 0;
        const isShiftPressed = event.shiftKey;
        if (!activeCircle) {
            const canvas_svg = document.getElementById('canvas_svg');

            const mouseX = event.clientX - canvas_svg.offsetLeft;
            const mouseY = event.clientY - canvas_svg.offsetTop-20;

            zoom += isScrollUp ? 0.06 : -0.06;
            transform(zoom, mouseX*speed, mouseY*speed, 0, 0)
        } else {
            if (!isShiftPressed && (isScrollUp || isScrollDown)) {
                const currentRadius = parseFloat(activeCircle.getAttribute("r"));
                const scaleFactor = isScrollUp ? 2 : -2;
                const newRadius = Math.max(currentRadius + scaleFactor, 1);
                activeCircle.setAttribute("r", newRadius);
                updateCircleData(activeCircle, null, null, newRadius);
            } else if (isShiftPressed && (isScrollUp || isScrollDown)) {
                const smoothFactor = isScrollUp ? 0.2 : -0.2;
                updateCircleData(activeCircle, null, null, undefined, smoothFactor);
            }
        }
    }

    function updateCircleData(circle, newX, newY, newRadius, smoothFactor) {
        const shapeInput = document.getElementById("shapeInput");
        const circleIndex = Array.from(draggableCircles.nodes()).indexOf(circle);
        const lines = shapeInput.value.split("\n");
        const firstLine = lines[0].trim();

        if (newX !== null && newY !== null) {
            lines[circleIndex + 1] = `${newX} ${newY}`;
            hasDataChanged = true;
        }

        if (newRadius !== undefined) {
            lines[circleIndex + parseInt(firstLine) + 1] = `${newRadius}`;
            hasDataChanged = true;
        }

        if (smoothFactor !== undefined) {
            const currentSmooth = parseFloat(lines[circleIndex + parseInt(firstLine) * 2 + 1]);
            lines[circleIndex + parseInt(firstLine) * 2 + 1] = Math.max(Math.min(currentSmooth + smoothFactor, 2), 0).toString();
            hasDataChanged = true;
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
                hasDataChanged = false;
            }
            requestAnimationFrame(animate);
        } else {
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
            if (typeof erasecon.firstCircleIndex === "undefined") {
                // Almacena el índice del primer círculo
                erasecon.firstCircleIndex = circleIndex;
            } else {
                // Almacena el índice del segundo círculo
                const secondCircleIndex = circleIndex;
                // Llama a la función eraseconection con los índices de los círculos como parámetros
                eraseConnection(erasecon.firstCircleIndex, secondCircleIndex);
                // Reinicia el primer índice almacenado para futuras conexiones
                delete erasecon.firstCircleIndex;
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
                // Almacena el índice del primer círculo
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
function transform(zoom_factor, zx, zy, dx, dy) {
    shapeInput.value = Module.ccall(
        "_Z9transformfffff", // nombre de la función C
        "string", // tipo de retorno
        ["float", "float", "float", "float", "float"], // tipos de argumentos
        [zoom_factor, zx, zy, dx, dy] // argumentos
    );
    computeShape();
}
