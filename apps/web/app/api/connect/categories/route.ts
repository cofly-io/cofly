import { NextRequest, NextResponse } from 'next/server';
import { ConnectCategory } from '@repo/common';

/**
 * GET /api/connect/categories
 * 获取所有连接分类
 */
export async function GET(request: NextRequest) {
  try {
    // 将 ConnectCategory 对象转换为数组格式，包含键值作为id和type
    const categoriesArray = Object.entries(ConnectCategory).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.desc,
      type: key
    }));
    
    return NextResponse.json({
      success: true,
      data: categoriesArray,
      total: categoriesArray.length
    });
  } catch (error) {
    console.error('获取连接分类失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取连接分类失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}