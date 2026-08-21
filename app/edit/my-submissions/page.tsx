"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function MySubmissionsPage() {
  const { user: session, loading: sessionLoading } = useSimpleSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (sessionLoading) {
      return
    }

    if (!session) {
      router.replace("/auth/login")
      return
    }

    fetchSubmissions()
  }, [session, sessionLoading, router])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/edit/my-submissions")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取失败")
      }

      setSubmissions(data.submissions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTO_APPROVED': return 'bg-green-900/20 text-green-400 border-green-700'
      case 'APPROVED': return 'bg-green-900/20 text-green-400 border-green-700'
      case 'REJECTED': return 'bg-red-900/20 text-red-400 border-red-700'
      case 'VOTING': return 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
      case 'PENDING': return 'bg-gray-700/20 text-gray-400 border-gray-600'
      default: return 'bg-gray-700/20 text-gray-400 border-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AUTO_APPROVED': return '自动采纳'
      case 'APPROVED': return '已采纳'
      case 'REJECTED': return '已拒绝'
      case 'VOTING': return '投票中'
      case 'PENDING': return '待审核'
      default: return status
    }
  }

  const getEditTypeText = (editType: string) => {
    switch (editType) {
      case 'ADD': return '添加记录'
      case 'UPDATE': return '更新记录'
      case 'DELETE': return '删除记录'
      default: return editType
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页头 */}
          <div className="mb-8">
            <Link href="/user/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
              ← 返回用户中心
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">我的提交</h1>
            <p className="text-gray-400">
              查看和管理您的汉奸记录提交
            </p>
          </div>

          {error ? (
            <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">还没有提交记录</h3>
              <p className="text-gray-400 mb-6">
                开始贡献汉奸历史资料，帮助完善历史记录
              </p>
              <Link
                href="/edit/add"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                添加第一条记录
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                  <div className="text-2xl font-bold text-white">{submissions.length}</div>
                  <div className="text-sm text-gray-400">总提交数</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {submissions.filter(s => s.status === 'AUTO_APPROVED' || s.status === 'APPROVED').length}
                  </div>
                  <div className="text-sm text-gray-400">已采纳</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {submissions.filter(s => s.status === 'PENDING' || s.status === 'VOTING').length}
                  </div>
                  <div className="text-sm text-gray-400">审核中</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {submissions.filter(s => s.status === 'REJECTED').length}
                  </div>
                  <div className="text-sm text-gray-400">已拒绝</div>
                </div>
              </div>

              {/* 提交列表 */}
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {submission.proposedData.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(submission.status)}`}>
                          {getStatusText(submission.status)}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {getEditTypeText(submission.editType)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                          <span className="text-gray-400">身份：</span>
                          {submission.proposedData.identity}
                        </div>
                        <div>
                          <span className="text-gray-400">时期：</span>
                          {submission.proposedData.period || '1931-1945'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 主要事迹 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">主要事迹：</h4>
                    <p className="text-gray-300 text-sm">{submission.proposedData.activities}</p>
                  </div>

                  {/* 投票情况 */}
                  {submission.votes.total > 0 && (
                    <div className="mb-4 p-3 bg-gray-700/30 rounded">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">投票情况：</h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">
                          支持：{submission.votes.support} ({submission.votes.totalWeight}权重)
                        </span>
                        <span className="text-red-400">
                          反对：{submission.votes.oppose}
                        </span>
                        <span className="text-gray-400">
                          总计：{submission.votes.total}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 文献引用 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">文献引用：</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {submission.citationSources.map((source: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 拒绝原因 */}
                  {submission.rejectReason && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded">
                      <h4 className="text-sm font-medium text-red-400 mb-1">拒绝原因：</h4>
                      <p className="text-red-300 text-sm">{submission.rejectReason}</p>
                    </div>
                  )}

                  {/* 提交时间 */}
                  <div className="text-xs text-gray-500">
                    提交时间：{new Date(submission.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 底部操作 */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/edit/add"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              添加新记录
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
