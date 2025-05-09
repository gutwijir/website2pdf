// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer, { BoundingBox } from "puppeteer";

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

    await page.setViewport({ width: 1280, height: 1080 }); // Initial height, will be overridden by content

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle0" }); // Wait until the network is idle

    // Get the full height of the page
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle!.boundingBox()! as BoundingBox;
    await bodyHandle!.dispose();

    // Generate PDF with dynamic height
    const pdfBuffer = await page.pdf({
      width: '1280px', // Use the viewport width
      height: `${Math.ceil(height)}px`, // Use the calculated full page height
      printBackground: true, // Crucial for capturing website appearance
      scale: 1, // Ensure no scaling is applied
      margin: { // Optional: set margins to 0 if you want to maximize content area
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    });

    await browser.close();

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    // Remove quotes around the filename to prevent issues with browser parsing
    res.setHeader("Content-Disposition", `attachment; filename=${new URL(url).hostname}.pdf`);
    
    // Send the PDF buffer
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
