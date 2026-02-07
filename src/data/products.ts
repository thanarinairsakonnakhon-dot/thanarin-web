export type Product = {
    id: string;
    name: string;
    brand: 'Daikin' | 'Mitsubishi' | 'Carrier' | 'Haier' | 'Samsung';
    type: 'Wall' | 'Cassette' | 'Ceiling' | 'Portable';
    btu: number;
    seer: number;
    price: number;
    image: string;
    features: string[];
    inverter: boolean;
};

export const products: Product[] = [
    {
        id: 'dk-kq09',
        name: 'Daikin Sabai Inverter II (FTKQ-XV2S)',
        brand: 'Daikin',
        type: 'Wall',
        btu: 9200,
        seer: 17.49,
        price: 14900,
        image: '/images/daikin-ftkq.png',
        features: ['Inverter', 'กรองฝุ่น PM 2.5', 'ระบบป้องกันเชื้อรา'],
        inverter: true,
    },
    {
        id: 'dk-kq12',
        name: 'Daikin Sabai Inverter II (FTKQ-XV2S) 12000',
        brand: 'Daikin',
        type: 'Wall',
        btu: 12300,
        seer: 17.49,
        price: 17900,
        image: '/images/daikin-ftkq.png',
        features: ['Inverter', 'กรองฝุ่น PM 2.5', 'ระบบป้องกันเชื้อรา'],
        inverter: true,
    },
    {
        id: 'mit-gr13',
        name: 'Mitsubishi Electric Mr.Slim (MSY-GR13VF)',
        brand: 'Mitsubishi',
        type: 'Wall',
        btu: 12624,
        seer: 21.80,
        price: 21500,
        image: '/images/mitsubishi-gr.png',
        features: ['ระบบทำความเย็นเร็ว', 'แผ่นกรอง Nano Platinum', 'เคลือบสารลดการเกาะตัวของฝุ่น'],
        inverter: true,
    },
    {
        id: 'car-x10',
        name: 'Carrier XInverter Plus (TVAB010)',
        brand: 'Carrier',
        type: 'Wall',
        btu: 9200,
        seer: 24.00,
        price: 15900,
        image: '/images/carrier-xinverter.png',
        features: ['X-Ionizer ฟอกอากาศ', 'ลมแรงแต่ลมละมุน', 'ระบบทำความสะอาดตัวเอง'],
        inverter: true,
    },
    {
        id: 'haier-vns',
        name: 'Haier Clean Cool (HSU-10VNS03T)',
        brand: 'Haier',
        type: 'Wall',
        btu: 10000,
        seer: 16.00,
        price: 9900,
        image: '/images/haier-vns.png',
        features: ['เร่งความเย็น Turbo Cool', 'ส่งลมไกล Triple Airflow', 'เคลือบสารป้องกันสนิม'],
        inverter: true,
    },
    {
        id: 'dk-cst24',
        name: 'Daikin Cassette (FCF24CV2S)',
        brand: 'Daikin',
        type: 'Cassette',
        btu: 24200,
        seer: 19.50,
        price: 45000,
        image: '/images/daikin-cassette.png',
        features: ['กระจายลมรอบทิศทาง', 'เซ็นเซอร์อัจฉริยะ', 'ทำงานเงียบสนิท'],
        inverter: true,
    },
    {
        id: 'mit-ceil30',
        name: 'Mitsubishi Ceiling Suspended (PCY-SM30KAL)',
        brand: 'Mitsubishi',
        type: 'Ceiling',
        btu: 30000,
        seer: 18.20,
        price: 38500,
        image: '/images/mitsubishi-ceiling.png',
        features: ['กระจายลมกว้าง', 'โหมดเพดานสูง', 'ระบบเริ่มทำงานอัตโนมัติ'],
        inverter: true,
    }
];
