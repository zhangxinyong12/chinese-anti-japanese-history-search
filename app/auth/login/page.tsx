"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export default function LoginPage() {
  const router = useRouter()
  const { refreshSession } = useSimpleSession()
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 使用简单的登录API
      const response = await fetch("/api/auth/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "登录失败")
      }

      if (!data.success) {
        throw new Error(data.error || "登录失败")
      }

      // 登录接口刚写入 cookie，先刷新全局会话，避免 dashboard 读取到旧的未登录状态。
      await refreshSession()
      router.replace("/user/dashboard")

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="text-3xl mb-4 inline-block">🇨🇳</Link>
          <h2 className="text-3xl font-bold text-white">
            汉奸清算器
          </h2>
          <p className="mt-2 text-gray-400">
            登录到您的账号
          </p>
        </div>

        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="请输入用户名"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "登录中..." : "登录"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-400">
              还没有账号？
              <Link href="/auth/register" className="font-medium text-red-400 hover:text-red-300 ml-1">
                立即注册
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center text-xs text-gray-500">
          <Link href="/" className="text-gray-400 hover:text-gray-300">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
