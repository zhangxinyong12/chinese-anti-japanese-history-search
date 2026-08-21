"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSimpleSession } from "@/components/SimpleSessionProvider"

export function SessionNav() {
  const { user, loading, refreshSession } = useSimpleSession()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)

    try {
      const response = await fetch("/api/auth/simple-signout", { method: "POST" })
      if (!response.ok) {
        throw new Error("退出登录失败")
      }

      // 更新全局状态，确保导航在退出后立即恢复为未登录状态。
      await refreshSession()
      router.replace("/")
    } catch (error) {
      console.error("退出登录失败:", error)
      setSigningOut(false)
    }
  }

  if (loading) {
    return <span className="px-4 py-2 text-sm text-gray-400">加载中...</span>
  }

  if (user) {
    return (
      <>
        <Link
          href="/user/dashboard"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {user.username || user.name}
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingOut ? "退出中..." : "退出"}
        </button>
      </>
    )
  }

  return (
    <>
      <Link
        href="/auth/register"
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        注册
      </Link>
      <Link
        href="/auth/login"
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
      >
        登录
      </Link>
    </>
  )
}
