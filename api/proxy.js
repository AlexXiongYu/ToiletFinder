// 文件路径: api/proxy.js

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 从 Vercel 的环境变量中安全读取密钥（绝对不会暴露给前端）
  const APP_KEY = process.env.SECURE_APP_KEY;
  const APP_CODE = process.env.SECURE_APP_CODE;
  const BASE_URL = "https://sunpncity.cn";

  // 获取前端传过来的指令类型
  const { action, payload } = req.body;

  try {
    let targetUrl = "";
    let requestBody = {};

    // 1. 如果前端请求的是【登录鉴权】
    if (action === "login") {
      targetUrl = `${BASE_URL}/api/okmes/OpenApi/Login`;
      requestBody = {
        APP_KEY: APP_KEY,
        APP_CODE: APP_CODE,
        Timestamp: String(Date.now())
      };
    } 
    // 2. 如果前端请求的是【获取厕位数据】
    else if (action === "fetch_data") {
      targetUrl = `${BASE_URL}/api/okmes/OpenApi/PageRealTimePitNumber`;
      requestBody = {
        APP_KEY: APP_KEY,
        Token: payload.token,
        PageNo: 1,
        PageSize: 100
      };
    } else {
      return res.status(400).json({ message: '未知的请求类型' });
    }

    // 由云函数向真实的厂商服务器发起请求
    const backendResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await backendResponse.json();
    
    // 把拿到的数据原封不动地返回给你的前端 HTML
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ message: '服务器内部请求错误', error: error.message });
  }
}
