//Event Handlers
function HandleExportShapeButtonClick() {
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

function handleNoActionClick() {
    removeAllCanvasEvents();
    addAllCanvasEvents();
    setButtonStyle();
}
function handleBPreviewMouseDown() {
    hideAllButtons()
    svgOutput.value = preview();
    drawFigure();
}

function handleMiddleCircleClick() {
    hideAllButtons();
    handleNoActionClick();
    buttonColor(middlecircle, "#ff9800");
    waitingMessage.style.display = "block";
    removeAllCanvasEvents();

    // Agregar un retraso de 10ms antes de activar el evento click
    setTimeout(function () {
        canvas.addEventListener("click", handleMiddleCircleConnectionClick);
    }, 10);
}


function handleMiddleCircleConnectionClick() {
    var coords = relMouseCoords(event);

    middleCircle(coords.x , coords.y);
    waitingMessage.style.display = "none";
    buttonColor(middlecircle, "#4CAF50");
    canvas.removeEventListener("click", handleMiddleCircleConnectionClick);
    addShape();

}
function handleEraseconClick() {
    hideAllButtons();
    handleNoActionClick();
    buttonColor(erasecon, "#ff9800");
    waitingMessage.style.display = "block";
    removeAllCanvasEvents();

    // Agregar un retraso de 10ms antes de activar el evento click
    setTimeout(function () {
        canvas.addEventListener("click", handleEraseConnectionClick);
    }, 10);
}


function handleEraseConnectionClick(event) {
    var coords = relMouseCoords(event);
    eraseConnection(coords.x, coords.y );
    waitingMessage.style.display = "none";
    buttonColor(erasecon, "#4CAF50");
    canvas.removeEventListener("click", handleEraseConnectionClick);
    addShape();
}
function handleCreateconClick() {
    hideAllButtons();
    handleNoActionClick();
    buttonColor(createcon, "#ff9800");

    setTimeout(function () {
        if (circulitos) {
            waitingMessage.style.display = "block";
            removeAllCanvasEvents();
            circulitos.on("click", handleCreateConnectionClick);
        }
    }, 10);
}


function handleCreateConnectionClick() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);

    if (typeof createconection.firstCircleIndex === "undefined") {
        createconection.firstCircleIndex = circleIndex;
    } else {
        createconection(createconection.firstCircleIndex, circleIndex);
        delete createconection.firstCircleIndex;
        waitingMessage.style.display = "none";
        buttonColor(createcon, "#4CAF50");
    }
    addShape();
}
function handleAddButtonClick() {
    hideAllButtons();
    handleNoActionClick();
    buttonColor(addButton, "#ff9800");
    waitingMessage.style.display = "block";
    removeAllCanvasEvents();
    canvas.addEventListener("mousedown", addcircle, { once: true });
}

function handleAddButtonClicks() {
    hideAllButtons();
    setTimeout(function () {
        handleNoActionClick();
        buttonColor(addsButton, "#ff9800");
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        canvas.addEventListener("click", addcirclebefore);
    }, 20);
}


function handleEraseButtonClick() {
    handleNoActionClick();
    buttonColor(eraseButton, "#ff9800");
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleCircleClickForErase);
    }
}
function handleEraseButtonClicks() {
    handleNoActionClick();
    hideAllButtons();
    buttonColor(erasesButton, "#ff9800");
    circulitos.on("click", handleCircleClickForErase);
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleCircleClickForErases);
    }
}
function handleCircleClickForErases() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
    erasePoint(circleIndex);
    waitingMessage.style.display = "none";
    buttonColor(eraseButton, "#4CAF50");
    addShape();
    handleEraseButtonClicks();
}
function handleCircleClickForErase() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
    erasePoint(circleIndex);
    waitingMessage.style.display = "none";
    buttonColor(eraseButton, "#4CAF50");
    addShape();
    handleNoActionClick();
}

function handleComputeButtonClick() {
    addShape(shapeInput.value.split("\n"));
    computeShape();
    fixit();
}

function handleHelpButtonClick() {
    var popuphelp = document.getElementById('popuphelp'); // Asegúrate de que popuphelp sea el ID correcto de tu elemento

    // Si el estilo display es "block", cambia a "none"; de lo contrario, cambia a "block"
    popuphelp.style.display = (popuphelp.style.display === "block") ? "none" : "block";
}

function handleBlankButtonClick() {
    hideAllButtons()
    shapeInput.value = "1\n" +
        "490.03424099999995 648\n" +
        "100.000000\n" +
        "1.000000\n" +
        "0\n" +
        "5\n" +
        "1128602801\n" +
        "480.000000\n" +
        "30.000000\n" +
        "1.000000\n" +
        "0\n" +
        "1\n" +
        "1\n" +
        "0.000000\n" +
        "11\n" +
        "0\n" +
        "0.950000\n" +
        "33\n" +
        "73\n" +
        "1\n"
    computeShape();

}

function handleCloseButtonClick() {
    popuphelp.style.display = "none";
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;
        shapeInput.value = fileContent.trim();
        computeShape();
    };

    reader.readAsText(file, "UTF-8");
}
function handleWheelEvent(event) {
    if (isMouseOverSVG(event)) {
        event.preventDefault(); // Evita el desplazamiento predeterminado de la página
    }
}
function handleCanvasMouseDown(event) {
    if (!isRightClick(event) || popup.style.display === "block") return;
    var coords = relMouseCoords(event);
    initialClickX = coords.x;
    initialClickY = coords.y;
    isCanvasClicked = true;
}

function handleCanvasMouseUp() {
    isCanvasClicked = false;
    addShape();
}
let wheelTimer;

// Función para guardar la figura
function saveFigure() {
    addShape(); // Guardar la figura
    // Restablecer el temporizador
    clearTimeout(wheelTimer);
    wheelTimer = null;
}

// Controlador de eventos para la rueda del ratón en el canvas
function handleWheelCanvas(event) {
    if (selectedcircle == null) {
        var isScrollUp = event.deltaY < 0;
        var coords = relMouseCoords(event);
        var zoom = isScrollUp ? 1.03 : 0.97;
        transform(zoom, coords.x, coords.y, 0, 0);
        computeShape();

        // Reiniciar el temporizador cada vez que se usa la rueda del ratón
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(saveFigure, 300); // 300 milisegundos después de terminar el uso de la rueda
    }
}
function HandleMovecanvas(event) {
    if (!isRightClick(event) || popup.style.display === "block") return;
    if (isCanvasClicked) {
        if (activeCircle === false) {
            var coords = relMouseCoords(event);
            var currentMouseX = coords.x;
            var currentMouseY = coords.y;
            var movementX = currentMouseX - initialMouseX;
            var movementY = currentMouseY - initialMouseY;

            transform(1, null, null, movementX, movementY);
            computeShape();

            initialMouseX = currentMouseX;
            initialMouseY = currentMouseY;
        }
    }
}
function handleCanvasContextMenu(event) {
    event.preventDefault();
    openPopup(event.clientX, event.clientY);
}

function handleCanvasMouseDown2(event) {
    var coords = relMouseCoords(event);
    initialMouseX = coords.x;
    initialMouseY = coords.y;
}

function handleDocumentKeyDown(event) {
    if (event.ctrlKey && event.keyCode === 90) {
        updateShapeInput();
    } else if (event.ctrlKey && event.keyCode === 89) {
        redoShapeInput();
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.getElementById("toggle-content-button");
    const instructions = document.getElementById("instructions");
    const canvasSvg = document.getElementById("canvas_svg");

    let isInstructionsVisible = false;

    toggleButton.addEventListener("click", function () {
        if (isInstructionsVisible) {
            instructions.style.display = "none";
            canvasSvg.style.display = "block";
        } else {
            instructions.style.display = "block";
            canvasSvg.style.display = "none";
        }
        isInstructionsVisible = !isInstructionsVisible;
    });
});
