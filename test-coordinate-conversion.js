// 坐标转换测试脚本
// 用于验证BD09到WGS84坐标转换功能

// 导入坐标转换工具
import { coordinateConverter, isWithinServiceRadius } from './utils/location.js';

// 测试数据：BD09坐标转换
console.log('=== BD09到WGS84坐标转换测试 ===');

// 示例1：宁乡市中心的BD09坐标
const ningxiangBd09 = {
  latitude: 28.2441,  // 宁乡市中心BD09纬度
  longitude: 112.5593  // 宁乡市中心BD09经度
};

// 转换为WGS84
const ningxiangWgs84 = coordinateConverter.bd09ToWgs84(
  ningxiangBd09.latitude,
  ningxiangBd09.longitude
);

console.log('宁乡市中心坐标转换：');
console.log('BD09坐标:', ningxiangBd09);
console.log('转换后WGS84坐标:', ningxiangWgs84);
console.log('====================\n');

// 示例2：服务半径检查测试
console.log('=== 服务半径检查测试 ===');

// 用户当前位置（WGS84，假设在宁乡市内）
const userWgs84 = {
  latitude: 28.2450,  // 用户位置WGS84纬度
  longitude: 112.5600  // 用户位置WGS84经度
};

// 食堂坐标（BD09格式）
const canteenBd09 = {
  latitude: 28.2441,  // 食堂BD09纬度
  longitude: 112.5593  // 食堂BD09经度
};

// 测试不同半径下的服务范围检查
const testRadius = 2; // 2公里服务半径

const isWithin = isWithinServiceRadius(
  userWgs84,
  canteenBd09,
  testRadius,
  'BD09' // 指定食堂坐标类型为BD09
);

console.log('用户位置（WGS84）:', userWgs84);
console.log('食堂位置（BD09）:', canteenBd09);
console.log('服务半径:', testRadius, '公里');
console.log('用户是否在服务范围内:', isWithin ? '是' : '否');
console.log('====================\n');

// 示例3：反向转换测试（验证转换准确性）
console.log('=== 坐标转换准确性测试 ===');

// 原始WGS84坐标
const originalWgs84 = {
  latitude: 28.2381,
  longitude: 112.5528
};

// WGS84 -> BD09 -> WGS84
const convertedBd09 = coordinateConverter.wgs84ToBd09(
  originalWgs84.latitude,
  originalWgs84.longitude
);

const convertedBackWgs84 = coordinateConverter.bd09ToWgs84(
  convertedBd09.latitude,
  convertedBd09.longitude
);

console.log('原始WGS84坐标:', originalWgs84);
console.log('转换为BD09坐标:', convertedBd09);
console.log('转换回WGS84坐标:', convertedBackWgs84);

// 计算转换误差（米）
const errorLat = Math.abs(originalWgs84.latitude - convertedBackWgs84.latitude) * 111319.9; // 1度纬度 ≈ 111319.9米
const errorLon = Math.abs(originalWgs84.longitude - convertedBackWgs84.longitude) * 111319.9 * Math.cos(originalWgs84.latitude * Math.PI / 180); // 1度经度 ≈ 111319.9 * cos(纬度) 米
const totalError = Math.sqrt(errorLat * errorLat + errorLon * errorLon);

console.log('转换误差:', totalError.toFixed(2), '米');
console.log('====================');
