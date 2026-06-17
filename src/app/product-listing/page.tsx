"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { productApi, getImageUrl, type Product } from "@/lib/api";
import { Loader2 } from 'lucide-react';

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

const ProductRows = ({ products, startIndex }: { products: Product[]; startIndex: number }) => (
    <tbody>
        {products.map((p, idx) => {
            const descList = p.overview?.overviewList?.length
                ? p.overview.overviewList
                : (p.description ? [p.description] : (p.shortDescription ? [p.shortDescription] : []));

            return (
                <tr key={p._id} className={idx % 2 === 0 ? "bg-white" : "bg-[#fdfbf6]"}>
                    <td className="border border-[#e0d6c8] text-center py-3 font-serif text-sm text-gray-700">{startIndex + idx + 1}</td>
                    <td className="border border-[#e0d6c8] text-center p-0.5">
                        <div className="w-24 h-16 mx-auto flex items-center justify-center">
                            <img src={p.images?.[0] ? getImageUrl(p.images[0]) : 'https://placehold.co/120x80?text=Image'} 
                                alt={p.title} className="object-contain max-w-full max-h-full"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/120x80?text=Image'; }} />
                        </div>
                    </td>
                    <td className="border border-[#e0d6c8] text-center font-semibold text-[11px] px-1.5 text-gray-800">{p.title}</td>
                    <td className="border border-[#e0d6c8] text-center font-semibold text-[11px] px-1.5 text-gray-800">{p.code}</td>
                    <td className="border border-[#e0d6c8] text-center px-1.5 text-[11px] font-bold">
                        {p.price ? `₹${p.price.toLocaleString("en-IN")}` : ""}
                    </td>
                    <td className="border border-[#e0d6c8] px-4 py-2.5">
                        <ul className="list-disc pl-3 text-left space-y-0.5 text-[11px] text-gray-700">
                            {descList.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    </td>
                    <td className="border border-[#e0d6c8] text-center px-1.5"></td>
                    <td className="border border-[#e0d6c8] text-center px-1.5 text-[11px] text-gray-700">{p.material}</td>
                </tr>
            );
        })}
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
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const result = await productApi.list();
            setProducts(result.products || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const pages = useMemo(() => {
        if (products.length === 0) return [];
        const itemsPerPageFirst = 8;
        const itemsPerPageRest = 14;
        const p = [];
        // First page
        p.push(products.slice(0, itemsPerPageFirst));
        // Rest of the pages
        for (let i = itemsPerPageFirst; i < products.length; i += itemsPerPageRest) {
            p.push(products.slice(i, i + itemsPerPageRest));
        }
        return p;
    }, [products]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center h-full p-20">
            <Loader2 className="animate-spin text-[#013b28]" size={48} />
        </div>
    );

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
                    {pages[0] && (
                        <table className="w-full border-collapse text-center">
                            <TableHeader />
                            <ProductRows products={pages[0]} startIndex={0} />
                        </table>
                    )}
                </div>
                <FooterNote />
                <Footer />
            </div>

            {/* ===== PAGES 2–6 ===== */}
            {pages.length > 1 && pages.slice(1).map((page, pageIdx) => {
                const startIndex = 8 + (pageIdx * 14);
                return (
                    <div key={pageIdx} className="w-full max-w-[1200px] bg-white shadow-2xl overflow-hidden">
                        <MiniFeatureBar />
                        <div className="px-6 mt-3 mb-2">
                            <table className="w-full border-collapse text-center">
                                <TableHeader />
                                <ProductRows products={page} startIndex={startIndex} />
                            </table>
                        </div>
                        <FooterNote />
                        <Footer />
                    </div>
                );
            })}

        </div>
    );
};

export default EnsisPriceList;