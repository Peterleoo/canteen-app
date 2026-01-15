// 位置服务工具类

/**
 * 坐标接口
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * 坐标转换工具类
 * 提供不同坐标系之间的转换功能
 */
class CoordinateConverter {
  // 地球半径（米）
  private static readonly EARTH_RADIUS = 6378137;
  
  // 百度坐标转换参数
  private static readonly X_PI = Math.PI * 3000.0 / 180.0;
  private static readonly PI = Math.PI;
  
  /**
   * 判断坐标是否在中国范围内（用于过滤无效坐标）
   * @param lat 纬度
   * @param lon 经度
   * @returns boolean 是否在中国范围内
   */
  private static isOutOfChina(lat: number, lon: number): boolean {
    if (lon < 72.004 || lon > 137.8347) return true;
    if (lat < 0.8293 || lat > 55.8271) return true;
    return false;
  }
  
  /**
   * 计算纬度转换系数
   * @param x 经度
   * @param y 纬度
   * @returns number 纬度转换系数
   */
  private static transformLat(x: number, y: number): number {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  }
  
  /**
   * 计算经度转换系数
   * @param x 经度
   * @param y 纬度
   * @returns number 经度转换系数
   */
  private static transformLon(x: number, y: number): number {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
    return ret;
  }
  
  /**
   * WGS84转GCJ02（火星坐标）
   * @param lat WGS84纬度
   * @param lon WGS84经度
   * @returns Coordinates GCJ02坐标
   */
  static wgs84ToGcj02(lat: number, lon: number): Coordinates {
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
      latitude: lat + dLat,
      longitude: lon + dLon
    };
  }
  
  /**
   * GCJ02（火星坐标）转WGS84
   * @param lat GCJ02纬度
   * @param lon GCJ02经度
   * @returns Coordinates WGS84坐标
   */
  static gcj02ToWgs84(lat: number, lon: number): Coordinates {
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
   * @param lat BD09纬度
   * @param lon BD09经度
   * @returns Coordinates GCJ02坐标
   */
  static bd09ToGcj02(lat: number, lon: number): Coordinates {
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
   * GCJ02（火星坐标）转BD09（百度坐标）
   * @param lat GCJ02纬度
   * @param lon GCJ02经度
   * @returns Coordinates BD09坐标
   */
  static gcj02ToBd09(lat: number, lon: number): Coordinates {
    const z = Math.sqrt(lon * lon + lat * lat) + 0.00002 * Math.sin(lat * this.X_PI);
    const theta = Math.atan2(lat, lon) + 0.000003 * Math.cos(lon * this.X_PI);
    
    return {
      latitude: z * Math.sin(theta) + 0.006,
      longitude: z * Math.cos(theta) + 0.0065
    };
  }
  
  /**
   * BD09（百度坐标）转WGS84
   * @param lat BD09纬度
   * @param lon BD09经度
   * @returns Coordinates WGS84坐标
   */
  static bd09ToWgs84(lat: number, lon: number): Coordinates {
    // BD09 -> GCJ02 -> WGS84
    const gcj02 = this.bd09ToGcj02(lat, lon);
    return this.gcj02ToWgs84(gcj02.latitude, gcj02.longitude);
  }
  
  /**
   * WGS84转BD09（百度坐标）
   * @param lat WGS84纬度
   * @param lon WGS84经度
   * @returns Coordinates BD09坐标
   */
  static wgs84ToBd09(lat: number, lon: number): Coordinates {
    // WGS84 -> GCJ02 -> BD09
    const gcj02 = this.wgs84ToGcj02(lat, lon);
    return this.gcj02ToBd09(gcj02.latitude, gcj02.longitude);
  }
}

/**
 * 获取用户当前位置
 * @returns Promise<Coordinates> 用户坐标
 */
export const getUserLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '您拒绝了位置权限请求';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '获取位置超时';
            break;
          default:
            errorMessage = '获取位置时发生未知错误';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * 计算两点之间的距离（使用Haversine公式）
 * @param lat1 第一个点的纬度
 * @param lon1 第一个点的经度
 * @param lat2 第二个点的纬度
 * @param lon2 第二个点的经度
 * @returns number 距离（单位：公里）
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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
};

/**
 * 检查用户是否在服务半径内
 * @param userCoords 用户坐标（WGS84）
 * @param canteenCoords 食堂坐标（支持BD09/WGS84/GCJ02）
 * @param radius 服务半径（单位：公里）
 * @param canteenCoordType 食堂坐标类型，默认为WGS84
 * @returns boolean 是否在服务半径内
 */
export const isWithinServiceRadius = (
  userCoords: Coordinates,
  canteenCoords: Coordinates,
  radius: number,
  canteenCoordType: 'WGS84' | 'BD09' | 'GCJ02' = 'WGS84'
): boolean => {
  // 根据坐标类型转换为WGS84
  let convertedCanteenCoords = canteenCoords;
  switch (canteenCoordType) {
    case 'BD09':
      convertedCanteenCoords = CoordinateConverter.bd09ToWgs84(
        canteenCoords.latitude,
        canteenCoords.longitude
      );
      break;
    case 'GCJ02':
      convertedCanteenCoords = CoordinateConverter.gcj02ToWgs84(
        canteenCoords.latitude,
        canteenCoords.longitude
      );
      break;
    case 'WGS84':
    default:
      convertedCanteenCoords = canteenCoords;
      break;
  }
  
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    convertedCanteenCoords.latitude,
    convertedCanteenCoords.longitude
  );
  
  return distance <= radius;
};

/**
 * 转换坐标到WGS84格式
 * @param coords 原始坐标
 * @param fromType 原始坐标类型
 * @returns Coordinates WGS84坐标
 */
export const convertToWgs84 = (
  coords: Coordinates,
  fromType: 'WGS84' | 'BD09' | 'GCJ02'
): Coordinates => {
  switch (fromType) {
    case 'WGS84':
      return coords;
    case 'GCJ02':
      return CoordinateConverter.gcj02ToWgs84(coords.latitude, coords.longitude);
    case 'BD09':
      return CoordinateConverter.bd09ToWgs84(coords.latitude, coords.longitude);
    default:
      return coords;
  }
};

/**
 * 获取默认坐标（用于测试或权限被拒绝时）
 * @returns Coordinates 默认坐标
 */
// 缓存默认坐标，避免每次调用返回新对象导致不必要的重渲染
let cachedDefaultCoords: Coordinates | null = null;
export const getDefaultCoords = (): Coordinates => {
  if (!cachedDefaultCoords) {
    // 从环境变量获取默认坐标，默认为配置的宁乡坐标
    const defaultLatitude = parseFloat(import.meta.env.VITE_DEFAULT_LATITUDE || '28.199110');
    const defaultLongitude = parseFloat(import.meta.env.VITE_DEFAULT_LONGITUDE || '112.991201');
    
    cachedDefaultCoords = {
      latitude: defaultLatitude,
      longitude: defaultLongitude
    };
  }
  
  return cachedDefaultCoords;
};

/**
 * 地址信息接口
 */
export interface AddressInfo {
  province: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
  fullAddress: string;
  coordinates: Coordinates;
}

/**
 * 通过坐标获取地址信息（逆地理编码）
 * @param coords 坐标（WGS84）
 * @returns Promise<AddressInfo> 地址信息
 */
export const getAddressFromCoords = async (coords: Coordinates): Promise<AddressInfo> => {
  // 后端服务器地址 - 用于代理百度地图API请求
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
  
  // 默认使用模拟数据（可靠稳定）
  const mockAddress: AddressInfo = {
    province: '湖南省',
    city: '长沙市',
    district: '宁乡市',
    street: '玉潭街道',
    streetNumber: '花明北路',
    fullAddress: '湖南省长沙市宁乡市玉潭街道花明北路',
    coordinates: coords
  };
  
  try {
    // 注意：高德地图API使用GCJ02坐标，需要先将WGS84转换为GCJ02
    const gcjCoords = CoordinateConverter.wgs84ToGcj02(coords.latitude, coords.longitude);
    
    // 调用后端服务器API，由后端代理请求高德地图API
    // 这样可以避免浏览器的CORS跨域限制
    const url = `${backendUrl}/api/reverse-geocode?lat=${gcjCoords.latitude}&lng=${gcjCoords.longitude}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // 支持百度地图和高德地图的返回格式
    if (response.ok) {
      // 百度地图返回格式
      if (data.status === 0 && data.result) {
        const result = data.result;
        const addressComponent = result.addressComponent;
        
        return {
          province: addressComponent.province || '',
          city: addressComponent.city || '',
          district: addressComponent.district || '',
          street: addressComponent.street || '',
          streetNumber: addressComponent.street_number || '',
          fullAddress: result.formatted_address || '',
          coordinates: coords
        };
      }
      // 高德地图返回格式
      else if (data.status === 'complete' && data.regeocode) {
        const result = data.regeocode;
        const addressComponent = result.addressComponent;
        
        return {
          province: addressComponent.province || '',
          city: addressComponent.city || '',
          district: addressComponent.district || '',
          street: addressComponent.street || '',
          streetNumber: addressComponent.streetNumber || '',
          fullAddress: result.formattedAddress || '',
          coordinates: coords
        };
      }
    }
    
    console.warn('后端API返回错误:', data.error || data.message || '未知错误');
    return mockAddress;
  } catch (error: any) {
    console.warn('调用后端API失败，使用模拟数据:', error.message);
    // 无论发生什么错误，都返回模拟数据，确保用户体验
    return mockAddress;
  }
};

/**
 * 格式化距离显示
 * @param distance 距离（单位：公里）
 * @returns string 格式化后的距离
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * 导出坐标转换工具
 */
export const coordinateConverter = CoordinateConverter;