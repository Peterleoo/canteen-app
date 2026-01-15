// 距离计算示例代码（JavaScript版）
// 演示如何使用Haversine公式计算两点之间的距离

/**
 * 计算两点之间的距离（使用Haversine公式）
 * @param {number} lat1 第一个点的纬度
 * @param {number} lon1 第一个点的经度
 * @param {number} lat2 第二个点的纬度
 * @param {number} lon2 第二个点的经度
 * @returns {number} 距离（单位：公里）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // 地球半径（单位：公里）
  const R = 6371;
  
  // 转换为弧度
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
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

// 示例计算：当前位置到宁乡市食堂的距离

// 1. 假设当前位置（根据浏览器定位API获取）
const currentPosition = {
  latitude: 39.9042,  // 示例：北京天安门纬度
  longitude: 116.4074  // 示例：北京天安门经度
};

// 2. 宁乡市食堂大致坐标（根据地理信息）
const ningxiangCanteen = {
  latitude: 28.25,     // 宁乡市纬度（大致）
  longitude: 112.55    // 宁乡市经度（大致）
};

// 3. 计算距离
const distance = calculateDistance(
  currentPosition.latitude,
  currentPosition.longitude,
  ningxiangCanteen.latitude,
  ningxiangCanteen.longitude
);

// 4. 格式化距离
const formattedDistance = formatDistance(distance);

console.log('=== 距离计算示例 ===');
console.log('当前位置:', currentPosition);
console.log('宁乡市食堂位置:', ningxiangCanteen);
console.log('计算方法: Haversine公式');
console.log('计算公式:');
console.log('  a = sin²(Δφ/2) + cos φ1 × cos φ2 × sin²(Δλ/2)');
console.log('  c = 2 × atan2(√a, √(1−a))');
console.log('  d = R × c');
console.log('  其中: R = 6371公里（地球半径）, φ = 纬度, λ = 经度');
console.log('计算结果:', distance.toFixed(2), '公里');
console.log('格式化显示:', formattedDistance);
console.log('====================');

// 示例2：如果当前位置是宁乡市内的某个位置
const ningxiangCurrentPosition = {
  latitude: 28.24,     // 宁乡市内某位置纬度
  longitude: 112.56    // 宁乡市内某位置经度
};

const distanceInNingxiang = calculateDistance(
  ningxiangCurrentPosition.latitude,
  ningxiangCurrentPosition.longitude,
  ningxiangCanteen.latitude,
  ningxiangCanteen.longitude
);

const formattedDistanceInNingxiang = formatDistance(distanceInNingxiang);

console.log('\n=== 宁乡市内距离计算示例 ===');
console.log('当前位置（宁乡市内）:', ningxiangCurrentPosition);
console.log('宁乡市食堂位置:', ningxiangCanteen);
console.log('计算结果:', distanceInNingxiang.toFixed(2), '公里');
console.log('格式化显示:', formattedDistanceInNingxiang);
console.log('========================');
