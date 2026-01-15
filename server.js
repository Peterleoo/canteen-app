// 后端服务器 - 用于代理地图API请求，解决CORS问题
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'fs';

// 加载环境变量
if (existsSync('.env')) {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// 允许跨域请求
app.use(cors());

// 配置地图API密钥
const BAIDU_API_KEY = process.env.VITE_BAIDU_MAP_API_KEY || '';
const AMAP_API_KEY = process.env.AMAP_DT_KEY || '';

// 使用的地图服务提供商
const MAP_SERVICE = process.env.MAP_SERVICE || 'AMAP'; // 可选值: 'BAIDU' 或 'AMAP'

// 验证API密钥
if (MAP_SERVICE === 'BAIDU' && !BAIDU_API_KEY) {
    console.error('百度地图API密钥未配置，请在.env文件中添加VITE_BAIDU_MAP_API_KEY');
    process.exit(1);
}

if (MAP_SERVICE === 'AMAP' && !AMAP_API_KEY) {
    console.error('高德地图API密钥未配置，请在.env文件中添加VITE_AMAP_MAP_AK');
    process.exit(1);
}
// server.js 核心修改
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lng } = req.query;
    // 强制使用高德 URL (或者确保环境变量 MAP_SERVICE === 'AMAP')
    const amapUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY}&location=${lng},${lat}&extensions=all&output=json`;
    
    const response = await axios.get(amapUrl);
    res.json(response.data); // 这时返回的 JSON 结构会完全改变
});

// // 定义反向地理编码API端点
// app.get('/api/reverse-geocode', async (req, res) => {
//     try {
//         const { lat, lng, radius = 500 } = req.query; // 允许前端传入半径，默认500米
        
//         if (!lat || !lng) {
//             return res.status(400).json({ error: '缺少坐标参数' });
//         }
        
//         let response;
        
//         if (MAP_SERVICE === 'BAIDU') {
//             /**
//              * 百度地图优化：
//              * 1. extensions_poi=1: 必须设置为1才会返回周边POI列表
//              * 2. radius: 搜索范围
//              */
//             const url = `https://api.map.baidu.com/reverse_geocoding/v3/?ak=${BAIDU_API_KEY}&output=json&coordtype=bd09ll&location=${lat},${lng}&extensions_poi=1&radius=${radius}`;
//             console.log('调用百度地图API (含POI扩展)');
//             response = await axios.get(url);
//         } else {
//             /**
//              * 高德地图优化：
//              * 1. extensions=all: 【最重要】默认是base，只返回地址；设为all才返回周边POI、AOI等详细信息
//              * 2. location: 高德顺序是 lng,lat
//              * 3. poitype: 可选，限制只返回写字楼、小区等
//              */
//             const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_API_KEY}&location=${lng},${lat}&output=json&radius=${radius}&extensions=all`;
//             console.log('调用高德地图API (含POI扩展)');
//             response = await axios.get(url);
//         }
        
//         res.json(response.data);
//     } catch (error) {
//         console.error('调用地图API失败:', error.message);
//         res.status(500).json({ 
//             error: `调用${MAP_SERVICE === 'BAIDU' ? '百度' : '高德'}地图API失败`,
//             details: error.message 
//         });
//     }
// });

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

app.listen(PORT, () => {
    console.log(`\n=== 后端服务器已启动 ===`);
    console.log(`服务器地址: http://192.168.0.57:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
    console.log(`反向地理编码API: http://localhost:${PORT}/api/reverse-geocode`);
    console.log(`========================\n`);
});
