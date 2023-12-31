//Functionality
function fixit() {
    transform(1, null, null, 0, 0);
}


function arraysAreEqual(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
function addShape() {
    const newShape = shapeInput.value.split("\n");
    if (currentShapeIndex < shapesArray.length - 1) {
        //shapesArray.splice(currentShapeIndex + 1);
    }
    if (shapesArray.length >= 10) {
        shapesArray.shift();
    }
    const lastShape = shapesArray[currentShapeIndex];

    const shapesAreEqual = lastShape && arraysAreEqual(newShape, lastShape);

    if (!shapesAreEqual) {
        shapesArray.push(newShape);
        currentShapeIndex = shapesArray.length - 1;
    }
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
    if(selectedcircle==null) return;
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

        previousGlobalRadius = 0;

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
        document.addEventListener("mouseup", function () {
            isDragging = false;
            popup.style.cursor = "grab";

        });
        canvas.addEventListener("mouseup", function () {
            closePopup();
        });
        var smoothInput = document.getElementById("smooth");
        var globalRadiusInput = document.getElementById("globalRadius");

        var angleInput = document.getElementById("angleInput");
        var xInput = document.getElementById("xInput");
        var yInput = document.getElementById("yInput");

        if (popupallAux === false) {
            smoothInput.addEventListener("mousemove", handleSmoothInput);
            smoothInput.addEventListener("touchmove", handleSmoothInput);

            globalRadiusInput.addEventListener("input", handleGlobalRadiusInput);

            angleInput.addEventListener("mousemove", handleAngleInput);
            angleInput.addEventListener("touchmove", handleAngleInput);

            function handleSmoothInput(event) {
                event.stopPropagation();
                const currentSmoothValue = smoothInput.value;
                const smoothDifference = currentSmoothValue - previousSmoothValue;
                allcircles(0, smoothDifference);
                previousSmoothValue = currentSmoothValue;
            }

            function handleGlobalRadiusInput() {
                const newGlobalRadius = globalRadiusInput.value;
                const radiusDifference = newGlobalRadius - previousGlobalRadius;
                allcircles(radiusDifference, 0);
                previousGlobalRadius = newGlobalRadius;
            }

            function handleAngleInput(event) {
                event.stopPropagation();
                const newAngle = parseFloat(angleInput.value);
                const x = parseFloat(xInput.value);
                const y = parseFloat(yInput.value);
                const angleDifference = newAngle - previousAngle;
                rotate(angleDifference, x, y);
                computeShape();
                previousAngle = newAngle;
            }


            angleInput.value = "0";
            xInput.value = "512";
            yInput.value = "512";

            popupallAux = true;
        }

        let previousSmoothValue = smoothInput.value;
    }
}

function closePopup() {
    var globalRadiusInput = document.getElementById("globalRadius"); // Nuevo input
    globalRadiusInput.value=0;
    addShape();
    addAllCanvasEvents();
    popup2.style.display = "none";
    angleInput.value = "0";
    xInput.value = "512";
    yInput.value = "512";
    previousAngle = "0";
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

    circulitos.attr("r", function () {
        const currentRadius = parseFloat(d3.select(this).attr("r"));
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

    const closeButton = document.getElementById("closeButton");
    closeButton.addEventListener("click", function () {
        addShape();
        unselect();
    });
    document.addEventListener("mouseup", function () {
        isDragging = false;
        popup.style.cursor = "grab";
    });
    canvas.addEventListener("mouseup", function () {
        closeButton.click();
    });
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

    smoothInput.addEventListener("input", function (event) {
        isDragging=false;
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
    }
    selectedcircle.setAttribute("stroke", "blue");
    selectedcircle.setAttribute("stroke-width", "3");
    showPopup(512, 512);
}


function isRightClick(event) {
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
    if (!isRightClick(event) || popup.style.display === "block") return;
    isDragging = false;
    activeCircle = false;
    document.removeEventListener("mouseup", dragEnded);
    document.removeEventListener("mousemove", dragged);
    drawFigure();
    unselect();
}
var touch ;

function touchStarted(event){
    isClicking = true;
    if(waitingMessage.style.display === "block") return
    if (event.touches.length === 1) {
        if (popup2.style.display === "block") return;
        if (selectedcircle == null) {
            selectedcircle = this;
            selectedcircle.setAttribute("stroke", "blue");
            selectedcircle.setAttribute("stroke-width", "3")
        }

        drawFigure();
    }
    activeCircle = this;
    touch = event.touches[0];
    selectedcircle = activeCircle;
    initialX = parseFloat(activeCircle.getAttribute("cx"));
    initialY = parseFloat(activeCircle.getAttribute("cy"));
    activeCircle.setAttribute("stroke", "blue");
    activeCircle.setAttribute("stroke-width", "3");

    deltaX = touch.clientX;
    deltaY = touch.clientY;

    activeCircle.addEventListener("touchmove", touchMoved);
    activeCircle.addEventListener("touchend", touchEnded);

}

function touchMoved(event,) {
    preventDefaultAction(event);
    isDragging = true; // Marcar como arrastrando
    if (isDragging && activeCircle) {
        touch = event.touches[0];
        var offsetX = touch.clientX - deltaX;
        var offsetY = touch.clientY - deltaY;
        const newX = initialX + offsetX;
        const  newY = initialY + offsetY;

        activeCircle.setAttribute("cx", newX);
        activeCircle.setAttribute("cy", newY);
        hasDataChanged = true; // Marcar como datos modificados

        updateCircleData(activeCircle, newX, newY);
    }
}

function touchEnded(event) {
    isClicking = false;
    selectedcircle= activeCircle;
    activeCircle = false;
    if(isDragging===false){rightClick(event)}
    document.removeEventListener("touchmove", touchMoved);
    document.removeEventListener("touchend", touchEnded);
    drawFigure();
    if(isDragging===true){unselect();}
    isDragging = false;
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

function updateCircleRadius(circleIndex,newRadius) {
    const shapeInput = document.getElementById("shapeInput");
    if (newRadius<0) return;
    const lines = shapeInput.value.split("\n");
    const firstLine = lines[0].trim();

    if (newRadius !== undefined && newRadius !== null) {
        lines[circleIndex] = `${newRadius}`;
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
    canvas.removeEventListener("click", addcirclebefore);
    canvas.removeEventListener("contextmenu", handleCanvasContextMenu);

    draggableCircles.on("mousedown", null).on("mouseup", null);
}
function addAllCanvasEvents() {
    canvas.addEventListener("mousemove", HandleMovecanvas);
    canvas.addEventListener("wheel", handleWheelCanvas);
    draggableCircles = circulitos
        .on("mousedown", dragStarted)
        .on("touchstart", touchStarted)
        .on("contextmenu", rightClick);
    canvas.addEventListener("contextmenu", handleCanvasContextMenu);
    circulitos.on("click", function () {});
    waitingMessage.style.display = "none";
}

function setButtonStyle() {
    const buttons = document.getElementsByTagName("button");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.backgroundColor = "#4CAF50";
    }
}

function addcirclebefore(event) {
    var coords = relMouseCoords(event);

    addpoint(coords.x , coords.y );
    addButton.style.backgroundColor = "#4CAF50";

    waitingMessage.style.display = "none";
}
var coords;
var initialDistance;
var throttledMouseMove;

function addcircle(event) {
    coords = relMouseCoords(event);
    initialDistance = 0;
    addpoint(coords.x, coords.y);
    var addcircleindex = shapeInput.value.split('\n')[0] * 2;
    radius = shapeInput.value.split('\n')[addcircleindex];
    updateCircleRadius(addcircleindex, radius/4);

    computeShape();
    addButton.style.backgroundColor = "#4CAF50";
    waitingMessage.style.display = "none";
    throttledMouseMove = throttle(handleCircleMouseMove, 16);
    document.addEventListener("mousemove", throttledMouseMove);
    document.addEventListener("mouseup", handleCircleMouseUp);

}

function handleCircleMouseMove(event) {
    var coords2 = relMouseCoords(event);

    var distanceSquared = Math.pow(coords2.x - coords.x, 2) + Math.pow(coords2.y - coords.y, 2);
    var radiusIncrement = Math.sqrt(distanceSquared) - Math.sqrt(initialDistance);

    initialDistance = distanceSquared;

    var addcircleindex = shapeInput.value.split('\n')[0] * 2;
    var radius = parseInt(shapeInput.value.split('\n')[addcircleindex], 10);
    updateCircleRadius(addcircleindex, radius + radiusIncrement);

    computeShape();
    removeAllCanvasEvents();
}

function handleCircleMouseUp() {
    document.removeEventListener("mousemove", throttledMouseMove);
    document.removeEventListener("mouseup", handleCircleMouseUp);
    addAllCanvasEvents();
}

// Función throttle para limitar la frecuencia de ejecución
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

function relMouseCoords(event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) * (1);
    var y = (event.clientY - rect.top) * (1);
    return { x: x, y: y };
}

function buttonColor(elementoBoton, color) {
    elementoBoton.style.backgroundColor = color;

}

document.addEventListener('DOMContentLoaded', function () {
    // Botón "Advanced Info"
    var advancedInfoButton = document.getElementById('advancedInfoButton');
    advancedInfoButton.addEventListener('click', function () {
        // Muestra u oculta los elementos
        var hiddenElements = document.querySelectorAll('#inline-buttons, #shapeInput, #instructions2, #advinfo');
        for (var i = 0; i < hiddenElements.length; i++) {
            if (hiddenElements[i].style.display === 'none') {
                hiddenElements[i].style.display = 'block';
            } else {
                hiddenElements[i].style.display = 'none';
            }
        }
    });
});
function toggleButtons(categoria) {
    var buttons = document.querySelectorAll('.' + categoria);
    var anyButtonVisible = Array.from(buttons).some(function(button) {
        return !button.classList.contains('hidden');
    });

    // Si al menos un botón de la categoría no está visible, ocultar todos los botones
    if (!anyButtonVisible) {
        hideAllButtons();
    }
    buttons.forEach(function (button) {
        button.classList.toggle('hidden');
    });
}
function hideAllButtons() {
    var categories = ['edicion', 'creacion', 'generacion', 'otros'];

    categories.forEach(function (categoria) {
        var buttons = document.querySelectorAll('.' + categoria);
        buttons.forEach(function (button) {
            button.classList.add('hidden');
        });
    });
}
