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

---ACTUALIZACION---


La speed del raton hay que mirarla, ni siquiera creo que que exista speed sea algo  que debiera existir.

hay que hacer algo con los draggeable-circles, esa clase deberia estar estanciada desde el prinicpio.

A nivel de codigo, no permitir que se pueda intentar colocar un punto entre dos, si no existe el segmento.

Optmizar, es inhumano lo mal que va cunado hay muchos circulos, hay que mirarlo. Incluso sale un error de out of memory o algo asi.

el zoom, hay que mejorarlo,

tambien con muchos circulos no se puede ni arrastrar casi

tambein ahora lo del circulo en medio es clickando en un circulo y leugo en otro, no en medio.

UI: ALgo que indique que estas esperando a que clickes circulos o algo, experiencia de usuario xd
