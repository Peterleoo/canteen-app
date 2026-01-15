// 独立的坐标转换测试脚本
// 直接实现转换函数，无需导入TypeScript模块

/**
 * 坐标转换工具类
 * 提供不同坐标系之间的转换功能
 */
class CoordinateConverter {
  // 地球半径（米）
  static EARTH_RADIUS = 6378137;
  
  // 百度坐标转换参数
  static X_PI = Math.PI * 3000.0 / 180.0;
  static PI = Math.PI;
  
  /**
   * 判断坐标是否在中国范围内（用于过滤无效坐标）
   */
  static isOutOfChina(lat, lon) {
    if (lon < 72.004 || lon > 137.8347) return true;
    if (lat < 0.8293 || lat > 55.8271) return true;
    return false;
  }
  
  /**
   * 计算纬度转换系数
   */
  static transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }
  
  /**
   * 计算经度转换系数
   */
  static transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
    return ret;
  }
  
  /**
   * GCJ02（火星坐标）转WGS84
   */
  static gcj02ToWgs84(lat, lon) {
    if (this.isOutOfChina(lat, lon)) {
      return { latitude: lat, longitude: lon };
    }
    
    let dLat = this.transformLat(lon - 105.0, lat - 35.0);
    let dLon = this.transformLon(lon - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * this.PI;
    let magic = Math.sin(radLat);
    magic = 1 - 0.00669342162296594323 * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((this.EARTH_RADIUS * (1 - 0.00669342162296594323)) / (magic * sqrtMagic) * this.PI);
    dLon = (dLon * 180.0) / (this.EARTH_RADIUS / sqrtMagic * Math.cos(radLat) * this.PI);
    
    return {
      latitude: lat - dLat,
      longitude: lon - dLon
    };
  }
  
  /**
   * BD09（百度坐标）转GCJ02（火星坐标）
   */
  static bd09ToGcj02(lat, lon) {
    const x = lon - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.X_PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.X_PI);
    
    return {
      latitude: z * Math.sin(theta),
      longitude: z * Math.cos(theta)
    };
  }
  
  /**
   * BD09（百度坐标）转WGS84
   */
  static bd09ToWgs84(lat, lon) {
    // BD09 -> GCJ02 -> WGS84
    const gcj02 = this.bd09ToGcj02(lat, lon);
    return this.gcj02ToWgs84(gcj02.latitude, gcj02.longitude);
  }
}

/**
 * 计算两点之间的距离（使用Haversine公式）
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
 * 检查用户是否在服务半径内
 */
function isWithinServiceRadius(userCoords, canteenCoords, radius, canteenCoordType = 'WGS84') {
  // 如果食堂坐标是BD09格式，先转换为WGS84
  let convertedCanteenCoords = canteenCoords;
  if (canteenCoordType === 'BD09') {
    convertedCanteenCoords = CoordinateConverter.bd09ToWgs84(
      canteenCoords.latitude,
      canteenCoords.longitude
    );
  }
  
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    convertedCanteenCoords.latitude,
    convertedCanteenCoords.longitude
  );
  
  return distance <= radius;
}

// 测试数据：BD09坐标转换
console.log('=== BD09到WGS84坐标转换测试 ===');

// 示例1：宁乡市中心的BD09坐标
const ningxiangBd09 = {
  latitude: 28.2441,  // 宁乡市中心BD09纬度
  longitude: 112.5593  // 宁乡市中心BD09经度
};

// 转换为WGS84
const ningxiangWgs84 = CoordinateConverter.bd09ToWgs84(
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

// 示例3：计算实际距离
const distance = calculateDistance(
  userWgs84.latitude,
  userWgs84.longitude,
  ningxiangWgs84.latitude,
  ningxiangWgs84.longitude
);

console.log('=== 实际距离计算 ===');
console.log('用户到食堂的距离:', distance.toFixed(3), '公里');
console.log('格式化显示:', distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`);
console.log('====================');
