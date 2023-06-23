## Para Comenzar

Para correr localmente ejecutar los siguientes comandos en ambos proyectos:

```bash
npm install

npm run dev
```

## Endpoints

Flujo de registro:

- [http://localhost:5001/ingresar/{nroCedula}]

Flujo de logueo:

- [http://localhost:5001/registrar/{nroCedula}]

## Correr imagen Docker

Para levantar la imagen correr los siguientes comandos:

```bash
docker-compose build

docker-compose up
```

## Env

Dentro del docker-compose.yml se definen los valores que pasan al env del front
