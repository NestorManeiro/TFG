#include <cstdlib>
#include <iostream>
#include <fstream>
#include <stdio.h>
#include <cstring>
#include <string.h>
#include <time.h>
#include <emscripten.h>

#include "triangulation.h"

NodeTree nT; /// shape object
int main() {

   /// READING SHAPE PARAMETERS
    nT.read("shape.txt"); /// reading shape configuration from disk

  /// CHECKING THE SHAPE STRUCTURE
  if(nT.checking()==false){
    printf("Problems with the uploaded branched shape\n");
    return 1;
  }

  /// GENERATION OF A SVG FILE (THE SECOND PARAMETERS IS USED TO DRAW THE CIRCLES IN BLACK)
  nT.svg_generation("shape.svg",true);

  /// PRINT SHAPE MAIN PARAMETERS
  for(int k=0;k<nT.n_.size();k++){
    printf("cercle %d : center = (%1.2lf,%1.2lf), radius=%1.2lf, smoothing factor=%1.2lf\n",
           k,nT.n_[k].x,nT.n_[k].y,nT.r_[k],nT.s_[k]);
  }

  /// SAVING THE NEW SHAPE FILES
  nT.svg_generation("shape_new.svg",true);
  nT.write("shape_new.txt");
  return 0;
}


EMSCRIPTEN_KEEPALIVE
char* ComputeSVGFromShape(char* shape) {

    // guardamos la string shape en el fichero de texto shape.txt
    FILE *shapeFile = fopen("shape.txt", "w");
    fprintf(shapeFile, "%s", shape);
    fclose(shapeFile);

    main();

    // leo todo el fichero de salida en una string para devolverla
    FILE *SVGfile = fopen("shape.svg", "r");
    fseek(SVGfile, 0, SEEK_END);
    long dim = ftell(SVGfile);
    fseek(SVGfile, 0, SEEK_SET);
    char *contenido = (char *)malloc(dim + 1);
    fread(contenido, sizeof(char), dim, SVGfile);
    contenido[dim] = '\0'; // Agregar el car�cter nulo al final de la cadena
    fclose(SVGfile);
    return contenido;
}

EMSCRIPTEN_KEEPALIVE
char* erasepoint(int argc) {
    nT.erase_point(argc);
    nT.svg_generation("shape_new.svg", true);
    nT.write("shape_new.txt");

    std::ifstream file("shape_new.txt");
    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    file.close();

    char* result = (char*)malloc(content.size() + 1);
    std::strcpy(result, content.c_str());
    return result;
}





/// **********************************************************
///               MAIN
/// **********************************************************
int ejemplo(int argc, char *argv[]){
  /// ADD A POINT IN THE MIDDLE OF THE FIRST SEGMENT
  nT.insert_point((nT.n_[0]+nT.n_[1])*0.5,
                  (nT.r_[0]+nT.r_[1])*0.5,
                  (nT.s_[0]+nT.s_[1])*0.5,0,1);

  /// ERASE A POINT
  nT.erase_point(2);

  /// CONNECT 2 NODES
  nT.connect_nodes(2,3);

  /// DISCONNECT 2 NODES
  nT.disconnect_nodes(0,2);


  /// SAVING THE NEW SHAPE FILES
  nT.svg_generation("shape_new.svg",true);
  nT.write("shape_new.txt");

/***********************************************************************/

  /// EXAMPLE OF RANDOM GENERATION OF A BRANCHED SHAPE
  nT=NodeTree_random_generator();

  /// SAVING THE NEW SHAPE FILES
  nT.svg_generation("random_shape.svg",true);
  nT.write("random_shape.txt");


/***********************************************************************/

  /// EXAMPLE OF A BRANCHED SHAPE SIMILAR TO THE RANDOMLY GENERATED

  NodeTree nT2=NodeTree_similar_generation(nT);

  /// SAVING THE NEW SHAPE FILES
  nT2.svg_generation("random_shape_similar.svg",true);
  nT2.write("random_shape_similar.txt");

}