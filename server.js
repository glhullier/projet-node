const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;
const dataFile = "data.json";

// Middleware pour le parsing du corps des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le répertoire courant
app.use(express.static(__dirname));

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/votre_base_de_donnees", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connecté à MongoDB");
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB", err);
  });

// Définir les schémas et modèles Mongoose
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const articleSchema = new mongoose.Schema({
  name: String,
  code: String,
  description: String,
  image: String,
  price: {
    type: Number,
    required: true,
    min: [0, "Le prix doit être supérieur à 0"],
  },
  quantity: Number,
});

const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);

// Route pour servir le fichier HTML à la racine
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route pour se connecter
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (user) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// Route pour créer un compte utilisateur
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.send({ success: false, message: "Utilisateur déjà existant" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    res.send({ success: true });
  }
});

// Route pour créer un article
app.post("/createArticle", async (req, res) => {
  const { name, code, description, image, price, quantity } = req.body;
  const newArticle = new Article({
    name,
    code,
    description,
    image,
    price,
    quantity,
  });
  await newArticle.save();
  res.send({ success: true });
});

// Route pour visualiser les articles
app.get("/articles", async (req, res) => {
  const articles = await Article.find();
  res.send(articles);
});

// Route pour visualiser un article
app.get("/article/:code", async (req, res) => {
  const article = await Article.findOne({ code: req.params.code });
  if (article) {
    res.send(article);
  } else {
    res.send({ error: "Article non trouvé" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
});

/*const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const dataFile = "data.json";

// Middleware pour le parsing du corps des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le répertoire courant
app.use(express.static(__dirname));

// Charger les données existantes
let data = { users: [], articles: [] };
if (fs.existsSync(dataFile)) {
  data = JSON.parse(fs.readFileSync(dataFile));
}

// Route pour servir le fichier HTML à la racine
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route pour se connecter
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const userExists = data.users.some(
    (user) => user.username === username && user.password === password
  );

  if (userExists) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

// Route pour créer un compte utilisateur
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Vérifier si l'utilisateur existe déjà avant d'ajouter un nouvel utilisateur
  const userExists = data.users.some((user) => user.username === username);

  if (userExists) {
    res.send({ success: false, message: "Utilisateur déjà existant" });
  } else {
    data.users.push({ username, password });
    fs.writeFileSync(dataFile, JSON.stringify(data));
    res.send({ success: true });
  }
});

// Route pour créer un article
app.post("/createArticle", (req, res) => {
  const { name, code, description, image, price, quantity } = req.body;
  data.articles.push({ name, code, description, image, price, quantity });
  fs.writeFileSync(dataFile, JSON.stringify(data));
  res.send({ success: true });
});

// Route pour visualiser les articles
app.get("/articles", (req, res) => {
  res.send(data.articles);
});

// Route pour visualiser un article
app.get("/article/:code", (req, res) => {
  const article = data.articles.find(
    (article) => article.code === req.params.code
  );
  if (article) {
    res.send(article);
  } else {
    res.send({ error: "Article non trouvé" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
// });*/

/*const express = require("express"); // Importer le module Express
const path = require("path"); // Importer le module path pour gérer les chemins de fichiers
const app = express(); // Créer une application Express

// Définir une route pour la racine ('/')
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Envoyer le fichier HTML en réponse
});

const PORT = 3000; // Définir le port sur lequel le serveur écoutera
app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`); // Afficher un message lorsque le serveur démarre
});*/

/*const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`);
// });*

/*const http = require("http");
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello, World!\n"); // Corrected line
});
server.listen(3000, "127.0.0.1", () => {
  console.log("Server is running at http://127.0.0.1:3000/");
});*/
