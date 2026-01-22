import { ImageItem } from './types';

export const INITIAL_UNPLACED_IMAGES: ImageItem[] = [
    {
        id: 'img_3',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJqaV1eWGmuFyrA3idT_e56RDt4JC2abUb9onhQTRyK5lvalgh_7Q0Ip6XCZYGw3zb0MUc6vtpidE2pSQjrX59mrPPFg9FQ7VE93wzkrcwt0A9dcUp1_zm4UVqPdAU3X_plaL27SCiJDwS6qmb_DYnNHBgt-UixyHts09ubPs4e8rnvefeTmemzGaxnL0PHdTaPPIfsRgmAykx3cttP0fNZ2RluPZaFbFey3YxEqQtYG4aY1Y-Ww7mVyqeaIc8iVxjOFpjMoeYDeY',
        alt: 'Abstract red and blue pattern thumbnail',
        size: 2048 * 1024 // ~2MB mock
    },
    {
        id: 'img_4',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASXabBmN1uLYg93SpRZif6sGM13MoJV0RMYpHWlPHd4b3ojk4um-BcOZzaFo14P5Oi_AmNKGpoOLPVMqnHqP8xiAsxHGTLSA6WTehZFTah5dDTlcgmG-ZoL0stOuKayfhCSwkkq2D9JkiWDzg7SAAWYrxQ5-b6LhJYYO8MTNKT3Nl_kAsiwFT6NBc4lL1ec0-JZXDmxFuGEWkXLgW0aPPMpUuUhoOIA6dIJamP_09Q0up3fhapaiEHiBP2LS_MnQko9kemN3EtPEU',
        alt: 'Dark moody camera close up thumbnail',
        size: 3072 * 1024 // ~3MB mock
    }
];

export const INITIAL_PLACED_IMAGES: Record<number, ImageItem> = {
    0: {
        id: 'img_1',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyTYs8--oWIu8NXc1Tgfca2j1eMbRL5Iu-lKFre5Yv3RscxnMxZeB5XkMDs5O_FvLOSiXk5-Op0aQbpKg8LnulFvTza2pWkPdHNAwSvcQqTc0IQ5GVEhygWK6oMS5zu09SnBl7_XutZSsFp9Bqg9gAL_bx4rPyxdVWx5c_sExt79y890IepXlMjD8x7ZblWqrpJEdfCzWO_EmokBV8Vrmaf1UNaukc8VqpiyX9OKijoMsr_B0hc7mVwdkaz0Ih6EhtOZW3tjv0AhM',
        alt: 'Vibrant abstract pattern with red and blue swirls',
        size: 1024 * 1024 // ~1MB mock
    },
    1: {
        id: 'img_2',
        src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMDK8iXdGgQ1M_wrB8QhddOBXdBMQtHZJWVeIiViw4O8JOTM7crtzheGHVmx3zOayKQL1QdlZ0AvoXtYxbej8MCtcUhJtVuFgPQxxiNpxyD5_OD0WkrSzokw9Nc1zdOh9ni5eJreQxJNX2qdY9Yl-egi47W2qcKGLbsvDOHgpTIjDgQS7K8CcMIE9cHoM2t8japGXv1AomPghUjygqHItjWuOk_vFluH15AUZf2UR_OFPiKBOpudQVEIH2yYYAtMP-nZApEpUebXQ',
        alt: 'Close up of a vintage camera lens',
        size: 4096 * 1024 // ~4MB mock
    }
};
