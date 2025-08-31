"use client";

import React, { useState, useEffect } from 'react';
import { ConnectPage } from '@repo/ui/main/connection';
import { ConnectService } from '@/services/connectService';
import { ConnectConfigService } from '@/services/connectConfigService';
import { LuLink } from "react-icons/lu";


// 定义删除结果类型，与 ConnectPage 组件中的 DeleteResult 保持一致
interface DeleteResult {
  success: boolean;
  error?: string;
  message?: string;
  errorType?: 'REFERENCED_BY_AGENTS' | 'GENERAL_ERROR';
}

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
  mtype: string; // 数据库中实际的类型字段
  configinfo: string;
  createdtime: Date;
  updatedtime: Date;
  creator: string | null;
}

export default function AgentPageContainer() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>>([]);
  const [connectConfigs, setConnectConfigs] = useState<ConnectConfig[]>([]);

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const result = await ConnectService.getConnectCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('获取分类失败:', result.error);
      }
    } catch (error) {
      console.error('获取分类错误:', error);
    }
  };

  // 获取连接配置数据
  const fetchConnectConfigs = async (): Promise<ConnectConfig[]> => {
    try {
      const result = await ConnectConfigService.getConnectConfigs();     
       console.log('获取连接配置数据...',result);
      if (result.success) {
        // 转换数据结构以匹配 ConnectConfig 接口
        const transformedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          ctype: item.ctype,
          mtype: item.mtype || 'unknown',
          configinfo: JSON.stringify(item.config || {}),
          createdtime: new Date(),
          updatedtime: new Date(),
          creator: item.creator || null
        }));

        setConnectConfigs(transformedData);
        return transformedData;
      } else {
        console.error('获取连接配置失败:', result.error);
        return [];
      }
    } catch (error) {
      console.error('获取连接配置错误:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchConnectConfigs()
      ]);
    };
    loadData();
  }, []);

  // 获取连接列表的回调函数
  const handleFetchConnects = async () => {
    try {
      const result = await ConnectService.getConnectList();

      if (result.success) {
        // 将平面数据结构转换为嵌套结构
        const transformedData = (result.data || []).map((item: any) => ({
          overview: item
        }));
        return transformedData;
      } else {
        console.error('❌ 获取连接列表失败:', result.error);
        throw new Error(result.error || '获取连接列表失败');
      }
    } catch (error) {
      console.error('❌ handleFetchConnects 错误:', error);
      throw error;
    }
  };

  // 获取连接详情的回调函数
  const handleFetchConnectDetails = async (connectId: string) => {
    try {
      const result = await ConnectService.getConnectDetail(connectId);

      if (result.success) {
        // 将平面数据结构转换为嵌套结构，以匹配 ConnectSettings 的期望
        const transformedData = {
          overview: {
            // 动态展开所有字段，避免遗漏新增字段
            ...result.data,
            // 确保detail中的字段不会覆盖overview
            fields: undefined,
            supportedModels: undefined,
            validateConnection: undefined,
            connectionTimeout: undefined
          },
          detail: {
            fields: result.data.fields || [],
            supportedModels: result.data.supportedModels || [],
            validateConnection: result.data.validateConnection ?? true,
            connectionTimeout: result.data.connectionTimeout
          }
        };
        return transformedData;
      } else {
        throw new Error('获取连接详情失败');
      }
    } catch (error) {
      console.error('❌ handleFetchConnectDetails 错误:', error);
      throw error;
    }
  };

  // 连接测试的回调函数
  const handleTest = async (config: Record<string, any>, message?: string) => {
    console.log('🧪 AgentPageContainer.handleTest 开始');
    try {
      // 这里需要根据config中的connectId来调用测试
      const connectId = config.connectId || 'unknown';
      const result = await ConnectService.testConnection(connectId, config, message);
      console.log('✅ 连接测试成功:', result);
      return result;
    } catch (error) {
      console.error('❌ handleTest 错误:', error);
      throw error;
    }
  };

  // 连接保存的回调函数
  const handleConnectSave = async (data: any) => {
    console.log('💾 AgentPageContainer.handleConnectSave 开始:', data);
    console.log('📊 接收到的数据:', data);

    try {
      // 检查是否为编辑模式（有id字段表示是更新）
      if (data.id) {
        console.log('✏️ 编辑模式：更新连接配置 ID:', data.id);

        // 编辑模式：调用更新API
        const updatePayload = {
          name: data.name,
          config: data.config || {},
        };
        console.log('📤 更新载荷:', updatePayload);

        const result = await ConnectConfigService.updateConnectConfig(data.id, updatePayload);
        console.log('📥 更新响应:', result);

        if (result.success) {
          console.log('✅ 连接配置更新成功');
          // 重新获取连接配置列表
          await fetchConnectConfigs();
          return true;
        } else {
          console.error('❌ 更新失败:', result.error);
          return false;
        }
      } else {
        console.log('➕ 创建模式：保存新连接配置');

        // 创建模式：调用创建API
        const result = await ConnectConfigService.saveConnectConfig(data);
        console.log('✅ 连接配置保存成功:', result);

        if (result.success) {
          // 重新获取连接配置列表
          await fetchConnectConfigs();
          return true;
        } else {
          console.error('❌ 保存失败:', result.error);
          return false;
        }
      }
    } catch (error) {
      console.error('❌ handleConnectSave 错误:', error);
      return false;
    }
  };

  // 删除连接配置的回调函数
  const handleDeleteConnect = async (connectId: string): Promise<DeleteResult> => {
    try {
      console.log('🗑️ 开始删除连接配置:', connectId);
      const result = await ConnectConfigService.deleteConnectConfig(connectId);

      if (result.success) {
        console.log('✅ 连接配置删除成功');
        // 重新获取连接配置列表
        await fetchConnectConfigs();
        return {
          success: true,
          message: result.message
        };
      } else {
        console.error('❌ 删除失败:', result.error);
        return {
          success: false,
          error: result.error,
          message: result.message,
          errorType: result.error === 'REFERENCED_BY_AGENTS' ? 'REFERENCED_BY_AGENTS' : 'GENERAL_ERROR'
        };
      }
    } catch (error) {
      console.error('❌ handleDeleteConnect 错误:', error);
      return {
        success: false,
        error: '网络错误，请稍后重试',
        message: error instanceof Error ? error.message : '未知错误',
        errorType: 'GENERAL_ERROR'
      };
    }
  };

  // 编辑连接配置的回调函数
  const handleEditConnect = (connect: ConnectConfig) => {
    console.log('编辑连接配置:', connect);
    // 可以在这里进行一些编辑前的处理
  };

  return (
    <ConnectPage
      title='资源统一连接配置'
      slogan='为您统一管理所有连接资源，包括数据库、API接口、大语言模型、Embedding服务、邮箱等，并提供连接测试、参数配置、资源删除等管理操作.'
      loading={loading}
      DocumentIcon={LuLink}
      categories={categories}
      connectConfigs={connectConfigs}
      onConnectSave={handleConnectSave}
      onFetchConnects={handleFetchConnects}
      onFetchConnectDetails={handleFetchConnectDetails}
      onFetchConnectConfigs={fetchConnectConfigs}
      onDeleteConnect={handleDeleteConnect}
      onEditConnect={handleEditConnect}
      onTest={handleTest}
    />
  );
}