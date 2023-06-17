// Declarar la variable svg fuera de la función drawFigure()
var svg;

// Variable para almacenar el círculo activo
var activeCircle = null;

// función que pinta el svg en el canvas
function drawFigure() {
    // Limpia el contenido anterior del canvas
    d3.select("#canvas_svg").selectAll("*").remove();

    // Obtiene el contenido SVG del textarea
    var svgContent = svgOutput.value;

    // Crea el elemento SVG en el canvas
    svg = d3.select("#canvas_svg")
        .append("svg")
        .attr("width", 600)
        .attr("height", 500);

    // Parsea el contenido SVG y lo dibuja en el canvas
    var parser = new DOMParser();
    var doc = parser.parseFromString(svgContent, "image/svg+xml");
    svg.node().appendChild(doc.documentElement);

    // Añade la clase "draggable-circle" a los círculos con stroke="black"
    svg.selectAll("circle")
        .filter(function() {
            return this.getAttribute("stroke") === "black";
        })
        .classed("draggable-circle", true)
        .on("mousedown", dragStarted);

    // Funciones de arrastre
    function dragStarted(event) {
        activeCircle = this;
        activeCircle.classList.add("active");

        // Obtener la posición inicial del círculo
        var initialX = parseFloat(activeCircle.getAttribute("cx"));
        var initialY = parseFloat(activeCircle.getAttribute("cy"));

        // Calcular la diferencia entre la posición del ratón y la posición inicial del círculo
        var deltaX = event.clientX - initialX;
        var deltaY = event.clientY - initialY;

        // Definir una constante de velocidad para ajustar la sensibilidad del movimiento
        var speed = 2; // Puedes ajustar este valor según tus necesidades

        // Escuchar eventos de movimiento del ratón en todo el documento
        document.addEventListener("mousemove", dragged);
        document.addEventListener("mouseup", dragEnded);

        // Función de arrastre
        function dragged(event) {
            if (activeCircle) {
                // Calcular el desplazamiento del ratón multiplicado por la velocidad
                var offsetX = (event.clientX - deltaX - initialX) * speed;
                var offsetY = (event.clientY - deltaY - initialY) * speed;

                // Calcular las nuevas coordenadas del círculo sumando el desplazamiento al valor inicial
                var newX = initialX + offsetX;
                var newY = initialY + offsetY;

                // Establecer las nuevas coordenadas del círculo
                activeCircle.setAttribute("cx", newX);
                activeCircle.setAttribute("cy", newY);
            }
        }

        // Función de finalización del arrastre
        function dragEnded() {
            if (activeCircle) {
                activeCircle.classList.remove("active");
                activeCircle = null;

                // Dejar de escuchar eventos de movimiento del ratón en todo el documento
                document.removeEventListener("mousemove", dragged);
                document.removeEventListener("mouseup", dragEnded);
            }
        }
    }


    function dragEnded() {
        if (activeCircle) {
            activeCircle.classList.remove("active");
            activeCircle = null;

            // Deja de escuchar eventos del ratón en todo el documento
            document.removeEventListener("mousemove", dragged);
            document.removeEventListener("mouseup", dragEnded);
        }
    }
}