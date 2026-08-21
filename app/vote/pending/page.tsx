"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function PendingVotesPage() {
  const { user: session, loading: sessionLoading } = useSimpleSession()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [votingStates, setVotingStates] = useState<{[key: number]: boolean}>({})

  useEffect(() => {
    if (sessionLoading) {
      return
    }

    if (!session) {
      router.replace("/auth/login")
      return
    }

    fetchPendingSubmissions()
  }, [session, sessionLoading, router])

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch("/api/vote/pending")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "获取失败")
      }

      setSubmissions(data.submissions)
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (submissionId: number, voteType: boolean) => {
    setVotingStates(prev => ({ ...prev, [submissionId]: true }))

    try {
      const response = await fetch(`/api/vote/${submissionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "投票失败")
      }

      // 刷新列表
      await fetchPendingSubmissions()

      // 显示结果消息
      alert(data.message)

    } catch (err: any) {
      alert(err.message)
    } finally {
      setVotingStates(prev => ({ ...prev, [submissionId]: false }))
    }
  }

  const getEditTypeText = (editType: string) => {
    switch (editType) {
      case 'ADD': return '添加新记录'
      case 'UPDATE': return '更新记录'
      case 'DELETE': return '删除记录'
      default: return editType
    }
  }

  const getVotePercentage = (support: number, oppose: number, total: number) => {
    if (total === 0) return { support: 0, oppose: 0 }
    return {
      support: Math.round((support / total) * 100),
      oppose: Math.round((oppose / total) * 100)
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
            <h1 className="text-3xl font-bold text-white mb-2">待投票内容</h1>
            <p className="text-gray-400">
              参与社区审核，投票决定汉奸记录的采纳与否
            </p>
          </div>

          {/* 投票说明 */}
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">📜 投票规则</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• 支持票远超反对票时，内容将自动采纳</p>
              <p>• 反对票远超支持票时，内容将被拒绝</p>
              <p>• 您的投票权重基于信誉分和角色</p>
              <p>• 诚信投票，恶意投票将受到处罚</p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
              <div className="text-6xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无待投票内容</h3>
              <p className="text-gray-400 mb-6">
                所有提交都已处理完毕，请稍后再来查看
              </p>
              <Link
                href="/edit/add"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                添加新记录
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {submissions.map((submission) => {
                const percentages = getVotePercentage(
                  submission.votes.support, 
                  submission.votes.oppose, 
                  submission.votes.total
                )

                return (
                  <div key={submission.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {submission.proposedData.name}
                          </h3>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {getEditTypeText(submission.editType)}
                          </span>
                          <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 border border-yellow-700 rounded text-xs">
                            {submission.status === 'VOTING' ? '投票中' : '待投票'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-400">
                          提交者：{submission.submitter.username} 
                          （信誉分：{submission.submitter.reputationScore}）
                        </div>
                      </div>
                    </div>

                    {/* 内容详情 */}
                    <div className="mb-4 space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">身份：</span>
                        <span className="text-white ml-2">{submission.proposedData.identity}</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400 text-sm">时期：</span>
                        <span className="text-white ml-2">{submission.proposedData.period || '1931-1945'}</span>
                      </div>

                      <div className="bg-gray-700/30 rounded p-3">
                        <span className="text-gray-400 text-sm">主要事迹：</span>
                        <p className="text-gray-300 text-sm mt-1">{submission.proposedData.activities}</p>
                      </div>

                      {submission.proposedData.note && (
                        <div>
                          <span className="text-gray-400 text-sm">历史评价：</span>
                          <p className="text-gray-300 text-sm mt-1">{submission.proposedData.note}</p>
                        </div>
                      )}

                      {submission.proposedData.punishment && (
                        <div>
                          <span className="text-gray-400 text-sm">结局：</span>
                          <span className="text-white ml-2">{submission.proposedData.punishment}</span>
                        </div>
                      )}
                    </div>

                    {/* 文献引用 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">📚 文献引用：</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {submission.citationSources.map((source: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-400">•</span>
                            <span>{source}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 投票区域 */}
                    <div className="border-t border-gray-700 pt-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">当前投票情况：</span>
                          <span className="text-gray-300">总计 {submission.votes.total} 票</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-green-400">支持：</span>
                              <span className="text-white">{submission.votes.support} 票 ({submission.votes.supportWeight}权重)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${percentages.support}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{percentages.support}%</div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-red-400">反对：</span>
                              <span className="text-white">{submission.votes.oppose} 票 ({submission.votes.opposeWeight}权重)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${percentages.oppose}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{percentages.oppose}%</div>
                          </div>
                        </div>
                      </div>

                      {/* 投票按钮 */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVote(submission.id, true)}
                          disabled={votingStates[submission.id]}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {votingStates[submission.id] ? '投票中...' : '✓ 支持'}
                        </button>
                        <button
                          onClick={() => handleVote(submission.id, false)}
                          disabled={votingStates[submission.id]}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {votingStates[submission.id] ? '投票中...' : '✗ 反对'}
                        </button>
                      </div>
                    </div>

                    {/* 提交时间 */}
                    <div className="text-xs text-gray-500 mt-2">
                      提交时间：{new Date(submission.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
