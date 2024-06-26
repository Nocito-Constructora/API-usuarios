const CRUD = require("./CRUD");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitar CORS con la biblioteca cors
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./db/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const server = app.listen(process.env.PORT || PORT, () =>
  console.log(`Server listening on PORT ${PORT}`)
);

server.on("error", (err) => console.log(`Error: ${err}`));

const usuariosArchivo = new CRUD("./usuarios.txt");

app.get("/usuarios", async (req, res) => {
  const mostrarUsuarios = await usuariosArchivo.getAll();
  res.json(mostrarUsuarios);
});

app.post("/usuarios/signup", async (req, res) => {
  const usuario = req.body;
  console.log(req.body);
  if (
    usuario.nombre &&
    usuario.apellido &&
    usuario.email &&
    usuario.telefono &&
    usuario.contrasenia &&
    typeof usuario.nombre === "string" &&
    typeof usuario.apellido === "string" &&
    typeof usuario.email === "string" &&
    typeof usuario.telefono === "number" &&
    typeof usuario.contrasenia === "string"
  ) {
    const usuarioCreado = await usuariosArchivo.create(usuario);
    res.json({ usuarioCreado });
  } else {
    res.status(400).json({
      message: "Faltan datos para crear el usuario o los datos son inválidos",
    });
  }
});

app.post("/usuarios/signin", async (req, res) => {
  const usuario = req.body;
  console.log(req.body);
  if (
    usuario.email &&
    usuario.contrasenia &&
    typeof usuario.email === "string" &&
    typeof usuario.contrasenia === "string"
  ) {
    const listaUsuarios = await usuariosArchivo.getAll();
    let usuarioEncontrado = listaUsuarios.find(
      (user) => user.email === usuario.email
    );
    if (usuarioEncontrado) {
      if (usuarioEncontrado.contrasenia === usuario.contrasenia) {
        res.json({ usuarioEncontrado });
      } else {
        res.json({ message: "Contraseña Incorrecta" });
      }
    } else {
      res.json({ message: "Usuario no encontrado" });
    }
  } else {
    res.status(400).json({
      message:
        "Faltan datos para encontrar el usuario o los datos son inválidos",
    });
  }
});

let modificando = false;

app.put("/usuarios/:id", async (req, res) => {
  if (modificando == true) return "NO TERMINO EL GURDADO ANTERIOR";
  modificando = true;
  const id = req.params.id;
  console.log(req.body);
  const usuario = req.body;
  const usuariosActualizado = await usuariosArchivo.modify(id, usuario);
  modificando = false;
  res.json({ usuariosActualizado });
});

app.delete("/usuarios/:id", async (req, res) => {
  const id = req.params.id;
  const usuario = await usuariosArchivo.delete(id);
  if (usuario) {
    res.send({ usuario: usuario, message: "usuario eliminado" });
  } else {
    res.send({ message: "usuario no encontrado" });
  }
});

app.get("/usuarios/:id", async (req, res) => {
  const id = req.params.id;
  const usuario = await usuariosArchivo.getById(id);
  if (usuario) {
    res.send(usuario);
  } else {
    res.send({ message: "usuario no encontrado" });
  }
});

app.post("/usuarios/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No se ha subido ninguna imagen" });
  }

  // Aquí puedes realizar cualquier lógica adicional, como guardar la ruta del archivo en la base de datos

  res.status(200).send({ message: "Imagen subida correctamente" });
});

app.get("/imagenes", (req, res) => {
  const directoryPath = path.join(__dirname, "db/images");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Error al leer el directorio de imágenes" });
    }

    const imagenes = files.map((file) => {
      return { url: `/usuarios/imagenes/${file}` };
    });
    res.json({ imagenes });
  });
});

app.get("/usuarios/imagenes/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "db/images", fileName);
  res.sendFile(filePath);
});
