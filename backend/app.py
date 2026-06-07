from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
from werkzeug.utils import secure_filename
import sqlite3
import os
import uuid

app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB_PATH = os.path.join(os.path.dirname(__file__), "portfolio.db")
BASE_DIR = os.path.dirname(__file__)
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
UPLOAD_DIR = os.path.join(FRONTEND_DIR, "assets", "uploads")
ALLOWED_IMAGE = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
ALLOWED_VIDEO = {"mp4", "webm", "mov", "avi", "mkv"}
ALLOWED_MEDIA = ALLOWED_IMAGE | ALLOWED_VIDEO

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(FRONTEND_DIR, "assets", "images"), exist_ok=True)
os.makedirs(os.path.join(FRONTEND_DIR, "assets", "videos"), exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_MEDIA


def save_upload(file):
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)
    return f"/assets/uploads/{filename}"


def is_deletable_upload(file_path):
    return bool(file_path) and file_path.replace("\\", "/").startswith("/assets/uploads/")


def path_from_url(file_path):
    rel = file_path.lstrip("/").replace("/", os.sep)
    return os.path.join(FRONTEND_DIR, rel)


def safe_delete_file(file_path):
    if not is_deletable_upload(file_path):
        return
    filepath = path_from_url(file_path)
    if os.path.isfile(filepath):
        os.remove(filepath)


def cleanup_saved_paths(saved_paths):
    for path in saved_paths:
        safe_delete_file(path)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            label TEXT NOT NULL,
            value TEXT NOT NULL,
            icon TEXT
        );

        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            year TEXT,
            badge TEXT
        );

        CREATE TABLE IF NOT EXISTS weapons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            damage TEXT,
            image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            file_path TEXT NOT NULL,
            category TEXT DEFAULT 'gameplay',
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            file_path TEXT,
            video_url TEXT,
            thumbnail TEXT,
            category TEXT DEFAULT 'highlight',
            created_at TEXT NOT NULL
        );
    """)

    existing = conn.execute("SELECT COUNT(*) FROM stats").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO stats (label, value, icon) VALUES (?, ?, ?)",
            [
                ("Total Kills", "12,450+", "skull"),
                ("Win Rate", "68%", "trophy"),
                ("Headshots", "4,200+", "crosshair"),
                ("Rank", "Heroic", "star"),
                ("Matches", "3,800+", "gamepad"),
                ("KD Ratio", "4.2", "chart"),
            ],
        )

    existing = conn.execute("SELECT COUNT(*) FROM achievements").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO achievements (title, description, year, badge) VALUES (?, ?, ?, ?)",
            [
                ("Booyah Master", "100+ consecutive Booyah wins in ranked mode", "2025", "gold"),
                ("Sniper Elite", "Top 1% headshot accuracy across all seasons", "2024", "silver"),
                ("Clutch King", "50+ 1v4 clutch victories in Grandmaster", "2025", "gold"),
                ("Tournament Champion", "1st place in regional Free Fire championship", "2024", "gold"),
                ("MVP Season 42", "Most Valuable Player in Season 42 ranked", "2025", "platinum"),
            ],
        )

    existing = conn.execute("SELECT COUNT(*) FROM weapons").fetchone()[0]
    if existing == 0:
        conn.executemany(
            "INSERT INTO weapons (name, type, damage, image_url) VALUES (?, ?, ?, ?)",
            [
                ("AWM", "Sniper", "High", "awm"),
                ("M1014", "Shotgun", "Very High", "m1014"),
                ("Groza", "AR", "High", "groza"),
                ("MP40", "SMG", "Medium", "mp40"),
                ("Desert Eagle", "Pistol", "High", "deagle"),
                ("M249", "LMG", "High", "m249"),
            ],
        )

    existing = conn.execute("SELECT COUNT(*) FROM photos").fetchone()[0]
    if existing == 0:
        now = datetime.utcnow().isoformat()
        conn.executemany(
            "INSERT INTO photos (title, description, file_path, category, created_at) VALUES (?, ?, ?, ?, ?)",
            [
                ("Tournament Victory", "Regional championship finals — Booyah moment", "assets/images/gallery-1.svg", "tournament", now),
                ("Squad Wipe Clutch", "1v4 clutch in Grandmaster ranked", "assets/images/gallery-2.svg", "gameplay", now),
                ("AWM Headshot", "300m sniper headshot highlight", "assets/images/gallery-3.svg", "sniper", now),
                ("Team Phoenix", "Squad photo after tournament win", "assets/images/gallery-4.svg", "team", now),
                ("Ranked Push", "Heroic rank achieved — Season 43", "assets/images/gallery-5.svg", "gameplay", now),
                ("Streaming Setup", "Live stream gaming setup", "assets/images/gallery-6.svg", "content", now),
            ],
        )

    existing = conn.execute("SELECT COUNT(*) FROM videos").fetchone()[0]
    if existing == 0:
        now = datetime.utcnow().isoformat()
        conn.executemany(
            "INSERT INTO videos (title, description, file_path, video_url, thumbnail, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                ("Booyah Highlights", "Best Booyah moments compilation", None, "https://www.youtube.com/embed/dQw4w9WgXcQ", "assets/images/video-thumb-1.svg", "highlight", now),
                ("AWM Montage", "Insane sniper shots montage", None, "https://www.youtube.com/embed/dQw4w9WgXcQ", "assets/images/video-thumb-2.svg", "montage", now),
                ("Tournament Finals", "Full tournament final match replay", None, "https://www.youtube.com/embed/dQw4w9WgXcQ", "assets/images/video-thumb-3.svg", "tournament", now),
                ("Clutch King", "Top 1v4 clutch plays", None, "https://www.youtube.com/embed/dQw4w9WgXcQ", "assets/images/video-thumb-4.svg", "clutch", now),
            ],
        )

    conn.commit()
    conn.close()


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/stats")
def get_stats():
    conn = get_db()
    rows = conn.execute("SELECT * FROM stats ORDER BY id").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/achievements")
def get_achievements():
    conn = get_db()
    rows = conn.execute("SELECT * FROM achievements ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/weapons")
def get_weapons():
    conn = get_db()
    rows = conn.execute("SELECT * FROM weapons ORDER BY id").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/photos")
def get_photos():
    conn = get_db()
    rows = conn.execute("SELECT * FROM photos ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/videos")
def get_videos():
    conn = get_db()
    rows = conn.execute("SELECT * FROM videos ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/upload/photo", methods=["POST"])
def upload_photo():
    title = request.form.get("title", "Untitled Photo")
    description = request.form.get("description", "")
    category = request.form.get("category", "gameplay")
    file = request.files.get("file")

    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Valid image file required (png, jpg, jpeg, gif, webp)"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_IMAGE:
        return jsonify({"error": "Only image files allowed for photo upload"}), 400

    saved_paths = []
    try:
        file_path = save_upload(file)
        saved_paths.append(file_path)
        conn = get_db()
        conn.execute(
            "INSERT INTO photos (title, description, file_path, category, created_at) VALUES (?, ?, ?, ?, ?)",
            (title, description, file_path, category, datetime.utcnow().isoformat()),
        )
        conn.commit()
        photo_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        return jsonify({"success": True, "id": photo_id, "file_path": file_path})
    except Exception:
        cleanup_saved_paths(saved_paths)
        return jsonify({"error": "Failed to save photo. Please try again."}), 500


@app.route("/api/upload/video", methods=["POST"])
def upload_video():
    title = request.form.get("title", "Untitled Video")
    description = request.form.get("description", "")
    category = request.form.get("category", "highlight")
    video_url = request.form.get("video_url", "")
    file = request.files.get("file")
    thumb = request.files.get("thumbnail")

    if not video_url and (not file or not allowed_file(file.filename)):
        return jsonify({"error": "Upload a video file or provide a YouTube/embed URL"}), 400

    saved_paths = []
    file_path = None
    thumbnail = None

    try:
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit(".", 1)[1].lower()
            if ext in ALLOWED_VIDEO:
                file_path = save_upload(file)
                saved_paths.append(file_path)
            elif ext in ALLOWED_IMAGE:
                thumbnail = save_upload(file)
                saved_paths.append(thumbnail)

        if thumb and allowed_file(thumb.filename):
            ext = thumb.filename.rsplit(".", 1)[1].lower()
            if ext in ALLOWED_IMAGE:
                if thumbnail:
                    safe_delete_file(thumbnail)
                    saved_paths = [p for p in saved_paths if p != thumbnail]
                thumbnail = save_upload(thumb)
                saved_paths.append(thumbnail)

        if not file_path and not video_url:
            cleanup_saved_paths(saved_paths)
            return jsonify({"error": "Upload a video file or provide a YouTube/embed URL"}), 400

        conn = get_db()
        conn.execute(
            "INSERT INTO videos (title, description, file_path, video_url, thumbnail, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (title, description, file_path, video_url or None, thumbnail, category, datetime.utcnow().isoformat()),
        )
        conn.commit()
        video_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.close()
        return jsonify({"success": True, "id": video_id})
    except Exception:
        cleanup_saved_paths(saved_paths)
        return jsonify({"error": "Failed to save video. Please try again."}), 500


@app.route("/api/photos/<int:photo_id>", methods=["DELETE"])
def delete_photo(photo_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM photos WHERE id = ?", (photo_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Photo not found"}), 404

    file_path = row["file_path"]
    conn.execute("DELETE FROM photos WHERE id = ?", (photo_id,))
    conn.commit()
    conn.close()

    safe_delete_file(file_path)
    return jsonify({"success": True, "message": "Photo deleted"})


@app.route("/api/videos/<int:video_id>", methods=["DELETE"])
def delete_video(video_id):
    conn = get_db()
    row = conn.execute("SELECT * FROM videos WHERE id = ?", (video_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Video not found"}), 404

    file_path = row["file_path"]
    thumbnail = row["thumbnail"]
    conn.execute("DELETE FROM videos WHERE id = ?", (video_id,))
    conn.commit()
    conn.close()

    safe_delete_file(file_path)
    safe_delete_file(thumbnail)
    return jsonify({"success": True, "message": "Video deleted"})


@app.route("/api/contact", methods=["POST"])
def submit_contact():
    if request.content_type and "multipart/form-data" in request.content_type:
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        subject = request.form.get("subject", "").strip()
        message = request.form.get("message", "").strip()
        attachment_path = None

        file = request.files.get("attachment")
        if file and file.filename and allowed_file(file.filename):
            attachment_path = save_upload(file)
            subject = f"{subject} [Attachment: {file.filename}]".strip()

        if not name or not email or not message:
            return jsonify({"error": "Name, email, and message are required"}), 400

        full_message = message
        if attachment_path:
            full_message += f"\n\n[Attached file: {attachment_path}]"

        conn = get_db()
        conn.execute(
            "INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, subject, full_message, datetime.utcnow().isoformat()),
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Message sent with attachment! We'll get back to you soon."})

    data = request.get_json()
    if not data or not data.get("name") or not data.get("email") or not data.get("message"):
        return jsonify({"error": "Name, email, and message are required"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO contacts (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)",
        (
            data["name"],
            data["email"],
            data.get("subject", ""),
            data["message"],
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Message sent successfully! We'll get back to you soon."})


@app.route("/api/contacts")
def get_contacts():
    conn = get_db()
    rows = conn.execute("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 50").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


init_db()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, host="0.0.0.0", port=port)
