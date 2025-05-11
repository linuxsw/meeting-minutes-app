import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // Create a temporary file path
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "audio-"));
    const tempFilePath = path.join(tempDir, file.name);

    // Convert ArrayBuffer to Buffer and write to temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);

    // Ensure the python script is executable
    const pythonScriptPath = path.resolve("./src/python_services/audio_processor.py");
    try {
        fs.accessSync(pythonScriptPath, fs.constants.X_OK);
    } catch (err) {
        // If not executable, try to make it executable
        try {
            fs.chmodSync(pythonScriptPath, "755");
        } catch (chmodError) {
            console.error(`Failed to chmod ${pythonScriptPath}:`, chmodError);
            // If chmod fails, we might still try to run it with python3 directly
        }
    }

    // Execute the Python script
    const pythonProcess = spawn("python3", [pythonScriptPath, tempFilePath]);

    let scriptOutput = "";
    let scriptError = "";

    pythonProcess.stdout.on("data", (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      scriptError += data.toString();
    });

    const processingPromise = new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        // Clean up the temporary file and directory
        fs.unlinkSync(tempFilePath);
        fs.rmdirSync(tempDir);

        if (code === 0) {
          try {
            const result = JSON.parse(scriptOutput);
            resolve(result);
          } catch (e) {
            console.error("Error parsing Python script output:", e);
            console.error("Python script output (stdout):", scriptOutput);
            console.error("Python script error (stderr):", scriptError);
            reject({ error: "Failed to parse Python script output.", details: scriptOutput, stderr: scriptError });
          }
        } else {
          console.error(`Python script exited with code ${code}`);
          console.error("Python script error (stderr):", scriptError);
          console.error("Python script output (stdout):", scriptOutput);
          reject({ error: `Python script failed with code ${code}.`, details: scriptError, stdout: scriptOutput });
        }
      });

      pythonProcess.on("error", (err) => {
        // Clean up the temporary file and directory in case of spawn error
        try {
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        } catch (cleanupError) {
            console.error("Error during cleanup after spawn error:", cleanupError);
        }
        console.error("Failed to start Python script:", err);
        reject({ error: "Failed to start Python script.", details: err.message });
      });
    });

    const result = await processingPromise;
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Internal server error.", details: error.message }, { status: 500 });
  }
}

