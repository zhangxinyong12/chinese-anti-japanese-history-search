"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function AddTraitorPage() {
  const { user: session, loading: sessionLoading } = useSimpleSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    period: "1931-1945",
    identity: "",
    activities: "",
    note: "",
    year: "",
    punishment: "",
    deathPlace: "",
    citationSources: [""]
  })

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace("/auth/login")
    }
  }, [router, session, sessionLoading])

  // 等待会话请求结束，避免首次渲染时把已登录用户误导回登录页。
  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  const handleCitationChange = (index: number, value: string) => {
    const newCitations = [...formData.citationSources]
    newCitations[index] = value
    setFormData({ ...formData, citationSources: newCitations })
  }

  const addCitationField = () => {
    setFormData({ ...formData, citationSources: [...formData.citationSources, ""] })
  }

  const removeCitationField = (index: number) => {
    if (formData.citationSources.length > 1) {
      const newCitations = formData.citationSources.filter((_, i) => i !== index)
      setFormData({ ...formData, citationSources: newCitations })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // 验证必填字段
    if (!formData.name.trim() || !formData.identity.trim() || !formData.activities.trim()) {
      setError("姓名、身份和主要事迹为必填项")
      setLoading(false)
      return
    }

    // 验证文献引用
    const validCitations = formData.citationSources.filter(c => c.trim())
    if (validCitations.length === 0) {
      setError("至少需要提供一个历史文献引用")
      setLoading(false)
      return
    }

    // 检查是否包含英雄关键词
    const heroKeywords = ["英雄", "抗日", "爱国", "烈士", "将领", "司令"]
    const hasHeroKeyword = heroKeywords.some(keyword => 
      formData.identity.includes(keyword) || 
      formData.activities.includes(keyword) ||
      (formData.note && formData.note.includes(keyword))
    )

    if (hasHeroKeyword) {
      setError("系统仅记录汉奸历史，请勿提交英雄相关内容")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/edit/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          editType: "ADD",
          proposedData: {
            name: formData.name.trim(),
            period: formData.period,
            identity: formData.identity.trim(),
            activities: formData.activities.trim(),
            note: formData.note.trim(),
            year: formData.year ? parseInt(formData.year) : null,
            punishment: formData.punishment.trim(),
            deathPlace: formData.deathPlace.trim()
          },
          citationSources: validCitations
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "提交失败")
      }

      setSuccess(true)
      // 清空表单
      setFormData({
        name: "",
        period: "1931-1945",
        identity: "",
        activities: "",
        note: "",
        year: "",
        punishment: "",
        deathPlace: "",
        citationSources: [""]
      })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-green-900/20 border border-green-700 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">提交成功！</h2>
              <p className="text-gray-300 mb-6">
                您的汉奸记录已提交审核，感谢您的贡献！
              </p>
              <div className="text-sm text-gray-400 mb-6">
                <p>• 您的提交将在审核队列中等待其他用户验证</p>
                <p>• 当有3个以上用户提交相似信息时，将自动采纳</p>
                <p>• 您可以在"我的提交"中查看审核状态</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSuccess(false)
                    setError("")
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  继续添加
                </button>
                <Link
                  href="/user/dashboard"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  返回用户中心
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 页头 */}
          <div className="mb-8">
            <Link href="/user/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
              ← 返回用户中心
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">添加汉奸记录</h1>
            <p className="text-gray-400">
              请填写汉奸的详细历史信息，所有提交将经过社区审核
            </p>
          </div>

          {/* 警告信息 */}
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">
              ⚠️ <strong>重要提醒：</strong>本系统仅记录抗日战争时期的汉奸和伪政府官员。
              请确保提交的内容真实可靠，并提供历史文献引用。
            </p>
          </div>

          {/* 表单 */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">基本信息</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      姓名 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                      placeholder="汪精卫"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      主要时期
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData({...formData, period: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                    >
                      <option value="1931-1945">1931-1945 (抗日战争时期)</option>
                      <option value="1931-1937">1931-1937 (局部抗战)</option>
                      <option value="1937-1945">1937-1945 (全面抗战)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    伪政府身份/职务 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.identity}
                    onChange={(e) => setFormData({...formData, identity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                    placeholder="伪国民政府主席"
                  />
                </div>
              </div>

              {/* 详细事迹 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">详细事迹</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    主要投敌行为 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.activities}
                    onChange={(e) => setFormData({...formData, activities: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                    placeholder="详细描述该人的投敌行为和伪政府活动..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    历史评价（可选）
                  </label>
                  <textarea
                    rows={2}
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                    placeholder="对该人的历史评价和影响..."
                  />
                </div>
              </div>

              {/* 结局信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">结局信息</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      活动年份
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                      placeholder="1940"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      惩罚/结局
                    </label>
                    <input
                      type="text"
                      value={formData.punishment}
                      onChange={(e) => setFormData({...formData, punishment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                      placeholder="死刑/病逝/战死"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      死亡地点
                    </label>
                    <input
                      type="text"
                      value={formData.deathPlace}
                      onChange={(e) => setFormData({...formData, deathPlace: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                      placeholder="上海/南京"
                    />
                  </div>
                </div>
              </div>

              {/* 文献引用 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  历史文献引用 <span className="text-red-400">*</span>
                </h3>
                <p className="text-sm text-gray-400">
                  请提供支持您提交内容的历史文献或学术资料来源
                </p>

                {formData.citationSources.map((citation, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={citation}
                      onChange={(e) => handleCitationChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-2 focus:ring-red-500"
                      placeholder="书籍名称、学术文章、历史档案等"
                    />
                    {formData.citationSources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCitationField(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCitationField}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
                >
                  + 添加更多文献
                </button>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                <Link
                  href="/user/dashboard"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                >
                  取消
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "提交中..." : "提交审核"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
