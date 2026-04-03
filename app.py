from flask import Flask, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import mysql.connector
import bcrypt
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change_this_in_production")
CORS(app, supports_credentials=True)

# ─── Configuration base de données ────────────────────────────────────────────
DB_CONFIG = {
    "host":     os.environ.get("DB_HOST", "127.0.0.1"),
    "user":     os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "ctfeur"),
    "charset":  "utf8mb4",
}

def get_db():
    """Retourne une connexion à la base de données."""
    return mysql.connector.connect(**DB_CONFIG)


# ─── Décorateur : utilisateur connecté ────────────────────────────────────────
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"success": False, "message": "Non authentifié"}), 401
        return f(*args, **kwargs)
    return decorated


# ─── Route : Inscription ───────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    """
    Attendu (form POST ou JSON) :
        identifiant  – nom d'utilisateur
        mdp          – mot de passe en clair
        mail         – adresse e-mail
    """
    data = request.get_json(silent=True) or request.form

    identifiant = (data.get("identifiant") or "").strip()
    mdp         = (data.get("mdp")         or "").strip()
    mail        = (data.get("mail")        or "").strip()

    # ── Validation basique ──────────────────────────────────────────────────
    if not identifiant or not mdp or not mail:
        return jsonify({"success": False, "message": "Tous les champs sont requis"}), 400

    if len(identifiant) > 20:
        return jsonify({"success": False, "message": "Identifiant trop long (20 caractères max)"}), 400

    # ── Hachage du mot de passe ─────────────────────────────────────────────
    hashed = bcrypt.hashpw(mdp.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

<<<<<<< HEAD
    # ── Insertion en base (prepared statement) ─────────────────────────────
    try:
        conn   = get_db()
        # prepared=True → MariaDB compile la requête côté serveur avant
        # d'injecter les paramètres : aucune donnée utilisateur ne peut
        # modifier la structure SQL (protection SQLi).
        cursor = conn.cursor(prepared=True)
        cursor.execute(
            "INSERT INTO users (identifiant, mdp, mail) VALUES (?, ?, ?)",
            (identifiant, hashed, mail)
        )
        conn.commit()
    except mysql.connector.IntegrityError:
=======
    # ── Insertion en base ───────────────────────────────────────────────────
    try:
        conn   = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (identifiant, mdp, mail) VALUES (%s, %s, %s)",
            (identifiant, hashed, mail)
        )
        conn.commit()
    except mysql.connector.IntegrityError as e:
>>>>>>> ee4208b3210f27f0abb7ae14e452f7809c1ecdc6
        return jsonify({"success": False, "message": "Identifiant ou email déjà utilisé"}), 409
    except mysql.connector.Error as e:
        return jsonify({"success": False, "message": f"Erreur base de données : {e}"}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify({"success": True, "message": "Compte créé avec succès"}), 201


# ─── Route : Connexion ─────────────────────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    """
    Attendu (form POST ou JSON) :
        identifiant  – nom d'utilisateur
        mdp          – mot de passe en clair
    """
    data = request.get_json(silent=True) or request.form

    identifiant = (data.get("identifiant") or "").strip()
    mdp         = (data.get("mdp")         or "").strip()

    if not identifiant or not mdp:
        return jsonify({"success": False, "message": "Identifiant et mot de passe requis"}), 400

    try:
        conn   = get_db()
<<<<<<< HEAD
        # prepared=True → requête compilée côté serveur, paramètres transmis
        # séparément : l'identifiant saisi ne peut pas altérer le SQL.
        cursor = conn.cursor(prepared=True)
        cursor.execute(
            "SELECT id_user, mdp FROM users WHERE identifiant = ?",
            (identifiant,)
        )
        row = cursor.fetchone()
        # cursor(prepared=True) renvoie des tuples ; on reconstruit un dict.
        user = {"id_user": row[0], "mdp": row[1]} if row else None
=======
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT id_user, mdp FROM users WHERE identifiant = %s",
            (identifiant,)
        )
        user = cursor.fetchone()
>>>>>>> ee4208b3210f27f0abb7ae14e452f7809c1ecdc6
    except mysql.connector.Error as e:
        return jsonify({"success": False, "message": f"Erreur base de données : {e}"}), 500
    finally:
        cursor.close()
        conn.close()

    if user is None or not bcrypt.checkpw(mdp.encode("utf-8"), user["mdp"].encode("utf-8")):
        return jsonify({"success": False, "message": "Identifiant ou mot de passe incorrect"}), 401

    # ── Création de la session ──────────────────────────────────────────────
    session["user_id"]      = user["id_user"]
    session["identifiant"]  = identifiant

    return jsonify({
        "success":     True,
        "message":     "Connexion réussie",
        "identifiant": identifiant
    }), 200


# ─── Route : Déconnexion ───────────────────────────────────────────────────────
@app.route("/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Déconnecté"}), 200


# ─── Route : Vérifier la session courante ─────────────────────────────────────
@app.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "success":     True,
        "user_id":     session["user_id"],
        "identifiant": session["identifiant"]
    }), 200


# ─── Lancement ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
