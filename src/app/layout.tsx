import type { Metadata } from "next";
import { lufga } from "@/lib/font";
import Header from "@/components/layout/HeaderPublic"
import Footer from "@/components/layout/FooterPublic";
import "./globals.css";
import { Session } from "puppeteer";

export const metadata: Metadata = {
  title: "SagaHub",
  description: "Organizando sua contabilidade com eficiência e clareza.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession();

  return (
    <html lang="pt-BR">
      <body>
        <NextAuthSessionProvider>
          {session ? (
            <HeaderAuthenticated/>
          ): <HeaderPublic/>
          )}
          <main>{children}</main>
          {session ? (
            <FooterAuthenticated/>
          ): <FooterPublic/>    
          )}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
