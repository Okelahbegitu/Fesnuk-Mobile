import express from "express";
// Ubah import ke mysql2/promise untuk fungsionalitas Promise Pool
import mysql from "mysql2/promise"; 
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kunci rahasia untuk JWT
const SECRET = process.env.JWT_SECRET || "kunci-rahasia-default-yang-aman";

console.log('DB_HOST:', process.env.DB_HOST);

// Menggunakan Connection Pool (db) untuk stabilitas koneksi
// Pool menangani koneksi yang tertutup dan membuat ulang koneksi secara otomatis
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true },
    connectTimeout: 20000, // Timeout koneksi diperpanjang 20 detik
    connectionLimit: 10,   // Jumlah maksimum koneksi
    waitForConnections: true,
    queueLimit: 0
});

// Fungsi untuk mengetes koneksi Pool saat aplikasi dimulai
async function testDbConnection() {
    try {
        // Melakukan query sederhana untuk memverifikasi koneksi
        await db.query('SELECT 1'); 
        console.log("✅ Terhubung ke database MySQL (Pool connection verified)");
    } catch (err) {
        // Jika ETIMEDOUT atau error lain terjadi di sini, itu adalah masalah KONEKSI/FIREWALL
        console.error("❌ Koneksi Gagal Saat Verifikasi Pool:", err.message);
        console.error(">>> ERROR KRITIS: Pastikan server DB berjalan, firewall port 3306 terbuka, dan bind-address = 0.0.0.0.");
    }
}
testDbConnection();

// Middleware untuk verifikasi JWT
function verify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
        req.user = user;
        next();
    });
}

// =======================================================
// API: Signup
// =======================================================
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
        // Query menggunakan Pool
        const [rows] = await db.query("SELECT id_user FROM tb_akun WHERE username = ?", [username]);
        if (rows.length > 0) {
            return res.status(409).json({ message: "Username sudah digunakan" });
        }

        // Simpan user baru
        const sql = "INSERT INTO tb_akun (username, password) VALUES (?, ?)";
        await db.query(sql, [username, password]);

        return res.status(201).json({ message: "Akun berhasil dibuat" });
    } catch (err) {
        console.error("Error saat signup:", err);
        return res.status(500).json({ message: "Gagal daftar karena error server" });
    }
});

// =======================================================
// API: Login
// =======================================================
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Query menggunakan Pool
        const sql = "SELECT id_user, username FROM tb_akun WHERE username = ? AND password = ?";
        const [results] = await db.query(sql, [username, password]); 

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
        console.error("Error saat login:", err);
        return res.status(500).json({ message: "Error server saat login" });
    }
});

// =======================================================
// API: Home
// =======================================================
app.get("/home", verify, async (req, res) => {
    const id_user = req.user.id; 
    const sql = "SELECT * FROM tb_post WHERE id_user = ?";

    try {
        const [results] = await db.query(sql, [id_user]);

        if (results.length > 0) {
            return res.json({
                message: `Meload content untuk user ${id_user} berhasil`,
                content: results
            });
        } else {
            res.status(404).json({ message: "Tidak ada post ditemukan" });
        }
    } catch (err) {
        console.error("Error saat mengambil home content:", err);
        return res.status(500).json({ message: "Error server" });
    }
});

// =======================================================
// API: Get Post to Edit
// =======================================================
app.get("/edit/:id_post", verify, async (req, res) => {
    const id_user = req.user.id;
    const { id_post } = req.params;
    const sql = "SELECT * FROM tb_post WHERE id_post = ? AND id_user = ?";

    try {
        const [results] = await db.query(sql, [id_post, id_user]);

        if (results.length > 0) {
            res.json({
                message: "Meload edit berhasil",
                content: results[0]
            });
        } else {
            res.status(404).json({ message: "Post tidak ditemukan" });
        }
    } catch (err) {
        console.error("Error saat mengambil post untuk edit:", err);
        return res.status(500).json({ message: "Error server" });
    }
});

// =======================================================
// API: Add Post
// =======================================================
app.post("/add", verify, async (req, res) => {
    const id_user = req.user.id;
    const {id_post, Head, Body } = req.body;
    
    if (!Head || !Body) {
        return res.status(400).json({ message: "Judul dan Isi post harus diisi." });
    }

    const query = "INSERT INTO tb_post (id_post ,id_user, Head, Body) VALUES (?, ?, ?, ?)";

    try {
        await db.query(query, [id_post, id_user, Head, Body]);
        return res.status(201).json({ message: "Berhasil dibuat" });
    } catch (err) {
        console.error("Error saat menambah post:", err);
        return res.status(500).json({ message: "Gagal membuat content" });
    }
});

// =======================================================
// API: Edit Post
// =======================================================
app.put("/edit/:id_post", verify, async (req, res) => {
    const id_user = req.user.id;
    const { id_post } = req.params;
    const { Head, Body } = req.body;
    
    if (!Head || !Body) {
        return res.status(400).json({ message: "Judul dan Isi post harus diisi." });
    }

    try {
        const updateQuery = "UPDATE tb_post SET Head = ?, Body = ? WHERE id_post = ? AND id_user = ?";
        const [resultu] = await db.query(updateQuery, [Head, Body, id_post, id_user]);
        
        if (resultu.affectedRows > 0) {
            return res.status(200).json({ message: "Berhasil update post" });
        } else {
            return res.status(404).json({ message: "Post tidak ditemukan atau Anda tidak memiliki izin" });
        }
    } catch (err) {
        console.error("Error saat update post:", err);
        return res.status(500).json({ message: "Server error saat update" });
    }
});

// =======================================================
// API: Delete Post
// =======================================================
app.delete("/delete/:id_post", verify, async (req, res) => {
    const id_user = req.user.id;
    const { id_post } = req.params;

    try {
        const Delquery = "DELETE FROM tb_post WHERE id_user = ? AND id_post = ?";
        const [result] = await db.query(Delquery, [id_user, id_post]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: "Berhasil hapus post" });
        } else {
            return res.status(404).json({ message: "Post tidak ditemukan atau Anda tidak memiliki izin" });
        }
    } catch (err) {
        console.error("Error saat menghapus post:", err);
        return res.status(500).json({ message: "Server error saat delete" });
    }
});

// Endpoint default
app.get("/", (req, res) => {
    res.status(200).json({
        message: "API berjalan dengan baik. Silakan gunakan endpoint /login atau /signup."
    });
});

export default app;