//Dependencias Necessarias
const express = require("express");
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const ejs = require("ejs");
const path = require("path");
const app = express();

require("dotenv").config();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(__dirname + "/public"));

//ruta para mostrar el index
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;
    const user = await User.findOne({ usuario });
    if (!user) {
      return res.status(400).send("Usuario no encontrado");
    }
    //validar contraseña
    const validPassword = await bcryptjs.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(400).send("Contraseña no valida");
    }

    //Generar Token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al iniciar sesion");
  }
});
app.post("/register", async (req, res) => {
  try {
    const { nombre, usuario, contraseña } = req.body;

    // Validar si los datos necesarios están presentes
    if (!nombre || !usuario || !contraseña) {
      return res.status(400).send("Faltan datos para registrar el usuario");
    }

    // Validar si el usuario ya existe
    const usuarioExistente = await User.findOne({ usuario });
    if (usuarioExistente) {
      return res.status(400).send("Usuario ya registrado");
    }

    // Crear Usuario
    const user = new User({ nombre, usuario });

    // Encriptar Contraseña
    const salt = await bcryptjs.genSalt(10);
    user.contraseña = await bcryptjs.hash(contraseña, salt);

    await user.save();
    res.status(201).send("Usuario registrado con éxito");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error al registrar usuario");
  }
});

//Configutacion de Puerto y Base de Datos
const port = 10000;
const db = process.env.URI;
mongoose
  .connect(db)
  .then(() => {
    console.log("MongoDB conectado");
  })
  .catch((err) => {
    console.log("Error a conectar ao MongoDB: ", err);
  });

app.listen(port, () => {
  console.log("Servidor Funionando...");
});
