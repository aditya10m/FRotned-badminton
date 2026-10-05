const theme = {
  colors: {
    background: '#0A0A0A',
    surface: '#141414',
    surfaceLight: '#1E1E1E',
    border: '#2A2A2A',
    primary: '#C8E64C',       // Tennis ball yellow-green
    primaryDim: '#8BA833',
    text: '#FFFFFF',
    textSecondary: '#8A8A8A',
    textMuted: '#555555',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#EF5350',
    info: '#42A5F5',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { sm: 6, md: 10, lg: 16, xl: 24 },
  typography: {
    hero: { fontSize: 48, fontWeight: '800' as const, letterSpacing: -1 },
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '600' as const },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    score: { fontSize: 64, fontWeight: '800' as const, letterSpacing: -2 },
  },
};
export default theme;
