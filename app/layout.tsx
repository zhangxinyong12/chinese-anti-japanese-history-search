import type { Metadata } from "next";
import "./globals.css";
import { SimpleSessionProvider } from "@/components/SimpleSessionProvider";

export const metadata: Metadata = {
  title: "汉奸清算器 - 中国抗日战争汉奸历史查询",
  description: "专注记录中国抗日战争时期(1931-1945)的汉奸和伪政府官员历史档案。警示后人，铭记历史，防止悲剧重演。",
  keywords: ["抗日战争", "汉奸清算", "历史人物", "汉奸查询", "伪政府", "历史教育", "汪精卫", "历史警示"],
  authors: [{ name: "项目开发团队" }],
  creator: "汉奸清算器项目组",
  publisher: "汉奸清算器",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-project.vercel.app'),
  openGraph: {
    title: "汉奸清算器 - 中国抗日战争汉奸历史查询",
    description: "查询1931-1945年抗日战争时期的汉奸和伪政府官员",
    type: "website",
    locale: "zh_CN",
    siteName: "汉奸清算器",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "汉奸清算器"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "汉奸清算器 - 中国抗日战争汉奸历史查询",
    description: "查询1931-1945年抗日战争时期的汉奸和伪政府官员",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <SimpleSessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="text-3xl">🇨🇳</span>
                    <span>汉奸清算器</span>
                  </h1>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                      警惕汉奸 · 铭记历史 · 防止悲剧重演
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="/auth/register"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        注册
                      </a>
                      <a
                        href="/auth/login"
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        登录
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <main className="container mx-auto px-4 py-8">
              {children}
            </main>

            <footer className="border-t border-gray-800 bg-black/30 backdrop-blur-sm mt-16">
              <div className="container mx-auto px-4 py-6">
                <div className="text-center text-gray-500 text-sm">
                  <p>⚠️ 本项目专注记录抗日战争时期的汉奸历史，仅供历史研究和教育参考</p>
                  <p className="mt-2">铭记历史，警惕汉奸，防止悲剧重演，珍爱和平</p>
                  <p className="mt-2">抗日战争汉奸历史查询 | 1931-1945</p>
                  <p className="mt-2">当前网站域名：china-war-heroes.vercel.app</p>
                </div>
              </div>
            </footer>
          </div>
        </SimpleSessionProvider>
      </body>
    </html>
  );
}
