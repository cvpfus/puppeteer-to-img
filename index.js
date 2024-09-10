import express from "express";
import cors from "cors";
import "dotenv/config";
import puppeteer from "puppeteer";
import * as htmlToImage from "html-to-image";

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/image", async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      ignoreDefaultArgs: ["--disable-extensions"],
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