const express = require("express"); // Importation du module Express pour créer une application web.
const path = require("path"); // Importation du module Path pour travailler avec les chemins de fichiers.
const fs = require("fs"); // Importation du module File System pour manipuler les fichiers.
const bodyParser = require("body-parser"); // Importation du module Body-Parser pour parser les corps des requêtes HTTP.
const mongoose = require("mongoose"); // Importation du module Mongoose pour interagir avec MongoDB.

const app = express(); // Création d'une instance de l'application Express.
const PORT = 3000; // Définition du port sur lequel le serveur va écouter.
const dataFile = "data.json"; // Définition du nom du fichier de données.

// Middleware pour le parsing du corps des requêtes
app.use(bodyParser.json()); // Utilisation de Body-Parser pour parser les requêtes JSON.
app.use(bodyParser.urlencoded({ extended: true })); // Utilisation de Body-Parser pour parser les requêtes URL-encodées.

// Servir les fichiers statiques depuis le répertoire courant
app.use(express.static(__dirname)); // Utilisation d'Express pour servir les fichiers statiques depuis le répertoire courant.

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/votre_base_de_donnees", {
    useNewUrlParser: true, // Utilisation du nouvel analyseur d'URL.
    useUnifiedTopology: true, // Utilisation de la nouvelle topologie unifiée.
  })
  .then(() => {
    console.log("Connecté à MongoDB"); // Message de confirmation de connexion réussie à MongoDB.
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB", err); // Message d'erreur en cas de problème de connexion à MongoDB.
  });

// Définir les schémas et modèles Mongoose
const userSchema = new mongoose.Schema({
  username: String, // Définition du champ username de type String.
  password: String, // Définition du champ password de type String.
});

const articleSchema = new mongoose.Schema({
  name: String, // Définition du champ name de type String.
  code: String, // Définition du champ code de type String.
  description: String, // Définition du champ description de type String.
  image: String, // Définition du champ image de type String.
  price: {
    type: Number, // Définition du champ price de type Number.
    required: true, // Le champ price est obligatoire.
    min: [0, "Le prix doit être supérieur à 0"], // Le prix doit être supérieur à 0.
  },
  quantity: Number, // Définition du champ quantity de type Number.
});

const User = mongoose.model("User", userSchema); // Création du modèle User basé sur le schéma userSchema.
const Article = mongoose.model("Article", articleSchema); // Création du modèle Article basé sur le schéma articleSchema.

// Route pour servir le fichier HTML à la racine
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Envoi du fichier index.html en réponse à la requête GET à la racine.
});

// Route pour se connecter
app.post("/login", async (req, res) => {
  const { username, password } = req.body; // Extraction des champs username et password du corps de la requête.
  const user = await User.findOne({ username, password }); // Recherche d'un utilisateur correspondant dans la base de données.

  if (user) {
    res.send({ success: true }); // Si l'utilisateur est trouvé, envoi d'une réponse de succès.
  } else {
    res.send({ success: false }); // Si l'utilisateur n'est pas trouvé, envoi d'une réponse d'échec.
  }
});

// Route pour créer un compte utilisateur
app.post("/register", async (req, res) => {
  const { username, password } = req.body; // Extraction des champs username et password du corps de la requête.

  const userExists = await User.findOne({ username }); // Vérification si un utilisateur avec le même username existe déjà.

  if (userExists) {
    res.send({ success: false, message: "Utilisateur déjà existant" }); // Si l'utilisateur existe déjà, envoi d'une réponse d'échec avec un message.
  } else {
    const newUser = new User({ username, password }); // Création d'un nouvel utilisateur avec les données fournies.
    await newUser.save(); // Sauvegarde du nouvel utilisateur dans la base de données.
    res.send({ success: true }); // Envoi d'une réponse de succès.
  }
});

// Route pour créer un article
app.post("/createArticle", async (req, res) => {
  const { name, code, description, image, price, quantity } = req.body; // Extraction des champs de l'article du corps de la requête.
  const newArticle = new Article({
    name,
    code,
    description,
    image,
    price,
    quantity,
  }); // Création d'un nouvel article avec les données fournies.
  await newArticle.save(); // Sauvegarde du nouvel article dans la base de données.
  res.send({ success: true }); // Envoi d'une réponse de succès.
});

// Route pour visualiser les articles
app.get("/articles", async (req, res) => {
  const articles = await Article.find(); // Récupération de tous les articles de la base de données.
  res.send(articles); // Envoi des articles en réponse à la requête GET.
});

// Route pour visualiser un article
app.get("/article/:code", async (req, res) => {
  const article = await Article.findOne({ code: req.params.code }); // Recherche d'un article par son code dans la base de données.
  if (article) {
    res.send(article); // Si l'article est trouvé, envoi de l'article en réponse.
  } else {
    res.send({ error: "Article non trouvé" }); // Si l'article n'est pas trouvé, envoi d'une réponse d'erreur.
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}/`); // Démarrage du serveur et affichage d'un message indiquant l'URL du serveur.
});
