import fs from 'fs'
import path from 'path'

// 读取保护名单
function loadProtectedFigures() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'protected-figures.json')
    const data = fs.readFileSync(dataPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('加载保护名单失败:', error)
    return { protected_figures: [], protected_names: [], protected_keywords: [] }
  }
}

// 安全检查函数
export function checkContentSafety(content: {
  name: string
  identity?: string
  activities?: string
  note?: string
}): {
  isSafe: boolean
  reason?: string
  matchedFigure?: string
  protectionLevel?: string
} {
  const protectedData = loadProtectedFigures()
  const { protected_figures, protected_names, protected_keywords } = protectedData

  // 检查姓名
  const figure = protected_figures.find((f: any) => {
    return f.name === content.name
  })

  if (figure) {
    return {
      isSafe: false,
      reason: `该人物为受保护的历史人物：${figure.name}，不允许提交`,
      matchedFigure: figure.name,
      protectionLevel: figure.protection_level
    }
  }

  // 检查别名和变体
  const nameVariations = [
    content.name,
    content.identity,
    `${content.name}同志`,
    `${content.name}主席`,
    `${content.name}总理`
  ]

  for (const variation of nameVariations) {
    if (!variation) continue
    
    const protectedName = protected_names.find((protectedName: string) => 
      variation?.toLowerCase().includes(protectedName.toLowerCase()) ||
      protectedName.toLowerCase().includes(variation?.toLowerCase())
    )

    if (protectedName) {
      return {
        isSafe: false,
        reason: `该姓名受保护，不允许提交：${protectedName}`,
        matchedFigure: variation
      }
    }
  }

  // 检查关键词
  const allText = `${content.name} ${content.identity || ''} ${content.activities || ''} ${content.note || ''}`.toLowerCase()
  
  for (const keyword of protected_keywords) {
    if (allText.includes(keyword.toLowerCase())) {
      // 如果匹配的是正面词汇，需要更仔细的判断
      if (['革命', '英雄', '模范', '大师', '功勋', '杰出'].some(kw => keyword.includes(kw))) {
        // 这些词如果出现在正面语境中，可能是误报
        continue
      }
      
      return {
        isSafe: false,
        reason: `包含受保护关键词：${keyword}`,
        matchedFigure: keyword
      }
    }
  }

  return { isSafe: true }
}