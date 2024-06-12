const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
var bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cron = require("./cron/Cron");

const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({ extended: true });

const sequelize = require("./database/sequelize");

const db = require("./database/sequelize");
const cookieParser = require("cookie-parser");
const Permiology = db.permiology;
////START SERVER ////
main();

async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();

    sequelize
      .sync()
      .then(() => {
        console.log("Mysql running ok");
      })
      .catch((err) => {
        console.error("Error al sincronizar la base de datos:", err);
      });
    // force: true will drop the table if it already exists
    // sequelize.sync({force: true}).then(() => {
    //   console.log('Drop and Resync Database with { force: true }');
    //   initial();
    // });
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
  }
}

function leerControladores() {
  // Ruta de la carpeta de controladores
  const controllersFolder = path.join(__dirname, "controllers");
  console.log("ruta ", controllersFolder);

  // Leer los archivos en la carpeta de controladores
  fs.readdir(controllersFolder, (err, carpetas) => {
    if (err) {
      console.error("Error al leer la carpeta de controladores:", err);
      return;
    }
    console.log("carpetas ", carpetas);

    // Iterar sobre cada carpeta
    carpetas.forEach((carpeta) => {
      const carpetaPath = path.join(controllersFolder, carpeta);

      // Verificar si es una carpeta
      fs.stat(carpetaPath, (err, stats) => {
        if (err) {
          console.error(
            `Error al obtener información de la carpeta ${carpeta}:`,
            err
          );
          return;
        }

        if (stats.isDirectory()) {
          // Si es una carpeta, leemos los archivos dentro de ella
          fs.readdir(carpetaPath, (err, archivos) => {
            if (err) {
              console.error(`Error al leer la carpeta ${carpeta}:`, err);
              return;
            }

            // Iterar sobre los archivos dentro de la carpeta
            archivos.forEach((archivo) => {
              const archivoPath = path.join(carpetaPath, archivo);
              // Verificar si el archivo es un archivo JavaScript
              if (
                fs.statSync(archivoPath).isFile() &&
                archivo.endsWith(".js")
              ) {
                // Si es un archivo JavaScript, leer su contenido
                fs.readFile(archivoPath, "utf8", (err, contenido) => {
                  if (err) {
                    console.error(`Error al leer el archivo ${archivo}:`, err);
                    return;
                  }
                  // Analizar el contenido del controlador para obtener los métodos
                  const metodos = obtenerMetodos(contenido);
                  console.log(`Métodos del controlador ${archivo}:`, metodos);
                  // Aquí puedes guardar los métodos en tu base de datos o realizar otras acciones
                });
              }
            });
          });
        }
      });
    });
  });
}

// Función para obtener los métodos de un controlador
function obtenerMetodos(contenido) {
  // Expresión regular para buscar los métodos con el prefijo CTRL.
  const regex = /CTRL\.(\w+)/g;
  const metodos = [];
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    metodos.push(match[1]);
  }
  return metodos;
}

function main() {
  testDatabaseConnection();
  leerControladores();

  // Puerto en el que escucha el servidor
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Nodejs running on port: ${PORT}`);
  });
  middlewares();
}

function middlewares() {
  //console.log('process.env.IP_PROD_FR => ' , process.env.IP_PROD_FR)
  // Middlewares
  app.use(
    cors({
      origin: ["http://localhost:5000"],
      // origin: "*" ,
      credentials: true,
    })
  );
  app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Methods", "*");
    // res.header(
    //   "Access-Control-Allow-Headers",
    //   "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    // );
    next();
  });
  app.use(express.json()); //de esta forma podemos entender los archivos JSON que vengan de Frontend y manipularlos
  app.use(bodyParserJSON);
  app.use(bodyParserURLEncoded);
  app.use(cookieParser()); // instaciamos  ayudas de cookes como req.cookie
  routes();
  // update
}

// Configura EJS como el motor de vistas
app.set("view engine", "ejs");
// Especifica la ubicación de tus vistas (plantillas EJS)
app.set("views", path.join(__dirname, "email/provider"));
app.use(express.static("public"));
function routes() {
  // app.use("/api/v1/permisologys", trafic, require("./routes/permisologys/permisologys.routes"))
  app.use("/api/v1/users", trafic, require("./routes/users/users.routes"));
  app.use("/api/v1/clients", trafic, require("./routes/client/client.routes"));
  app.use(
    "/api/v1/cod_posts",
    trafic,
    require("./routes/cod_posts/cod_posts.routes")
  );
  app.use(
    "/api/v1/storage",
    trafic,
    require("./routes/storage/storage.routes")
  );
  app.use(
    "/api/v1/patologies",
    trafic,
    require("./routes/patologies/patologies.routes")
  );
  app.use(
    "/api/v1/languages",
    trafic,
    require("./routes/languages/languages.routes")
  );
}
app.use(
  "/api/v1/clients-patologies",
  trafic,
  require("./routes/clients_patologies/clients_patologies.routes")
);
app.use("/api/v1/genders", trafic, require("./routes/genders/genders.routes"));
app.use(
  "/api/v1/countries",
  trafic,
  require("./routes/countries/countries.routes")
);
app.use(
  "/api/v1/services",
  trafic,
  require("./routes/services/services.routes")
);
app.use(
  "/api/v1/employees",
  trafic,
  require("./routes/employees/employees.routes")
);
app.use(
  "/api/v1/client-service",
  trafic,
  require("./routes/clients_services/clients_services.routes")
);
app.use(
  "/api/v1/client-service-preselection",
  trafic,
  require("./routes/clients_services_preselections/clients_services_preselections.routes")
);
function trafic(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  next();
}
