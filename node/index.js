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


  app.use(
    cors({
      origin: [ "https://app.sussalut.com",
      "http://localhost:5002"],
      // origin: "*" ,
      credentials: true,
    })
  );
  app.options("*", cors({
  origin: [
    "https://app.sussalut.com",
    "http://localhost:5002",
  ],
  credentials: true,
}));


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

// function leerControladores() {
//   const controllersFolder = path.join(__dirname, "controllers");
//   console.log("ruta ", controllersFolder);

//   fs.readdir(controllersFolder, (err, carpetas) => {
//     if (err) {
//       console.error("Error al leer la carpeta de controladores:", err);
//       return;
//     }
//     console.log("carpetas ", carpetas);

//     carpetas.forEach((carpeta) => {
//       const carpetaPath = path.join(controllersFolder, carpeta);

//       fs.stat(carpetaPath, (err, stats) => {
//         if (err) {
//           console.error(
//             `Error al obtener información de la carpeta ${carpeta}:`,
//             err
//           );
//           return;
//         }

//         if (stats.isDirectory()) {
//           fs.readdir(carpetaPath, (err, archivos) => {
//             if (err) {
//               console.error(`Error al leer la carpeta ${carpeta}:`, err);
//               return;
//             }
//             archivos.forEach((archivo) => {
//               const archivoPath = path.join(carpetaPath, archivo);
//               if (
//                 fs.statSync(archivoPath).isFile() &&
//                 archivo.endsWith(".js")
//               ) {
//                 fs.readFile(archivoPath, "utf8", (err, contenido) => {
//                   if (err) {
//                     console.error(`Error al leer el archivo ${archivo}:`, err);
//                     return;
//                   }
//                   const metodos = obtenerMetodos(contenido);
//                   console.log(`Métodos del controlador ${archivo}:`, metodos);
//                 });
//               }
//             });
//           });
//         }
//       });
//     });
//   });
// }

// Función para obtener los métodos de un controlador
// function obtenerMetodos(contenido) {
//   const regex = /CTRL\.(\w+)/g;
//   const metodos = [];
//   let match;
//   while ((match = regex.exec(contenido)) !== null) {
//     metodos.push(match[1]);
//   }
//   return metodos;
// }

function main() {
  // testDatabaseConnection();
  // leerControladores();
  middlewares();
  // Puerto en el que escucha el servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Nodejs running on port: ${PORT}`);
  });

}

function middlewares() {
  //console.log('process.env.IP_PROD_FR => ' , process.env.IP_PROD_FR)
  // Middlewares

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
  app.use(
    "/api/v1/relations",
    trafic,
    require("./routes/families/relations.routes")
  );
  app.use("/api/v1/clients", trafic, require("./routes/client/client.routes"));
  app.use(
    "/api/v1/cod_posts",
    trafic,
    require("./routes/cod_posts/cod_posts.routes")
  );
  app.use("/api/v1/cooks", trafic, require("./routes/cooks/cooks.routes"));
  app.use(
    "/api/v1/educational-levels",
    trafic,
    require("./routes/educational_level/educational_level.routes")
  );
  app.use(
    "/api/v1/time-experiences",
    trafic,
    require("./routes/time_experience/time_experience.routes")
  );
  app.use(
    "/api/v1/storage",
    trafic,
    require("./routes/storage/storage.routes")
  );
  app.use("/api/form", trafic, require("./routes/form/form.routes"));
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
app.use(
  "/api/v1/eventlogs",
  trafic,
  require("./routes/eventlogs/eventlogs.routes")
);
app.use(
  "/api/v1/client-statu-reason",
  trafic,
  require("./routes/clients_statu_reasons/clients_statu_reasons.routes")
);
app.use(
  "/api/v1/concepts-invoices",
  trafic,
  require("./routes/concepts_invoices/concepts_invoices.routes")
);
app.use(
  "/api/v1/client-invoice",
  trafic,
  require("./routes/clients_invoices/clients_invoices.routes")
);
app.use(
  "/api/v1/client-follow-ups",
  trafic,
  require("./routes/clients_follow_ups/clients_follow_ups.routes")
);
app.use(
  "/api/v1/clients-tasks",
  trafic,
  require("./routes/clients_tasks/clients_tasks.routes")
);
app.use(
  "/api/v1/official-qualifications",
  trafic,
  require("./routes/official_qualification/official_qualification")
);
app.use("/api/v1/family", trafic, require("./routes/families/families.routes"));

app.use(
  "/auth",
  cors({
    origin: ["https://app.sussalut.com", "http://localhost:5002"],
    credentials: true,
  }),
  require("./microservices/google/routes/googleRoutes")
);

function trafic(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  next();
}
