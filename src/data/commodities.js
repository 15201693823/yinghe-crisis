// ============================================================
// 商品数据定义
// ============================================================

const COMMODITY_DATA = {
    ore: {
        id: 'ore',
        name: '矿石',
        basePrice: 10,
        supply: 100,
        demand: 80,
        tariff: 0.15,
        stock: 200,
        icon: '⛏️',
        color: 0xd4a574,
        category: 'raw_material',
        cpiWeight: 0.15
    },
    food: {
        id: 'food',
        name: '食物',
        basePrice: 8,
        supply: 60,
        demand: 100,
        tariff: 0.10,
        stock: 150,
        icon: '🌾',
        color: 0x7bc67b,
        category: 'essential',
        cpiWeight: 0.30
    },
    tech: {
        id: 'tech',
        name: '科技产品',
        basePrice: 25,
        supply: 30,
        demand: 50,
        tariff: 0.20,
        stock: 80,
        icon: '🔧',
        color: 0x4ecdc4,
        category: 'manufactured',
        cpiWeight: 0.15
    },
    medicine: {
        id: 'medicine',
        name: '药品',
        basePrice: 15,
        supply: 20,
        demand: 40,
        tariff: 0.10,
        stock: 60,
        icon: '💊',
        color: 0xff6b9d,
        category: 'essential',
        cpiWeight: 0.20
    },
    fuel: {
        id: 'fuel',
        name: '燃料',
        basePrice: 12,
        supply: 50,
        demand: 70,
        tariff: 0.12,
        stock: 120,
        icon: '⛽',
        color: 0xffd93d,
        category: 'raw_material',
        cpiWeight: 0.20
    }
};
