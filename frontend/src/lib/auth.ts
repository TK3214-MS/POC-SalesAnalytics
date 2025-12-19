// TODO: Azure AD B2C / Entra ID 認証実装

export interface User {
  id: string;
  email: string;
  role: 'Sales' | 'Manager' | 'Auditor';
  storeId: string;
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: JWT トークンから claims を取得
  return {
    id: 'user-demo-001',
    email: 'demo@example.com',
    role: 'Sales',
    storeId: 'store-tokyo-001',
  };
}

export async function login(email: string, password: string): Promise<User> {
  // TODO: Azure AD B2C / Entra ID ログイン
  console.log('Login:', email, password);
  return {
    id: 'user-demo-001',
    email,
    role: 'Sales',
    storeId: 'store-tokyo-001',
  };
}

export async function logout(): Promise<void> {
  // TODO: ログアウト処理
  console.log('Logout');
}
