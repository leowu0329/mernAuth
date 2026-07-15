// 1. 自動判定 API 基礎路徑
// 開發環境 (localhost) 使用相對路徑 '/api'，讓 vite.config.js 的 Proxy 能夠成功攔截並轉發
// 生產環境 (如部署至 Vercel/Render) 則可依據需求動態調整，或維持相對路徑 '/api'
const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api'; 
  }
  // 生產環境設定，若後端與前端部署在同個網域，維持 '/api' 即可
  return import.meta.env.VITE_API_URL || '/api';
};

const API_URL = getBaseUrl();

/**
 * 通用 API 請求工具函數
 * @param {string} endpoint - 請求端點，例如 '/auth/register' 或 'auth/register'
 * @param {Object} options - Fetch 的自訂設定 (method, body, headers 等)
 */
export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  // 整理 Headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // 格式化路徑，避免出現雙斜線 (例如 /api//auth/register)
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${formattedEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 2. 防禦性解析：先讀取為文字，避免直接呼叫 json() 導致 "Unexpected end of JSON" 崩潰
    const responseText = await response.text();
    let data = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        // 如果後端回傳的是 HTML 錯誤頁面 (例如 404 或 500)
        throw new Error(`伺服器回應格式錯誤 (HTTP 狀態碼: ${response.status})。請確認後端伺服器是否正常運作。`);
      }
    }

    // 3. 判斷 HTTP 狀態碼是否成功
    if (!response.ok) {
      // 優先使用後端回傳的錯誤訊息，若無則顯示預設狀態
      throw new Error(data.msg || `請求失敗 (狀態碼: ${response.status})`);
    }

    return data;

  } catch (error) {
    console.error('API 請求發生錯誤:', error);
    throw error; // 向上拋出讓呼叫端 (React 元件) 可以用 catch 捕獲並顯示於 UI
  }
};