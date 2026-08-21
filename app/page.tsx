"use client";

import { useEffect, useState } from "react";

interface HistoricalFigure {
  id: number;
  name: string;
  period: string;
  identity: string;
  activities: string;
  note: string | null;
  year: number | null;
  punishment: string | null;
  deathPlace: string | null;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<HistoricalFigure[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [featuredFigures, setFeaturedFigures] = useState<HistoricalFigure[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/featured", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("获取默认人物失败")
        return response.json()
      })
      .then((data: { figures?: HistoricalFigure[] }) => {
        if (!cancelled) {
          setFeaturedFigures(data.figures ?? [])
        }
      })
      .catch((error) => {
        console.error("获取默认人物失败:", error)
        if (!cancelled) setFeaturedFigures([])
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (hasSearched || featuredFigures.length < 2) return

    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredFigures.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [featuredFigures.length, hasSearched])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("搜索失败:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          中国抗日战争汉奸历史查询
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          专注记录1931-1945年抗日战争时期的汉奸和伪政府官员
        </p>
        
        {/* Warning Box */}
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-red-300 text-sm">
            ⚠️ <strong>重要提示：</strong>本项目专注记录汉奸历史，仅供历史研究和教育参考。
            历史评价需要放在具体历史背景中理解，请勿将历史记录简单套用到现代人身上。
          </p>
        </div>
      </div>

      {!hasSearched && (
        <section className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8" aria-label="主要历史人物轮播">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">📚 主要人物轮播</h3>
              <p className="text-sm text-gray-400 mt-1">默认展示数据库中的重要历史人物，每5秒自动切换</p>
            </div>
            {featuredFigures.length > 0 && (
              <span className="text-sm text-gray-400">
                {featuredIndex + 1} / {featuredFigures.length}
              </span>
            )}
          </div>

          {featuredLoading ? (
            <div className="text-center py-8 text-gray-400">正在加载人物资料...</div>
          ) : featuredFigures.length === 0 ? (
            <div className="text-center py-8 text-gray-400">暂时没有可展示的人物资料</div>
          ) : (
            <div className="result-card">
              <div className="flex items-start justify-between mb-3">
                <h4 className="result-title">{featuredFigures[featuredIndex].name}</h4>
                <span className="result-type type-pro-japanese">汉奸</span>
              </div>
              <div className="space-y-2">
                <p className="result-info"><strong>身份：</strong>{featuredFigures[featuredIndex].identity}</p>
                <p className="result-info"><strong>主要事迹：</strong>{featuredFigures[featuredIndex].activities}</p>
                {featuredFigures[featuredIndex].note && (
                  <p className="result-info text-gray-400"><strong>历史评价：</strong>{featuredFigures[featuredIndex].note}</p>
                )}
                {featuredFigures[featuredIndex].punishment && (
                  <p className="result-info text-gray-400"><strong>结局：</strong>{featuredFigures[featuredIndex].punishment}</p>
                )}
              </div>
              {featuredFigures.length > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <button
                    type="button"
                    onClick={() => setFeaturedIndex((current) => (current - 1 + featuredFigures.length) % featuredFigures.length)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                    aria-label="上一位人物"
                  >
                    ← 上一位
                  </button>
                  <div className="flex gap-1.5" aria-label="轮播位置">
                    {featuredFigures.map((figure, index) => (
                      <button
                        key={figure.id}
                        type="button"
                        onClick={() => setFeaturedIndex(index)}
                        className={`h-2 rounded-full transition-all ${index === featuredIndex ? "w-6 bg-red-500" : "w-2 bg-gray-600 hover:bg-gray-500"}`}
                        aria-label={`显示第${index + 1}位人物`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeaturedIndex((current) => (current + 1) % featuredFigures.length)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                    aria-label="下一位人物"
                  >
                    下一位 →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Search Section */}
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-8">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入姓名或关键词（如：汪精卫、陈公博、周佛海）..."
            className="search-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? "搜索中..." : "搜索"}
          </button>
        </form>

        {/* Search Tips */}
        <div className="mt-4 text-sm text-gray-400">
          <p className="font-medium text-gray-300 mb-2">📝 搜索提示：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>输入历史人物的中文姓名进行搜索</li>
            <li>支持姓名搜索和关键词搜索</li>
            <li>可以搜索著名汉奸、伪政府官员、伪政权成员</li>
            <li>历史时期：1931年九一八事变至1945年抗战胜利</li>
          </ul>
        </div>
      </div>

      {/* Results Section */}
      {loading && (
        <div className="text-center py-12">
          <div className="loading-spinner"></div>
          <p className="text-gray-400 mt-4">搜索中...</p>
        </div>
      )}

      {!loading && hasSearched && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            搜索结果 ({results.length} 条)
          </h3>

          {results.length === 0 ? (
            <div className="no-results">
              <p className="text-lg">未找到相关记录</p>
              <p className="text-sm mt-2">
                该人物可能不在当前数据库中，或者请检查搜索关键词是否正确
              </p>
            </div>
          ) : (
            results.map((result, index) => (
              <div key={index} className="result-card">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="result-title">{result.name}</h4>
                  <span className="result-type type-pro-japanese">
                    汉奸
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="result-info">
                    <strong>时期：</strong>{result.period}
                  </p>
                  <p className="result-info">
                    <strong>身份：</strong>{result.identity}
                  </p>
                  <p className="result-info">
                    <strong>主要事迹：</strong>{result.activities}
                  </p>
                  {result.note && (
                    <p className="result-info text-gray-400 mt-3">
                      <strong>历史评价：</strong>{result.note}
                    </p>
                  )}
                  {result.punishment && (
                    <p className="result-info text-gray-400 mt-3">
                      <strong>结局：</strong>{result.punishment}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Section */}
      {!hasSearched && (
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-800">
            <h3 className="text-lg font-bold text-red-400 mb-3">🔴 什么是汉奸？</h3>
            <p className="text-gray-300 text-sm">
              汉奸是指在抗日战争时期投靠日本侵略者、背叛国家和民族的人，包括伪政府官员、
              伪军将领等。这些人的行为给中国人民带来了深重灾难。
            </p>
            <p className="text-gray-300 text-sm mt-3">
              本项目专注记录这段历史，警示后人铭记历史教训，防止悲剧重演。
            </p>
          </div>
        </div>
      )}

      {/* Historical Context */}
      {!hasSearched && (
        <div className="mt-12 bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">📜 历史背景</h3>
          <div className="text-gray-300 text-sm space-y-3">
            <p>
              <strong>抗日战争时期 (1931-1945)：</strong>这是中华民族历史上最艰苦卓绝的时期之一。
              从1931年九一八事变开始，到1945年日本投降结束，历时14年抗战。
            </p>
            <p>
              <strong>主要伪政权和汉奸势力：</strong>包括伪满洲国政府、汪精卫伪国民政府、各地伪维持会等。
              这些投敌叛国者协助日本侵略者镇压中国人民，犯下了滔天罪行，给中华民族带来了深重灾难。
            </p>
            <p>
              <strong>历史警示：</strong>记录这段历史不是为了仇恨，而是为了铭记历史教训，警惕汉奸行为，
              防止历史悲剧重演。珍惜今日和平，维护国家主权和民族尊严。
            </p>
            <p className="text-gray-400 mt-4">
              ⚠️ <strong>提醒：</strong>本工具专注记录汉奸历史，仅供参考学习。
              欢迎补充更多历史资料和文献引用，共同完善这段历史记录。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
