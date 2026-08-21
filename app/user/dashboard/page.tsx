"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function DashboardPage() {
  const { user, loading, error } = useSimpleSession()
  const router = useRouter()
  
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">用户中心</h1>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
            >
              返回首页
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">用户名</div>
              <div className="text-lg font-semibold text-white">{user.username || user.name}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">邮箱</div>
              <div className="text-lg font-semibold text-white">{user.email}</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">信誉分</div>
              <div className="text-lg font-semibold text-yellow-400">
                {user.reputationScore || 50}分
              </div>
            </div>
          </div>
        </div>

        {/* 功能菜单 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">编辑贡献</h2>
            <p className="text-gray-400 mb-4">提交和查看您对汉奸历史资料的编辑贡献</p>
            <Link 
              href="/edit/my-submissions"
              className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              我的提交
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">投票参与</h2>
            <p className="text-gray-400 mb-4">参与编辑内容的投票和审核</p>
            <Link 
              href="/vote/pending"
              className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
            >
              待投票内容
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">添加汉奸记录</h2>
            <p className="text-gray-400 mb-4">为数据库添加新的汉奸历史记录</p>
            <Link 
              href="/edit/add"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              添加记录
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">账号设置</h2>
            <p className="text-gray-400 mb-4">管理您的账号信息和安全设置</p>
            <Link 
              href="/user/settings"
              className="inline-block px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
            >
              账号设置
            </Link>
          </div>
        </div>

        {/* 登出按钮 */}
        <div className="mt-6 text-center">
          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/simple-signout", { method: "POST" })
                window.location.href = "/auth/login"
              } catch (error) {
                console.error("登出失败:", error)
              }
            }}
            className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white rounded-lg text-sm"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  )
}