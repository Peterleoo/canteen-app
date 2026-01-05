export const formatSales = (count: number) => count > 1000 ? '1000+' : count.toString();

export const generateLocalAvatar = (name: string, backgroundColor: string = '2563eb', color: string = 'fff') => {
    const svg = `
  <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#${backgroundColor}"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="40" font-weight="bold" fill="#${color}" text-anchor="middle" dy=".3em">${name.charAt(0)}</text>
  </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};
