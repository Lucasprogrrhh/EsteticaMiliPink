import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleReserveClick = () => {
        navigate('/reservar');
    };

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden w-full m-0 p-0">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-[0px_10px_30px_rgba(179,0,105,0.08)] border-none">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-['Noto_Serif'] italic font-black text-pink-700 dark:text-pink-500">
                        Mili Belleza Study
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a className="font-['Noto_Serif'] font-bold tracking-tight text-pink-700 dark:text-pink-300 border-b-2 border-pink-700 pb-1 transition-all duration-300 hover:opacity-80" href="#servicios">Servicios</a>
                        <a className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80" href="#cursos">Cursos</a>
                        <a className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80" href="#portfolio">Portfolio</a>
                        <a className="font-['Noto_Serif'] font-bold tracking-tight text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-all duration-300 hover:opacity-80" href="#promociones">Promociones</a>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link to="/dashboard" className="text-sm font-bold text-pink-700 hover:text-pink-600 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">dashboard</span>
                                Mi Panel
                            </Link>
                        ) : (
                            <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-pink-600">
                                Iniciar Sesión
                            </Link>
                        )}
                        <button 
                            onClick={handleReserveClick}
                            className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:opacity-80 active:scale-95 duration-150"
                        >
                            Reservar
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mesh-gradient">
                {/* Hero Section */}
                <section className="relative min-h-[921px] flex items-center pt-20 pb-12 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                        {/* Hero Content */}
                        <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-medium text-sm tracking-wide">
                                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                                <span>ESTÉTICA INTEGRAL & CAPACITACIÓN</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-headline font-black text-on-surface leading-[1.1] tracking-tight">
                                Tu belleza, <br/>
                                <span className="text-primary italic">nuestra pasión</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed">
                                Servicios premium y capacitaciones profesionales en manicuría, pestañas y estética integral.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button onClick={handleReserveClick} className="bg-primary text-on-primary px-10 py-5 rounded-xl font-bold text-lg shadow-[0px_10px_30px_rgba(179,0,105,0.2)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                                    <span>Reservar turno</span>
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </button>
                                <a href="#cursos" className="inline-flex bg-secondary-container text-on-secondary-container px-10 py-5 rounded-xl font-bold text-lg border-2 border-transparent hover:border-outline-variant/30 transition-all items-center justify-center gap-2">
                                    <span>Ver cursos</span>
                                    <span className="material-symbols-outlined">school</span>
                                </a>
                            </div>
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-6 pt-12 border-t border-outline-variant/20">
                                <div>
                                    <div className="text-3xl font-headline font-bold text-primary">11.5k+</div>
                                    <div className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Seguidores</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-headline font-bold text-primary">500+</div>
                                    <div className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Alumnas</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-headline font-bold text-primary">5+</div>
                                    <div className="text-sm font-label uppercase tracking-widest text-on-surface-variant">Años Exp.</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visuals */}
                        <div className="lg:col-span-5 order-1 lg:order-2 relative">
                            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden group">
                                {/* Main Hero Image */}
                                <img alt="Mili professional portrait" className="w-full h-full object-cover rounded-lg transform transition-transform duration-700 group-hover:scale-110" data-alt="Professional portrait of Mili, a stylish aesthetician in a modern pink-themed studio." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbGPOvP8TN4y0yGTBsv_EIwbIgSa_1sXeEn14GGmLoCK2me-OmvTBwaK5n9p2Sek87t7rwWj4bdEDLVCV97o-sIOln73hWz2sImH4_U_XJwyWtVPn1C5NmLkCrSbJRJW9_GKTdCHUlrmfJ4eVN0fg0vNuWUaqNA-NLccFGeL05Byd3_AwsTluGMEqISwtpljCWKpkjHJ01KQhhniRG_qhO2vqHEZwb3TDbDkBgtY88_i711uDkkB-EdsaTn-0m6H-2lbJJf8ggZxo" />
                                {/* Floating Glass Cards */}
                                <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-lg border border-white/30 shadow-2xl hidden md:block">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center text-white">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>spa</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface">Premium Care</p>
                                            <p className="text-xs text-on-surface-variant">Técnicas exclusivas</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Sparkle Decorations */}
                                <div className="absolute -top-4 -right-4 text-tertiary-container animate-pulse">
                                    <svg fill="currentColor" height="48" viewBox="0 0 24 24" width="48">
                                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"></path>
                                    </svg>
                                </div>
                                <div className="absolute top-1/4 -left-8 text-primary-fixed-dim opacity-60">
                                    <svg fill="currentColor" height="32" viewBox="0 0 24 24" width="32">
                                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"></path>
                                    </svg>
                                </div>
                            </div>
                            {/* Floating Icons */}
                            <div className="absolute top-0 right-0 p-4 bg-white/20 backdrop-blur-md rounded-full transform translate-x-1/2 -translate-y-1/2 border border-white/50">
                                <span className="material-symbols-outlined text-primary text-4xl" data-icon="brush">brush</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Section (Asymmetric Bento) */}
                <section id="servicios" className="py-24 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                            {/* Image Column (Editorial bleed) */}
                            <div className="md:col-span-5 relative">
                                <div className="sticky top-24">
                                    <div className="rounded-lg overflow-hidden h-[600px] shadow-2xl">
                                        <img alt="Professional manicure and nail art session" className="w-full h-full object-cover" data-alt="Close-up of professional nail artist hands working with golden details and intricate artistic patterns in a high-end luxury spa" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxgCw20cCbMfOWdNchscPIScskCMkC5mQqziC-YAxn8habm4GFAdjRNeJqTa4Hz_fnUCWkKgZgEEKrdigc0Asfd6tXXFLPh7sQYCCFCXC-nde41AB1MoZNJjPe0BXbOmGdgtKkYhDJGjIwt_3TJMxdeyXmNYcgW0_UxBFpLq1acX8xkO_Z4yTjFti4LWm6bcL4_mn19Qm5WsWk_yaSMaTdgltnknEl6VkxJIqnkVO4qj880MWxvOZZ6Dd-bqdoKpM3LQC0Aqs1W1M" />
                                    </div>
                                    {/* "Story Ring" Decoration */}
                                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-4 border-dashed border-primary/30 animate-spin-slow"></div>
                                </div>
                            </div>
                            {/* Content Column */}
                            <div className="md:col-span-7 flex flex-col justify-center space-y-10 lg:pl-12">
                                <div className="space-y-4">
                                    <h2 className="text-sm font-label font-bold uppercase tracking-[0.3em] text-tertiary">Conocé a Mili</h2>
                                    <h3 className="text-5xl lg:text-7xl font-headline font-black text-on-surface leading-tight">
                                        "Soy Mili, y me apasiona hacer que te sientas hermosa"
                                    </h3>
                                </div>
                                <div className="space-y-6 text-xl text-on-surface-variant leading-relaxed font-light">
                                    <p>
                                        Con más de 5 años de trayectoria en el mundo de la estética integral, mi misión ha sido transformar la forma en que cada mujer percibe su propia belleza. 
                                    </p>
                                    <p>
                                        En <strong>Mili Belleza Study</strong>, no solo ofrecemos servicios de excelencia en manicuría y pestañas, sino que abrimos las puertas a nuevas emprendedoras que buscan profesionalizarse con técnicas de vanguardia y productos de primera línea.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="p-8 rounded-lg bg-surface-container-low border-l-4 border-primary">
                                        <h4 className="font-headline font-bold text-2xl mb-2 italic">Visión</h4>
                                        <p className="text-on-surface-variant text-sm">Crear un espacio donde el arte y la técnica se encuentran para potenciar tu confianza.</p>
                                    </div>
                                    <div className="p-8 rounded-lg bg-surface-container-low border-l-4 border-tertiary-container">
                                        <h4 className="font-headline font-bold text-2xl mb-2 italic">Método</h4>
                                        <p className="text-on-surface-variant text-sm">Capacitaciones intensivas 100% prácticas para que salgas lista para el mercado laboral.</p>
                                    </div>
                                </div>
                                <div className="pt-8">
                                    <a className="inline-flex items-center gap-3 text-primary font-bold text-xl group hover:gap-5 transition-all" href="#">
                                        <span>Ver mis trabajos en Instagram</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <div className="text-xl font-['Noto_Serif'] font-bold text-pink-700">Mili Belleza Study</div>
                        <p className="text-zinc-500 max-w-xs lowercase">DONDE LA TÉCNICA SE CONVIERTE EN ARTE. TU FUTURO EN LA ESTÉTICA COMIENZA AQUÍ.</p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest text-pink-600">Navegación</span>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Instagram</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">WhatsApp</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Ubicación</a>
                        <a className="text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">Términos</a>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest text-pink-600">Newsletter</span>
                        <div className="flex">
                            <input className="bg-zinc-100 dark:bg-zinc-900 border-none rounded-l-lg w-full px-4 focus:ring-2 focus:ring-pink-300" placeholder="TU EMAIL" type="email"/>
                            <button className="bg-pink-600 text-white px-4 py-2 rounded-r-lg">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 text-center md:text-left">
                    <p className="text-zinc-400 text-xs tracking-widest uppercase">© 2024 Mili Belleza Study. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
