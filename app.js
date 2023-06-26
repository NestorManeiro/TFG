let statusElement = document.getElementById('status');
let progressElement = document.getElementById('progress');
let spinnerElement = document.getElementById('spinner');
let shapeInput = document.getElementById('shapeInput');
let svgOutput = document.getElementById('svgOutput');
//Cambiar esto a let o const y explota todo
var Module = {
    preRun: [],
    postRun: [],
    print: (function() {
        let element = document.getElementById('output');
        if (element) element.value = ''; // clear browser cache
        return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');

            //Comentar para tener mejora de rendimiento
            /*console.log(text);
            if (element) {
                element.value += text + "\n";
                element.scrollTop = element.scrollHeight; // focus on bottom
            }*/
        };
    })(),
    canvas: (() => {
        return document.getElementById('canvas');
    })(),
    setStatus: (text) => {
        if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        let m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        let now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;
        if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2])*100;
            progressElement.max = parseInt(m[4])*100;
            progressElement.hidden = false;
            spinnerElement.hidden = false;
        } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;
            if (!text) spinnerElement.hidden = true;
        }
        statusElement.innerHTML = text;
    },
    totalDependencies: 0,
    monitorRunDependencies: (left) => {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
    }
};
Module.setStatus('Downloading...');
window.onerror = () => {
    Module.setStatus('Exception thrown, see JavaScript console');
    spinnerElement.style.display = 'none';
    Module.setStatus = (text) => {
        if (text) console.error('[post-exception status] ' + text);
    };
};

// para ejecutar mi función
document.getElementById("mybutton").addEventListener("click", () => {
    computeShape();
});

function computeShape(){
    svgOutput.value = Module.ccall(
        "_Z19ComputeSVGFromShapePc", // name of C function
        'string', // return type
        //['number','string'], // argument types
        ['string'], // argument types
        [shapeInput.value], // arguments
    );
    drawFigure();
}
// para cargar el shape.txt en el textarea al principio
window.addEventListener('load', function() {
    // Crear una nueva solicitud XMLHttpRequest
    let solicitud = new XMLHttpRequest();

    // Configurar la solicitud
    solicitud.open("GET", "./shape.txt", true);
    solicitud.onreadystatechange = function() {
        if (solicitud.readyState === 4 && solicitud.status === 200) {
            // Obtener el contenido del archivo
            let contenido = solicitud.responseText;

            // Establecer el contenido en el textarea
            let textarea = document.getElementById('shapeInput');
            textarea.value = contenido;
        }
    };

    // Enviar la solicitud
    solicitud.send();
});
