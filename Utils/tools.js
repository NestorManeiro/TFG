// función que pinta el svg en el canvas
function drawFigure() {
    const svgContent = svgOutput.value;

    d3.select("#canvas_svg").selectAll("*").remove();

    const svg = d3.select("#canvas_svg")
        .append("svg")
        .attr("width", 600)
        .attr("height", 500);

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    svg.node().appendChild(doc.documentElement);

    const draggableCircles = svg.selectAll("circle[stroke='black']")
        .classed("draggable-circle", true);

    draggableCircles.on("mousedown", dragStarted);

    let activeCircle = null;
    let initialX, initialY, deltaX, deltaY;

    function dragStarted(event) {
        activeCircle = this;
        activeCircle.classList.add("active");

        initialX = parseFloat(activeCircle.getAttribute("cx"));
        initialY = parseFloat(activeCircle.getAttribute("cy"));
        deltaX = event.clientX - initialX;
        deltaY = event.clientY - initialY;

        document.addEventListener("mousemove", dragged);
        document.addEventListener("mouseup", dragEnded);
    }

    function dragged(event) {
        if (!activeCircle) return;

        const speed = 2;
        const offsetX = (event.clientX - deltaX - initialX) * speed;
        const offsetY = (event.clientY - deltaY - initialY) * speed;
        const newX = initialX + offsetX;
        const newY = initialY + offsetY;

        activeCircle.setAttribute("cx", newX);
        activeCircle.setAttribute("cy", newY);
    }

    function dragEnded() {
        if (!activeCircle) return;

        activeCircle.classList.remove("active");
        activeCircle = null;

        document.removeEventListener("mousemove", dragged);
        document.removeEventListener("mouseup", dragEnded);
    }
}
