import express from "express";
import cors from "cors";
import "dotenv/config";
import chromium from "chrome-aws-lambda";
import * as htmlToImage from "html-to-image";
import { nanoid } from "nanoid";

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/image", async (req, res) => {
  let browser;
  console.log(chromium.args)
  console.log(await chromium.executablePath)
  console.log("test", nanoid())
  try {
    browser = await chromium.puppeteer.launch({
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      ignoreDefaultArgs: ["--disable-extensions"],
      headless: true,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
    });
    const page = await browser.newPage();
    await page.setContent(`
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"></script>
        <title>Hello world</title>
      </head>
      <body>
        <div>Hello world</div>
      </body>
    </html>
    `);

    let dataUrl = await page.evaluate(async () => {
      const node = document.querySelector("div");
      return await htmlToImage.toJpeg(node);
    })

    await browser.close();
    return res.json({message: dataUrl})
  } catch (error) {
    if (browser)
      await browser.close();
    return res
      .status(500)
      .json({error: error.message || "An unknown error occurred"});
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});