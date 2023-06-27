@echo off

REM Ejecutar emsdk_env.bat en la ruta de emsdk
cd /d D:\Nestor\TFG\emsdk
call emsdk_env.bat

REM Ejecutar emcc en la ruta de BranchedShapesEdition
cd /d D:\Nestor\TFG\Proyecto\BranchedShapesEdition
emcc mainBranchedShapesEdition.cpp triangulation.cpp -o blackbox.js --embed-file shape.txt -s NO_EXIT_RUNTIME=1 -s "EXPORTED_RUNTIME_METHODS=['ccall']" --shell-file index.html

echo El script ha finalizado.
pause >nul
