import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv  from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const SECRET = "hehehehha"
console.log('DB_HOST:', process.env.DB_HOST);
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: { rejectUnauthorized: true }
});

db.connect(err => {
    if (err) {
        console.error("❌ Koneksi gagal:", err);
    } else {
        console.log("✅ Terhubung ke database MySQL");
    }
});

// API Signup
app.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const sql = "INSERT INTO tb_akun (username, password) VALUES (?, ?)";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal daftar" });
        }
        res.json({ message: "Akun berhasil dibuat" });
    });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM tb_akun WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error server" });
        }

        if (results.length > 0) {
            const user = results[0];
            const token = jwt.sign({ id: user.id_user, user: user.username }, SECRET, { expiresIn: "1h" });

            return res.status(200).json({
                message: "Login berhasil",
                token: token,
                user: {
                    id: user.id_user,
                    user: user.username
                }
            });
        } else {
            return res.status(401).json({ message: "Username atau password salah" });
        }
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API berjalan dengan baik. Silakan gunakan endpoint /login atau lainnya."
    });
});

app.get("/home/:id_user", verify, (req, res) => {
    const id_user = req.params.id_user;
    const sql = "SELECT * FROM tb_post WHERE id_user = ?";
    db.query(sql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ message: "Error server" });

        if (results.length > 0) {
            res.json({
                message: "Meload content berhasil",
                content: results
            });
        } else {
            res.status(404).json({ message: "Tidak ada post ditemukan" });
        }
    });
});

app.get("/edit/:id_user/:id_post", verify, (req, res) => {
    const { id_user, id_post } = req.params;
    const sql = "SELECT * FROM tb_post WHERE id_post = ? AND id_user = ? ";
    db.query(sql, [id_post, id_user], (err, results) => {
        if (err) return res.status(500).json({ message: "Error server" });

        if (results.length > 0) {
            res.json({
                message: "Meload edit berhasil",
                content: results
            });
        } else {
            res.status(404).json({ message: "Tidak ada post ditemukan" });
        }
    });
});

app.post("/add/:id_user", verify, (req, res) => {
    const { id_user, Head, Body } = req.body;
    const query = "INSERT INTO tb_post (id_user, id_post ,Head, Body) VALUES (?, ?, ?, ?)";

    db.query(query, [id_user, null, Head, Body], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Gagal membuat content" });
        }
        res.json({ message: "Berhasil dibuat" });
    });
})

app.post("/edit/:id_user/:id_post", verify, (req, res) => {
    const { id_user, id_post } = req.params;
    const { head, body } = req.body;
    console.log("Request body:", req.body); // debug
    const checkQuery = "SELECT * FROM tb_post WHERE id_post = ? AND id_user = ?";
    db.query(checkQuery, [id_post, id_user], (err, resultc) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (resultc.length === 0) return res.status(404).json({ message: "Post tidak ditemukan" });

        const updateQuery = "UPDATE tb_post SET Head = ?, Body = ? WHERE id_post = ?";
        db.query(updateQuery, [head, body, id_post], (err, resultu) => {
            if (err) {
                console.log("UPDATE Query Error:", err)
                return res.status(500).json({ message: "Server error" })
            };
            if (resultu.affectedRows > 0) {
                return res.status(200).json({ message: "Berhasil update post" });
            } else {
                return res.status(404).json({ message: "Post tidak ditemukan" });
            }
        });
    });
});
//delete
app.post("/delete/:id_user/:id_post", verify, (req, res) => {
    const { id_user, id_post } = req.body;
    const checkQuery = "SELECT * FROM tb_post WHERE id_post = ? AND id_user = ?";
    db.query(checkQuery, [id_post, id_user], (err, resultc) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (resultc.length === 0) return res.status(404).json({ message: "Post tidak ditemukan" });
        const Delquery = "DELETE FROM tb_post WHERE id_user = ? AND id_post = ?"
        db.query(Delquery, [id_user, id_post], (err, result) => {
            if (err) {
                console.log("UPDATE Query Error:", err)
                return res.status(500).json({ message: "Server error" })
            };
            if (result.affectedRows > 0) {
                return res.status(200).json({ message: "Berhasil hapus post" });
            } else {
                return res.status(404).json({ message: "Post tidak ditemukan" });
            }
        })
    })
})

function verify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(403).json({ message: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token tidak valid" });
        req.user = user;
        next();
    });
}
export default app;
