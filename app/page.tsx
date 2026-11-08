import QRCodeGenerator from "./components/QRCodeGenerator"

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans">
      <main className="flex flex-col items-center m-10">
        <h1 className="text-4xl font-bold">QR Code Generator</h1>
        <p className="text-black/50 text-sm pt-4">Create, customize, and download QR codes instantly</p>
        <QRCodeGenerator />
      </main>
    </div>
  );
}
