import Navbar from "@/components/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar></Navbar>
      <main className="flex flex-col gap-y-2 min-h-screen mx-auto px-4 py-6 sm:w-xl md:w-3xl lg:w-4xl xl:w-5xl">
        {children}
      </main>
    </>
  );
}
