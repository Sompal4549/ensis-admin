"use client";
import React from 'react';

const topFeatures = [
    { title: "PREMIUM QUALITY", desc: "High-grade materials and superior finish", img: "/images/PREMIUM.png" },
    { title: "DURABLE & RELIABLE", desc: "Built for long-lasting performance", img: "/images/DURABLE & RELIABLE.png" },
    { title: "TRADITIONAL DESIGN", desc: "Authentic Ayurveda heritage", img: "/images/TRADITIONAL DESIGN.png" },
    { title: "ERGONOMIC & COMFORTABLE", desc: "Designed for therapist & client comfort", img: "/images/ERGONOMIC & COMFORTABLE.png" },
    { title: "MADE FOR WELLNESS", desc: "Ideal for Ayurvedic centres & spas", img: "/images/MADE FOR WELLNESS.png" },
];

const bottomFeatures = [
    { title: "100% Quality Assured", desc: "Strict quality check on every product", img: "/images/100%25 Quality Assured.png" },
    { title: "Customisation Available", desc: "Modify size, design & features as per need", img: "/images/Customisation Available.png" },
    { title: "Pan India Delivery", desc: "Safe & secure packing with timely delivery", img: "/images/Pan India Delivery.png" },
    { title: "After Sale Support", desc: "Dedicated support for a worry-free experience", img: "/images/After Sale.png" },
    { title: "Trusted by Professionals", desc: "Preferred choice of leading Ayurvedic centres & spas", img: "/images/Trusted by Professionals.png" },
];

const allProducts = [
    { sno: 1, name: 'SHIRODHARA STAND', code: 'ENS - 001', desc: ['Premium teak wood construction', 'Adjustable hanging support', 'Traditional Ayurvedic design'], material: 'Teak Wood & Brass', img: '/images/ENS-001.png' },
    { sno: 2, name: 'DRONI BED', code: 'ENS - 002', desc: ['Comfortable therapy surface', 'Integrated oil drainage system', 'Heavy-duty wooden structure'], material: 'Premium Teak Wood', img: '/images/ENS-002.png' },
    { sno: 3, name: 'STEAM CHAMBER (SITTING)', code: 'ENS - 003', desc: ['Compact sitting steam therapy unit', 'Heat-resistant wooden body', 'Easy access door design'], material: 'Teak Wood & Marine Plywood', img: '/images/ENS-003.png' },
    { sno: 4, name: 'STEAM CHAMBER (LY DOWN)', code: 'ENS - 004', desc: ['Full body steam therapy support', 'Comfortable lying platform', 'Durable insulated construction'], material: 'Teak Wood & Insulated Panels', img: '/images/ENS-004.png' },
    { sno: 5, name: 'SHIRODHARA BED', code: 'ENS - 005', desc: ['Smooth oil flow channel', 'Comfortable patient positioning', 'Premium polished finish'], material: 'Teak Wood & PU Cushion', img: '/images/ENS-005.png' },
    { sno: 6, name: 'MASSAGE BED (WITH CRADLE)', code: 'ENS - 006', desc: ['Adjustable head support', 'High-density cushioning', 'Stable wooden frame'], material: 'Teak Wood, Foam & Leatherette', img: '/images/ENS-006.png' },
    { sno: 7, name: 'MASSAGE BED (WITHOUT CRADLE)', code: 'ENS - 007', desc: ['Spacious therapy platform', 'Strong load-bearing design', 'Easy maintenance surface'], material: 'Teak Wood & Foam Cushion', img: '/images/ENS-007.png' },
    { sno: 8, name: 'PORTABLE BED', code: 'ENS - 008', desc: ['Foldable lightweight design', 'Height adjustable legs', 'Easy transportation support'], material: 'Aluminium Frame & PU Leather', img: '/images/ENS-008.png' },
    { sno: 9, name: 'MASSAGE BED (WITH STORAGE)', code: 'ENS - 009', desc: ['Built-in storage', 'Premium finish', 'Comfortable design'], material: 'Teak Wood & Foam Cushion', img: '/images/ENS-009.png' },
    { sno: 10, name: 'AYURVEDIC PANCHAKARMA BED CUM STEAM CHAMBER', code: 'ENS - 010', desc: ['Therapy & steam combo', 'Space-saving design', 'Durable structure'], material: 'Teak Wood & Steam Insulation', img: '/images/ENS-010.png' },
    { sno: 11, name: 'MASSAGE BED (WITHOUT CRADLE)', code: 'ENS - 011', desc: ['Wide therapy surface', 'Strong frame', 'Premium polish'], material: 'Teak Wood & Foam', img: '/images/ENS-011.png' },
    { sno: 12, name: 'MASSAGE BED (WITH CRADLE)', code: 'ENS - 012', desc: ['Adjustable cradle', 'Comfortable support', 'Spa-use design'], material: 'Teak Wood & PU Foam', img: '/images/ENS-012.png' },
    { sno: 13, name: 'MASSAGE BED', code: 'ENS - 013', desc: ['Ergonomic design', 'Durable structure', 'Soft cushioning'], material: 'Solid Teak Wood', img: '/images/ENS-013.png' },
    { sno: 14, name: 'MASSAGE BED (WITH STORAGE)', code: 'ENS - 014', desc: ['Storage shelves', 'Luxury finish', 'Professional use'], material: 'Teak Wood & Cushion', img: '/images/ENS-014.png' },
    { sno: 15, name: 'WOODEN STEP', code: 'ENS - 015', desc: ['Anti-slip surface', 'Compact design', 'Strong support'], material: 'Hardwood', img: '/images/ENS-015.png' },
    { sno: 16, name: 'HERBAL STORAGE CABINET', code: 'ENS - 016', desc: ['Organized herbal storage system', 'Multiple utility compartments', 'Premium wooden construction'], material: 'Teak Wood & Glass', img: '/images/ENS-016.png' },
    { sno: 17, name: 'WOODEN STEAM CHAMBER – SITTING', code: 'ENS - 017', desc: ['Comfortable seated steam therapy', 'Heat-insulated wooden body', 'Compact professional design'], material: 'Teak Wood & Steam Insulation', img: '/images/ENS-017.png' },
    { sno: 18, name: 'ROYAL STEAM CHAMBER-SITTING', code: 'ENS - 018', desc: ['Luxury steam therapy', 'Heat insulation', 'Elegant finish'], material: 'Cedar Wood', img: '/images/ENS-018.png' },
    { sno: 19, name: 'WOODEN STEAM CHAMBER – STANDING', code: 'ENS - 019', desc: ['Full standing steam support', 'Spacious interior design', 'Durable thermal insulation'], material: 'Cedar Wood & Steam Panels', img: '/images/ENS-019.png' },
    { sno: 20, name: 'THERAPIST STOOL', code: 'ENS - 020', desc: ['Comfortable mobility support', 'Adjustable ergonomic seating', 'Durable heavy-duty frame'], material: 'Steel Frame & PU Cushion', img: '/images/ENS-020.png' },
    { sno: 21, name: 'SPA TROLLEY', code: 'ENS - 021', desc: ['Utility storage', 'Smooth wheels', 'Compact design'], material: 'Wood & Steel', img: '/images/ENS-021.png' },
    { sno: 22, name: 'SIDE TABLE', code: 'ENS - 022', desc: ['Elegant finish', 'Durable top', 'Modern design'], material: 'Solid Wood', img: '/images/ENS-022.png' },
    { sno: 23, name: 'SPA TEOLLEY', code: 'ENS - 023', desc: ['Multi-storage shelves', 'Easy movement', 'Spa utility use'], material: 'Premium Wood', img: '/images/ENS-023.png' },
    { sno: 24, name: 'SIDE TABLE', code: 'ENS - 024', desc: ['Stylish design', 'Strong structure', 'Compact utility'], material: 'Hardwood', img: '/images/ENS-024.png' },
    { sno: 25, name: 'WOODEN STEP', code: 'ENS - 025', desc: ['Anti-slip surface finish', 'Strong wooden support', 'Compact ergonomic design'], material: 'Solid Wood', img: '/images/ENS-025.png' },
    { sno: 26, name: 'STOOL', code: 'ENS - 026', desc: ['Lightweight durable frame', 'Comfortable seating height', 'Premium wood finish'], material: 'Teak Wood', img: '/images/ENS-026.png' },
    { sno: 27, name: 'STOOL', code: 'ENS - 027', desc: ['Compact therapist seating', 'Long-lasting structure', 'Elegant modern design'], material: 'Wooden Frame & Cushion', img: '/images/ENS-027.png' },
    { sno: 28, name: 'STOOL', code: 'ENS - 028', desc: ['Multipurpose utility stool', 'Strong square frame', 'Easy movement support'], material: 'Solid Wood', img: '/images/ENS-028.png' },
    { sno: 29, name: 'SAUNA CABIN', code: 'ENS - 029', desc: ['Premium sauna experience', 'Efficient heat insulation', 'Luxury wellness finish'], material: 'Canadian Cedar Wood', img: '/images/ENS-029.png' },
    { sno: 30, name: 'PATRA POTLI', code: 'ENS - 030', desc: ['Traditional Ayurvedic therapy use', 'Herbal treatment support', 'Comfortable application design'], material: 'Cotton Fabric & Herbal Mix', img: '/images/ENS-030.png' },
    { sno: 31, name: 'NADI SWEDEN YANTRA (12LTR)', code: 'ENS - 031', desc: ['Traditional steam therapy unit', 'High-capacity vessel design', 'Durable stainless structure'], material: 'Stainless Steel & Copper', img: '/images/ENS-031.png' },
    { sno: 32, name: 'OIL DIFFUSER', code: 'ENS - 032', desc: ['Aromatherapy fragrance support', 'Elegant compact design', 'Quiet operation performance'], material: 'Ceramic & Wood Finish', img: '/images/ENS-032.png' },
    { sno: 33, name: 'WELCOME TRAY', code: 'ENS - 033', desc: ['Premium hospitality accessory', 'Elegant presentation style', 'Durable easy-clean surface'], material: 'Wood & MDF', img: '/images/ENS-033.png' },
    { sno: 34, name: 'MULTI PURPOSE TRAY', code: 'ENS - 034', desc: ['Multiple storage compartments', 'Lightweight wooden design', 'Utility-focused structure'], material: 'Wooden Board & Laminate', img: '/images/ENS-034.png' },
    { sno: 35, name: 'OIL WARMER', code: 'ENS - 035', desc: ['Uniform oil heating system', 'Temperature control support', 'Compact therapy equipment'], material: 'Stainless Steel', img: '/images/ENS-035.png' },
    { sno: 36, name: 'STONE HEATER', code: 'ENS - 036', desc: ['Fast heating performance', 'Professional spa application', 'Durable insulated body'], material: 'Stainless Steel & Heating Coil', img: '/images/ENS-036.png' },
    { sno: 37, name: 'TOWEL HEATER', code: 'ENS - 037', desc: ['Quick towel warming support', 'Hygienic enclosed chamber', 'Energy-efficient operation'], material: 'Stainless Steel Body', img: '/images/ENS-037.png' },
    { sno: 38, name: 'BRONZE POLISHED WRAP – 3" DIA', code: 'ENS - 038', desc: ['Traditional bronze craftsmanship', 'Premium polished surface', 'Ayurvedic therapy utility'], material: 'Pure Bronze', img: '/images/ENS-038.png' },
    { sno: 39, name: 'BRONZE MOTAR & PESTLE', code: 'ENS - 039', desc: ['Heavy-duty bronze material', 'Traditional grinding support', 'Long-lasting durability'], material: 'Heavy Bronze', img: '/images/ENS-039.png' },
    { sno: 40, name: 'BRONZE NASYA YANTRA BIG', code: 'ENS - 040', desc: ['Authentic Ayurvedic accessory', 'Smooth bronze finishing', 'Comfortable therapy application'], material: 'Pure Bronze', img: '/images/ENS-040.png' },
    { sno: 41, name: 'BRONZE NASYA YANTRA SMALL', code: 'ENS - 041', desc: ['Compact treatment support', 'Lightweight bronze body', 'Traditional handcrafted design'], material: 'Bronze', img: '/images/ENS-041.png' },
    { sno: 42, name: 'BRONZE BOWL WITH HANDLE', code: 'ENS - 042', desc: ['Easy grip handle support', 'Multipurpose therapy use', 'Premium bronze finish'], material: 'Bronze Metal', img: '/images/ENS-042.png' },
    { sno: 43, name: 'BRONZE GHATI YANTRA', code: 'ENS - 043', desc: ['Traditional Ayurvedic vessel', 'Elegant handcrafted design', 'Durable metal construction'], material: 'Handcrafted Bronze', img: '/images/ENS-043.png' },
    { sno: 44, name: 'BRONZE OIL BOWL', code: 'ENS - 044', desc: ['Compact oil holding bowl', 'Smooth polished finish', 'Heat-resistant bronze material'], material: 'Pure Bronze', img: '/images/ENS-044.png' },
    { sno: 45, name: 'BRONZE POLISHED URULI – 9" DIA', code: 'ENS - 045', desc: ['Decorative wellness accessory', 'Premium handcrafted polish', 'Traditional therapy utility'], material: 'Premium Bronze', img: '/images/ENS-045.png' },
    { sno: 46, name: 'BRONZE POLISHED URULI – 12" DIA', code: 'ENS - 046', desc: ['Large premium uruli design', 'Elegant bronze finishing', 'Ideal for spa décor'], material: 'Premium Bronze', img: '/images/ENS-046.png' },
    { sno: 47, name: 'BRONZE POLISHED WRAP – 9" DIA', code: 'ENS - 047', desc: ['Premium wide bowl structure', 'Traditional Ayurvedic styling', 'Durable bronze material'], material: 'Bronze', img: '/images/ENS-047.png' },
    { sno: 48, name: 'BRONZE POLISHED WRAP – 5" DIA', code: 'ENS - 048', desc: ['Compact handcrafted vessel', 'Smooth polished finish', 'Multi-therapy usage'], material: 'Bronze', img: '/images/ENS-048.png' },
    { sno: 49, name: 'BRONZE STEVAN PATRA', code: 'ENS - 049', desc: ['Traditional pouring vessel', 'Fine handcrafted detailing', 'Long-lasting bronze finish'], material: 'Pure Bronze', img: '/images/ENS-049.png' },
    { sno: 50, name: 'BRONZE THAVI', code: 'ENS - 050', desc: ['Easy handling support', 'Premium bronze construction', 'Multipurpose therapy utility'], material: 'Bronze', img: '/images/ENS-050.png' },
    { sno: 51, name: 'BRONZE THAVI', code: 'ENS - 051', desc: ['Durable traditional design', 'Comfortable grip support', 'Smooth polished texture'], material: 'Bronze', img: '/images/ENS-051.png' },
    { sno: 52, name: 'BRONZE DHOOMA PANANETRAM', code: 'ENS - 052', desc: ['Traditional Ayurvedic equipment', 'Precision handcrafted body', 'Premium metallic finish'], material: 'Handcrafted Bronze', img: '/images/ENS-052.png' },
    { sno: 53, name: 'BRONZE BASTI NETRA', code: 'ENS - 053', desc: ['Authentic therapy accessory', 'Lightweight durable structure', 'Smooth precision finish'], material: 'Bronze', img: '/images/ENS-053.png' },
    { sno: 54, name: 'BRONZE NILAVILAKKU', code: 'ENS - 054', desc: ['Traditional decorative lamp', 'Elegant handcrafted detailing', 'Premium bronze shine'], material: 'Pure Bronze', img: '/images/ENS-054.png' },
    { sno: 55, name: 'BRASS SHIRODHARA POT HEAVY DUTY', code: 'ENS - 055', desc: ['Heavy-duty brass structure', 'Smooth oil flow mechanism', 'Traditional hanging support'], material: 'Heavy Brass', img: '/images/ENS-055.png' },
    { sno: 56, name: 'SHIRODHARA POT', code: 'ENS - 056', desc: ['Premium hanging vessel', 'Traditional Ayurvedic use', 'Elegant polished finish'], material: 'Brass', img: '/images/ENS-056.png' },
    { sno: 57, name: 'TONG WITH TRAY', code: 'ENS - 057', desc: ['Easy handling support', 'Compact utility design', 'Durable metal construction'], material: 'Stainless Steel', img: '/images/ENS-057.png' },
    { sno: 58, name: 'YOGA MAT – 2 METER', code: 'ENS - 058', desc: ['Anti-slip yoga surface', 'Comfortable cushioning support', 'Lightweight portable design'], material: 'EVA Foam', img: '/images/ENS-058.png' },
    { sno: 59, name: 'YOGA BRICK', code: 'ENS - 059', desc: ['Strong balancing support', 'Lightweight foam structure', 'Ideal for stretching exercises'], material: 'EVA Foam Block', img: '/images/ENS-059.png' },
    { sno: 60, name: '', code: 'ENS - 060', desc: [], material: '', img: '/images/ENS-060.png' },
    { sno: 61, name: 'INFRARED LAMP', code: 'ENS - 061', desc: ['Deep heat therapy support', 'Adjustable lighting angle', 'Compact therapy equipment'], material: 'Metal Body & Glass Lamp', img: '/images/ENS-061.png' },
    { sno: 62, name: 'AROMA OILS 1LTR BOTTLE (ALUMINIUM BOTTLE)', code: 'ENS - 062', desc: ['Premium aromatic formulation', 'Long-lasting fragrance support', 'Secure aluminium packaging'], material: 'Essential Oil & Aluminium Bottle', img: '/images/ENS-062.png' },
    { sno: 63, name: 'SALT LAMP (3–5KG)', code: 'ENS - 063', desc: ['Natural Himalayan salt glow', 'Relaxing wellness ambiance', 'Elegant decorative finish'], material: 'Himalayan Salt Crystal', img: '/images/ENS-063.png' },
    { sno: 64, name: 'COPPER/BRASS OIL VESSELS', code: 'ENS - 064', desc: ['Traditional oil storage support', 'Premium handcrafted finish', 'Durable copper/brass material'], material: 'Copper & Brass', img: '/images/ENS-064.png' },
    { sno: 65, name: 'COPPER/BRASS FOOT BATH VESSEL', code: 'ENS - 065', desc: ['Traditional wellness therapy use', 'Elegant handcrafted structure', 'Durable metallic finish'], material: 'Pure Copper & Brass', img: '/images/ENS-065.png' },
    { sno: 66, name: 'PURE COPPER WATER JUG SET', code: 'ENS - 066', desc: ['Pure copper wellness utility', 'Traditional health benefits', 'Elegant premium appearance'], material: '100% Pure Copper', img: '/images/ENS-066.png' },
    { sno: 67, name: 'STEAM GENERATOR', code: 'ENS - 067', desc: ['Fast steam production system', 'Energy-efficient operation', 'Professional spa performance'], material: 'Stainless Steel & Copper Coil', img: '/images/ENS-067.png' },
    { sno: 68, name: 'BRASS POTALI SET', code: 'ENS - 068', desc: ['Traditional Panchkarma utility', 'Premium brass craftsmanship', 'Durable therapy application'], material: 'Brass & Cotton Cloth', img: '/images/ENS-068.png' },
    { sno: 69, name: 'AROMA DIFFUSER', code: 'ENS - 069', desc: ['Relaxing fragrance distribution', 'Modern compact structure', 'Quiet performance system'], material: 'Ceramic & ABS Plastic', img: '/images/ENS-069.png' },
    { sno: 70, name: 'KIZHI HEATING UNIT', code: 'ENS - 070', desc: ['Uniform herbal heating support', 'Professional therapy equipment', 'Temperature-controlled operation'], material: 'Stainless Steel & Heating Coil', img: '/images/ENS-070.png' },
];

const pages = [
    { products: allProducts.slice(0, 8) },
    { products: allProducts.slice(8, 22) },
    { products: allProducts.slice(22, 36) },
    { products: allProducts.slice(36, 50) },
    { products: allProducts.slice(50, 64) },
    { products: allProducts.slice(64, 70) },
];

const PhoneIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.4-1.2-.6-2.4-.6-3.6 0-.6-.5-1-1-1H4c-.6 0-1 .5-1 1 0 9.4 7.6 17 17 17 .6 0 1-.5 1-1v-3.5c0-.6-.5-1-1-1z" />
    </svg>
);

const WebIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

const MailIcon = () => (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

const LotusIcon = () => (
    <svg viewBox="0 0 60 60" className="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 48 C30 48 12 36 12 24 C12 18 18 14 24 16 C24 16 24 8 30 6 C36 8 36 16 36 16 C42 14 48 18 48 24 C48 36 30 48 30 48Z" fill="#c99b3b" opacity="0.85" />
        <path d="M30 48 C30 48 18 38 16 28 C19 30 22 30 24 28 C26 34 28 40 30 48Z" fill="#a07828" />
        <path d="M30 48 C30 48 42 38 44 28 C41 30 38 30 36 28 C34 34 32 40 30 48Z" fill="#a07828" />
        <path d="M30 6 C30 6 28 14 28 20 C28 26 30 30 30 30 C30 30 32 26 32 20 C32 14 30 6 30 6Z" fill="#e8b84b" />
        <circle cx="30" cy="30" r="3" fill="#fff" opacity="0.3" />
    </svg>
);

const FooterNote = () => (
    <div className="px-6 py-2 bg-white text-[10px] text-gray-700 border-b-4 border-[#013b28]">
        Note: GST Extra | Transport Charges Extra | Prices are subject to change without prior notice | Warranty: 1 Year on Manufacturing Defect
    </div>
);

const Footer = () => (
    <div className="bg-[#013b28] flex justify-between items-center px-8 relative h-[72px]">
        <div className="flex gap-8 z-10 text-[13px] font-semibold items-center text-white">
            <div className="flex items-center gap-2">
                <PhoneIcon /> <span className='text-lg font-medium'>+91-9654900525</span>
            </div>
            <div className="flex items-center gap-2">
                <WebIcon /> <span className='text-lg font-medium'>www.ensis.in</span>
            </div>
            <div className="flex items-center gap-2">
                <MailIcon /> <span className='text-lg font-medium'>info@ensis.in</span>
            </div>
        </div>
        <div className="absolute right-0 -top-8 bottom-0 w-[270px] z-10">
            <div
                className="absolute inset-y-0 -right-12 left-0 bg-[#0d261a] border-l-[3px] border-t-[3px] border-[#c99b3b] rounded-tl-[70px]"
                style={{ transform: 'skewX(-25deg)', transformOrigin: 'bottom left' }}
            />
            <div className="relative z-10 flex h-full flex-col items-center justify-center pl-12 pt-2 gap-1.5">
                <img src="/images/Healing Tradition Modern Wellness.png" alt="lotus" className="h-[60px] object-contain" />
                <span className="text-[12px] font-medium text-[#c99b3b] text-center leading-tight tracking-wide">
                    Healing Tradition<br />Modern Wellness
                </span>
            </div>
        </div>
    </div>
);

const TableHeader = () => (
    <thead>
        <tr className="bg-[#013b28] text-white text-[11px]">
            <th className="border-r border-white/20 py-2.5 px-1 w-10 font-semibold">S.No.</th>
            <th className="border-r border-white/20 py-2.5 px-1 w-28 font-semibold">PRODUCT IMAGE</th>
            <th className="border-r border-white/20 py-2.5 px-1 w-36 font-semibold">PRODUCT NAME</th>
            <th className="border-r border-white/20 py-2.5 px-1 w-24 font-semibold">PRODUCT CODE</th>
            <th className="border-r border-white/20 py-2.5 px-1 w-20 font-semibold">MRP</th>
            <th className="border-r border-white/20 py-2.5 px-1 font-semibold">DESCRIPTION / DETAILS</th>
            <th className="border-r border-white/20 py-2.5 px-1 w-28 font-semibold">DIMENSIONS (L × W × H)</th>
            <th className="py-2.5 px-1 w-28 font-semibold">MATERIAL</th>
        </tr>
    </thead>
);

const ProductRows = ({ products }: { products: typeof allProducts }) => (
    <tbody>
        {products.map((p, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#fdfbf6]"}>
                <td className="border border-[#e0d6c8] text-center py-3 font-serif text-sm text-gray-700">{p.sno}</td>
                <td className="border border-[#e0d6c8] text-center p-0.5">
                    <div className="w-24 h-16 mx-auto flex items-center justify-center">
                        <img src={p.img} alt={p.name} className="object-contain max-w-full max-h-full"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/120x80?text=Image'; }} />
                    </div>
                </td>
                <td className="border border-[#e0d6c8] text-center font-semibold text-[11px] px-1.5 text-gray-800">{p.name}</td>
                <td className="border border-[#e0d6c8] text-center font-semibold text-[11px] px-1.5 text-gray-800">{p.code}</td>
                <td className="border border-[#e0d6c8] text-center px-1.5"></td>
                <td className="border border-[#e0d6c8] px-4 py-2.5">
                    <ul className="list-disc pl-3 text-left space-y-0.5 text-[11px] text-gray-700">
                        {p.desc.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                </td>
                <td className="border border-[#e0d6c8] text-center px-1.5"></td>
                <td className="border border-[#e0d6c8] text-center px-1.5 text-[11px] text-gray-700">{p.material}</td>
            </tr>
        ))}
    </tbody>
);

const MiniFeatureBar = () => (
    <div className="bg-white px-6 py-3 border-b border-gray-200">
        <div className="flex justify-between gap-3">
            {bottomFeatures.map((feat, idx) => (
                <div key={idx} className="flex gap-2.5 items-center bg-white rounded-lg border border-gray-200 p-2.5 w-1/5 shadow-sm">
                    <img src={feat.img} alt={feat.title} className="w-9 h-9 object-contain shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <div>
                        <h3 className="font-semibold text-[11px] text-gray-800 leading-tight">{feat.title}</h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{feat.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const EnsisPriceList = () => {
    return (
        <div className="min-h-screen flex flex-col items-center py-2 font-sans bg-gray-100 gap-4">

            {/* ===== PAGE 1 ===== */}
            <div className="w-full max-w-[1200px] bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative w-full h-[420px] bg-[#fdfaf2] overflow-hidden">
                    <div className="absolute top-0 right-0 h-[580px] w-full">
                        <img src="/images/Ensis Product prices List.jpg" alt="Header" className="w-full h-full object-fill" />
                    </div>
                    <div className="absolute top-0 right-0 p-6 z-20">
                        <img src="/images/logo.png" alt="Ensis Logo" className="w-65" />
                    </div>
                    <div className="absolute top-9 left-28 z-20">
                        <h1 className="text-7xl font-serif font-bold text-[#013b28] tracking-wider"
                            style={{ textShadow: '0 0 30px #fff, 0 0 60px #fff' }}>
                            PRICE LIST
                        </h1>
                        <div className="flex items-center mt-4 pl-10">
                            <div className="h-[2px] w-20 bg-[#b58c42]"></div>
                            <div className="px-6 py-1.5 bg-[#013b28] text-white font-semibold text-xl rounded-full border-2 border-[#b58c42] mx-3 shadow-lg">
                                Dealer Price
                            </div>
                            <div className="h-[2px] w-20 bg-[#b58c42]"></div>
                        </div>
                        <h2 className="mt-4 text-2xl font-serif font-semibold text-[#333] tracking-wide">Premium Panchkarmaa Equipments</h2>
                    </div>
                </div>

                {/* Green top features */}
                <div className="bg-linear-to-r from-[#1c3226] to-[#0f2318] text-white pt-7 pb-6 px-6">
                    <div className="flex justify-between items-start gap-3">
                        {topFeatures.map((feat, idx) => (
                            <div key={idx} className="flex gap-3 items-center w-1/5">
                                <img src={feat.img} alt={feat.title} className="w-12 h-12 object-contain shrink-0"
                                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <h3 className="font-semibold text-[11px] uppercase leading-snug">{feat.title}</h3>
                                    <p className="text-[10px] text-[#b4d1c4] mt-0.5 leading-tight">{feat.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <MiniFeatureBar />

                <div className="px-6 mt-3 mb-2">
                    <table className="w-full border-collapse text-center">
                        <TableHeader />
                        <ProductRows products={pages[0].products} />
                    </table>
                </div>
                <FooterNote />
                <Footer />
            </div>

            {/* ===== PAGES 2–6 ===== */}
            {pages.slice(1).map((page, pageIdx) => (
                <div key={pageIdx} className="w-full max-w-[1200px] bg-white shadow-2xl overflow-hidden">
                    <MiniFeatureBar />
                    <div className="px-6 mt-3 mb-2">
                        <table className="w-full border-collapse text-center">
                            <TableHeader />
                            <ProductRows products={page.products} />
                        </table>
                    </div>
                    <FooterNote />
                    <Footer />
                </div>
            ))}

        </div>
    );
};

export default EnsisPriceList;