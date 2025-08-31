// UI层的设置类型定义
export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: {
    systemUpdates: boolean;
    workflowCompletion: boolean;
    workflowErrors: boolean;
    emailNotifications: boolean;
    emailFrequency: 'immediate' | 'daily' | 'weekly';
    browserNotifications: boolean;
    doNotDisturb: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    soundEnabled: boolean;
    soundVolume: number;
  };
  api: {
    cofly: {
      apiKey: string;
      baseUrl: string;
    };
    openai: {
      apiKey: string;
      baseUrl: string;
    };
    custom: {
      name: string;
      apiKey: string;
      baseUrl: string;
      headers: string;
    };
  };
  mcp: {
    enabledTools: string[];
    toolConfigs: Record<string, any>;
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 设置服务接口 - UI层只定义接口，不实现具体逻辑
export interface SystemSettingsService {
  getSystemSettings(userId: string): Promise<ApiResponse<UserSettings>>;
  updateSystemSettings(userId: string, settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>>;
  resetSystemSettings(userId: string): Promise<ApiResponse<UserSettings>>;
  testApiConnection(type: 'cofly' | 'openai' | 'custom', config: any): Promise<ApiResponse<{ status: string }>>;
  getMcpTools(): Promise<ApiResponse<any[]>>;
  exportUserData(userId: string): Promise<ApiResponse<any>>;
  importUserData(userId: string, data: any): Promise<ApiResponse<any>>;
}

// 默认设置
export const defaultSettings: UserSettings = {
  theme: 'dark',
  notifications: {
    systemUpdates: true,
    workflowCompletion: true,
    workflowErrors: true,
    emailNotifications: true,
    emailFrequency: 'immediate',
    browserNotifications: true,
    doNotDisturb: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    soundEnabled: true,
    soundVolume: 50,
  },
  api: {
    cofly: {
      apiKey: '',
      baseUrl: 'https://api.cofly.com',
    },
    openai: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
    },
    custom: {
      name: '',
      apiKey: '',
      baseUrl: '',
      headers: '',
    },
  },
  mcp: {
    enabledTools: ['file-system', 'database', 'email-sender', 'text-processor'],
    toolConfigs: {},
  },
  preferences: {
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
  },
};