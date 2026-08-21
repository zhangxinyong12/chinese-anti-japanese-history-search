"use client";

import { useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
          中国抗日战争时期历史人物查询
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          查询1931-1945年抗日战争时期的汉奸与抗日英雄
        </p>
        
        {/* Warning Box */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>重要提示：</strong>本工具仅供历史研究和教育参考。历史评价复杂，
            需要放在具体历史背景中理解。请勿将历史记录简单套用到现代人身上。
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-8">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入姓名或关键词（如：汪精卫、张自忠）..."
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
            <li>可以搜索著名汉奸、伪政府官员、抗日英雄</li>
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
                  <span className={`result-type ${result.type === 'traitor' ? 'type-pro-japanese' : 'type-independence'}`}>
                    {result.type === 'traitor' ? '汉奸' : '抗日英雄'}
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
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Info Section */}
      {!hasSearched && (
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-800">
            <h3 className="text-lg font-bold text-red-400 mb-3">🔴 汉奸/伪政府官员</h3>
            <p className="text-gray-300 text-sm">
              指在抗日战争时期投靠日本侵略者、背叛国家和民族的人，包括伪政府官员、
              伪军将领等。这些人的行为给中国人民带来了深重灾难。
            </p>
          </div>
          
          <div className="bg-green-900/20 rounded-lg p-6 border border-green-800">
            <h3 className="text-lg font-bold text-green-400 mb-3">🟢 抗日英雄/爱国志士</h3>
            <p className="text-gray-300 text-sm">
              指在抗日战争时期为保卫祖国、抵抗日本侵略而英勇奋斗的志士仁人，
              包括国民党军队、共产党军队、游击队和各界爱国人士。
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
              从1931年九一八事变开始，到1945年日本投降结束，历时14年。
            </p>
            <p>
              <strong>主要汉奸势力：</strong>包括伪满洲国政府、汪精卫伪国民政府、各地伪维持会等。
              这些投敌叛国者协助日本侵略者镇压中国人民，犯下了滔天罪行。
            </p>
            <p>
              <strong>抗日力量：</strong>中国共产党领导的八路军、新四军，国民党领导的正规军，
              以及各界爱国人士和普通民众，形成了全民族抗战的磅礴力量。
            </p>
            <p className="text-gray-400 mt-4">
              ⚠️ <strong>提醒：</strong>历史评价需要具体分析，不能简单化。本工具仅供参考学习，
              欢迎补充更多历史资料。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
