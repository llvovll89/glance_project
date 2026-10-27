import { createTheme } from '@mantine/core';

export const formTheme = createTheme({
  fontFamily: "Pretendard, 'Malgun Gothic', sans-serif",
  primaryColor: 'glance',
  primaryShade: { light: 6, dark: 3 },
  colors: {
    glance: ['#edf1ff', '#dce4ff', '#c6d2fb', '#adbef4', '#8fa6e8', '#6f89dc', '#3455cc', '#2945ac', '#233a8f', '#1e3278'],
  },
});
