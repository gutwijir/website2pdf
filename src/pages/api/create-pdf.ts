// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  try {
    const browser = await puppeteer.launch({ headless: "shell" });
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 1080 }); 

    await page.goto(url, { waitUntil: "networkidle0" }); 

    
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle!.boundingBox()!;
    await bodyHandle!.dispose();

    
    const pdfBuffer = await page.pdf({
      width: '1280px', 
      height: `${Math.ceil(height)}px`, 
      printBackground: true, 
      scale: 1, 
      margin: { 
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    await browser.close();

    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${new URL(url).hostname}.pdf"`);
    
    
    res.status(200).end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    let errorMessage = "Failed to generate PDF.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    if (errorMessage.includes('net::ERR_NAME_NOT_RESOLVED') || errorMessage.includes('Protocol error (Page.navigate): Cannot navigate to invalid URL')) {
        res.status(400).json({ error: "Invalid URL or website not found." });
    } else {
        res.status(500).json({ error: "Failed to generate PDF. " + errorMessage });
    }
  }
}
