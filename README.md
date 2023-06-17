# TFG

Atm, we've introduced the use of d3.js and allowed the movement of circles (specific circles have been assigned a particular class: "draggable-circle", atm only wich ones with "stroke" == "black" ). 
The speed variable in the dragged function is set to 2 (subject to revision), and the recalculation is pending.


##### Notas ####

Se han pasado metodos que estaban en el index a app.js, el resto de metodos nuevos estan en tools.js.

Existe la funcion drafigure para dibujar la figura. Drag start es para cuando empieza el arrastre y luego esta dragged para cuando se mueve que cambia la posicion del circulo y change radius que cambia
el radio del circulo con la ruedita. updatecircle data actualiza el formato base con el que luego se genera el svg, por lo tanto luego gracias a animate se vuelve a generar el svg y a traves de ese nuevo svg volvemos a crear la nueva figura. dragended es para limpiar cositas.

animate como se dijo simplemente llama al actualizador del svg que automaticamente pinta luego. Luego se tienen unas funciones para evitar que funcione la rueda del raton encima del svg para que sea mas comodo.

y estamos pendiente de añadir nuevo circulo.

primero esta el numero de circulos, luego su posicion, luego su tamaño y el resto no se.
