// Let
let statusElement = document.getElementById('status');
let progressElement = document.getElementById('progress');
let spinnerElement = document.getElementById('spinner');
let shapeInput = document.getElementById('shapeInput');
let svgOutput = document.getElementById('svgOutput');
let isDragging = false;
let currentShapeIndex = -1;
let svgPtr;

// var
var circulitos;
var selectedcircle = null;
var draggableCircles;
var deltaX, deltaY;
var initialX = 0;
var initialY = 0;
var activeCircle = false;
var hasDataChanged;
var isCanvasClicked = false;
var popupallAux = false;
var initialMouseX = 0;
var initialMouseY = 0;
var shapesArray = [];
var previousAngle= 0;
// const
const popup = document.getElementById("popup");
const popup2 = document.getElementById("popupall");
const waitingMessage = document.getElementById("waiting-message");
const canvas = document.getElementById("canvas_svg");
const helpButton = document.getElementById("helpButton");
const blankButton = document.getElementById("blankButton");
const closeBtn = document.getElementsByClassName("close")[0];
const exportButton = document.getElementById("exportButton");
const customUploadButton = document.querySelector(".custom-upload-button");
const uploadInput = document.getElementById("upload");
const svgElement = document.getElementById("canvas_svg");
const eraseButton = document.getElementById("eraseButton");
const erasesButton = document.getElementById("erasesButton");
const noaction = document.getElementById("noAction");
const bpreview = document.getElementById("preview");
const addButton = document.getElementById("addcircle");
const addsButton = document.getElementById("addcircles");
const createcon = document.getElementById("createconection");
const erasecon = document.getElementById("eraseconection");
const middlecircle = document.getElementById("middlecircle");
const computeButton = document.getElementById("computeButton");

//Buttons Event Listeners
middlecircle.addEventListener("click", handleMiddleCircleClick);
erasecon.addEventListener("click", handleEraseconClick);
createcon.addEventListener("click", handleCreateconClick);
addButton.addEventListener("click", handleAddButtonClick);
addsButton.addEventListener("click", handleAddButtonClicks);
bpreview.addEventListener("click", handleBPreviewMouseDown);
noaction.addEventListener("click", handleNoActionClick);
eraseButton.addEventListener("click", handleEraseButtonClick);
erasesButton.addEventListener("click", handleEraseButtonClicks);
helpButton.addEventListener("click", handleHelpButtonClick);
blankButton.addEventListener("click", handleBlankButtonClick);
closeBtn.addEventListener("click", handleCloseButtonClick);
computeButton.addEventListener("click", handleComputeButtonClick);
customUploadButton.addEventListener("click", () => { uploadInput.click(); });
uploadInput.addEventListener("change", handleFileUpload);
exportButton.addEventListener("click", HandleExportShapeButtonClick);

// Canvas Event Listeners
canvas.addEventListener("mousedown", handleCanvasMouseDown);
canvas.addEventListener("mouseup", handleCanvasMouseUp);
canvas.addEventListener("wheel", handleWheelCanvas);
canvas.addEventListener("mousemove", HandleMovecanvas);
canvas.addEventListener("contextmenu", handleCanvasContextMenu);
canvas.addEventListener("mousedown", handleCanvasMouseDown2);

// Document Event Listener
document.addEventListener("keydown", handleDocumentKeyDown);
svgElement.addEventListener("wheel", handleWheelEvent, { passive: false });

const colorButton = document.getElementById('color-button');
const colorMenu = document.getElementById('color-menu');

colorButton.addEventListener('click', () => {
    if (colorMenu.style.display === 'block') {
        colorMenu.style.display = 'none';
    } else {
        colorMenu.style.display = 'block';
    }
});

// Obtén el elemento div que contiene el SVG
var svgContainer = document.getElementById('canvas_svg');

// Obtén los elementos de los círculos arrastrables
var draggableCircles = document.querySelectorAll('.draggable');

// Bandera para rastrear si se está haciendo clic
var isClicking = false;

// Función para prevenir la recarga de la página
function preventDefaultAction(e) {
    if (isClicking) {
        e.preventDefault();
    }
}

// Evento de inicio del toque, establece la bandera en verdadero
svgContainer.addEventListener('touchstart', function () {
    isClicking = true;
});

// Evento de movimiento del toque en el contenedor SVG, prevenir la recarga de la página
svgContainer.addEventListener('touchmove', preventDefaultAction);

// Evento de finalización del toque en el contenedor SVG, restablece la bandera a falso
svgContainer.addEventListener('touchend', function () {
    isClicking = false;
});
