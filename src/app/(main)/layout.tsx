import Navbar from "@/components/navbar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar></Navbar>
      {children}
    </>
  );
}
