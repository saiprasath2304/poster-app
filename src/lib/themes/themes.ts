import type { PosterTheme } from '$lib/types';

export const themes: PosterTheme[] = [
  {
    id: 'default-spiritual',
    name: 'Default Spiritual',
    bgGradientFrom: '#5b21b6',
    bgGradientTo: '#2e1065',
    headerTextColor: '#fde047',
    headerTextShadow: '0 2px 8px rgba(0,0,0,0.45)',
    tableHeaderBg: '#1d4ed8',
    tableHeaderText: '#ffffff',
    rowBgA: '#ffffff',
    rowBgB: '#e9edfb',
    bodyTextColor: '#1e1b2e',
    highlightColor: '#dc2626',
    footerBg: '#fdf1cf',
    footerTitleColor: '#b91c1c',
    borderColor: '#3730a3'
  },
  {
    id: 'sai-theme',
    name: 'Sai Theme',
    bgGradientFrom: '#c2410c',
    bgGradientTo: '#7c2d12',
    headerTextColor: '#fde047',
    headerTextShadow: '0 2px 8px rgba(0,0,0,0.5)',
    tableHeaderBg: '#ea580c',
    tableHeaderText: '#ffffff',
    rowBgA: '#fffaf0',
    rowBgB: '#fde8cc',
    bodyTextColor: '#431407',
    highlightColor: '#b91c1c',
    footerBg: '#fef3c7',
    footerTitleColor: '#9a3412',
    borderColor: '#9a3412'
  },
  {
    id: 'temple-theme',
    name: 'Temple Theme',
    bgGradientFrom: '#7f1d1d',
    bgGradientTo: '#450a0a',
    headerTextColor: '#fef3c7',
    headerTextShadow: '0 2px 8px rgba(0,0,0,0.5)',
    tableHeaderBg: '#991b1b',
    tableHeaderText: '#fef3c7',
    rowBgA: '#fffdf7',
    rowBgB: '#f5e9d3',
    bodyTextColor: '#3f1212',
    highlightColor: '#b45309',
    footerBg: '#f5e9d3',
    footerTitleColor: '#7f1d1d',
    borderColor: '#7f1d1d'
  },
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    bgGradientFrom: '#1e40af',
    bgGradientTo: '#1e3a8a',
    headerTextColor: '#ffffff',
    headerTextShadow: '0 1px 3px rgba(0,0,0,0.3)',
    tableHeaderBg: '#1e3a8a',
    tableHeaderText: '#ffffff',
    rowBgA: '#ffffff',
    rowBgB: '#eff4fc',
    bodyTextColor: '#0f172a',
    highlightColor: '#2563eb',
    footerBg: '#eff4fc',
    footerTitleColor: '#1e3a8a',
    borderColor: '#cbd5e1'
  }
];

export function getTheme(id: string): PosterTheme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
