# Utilizar una imagen de Node.js basada en Debian Buster
FROM node:14-buster

# Crear el directorio de la aplicación en el contenedor
WORKDIR /usr/src/app

# Copiar los archivos del paquete
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Instalar Tesseract OCR y lenguajes adicionales
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-spa 

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que se ejecutará la aplicación
EXPOSE 8200

# Definir el comando para ejecutar la aplicación
CMD [ "node", "api.js" ]