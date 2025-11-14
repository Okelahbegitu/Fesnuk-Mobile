import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
// Hashing (bcryptjs) dihapus sesuai permintaan
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// PENTING: Gunakan kunci yang lebih aman di lingkungan produksi
const SECRET = process.env.JWT_SECRET || "kunci-rahasia-default-yang-aman";

console.log('DB_HOST:', process.env.DB_HOST);

// Tambahkan connectTimeout 20 detik untuk membantu diagnosis ETIMEDOUT
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true },
    connectTimeout: 20000 // Timeout koneksi diperpanjang 20 detik
});

db.connect(err => {
    if (err) {
        // Jika ETIMEDOUT terjadi, cek firewall/bind-address di server DB
        console.error("❌ Koneksi gagal:", err.message);
        console.error("DEBUG: Pastikan server DB berjalan, firewall terbuka (port 3306), dan bind-address = 0.0.0.0.");
    } else {
        console.log("✅ Terhubung ke database MySQL");
    }
});

// Middleware untuk verifikasi JWT
function verify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
        req.user = user; // Data user dari token (id, username) disimpan di sini
        next();
    });
}

// =======================================================
// API: Signup (Menggunakan Password Plaintext Sesuai Permintaan)
// =======================================================
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        // Cek apakah username sudah ada
        const [rows] = await db.promise().query("SELECT id_user FROM tb_akun WHERE username = ?", [username]);
        if (rows.length > 0) {
            return res.status(409).json({ message: "Username sudah digunakan" });
        }

        // PERINGATAN: Password disimpan sebagai plaintext!
        const sql = "INSERT INTO tb_akun (username, password) VALUES (?, ?)";
        await db.promise().query(sql, [username, password]);

        res.status(201).json({ message: "Akun berhasil dibuat" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal daftar karena error server" });
    }
});

// =======================================================
// API: Login (Menggunakan Password Plaintext Sesuai Permintaan)
// =======================================================
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query untuk mencocokkan username DAN password plaintext
        const sql = "SELECT id_user, username FROM tb_akun WHERE username = ? AND password = ?";
        const [results] = await db.promise().query(sql, [username, password]); 

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
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error server saat login" });
    }
});

// Endpoint default
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API berjalan dengan baik. Silakan gunakan endpoint /login atau /signup."
    });
});

// =======================================================
// API: Home (Mengambil id_user dari JWT)
// =======================================================
app.get("/home", verify, async (req, res) => {
    const id_user = req.user.id; // AMBIL DARI TOKEN (aman)
    const sql = "SELECT * FROM tb_post WHERE id_user = ?";

    try {
        const [results] = await db.promise().query(sql, [id_user]);

        if (results.length > 0) {
            res.json({
                message: `Meload content untuk user ${id_user} berhasil`,
                content: results
            });
        } else {
            res.status(404).json({ message: "Tidak ada post ditemukan" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error server" });
    }
});

// =======================================================
// API: Get Post to Edit (Mengambil id_user dari JWT)
// =======================================================
app.get("/edit/:id_post", verify, async (req, res) => {
    const id_user = req.user.id; // AMBIL DARI TOKEN
    const { id_post } = req.params;
    const sql = "SELECT * FROM tb_post WHERE id_post = ? AND id_user = ?";

    try {
        const [results] = await db.promise().query(sql, [id_post, id_user]);

        if (results.length > 0) {
            res.json({
                message: "Meload edit berhasil",
                content: results[0]
            });
        } else {
            res.status(404).json({ message: "Post tidak ditemukan" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error server" });
    }
});

// =======================================================
// API: Add Post (Mengambil id_user dari JWT)
// =======================================================
app.post("/add", verify, async (req, res) => {
    const id_user = req.user.id; // AMBIL DARI TOKEN
    const { Head, Body } = req.body;
    
    if (!Head || !Body) {
        return res.status(400).json({ message: "Judul dan Isi post harus diisi." });
    }

    const query = "INSERT INTO tb_post (id_user, Head, Body) VALUES (?, ?, ?)";

    try {
        await db.promise().query(query, [id_user, Head, Body]);
        res.status(201).json({ message: "Berhasil dibuat" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Gagal membuat content" });
    }
});

// =======================================================
// API: Edit Post (Mengambil id_user dari JWT)
// =======================================================
app.put("/edit/:id_post", verify, async (req, res) => {
    const id_user = req.user.id; // AMBIL DARI TOKEN
    const { id_post } = req.params;
    const { Head, Body } = req.body;
    
    if (!Head || !Body) {
        return res.status(400).json({ message: "Judul dan Isi post harus diisi." });
    }

    try {
        // Cek kepemilikan dan update
        const updateQuery = "UPDATE tb_post SET Head = ?, Body = ? WHERE id_post = ? AND id_user = ?";
        const [resultu] = await db.promise().query(updateQuery, [Head, Body, id_post, id_user]);
        
        if (resultu.affectedRows > 0) {
            return res.status(200).json({ message: "Berhasil update post" });
        } else {
            return res.status(404).json({ message: "Post tidak ditemukan atau Anda tidak memiliki izin" });
        }
    } catch (err) {
        console.log("UPDATE Query Error:", err);
        return res.status(500).json({ message: "Server error saat update" });
    }
});

// =======================================================
// API: Delete Post (Mengambil id_user dari JWT)
// =======================================================
app.delete("/delete/:id_post", verify, async (req, res) => {
    const id_user = req.user.id; // AMBIL DARI TOKEN
    const { id_post } = req.params;

    try {
        const Delquery = "DELETE FROM tb_post WHERE id_user = ? AND id_post = ?";
        const [result] = await db.promise().query(Delquery, [id_user, id_post]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Berhasil hapus post" });
        } else {
            return res.status(404).json({ message: "Post tidak ditemukan atau Anda tidak memiliki izin" });
        }
    } catch (err) {
        console.log("DELETE Query Error:", err);
        return res.status(500).json({ message: "Server error saat delete" });
    }
});

export default app;