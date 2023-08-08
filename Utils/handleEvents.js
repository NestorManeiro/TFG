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
    svgOutput.value = preview();
    drawFigure();
}

function handleBPreviewMouseUp() {
    computeShape();
}

function handleMiddleCircleClick() {
    buttonColor(middlecircle, "#ff9800");
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleMiddleCircleConnectionClick);
    }
}

function handleMiddleCircleConnectionClick() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);

    if (typeof erasecon.firstCircleIndex === "undefined") {
        erasecon.firstCircleIndex = circleIndex;
    } else {
        middleCircle(erasecon.firstCircleIndex, circleIndex);
        delete erasecon.firstCircleIndex;
        waitingMessage.style.display = "none";
        buttonColor(middlecircle, "#4CAF50");
    }
}
function handleEraseconClick() {
    buttonColor(erasecon, "#ff9800");
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleEraseConnectionClick);
    }
}

function handleEraseConnectionClick() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);

    if (typeof eraseConnection.firstCircleIndex === "undefined") {
        eraseConnection.firstCircleIndex = circleIndex;
    } else {
        eraseConnection(eraseConnection.firstCircleIndex, circleIndex);
        delete eraseConnection.firstCircleIndex;
        waitingMessage.style.display = "none";
        buttonColor(erasecon, "#4CAF50");
    }
}
function handleCreateconClick() {
    buttonColor(createcon, "#ff9800");
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleCreateConnectionClick);
    }
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
}
function handleAddButtonClick() {
    buttonColor(addButton, "#ff9800");
    waitingMessage.style.display = "block";
    removeAllCanvasEvents();
    canvas.addEventListener("click", addcircle, { once: true });
}

function handleEraseButtonClick() {
    buttonColor(eraseButton, "#ff9800");
    if (circulitos) {
        waitingMessage.style.display = "block";
        removeAllCanvasEvents();
        circulitos.on("click", handleCircleClickForErase);
    }
}
function handleCircleClickForErase() {
    const circleIndex = Array.from(circulitos.nodes()).indexOf(this);
    erasePoint(circleIndex);
    waitingMessage.style.display = "none";
    buttonColor(eraseButton, "#4CAF50");
}
function handleComputeButtonClick() {
    addShape(shapeInput.value.split("\n"));
    computeShape();
    fixit();
}
function handleHelpButtonClick() {
    popuphelp.style.display = "block";
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
    initialClickX = event.clientX - canvas.getBoundingClientRect().left;
    initialClickY = event.clientY - canvas.getBoundingClientRect().top;
    isCanvasClicked = true;
}

function handleCanvasMouseUp() {
    isCanvasClicked = false;
    addShape();
}
function handleWheelCanvas(event) {
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
function HandleMovecanvas(event) {
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
function handleCanvasContextMenu(event) {
    event.preventDefault();
    openPopup(event.clientX, event.clientY);
}

function handleCanvasMouseDown2(event) {
    var rect = canvas.getBoundingClientRect();
    initialMouseX = event.clientX - rect.left;
    initialMouseY = event.clientY - rect.top;
}

// Document Event Handler
function handleDocumentKeyDown(event) {
    if (event.ctrlKey && event.keyCode === 90) {
        updateShapeInput();
    } else if (event.ctrlKey && event.keyCode === 89) {
        redoShapeInput();
    }
}
