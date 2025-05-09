import Head from "next/head";
import { useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--font-geist-sans), sans-serif;
    background-color: #ffffff;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
`;

const Heading = styled.h1`
  font-size: 3rem;
  color: #222;
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-family: var(--font-geist-mono), monospace;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  background: white;
  color: black;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #0070f3;
    box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
  background-color: #0070f3;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    background-color: #005bb5;
  }

  &:active {
    transform: translateY(1px);
    background-color: #004c9a;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePdf = async () => {
    if (!url) {
      setError("Please enter a website URL.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/create-pdf?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition");
        let filename = "download.pdf";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1];
          }
        }
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        setUrl(""); // Clear input after successful download
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate PDF. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Website to PDF | Convert any webpage to PDF instantly</title>
        <meta
          name="description"
          content="Easily convert any website into a high-quality PDF document. Just paste the URL and get your PDF in seconds!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <GlobalStyle />
        <PageContainer>
          <Heading>website2pdf</Heading>
          <Input
            type="url"
            placeholder="Paste a link, get a PDF. Simple as that!"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleCreatePdf} disabled={isLoading}>
            {isLoading ? "Brewing your PDF..." : "Make PDF"}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </PageContainer>
      </div>
    </>
  );
}
