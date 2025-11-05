const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const mime = require("mime-types");
const { v4: uuidv4 } = require("uuid");

const app = express();
const upload = multer({ dest: "/tmp/uploads" });

// Ensure directories exist
const TMP = "/tmp/goconv";
const UP = path.join(TMP, "uploads");
const OUT = path.join(TMP, "out");
[ TMP, UP, OUT ].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

app.post("/convert", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const targetFormat = (req.body.targetFormat || "").toLowerCase();
    const keep = req.body.keep === "true";
    const jobId = uuidv4();
    const origPath = req.file.path;
    const originalName = req.file.originalname || ("file_" + Date.now());
    const ext = (path.extname(originalName) || "").replace(".", "");
    const outFilenameBase = `converted_${jobId}`;
    const outPath = path.join(OUT, outFilenameBase + "." + (targetFormat || ext));

    const mimeType = mime.lookup(originalName) || req.file.mimetype || "application/octet-stream";
    console.log("[convert] job:", jobId, "mime:", mimeType, "target:", targetFormat);

    const streamAndCleanup = (filePath, nameHint) => {
      res.setHeader("Content-Disposition", `attachment; filename="${nameHint || path.basename(filePath)}"`);
      const stat = fs.statSync(filePath);
      res.setHeader("Content-Length", stat.size);
      const read = fs.createReadStream(filePath);
      read.pipe(res);
      read.on("close", () => {
        if (!keep) {
          try { fs.unlinkSync(filePath); } catch (e) {}
          try { fs.unlinkSync(origPath); } catch (e) {}
        }
      });
    };

    const imageExts = ["jpg","jpeg","png","webp","gif","bmp","tiff"];
    if (imageExts.includes(ext) && imageExts.includes(targetFormat)) {
      const cmd = `convert "${origPath}" "${outPath}"`;
      exec(cmd, (err) => {
        if (!err && fs.existsSync(outPath)) {
          streamAndCleanup(outPath, outFilenameBase + "." + targetFormat);
        } else {
          const fallback = path.join(OUT, outFilenameBase + "_fallback." + targetFormat);
          fs.copyFileSync(origPath, fallback);
          streamAndCleanup(fallback, outFilenameBase + "." + targetFormat);
        }
      });
      return;
    }

    const audioVideoExts = ["mp3","wav","aac","m4a","ogg","flac","mp4","mkv","mov","webm","avi"];
    if (audioVideoExts.includes(ext) || audioVideoExts.includes(targetFormat)) {
      const isVideoOut = ["mp4","mkv","mov","webm","avi"].includes(targetFormat);
      let cmd;
      if (isVideoOut) {
        cmd = `ffmpeg -y -i "${origPath}" -c:v libx264 -preset veryfast -c:a aac -strict -2 "${outPath}"`;
      } else {
        cmd = `ffmpeg -y -i "${origPath}" -vn -acodec libmp3lame -ar 44100 -ac 2 "${outPath}"`;
      }
      exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
        if (err || !fs.existsSync(outPath)) {
          console.error("ffmpeg err:", err, stderr);
          const fallback = path.join(OUT, outFilenameBase + "_fallback." + (targetFormat || ext));
          fs.copyFileSync(origPath, fallback);
          streamAndCleanup(fallback, outFilenameBase + "." + (targetFormat || ext));
        } else {
          streamAndCleanup(outPath, outFilenameBase + "." + (targetFormat || ext));
        }
      });
      return;
    }

    if (["doc","docx","odt","ppt","pptx","xls","xlsx","rtf","txt","pdf"].includes(ext) || ["pdf","docx","odt","pptx","xlsx"].includes(targetFormat)) {
      const outDir = OUT;
      const convertTo = targetFormat || "pdf";
      const cmd = `libreoffice --headless --convert-to ${convertTo} --outdir "${outDir}" "${origPath}"`;
      exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
        const base = path.basename(originalName, path.extname(originalName));
        const candidate = path.join(outDir, base + "." + convertTo);
        if (fs.existsSync(candidate)) {
          streamAndCleanup(candidate, base + "." + convertTo);
        } else {
          const files = fs.readdirSync(outDir);
          const matched = files.find(f => f.startsWith(base) && f.endsWith("." + convertTo));
          if (matched) {
            streamAndCleanup(path.join(outDir, matched), matched);
          } else {
            console.error("libreoffice failed:", err, stdout, stderr);
            const fallback = path.join(OUT, outFilenameBase + "_fallback." + ext);
            fs.copyFileSync(origPath, fallback);
            streamAndCleanup(fallback, originalName);
          }
        }
      });
      return;
    }

    const fallback = path.join(OUT, outFilenameBase + "_fallback." + ext);
    fs.copyFileSync(origPath, fallback);
    streamAndCleanup(fallback, originalName);

  } catch (e) {
    console.error("server err", e);
    res.status(500).send("Conversion server error: " + String(e));
  }
});

const PORT = process.env.PORT || 8080;
app.get("/", (req, res) => res.send("GoConverter server alive"));
app.listen(PORT, () => console.log("GoConverter server running on port", PORT));
