function drawFigure() {
    const svgContent = svgOutput.value;

    const canvas = document.getElementById("canvas_svg");
    canvas.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.documentElement;

    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");

    canvas.appendChild(svgElement);

    const draggableCircles = d3.selectAll("#canvas_svg circle[stroke='black']")
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
