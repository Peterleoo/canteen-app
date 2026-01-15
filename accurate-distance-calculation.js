// 精确距离计算示例
// 说明：本项目使用WGS84坐标系统（GPS原始坐标），与谷歌地图兼容

/**
 * 计算两点之间的距离（使用Haversine公式）
 * @param {number} lat1 第一个点的纬度
 * @param {number} lon1 第一个点的经度
 * @param {number} lat2 第二个点的纬度
 * @param {number} lon2 第二个点的经度
 * @returns {number} 距离（单位：公里）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 格式化距离显示
 * @param {number} distance 距离（单位：公里）
 * @returns {string} 格式化后的距离
 */
function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// 坐标系统说明
console.log('=== 坐标系统说明 ===');
console.log('本项目使用的坐标格式：WGS84（GPS原始坐标）');
console.log('兼容的地图平台：谷歌地图、GPS设备、苹果地图');
console.log('高德地图使用：GCJ-02（火星坐标）- 需要坐标转换');
console.log('百度地图使用：BD-09（百度坐标）- 需要坐标转换');
console.log('====================\n');

// 1. 获取更精确的宁乡市坐标（WGS84格式）
// 来源：通过地图服务查询获得的宁乡市中心坐标
const ningxiangCoordinates = {
  latitude: 28.2381,  // 宁乡市中心精确纬度（WGS84）
  longitude: 112.5528 // 宁乡市中心精确经度（WGS84）
};

console.log('=== 宁乡市精确坐标（WGS84） ===');
console.log('纬度:', ningxiangCoordinates.latitude);
console.log('经度:', ningxiangCoordinates.longitude);
console.log('====================\n');

// 2. 模拟当前用户坐标（WGS84格式）
// 示例1：假设用户在长沙市中心
const changshaCurrentPosition = {
  latitude: 28.2278,  // 长沙市中心纬度（WGS84）
  longitude: 112.9388 // 长沙市中心经度（WGS84）
};

// 示例2：假设用户在宁乡市内某个位置
const ningxiangCurrentPosition = {
  latitude: 28.2450,  // 宁乡市内某位置纬度（WGS84）
  longitude: 112.5600 // 宁乡市内某位置经度（WGS84）
};

console.log('=== 模拟当前用户坐标（WGS84） ===');
console.log('示例1 - 长沙市中心:', changshaCurrentPosition);
console.log('示例2 - 宁乡市内:', ningxiangCurrentPosition);
console.log('====================\n');

// 3. 计算距离
console.log('=== 距离计算结果 ===');

// 计算示例1：长沙市中心到宁乡市
const distance1 = calculateDistance(
  changshaCurrentPosition.latitude,
  changshaCurrentPosition.longitude,
  ningxiangCoordinates.latitude,
  ningxiangCoordinates.longitude
);

// 计算示例2：宁乡市内到宁乡市
const distance2 = calculateDistance(
  ningxiangCurrentPosition.latitude,
  ningxiangCurrentPosition.longitude,
  ningxiangCoordinates.latitude,
  ningxiangCoordinates.longitude
);

console.log('示例1 - 长沙市中心到宁乡市:');
console.log('  计算结果:', distance1.toFixed(3), '公里');
console.log('  格式化显示:', formatDistance(distance1));
console.log('\n示例2 - 宁乡市内到宁乡市:');
console.log('  计算结果:', distance2.toFixed(3), '公里');
console.log('  格式化显示:', formatDistance(distance2));
console.log('====================\n');

// 4. 实际项目中获取当前位置的方法
console.log('=== 实际项目中获取当前位置 ===');
console.log('在浏览器中，通过navigator.geolocation API获取：');
console.log(`navigator.geolocation.getCurrentPosition((position) => {`);
console.log(`  const currentCoords = {`);
console.log(`    latitude: position.coords.latitude,`);
console.log(`    longitude: position.coords.longitude`);
console.log(`  };`);
console.log(`  // 然后使用currentCoords进行距离计算`);
console.log(`});`);
console.log('\n获取到的坐标格式：WGS84（与本项目兼容）');
console.log('====================');
