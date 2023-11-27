const CRUD = require("./CRUD");
const express = require("express");

const PORT = 8080;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
