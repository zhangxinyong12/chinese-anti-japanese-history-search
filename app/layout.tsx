import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日奸清算器 - 中国抗日战争历史人物查询",
  description: "查询中国抗日战争时期的汉奸、伪政府官员和抗日英雄的历史档案数据库。缅怀先烈，警惕汉奸，铭记历史。",
  keywords: ["抗日战争", "历史人物", "汉奸查询", "抗日英雄", "历史教育", "汪精卫", "张自忠"],
  authors: [{ name: "项目开发团队" }],
  creator: "日奸清算器项目组",
  publisher: "日奸清算器",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-project.vercel.app'),
  openGraph: {
    title: "日奸清算器 - 中国抗日战争历史人物查询",
    description: "查询1931-1945年抗日战争时期的历史人物，缅怀先烈，警惕汉奸",
    type: "website",
    locale: "zh_CN",
    siteName: "日奸清算器",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "日奸清算器"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "日奸清算器 - 中国抗日战争历史人物查询",
    description: "查询1931-1945年抗日战争时期的历史人物",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="text-3xl">🇨🇳</span>
                  <span>日奸清算器</span>
                </h1>
                <div className="text-sm text-gray-400">
                  缅怀先烈 · 警惕汉奸 · 铭记历史
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
                <p>⚠️ 本项目仅供历史研究和教育参考，基于公开历史资料</p>
                <p className="mt-2">铭记历史，缅怀先烈，珍爱和平，开创未来</p>
                <p className="mt-2">抗日战争时期历史人物查询 | 1931-1945</p>
                <p className="mt-2">当前网站域名：china-war-heroes.vercel.app</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
