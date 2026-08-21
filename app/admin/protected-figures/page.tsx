"use client";

import { useEffect, useState } from "react";
import { useSimpleSession } from "@/components/SimpleSessionProvider";

interface ProtectedFigure {
  name: string;
  category: string;
  protectionLevel: string;
  reason: string;
}

interface SecurityViolation {
  id: number;
  userId: number;
  userName: string;
  violationType: string;
  reason: string;
  matchedFigure: string;
  status: string;
  userReputation: number;
  userStatus: string;
  createdAt: string;
}

interface AdminData {
  protectedFigures: {
    total: number;
    figures: ProtectedFigure[];
  };
  recentViolations: SecurityViolation[];
  stats: {
    totalProtectedFigures: number;
    recentViolations: number;
    violationByType: Array<{ type: string; count: number }>;
  };
}

export default function AdminProtectedFigures() {
  const { user: session, loading: sessionLoading } = useSimpleSession();
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFigure, setNewFigure] = useState({
    name: "",
    category: "political",
    protectionLevel: "HIGH",
    reason: ""
  });

  useEffect(() => {
    if (sessionLoading) {
      return;
    }

    if (session) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [session, sessionLoading]);

  const handleSignOut = async () => {
    await fetch("/api/auth/simple-signout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/protected-figures");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError("需要管理员权限");
        } else if (response.status === 403) {
          setError("权限不足，仅管理员可访问");
        } else {
          setError(data.error || "获取数据失败");
        }
        return;
      }

      setAdminData(data);
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFigure = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/protected-figures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFigure)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "添加失败");
        return;
      }

      alert("成功添加保护人物");
      setNewFigure({ name: "", category: "political", protectionLevel: "HIGH", reason: "" });
      fetchAdminData(); // 刷新数据
    } catch (err) {
      alert("添加失败，请稍后重试");
    }
  };

  const handleDeleteFigure = async (name: string) => {
    if (!confirm(`确定要删除"${name}"吗？`)) return;

    try {
      const response = await fetch(`/api/admin/protected-figures?name=${encodeURIComponent(name)}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "删除失败");
        return;
      }

      alert("成功删除保护人物");
      fetchAdminData(); // 刷新数据
    } catch (err) {
      alert("删除失败，请稍后重试");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">管理员权限验证</h1>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-300 mb-4">请先登录以访问管理界面</p>
            <button
              onClick={() => { window.location.href = "/auth/login" }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">访问被拒绝</h1>
          <div className="bg-red-900/20 rounded-lg p-6 border border-red-700">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={handleSignOut}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-white text-xl">加载失败</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">保护名单管理</h1>
          <button
            onClick={handleSignOut}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            退出登录
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">保护人物总数</h3>
            <p className="text-3xl font-bold text-red-400">{adminData.stats.totalProtectedFigures}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">最近违规记录</h3>
            <p className="text-3xl font-bold text-yellow-400">{adminData.stats.recentViolations}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">主要违规类型</h3>
            <div className="space-y-2">
              {adminData.stats.violationByType.map((stat) => (
                <div key={stat.type} className="flex justify-between">
                  <span className="text-gray-300">{stat.type}</span>
                  <span className="text-white font-semibold">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Figure Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">添加保护人物</h2>
          <form onSubmit={handleAddFigure} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">姓名 *</label>
              <input
                type="text"
                value={newFigure.name}
                onChange={(e) => setNewFigure({ ...newFigure, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">类别</label>
                <select
                  value={newFigure.category}
                  onChange={(e) => setNewFigure({ ...newFigure, category: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="political">政治人物</option>
                  <option value="military">军事人物</option>
                  <option value="science">科学家</option>
                  <option value="culture">文化人物</option>
                  <option value="sports">体育人物</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">保护级别</label>
                <select
                  value={newFigure.protectionLevel}
                  onChange={(e) => setNewFigure({ ...newFigure, protectionLevel: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="HIGH">高级</option>
                  <option value="MEDIUM">中级</option>
                  <option value="LOW">低级</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">原因</label>
              <textarea
                value={newFigure.reason}
                onChange={(e) => setNewFigure({ ...newFigure, reason: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                rows={2}
                placeholder="说明为什么该人物需要保护..."
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              添加保护人物
            </button>
          </form>
        </div>

        {/* Protected Figures List */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            保护名单预览 (显示前50个，共{adminData.protectedFigures.total}个)
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {adminData.protectedFigures.figures.map((figure) => (
              <div
                key={figure.name}
                className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg"
              >
                <div>
                  <span className="text-white font-medium">{figure.name}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    ({figure.category} - {figure.protectionLevel})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteFigure(figure.name)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Violations */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">最近违规记录</h2>
          <div className="space-y-3">
            {adminData.recentViolations.map((violation) => (
              <div
                key={violation.id}
                className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-red-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-white font-medium">{violation.userName}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      (信誉: {violation.userReputation}, 状态: {violation.userStatus})
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(violation.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">
                  <p><strong>违规类型:</strong> {violation.violationType}</p>
                  <p><strong>原因:</strong> {violation.reason}</p>
                  {violation.matchedFigure && (
                    <p><strong>匹配人物:</strong> {violation.matchedFigure}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
