import Navbar from "@/components/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        {children}
      </main>
    </>
  );
}
