"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function AdminMonitorPage() {
  const { user: session, loading: sessionLoading } = useSimpleSession()
  const router = useRouter()
  const [monitorData, setMonitorData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionLoading) {
      return
    }

    if (!session) {
      router.replace("/auth/login")
      return
    }

    // 检查管理员权限
    if (session.role !== 'ADMIN') {
      router.replace("/user/dashboard")
      return
    }

    fetchMonitorData()
  }, [session, sessionLoading, router])

  const fetchMonitorData = async () => {
    try {
      const response = await fetch("/api/admin/monitor")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取失败")
      }

      setMonitorData(data.data)
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: number, username: string) => {
    const reason = prompt(`请输入封禁用户 ${username} 的原因：`)
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/ban-user/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "封禁失败")
      }

      alert(`用户 ${username} 已封禁`)
      fetchMonitorData() // 刷新数据

    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  if (!monitorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-red-400">加载失败，请刷新页面重试</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页头 */}
          <div className="mb-8">
            <Link href="/user/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
              ← 返回用户中心
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">管理员监控面板</h1>
            <p className="text-gray-400">
              反恶意用户检测和系统监控
            </p>
          </div>

          {/* 统计概览 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {monitorData.stats.totalSuspicious}
              </div>
              <div className="text-sm text-gray-400">可疑用户</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {monitorData.stats.pendingCount}
              </div>
              <div className="text-sm text-gray-400">待审核</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {monitorData.stats.votingCount}
              </div>
              <div className="text-sm text-gray-400">投票中</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl font-bold text-red-400 mb-2">
                {monitorData.recentBans.length}
              </div>
              <div className="text-sm text-gray-400">已封禁</div>
            </div>
          </div>

          {/* 可疑用户列表 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🔍 需要关注的用户</h2>
            
            {monitorData.suspiciousUsers.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-gray-400">暂无可疑用户</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monitorData.suspiciousUsers.map((user: any) => (
                  <div key={user.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {user.username || user.email}
                        </h3>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">信誉分：</span>
                            <span className="text-yellow-400 font-medium">{user.reputationScore}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">总提交：</span>
                            <span className="text-white">{user.stats.totalSubmissions}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">被拒：</span>
                            <span className="text-red-400">{user.stats.rejectedSubmissions}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">拒绝率：</span>
                            <span className="text-orange-400">{user.stats.rejectRate}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {user.stats.shouldBan && (
                          <span className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-700 rounded text-xs">
                            建议封禁
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* 用户最近的拒绝记录 */}
                    {user.submissions && user.submissions.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-700/30 rounded">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">最近被拒记录：</h4>
                        <div className="space-y-2">
                          {user.submissions.slice(0, 3).map((submission: any) => (
                            <div key={submission.id} className="text-sm">
                              <div className="text-white">{submission.proposedData.name}</div>
                              <div className="text-gray-400 text-xs">
                                拒绝原因：{submission.rejectReason || '无'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleBanUser(user.id, user.username || user.email)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                      >
                        🚫 封禁用户
                      </button>
                      <button
                        onClick={() => router.push(`/user/${user.id}`)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                      >
                        👤 查看详情
                      </button>
                    </div>

                    {/* 注册时间 */}
                    <div className="text-xs text-gray-500 mt-2">
                      注册时间：{new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 最近封禁记录 */}
          {monitorData.recentBans.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">🚫 最近封禁记录</h2>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">用户</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">信誉分</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">提交数</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">封禁时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {monitorData.recentBans.map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="text-white">{user.username || user.email}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </td>
                        <td className="px-4 py-3 text-red-400">{user.reputationScore}</td>
                        <td className="px-4 py-3 text-white">{user._count.submissions}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(user.updatedAt).toLocaleString('zh-CN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
