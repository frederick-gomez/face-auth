# para levantar la aoi se debe ejecutar los siguientes comandos.

docker build -t ocr:latest .

docker run -d -p 8200:8200 ocr
