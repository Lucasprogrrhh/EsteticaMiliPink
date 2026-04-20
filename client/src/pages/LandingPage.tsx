import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingStyles.css';

const PromocionesSection = () => {
    const [codigo, setCodigo] = useState('');
    const [verifResult, setVerifResult] = useState<{status: 'ok' | 'err' | null, message: React.ReactNode}>({ status: null, message: null });

    const MB_CUPONES: Record<string, { desc: string, tipo: string }> = {
      'MILI-REF-0001': { desc: '15% OFF por referida — presentalo al inscribirte', tipo: 'referida' },
      'MILI-REF-0002': { desc: '15% OFF por referida — presentalo al inscribirte', tipo: 'referida' },
      'COMBO-CURSOS':  { desc: '20% OFF al inscribirte en 2 cursos juntos',        tipo: 'combo'    },
      'PUNTOS-500':    { desc: '10% OFF en tu próximo servicio (500 puntos)',       tipo: 'puntos'   },
      'PUNTOS-1000':   { desc: 'Sesión de uñas gratis (1 000 puntos)',             tipo: 'puntos'   },
      'EARLY-CEJAS':   { desc: 'Precio especial lista de espera – Laminado de Cejas', tipo: 'early' },
      'CUOTA3X':       { desc: '3 cuotas sin interés en cualquier curso',          tipo: 'cuotas'   },
    };

    const verificarCodigo = () => {
        const key = codigo.trim().toUpperCase().replace(/\s+/g, '-');
        if (!key) {
            setVerifResult({
                status: 'err',
                message: '⚠️ Ingresá un código para verificar.'
            });
            return;
        }

        const cupon = MB_CUPONES[key];
        if (cupon) {
            setVerifResult({
                status: 'ok',
                message: <><strong>¡Código válido!</strong> {cupon.desc}. Mostráselo a Mili al momento de la reserva o inscripción.</>
            });
        } else {
            setVerifResult({
                status: 'err',
                message: <>❌ Código no encontrado. Verificá que esté bien escrito o <a href="https://wa.me/5492664734034?text=Hola!%20Tengo%20una%20consulta%20sobre%20un%20cup%C3%B3n" target="_blank" rel="noreferrer" style={{color:'#ff6b81', textDecoration:'underline'}}>consultá por WhatsApp</a>.</>
            });
        }
    };

    return (
        <section id="promociones" className="mb-promos">
            <p className="mb-eyebrow">✦ Beneficios exclusivos</p>
            <h2 className="mb-section-title" style={{fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2rem,3.5vw,2.75rem)", fontWeight:900, lineHeight:1.08, marginBottom:".6rem"}}>Sistema de Promociones</h2>
            <p className="mb-section-sub" style={{fontSize:".95rem", lineHeight:1.7}}>Porque confiás en nosotras, queremos recompensarte. Elegí la promo que más te conviene.</p>

            <div className="mb-promo-grid">
                {/* 1. Referidas */}
                <div className="mb-promo-card">
                    <span className="mb-promo-emoji">👯‍♀️</span>
                    <div className="mb-promo-name">Traé una amiga, ganan las dos</div>
                    <div className="mb-promo-desc">Referís a una amiga al curso y las dos obtienen un <strong>15% OFF</strong> sobre el precio. Sin límite de referidas — cuantas más traés, más acumulás.</div>
                    <div className="mb-promo-tag">📌 Al inscribirse tu amiga menciona tu nombre y listo</div>
                </div>

                {/* 2. Club Puntos */}
                <div className="mb-promo-card">
                    <span className="mb-promo-emoji">⭐</span>
                    <div className="mb-promo-name">Club de Puntos Mili</div>
                    <div className="mb-promo-desc">Cada servicio o curso te da puntos que canjeás en descuentos, productos o servicios. <strong>¡Los puntos no vencen!</strong></div>
                    <div className="mb-promo-tag">💛 1 servicio = 100 pts · 1 curso = 500 pts</div>
                </div>

                {/* 3. Cuotas */}
                <div className="mb-promo-card">
                    <span className="mb-promo-emoji">💳</span>
                    <div className="mb-promo-name">Cuotas sin interés</div>
                    <div className="mb-promo-desc">Inscribite en cualquier curso en hasta <strong>3 cuotas sin interés</strong>. Tu formación no puede esperar.</div>
                    <div className="mb-promo-tag">💰 Consultá disponibilidad por WhatsApp</div>
                </div>

                {/* 4. Combo */}
                <div className="mb-promo-card">
                    <span className="mb-promo-emoji">🎓</span>
                    <div className="mb-promo-name">Combo Formación Completa</div>
                    <div className="mb-promo-desc">Anotate en 2 o más cursos juntos y obtenés <strong>20% OFF</strong> sobre el total. La inversión más inteligente.</div>
                    <div className="mb-promo-tag">🚀 Válido: Manicura + Lifting de Pestañas</div>
                </div>
            </div>

            {/* ── TABLA DE PUNTOS + VERIFICADOR ── */}
            <div className="mb-puntos-panel">
                <div className="mb-puntos-title">⭐ Tabla de Canje – Club de Puntos Mili</div>

                <table className="mb-puntos-tabla">
                    <thead>
                        <tr>
                            <th>Puntos</th>
                            <th>Beneficio</th>
                            <th>Equivale a</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>500 pts</td><td>10% OFF en próximo servicio</td><td>≈ 5 servicios</td></tr>
                        <tr><td>1 000 pts</td><td>Sesión de uñas gratis</td><td>≈ 10 servicios</td></tr>
                        <tr><td>2 000 pts</td><td>25% OFF en cualquier curso</td><td>≈ 4 cursos</td></tr>
                        <tr><td>3 000 pts</td><td>Kit de productos Mili</td><td>Regalo premium</td></tr>
                        <tr><td>5 000 pts</td><td>Curso completo de regalo <span className="badge-top">🏆 TOP</span></td><td>Clienta VIP</td></tr>
                    </tbody>
                </table>

                {/* Verificador */}
                <span className="mb-verif-label">¿Tenés un código de referida o cupón? Verificalo acá:</span>
                <div className="mb-verif-form">
                    <input
                        className="mb-verif-input"
                        type="text"
                        placeholder="Ej: MILI-REF-0001"
                        autoComplete="off"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && verificarCodigo()}
                    />
                    <button className="mb-btn-gold" onClick={verificarCodigo}>Verificar →</button>
                </div>
                {verifResult.status && (
                    <div className={`mb-verif-result ${verifResult.status}`}>{verifResult.message}</div>
                )}
            </div>
        </section>
    );
};

const PortfolioSection = () => {
  const [filter, setFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const portfolioItems = [
    { cat: 'nail-art', title: 'Flores 3D & Animal Print', desc: 'Diseño mixto con flores acrílicas y estampado animal en rosa y negro.', src: '/images/port-01.jpeg', placeholder: '🌸', tag: 'Nail Art' },
    { cat: 'nail-art', title: 'Animales & Flores Pink', desc: 'Combinación única de zebra, leopardo y flores 3D en tonos rosas.', src: '/images/port-02.jpeg', placeholder: '🌺', tag: 'Nail Art', className: 'tall' },
    { cat: 'minimalista', title: 'Marmolado Rosado & Oro', desc: 'Marmolado delicado con detalles en hoja de oro y daisy charms.', src: '/images/port-03.jpeg', placeholder: '✨', tag: 'Minimalista' },
    { cat: 'nail-art', title: 'Fantasía Colorida', desc: 'Arte 3D multicolor: figuras, flores y efectos únicos sobre stiletto.', src: '/images/port-04.jpeg', placeholder: '🦋', tag: 'Nail Art', className: 'wide' },
    { cat: 'french', title: 'French Clásico', desc: 'French manicure perfecta y simétrica sobre gel acrílico de larga duración.', src: '/images/port-05.jpeg', placeholder: '💅', tag: 'French' },
    { cat: 'french', title: 'French Dorado & Leopardo', desc: 'French con punta dorada y estampado leopardo. Audaz y femenino.', src: '/images/port-06.jpeg', placeholder: '🐆', tag: 'French' },
    { cat: 'minimalista', title: 'Nude Shimmer', desc: 'Nude nacarado ultra refinado. Elegancia en su máxima expresión.', src: '/images/port-07.jpeg', placeholder: '🪞', tag: 'Minimalista' },
    { cat: 'nail-art', title: 'Chocolate Hearts', desc: 'Beige y blanco con corazones de acrílico y gotas de chocolate pintadas a mano.', src: '/images/port-08.jpeg', placeholder: '🍫', tag: 'Nail Art', className: 'tall' },
    { cat: 'nail-art', title: 'Spring Garden', desc: 'Flores de cerezo 3D con mariquitas y abejas. La primavera en tus manos.', src: '/images/port-09.jpeg', placeholder: '🌸', tag: 'Nail Art' },
    { cat: 'nail-art', title: 'Spring Garden II', desc: 'Segunda variación del diseño primavera con flores y criaturas en rosa pálido.', src: '/images/port-10.jpeg', placeholder: '🌼', tag: 'Nail Art' },
    { cat: 'french', title: 'French Rosas & Flores', desc: 'French con borde rosado y flores 3D de gel en el centro. Dulce y elegante.', src: '/images/port-11.jpeg', placeholder: '🌷', tag: 'French', className: 'wide' },
    { cat: 'french', title: 'French Amarillo Floral', desc: 'French en amarillo limón con pequeñas flores blancas. Verano puro.', src: '/images/port-12.jpeg', placeholder: '🌻', tag: 'French' },
    { cat: 'minimalista', title: 'Minimalismo Floral', desc: 'Flor delicada con detalle plateado y aros sobre base blush. Refinado al máximo.', src: '/images/port-13.jpeg', placeholder: '🤍', tag: 'Minimalista' },
    { cat: 'nail-art', title: 'Ocean Nails', desc: 'Temática marina con conchas, estrellas de mar y perlas nacaradas. Un sueño costero.', src: '/images/port-14.jpeg', placeholder: '🐚', tag: 'Nail Art', className: 'tall' },
    { cat: 'minimalista', title: 'Floral Cremoso', desc: 'Arte floral sobre base crema con líneas doradas y daisy 3D. Lujo sutil.', src: '/images/port-15.jpeg', placeholder: '🌿', tag: 'Minimalista' },
    { cat: 'nail-art', title: 'Collage de Diseños', desc: 'Muestra de distintos trabajos realizados por alumnas del curso completo. ¡Empezás de cero!', src: '/images/port-16.jpg', placeholder: '🎨', tag: 'Alumnas' },
    { cat: 'nail-art', title: 'Pink & Wild', desc: 'Animal print y flores en armonía: moderno, atrevido y profundamente femenino.', src: '/images/port-17.jpg', placeholder: '🐯', tag: 'Nail Art' },
    { cat: 'nail-art', title: 'Butterfly Dreams', desc: 'Diseño etéreo con mariposas y tonos pastel. Delicadeza en estado puro.', src: '/images/port-18.jpg', placeholder: '🦋', tag: 'Nail Art', className: 'wide' },
  ];

  const visibleItems = portfolioItems.filter(item => filter === 'all' || item.cat === filter);

  const openLightbox = (idx: number) => {
    setCurrentIdx(idx);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((currentIdx - 1 + visibleItems.length) % visibleItems.length);
  };

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((currentIdx + 1) % visibleItems.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setCurrentIdx((prevIdx) => (prevIdx - 1 + visibleItems.length) % visibleItems.length);
      if (e.key === 'ArrowRight') setCurrentIdx((prevIdx) => (prevIdx + 1) % visibleItems.length);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, visibleItems.length]);

  return (
    <section id="portfolio" className="mb-portfolio">
      <div className="mb-port-header">
        <div>
          <p className="mb-eyebrow" style={{fontSize:".72rem", fontWeight:700, letterSpacing:".18em", textTransform:"uppercase", color:"#c2185b", marginBottom:".6rem"}}>✦ Nuestro trabajo</p>
          <h2 className="mb-section-title" style={{fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(2rem,3.5vw,2.75rem)", fontWeight:900, color:"#1a0a10", lineHeight:1.08, marginBottom:".6rem"}}>Portfolio</h2>
          <p style={{fontSize:".95rem", color:"#7a4a5a", lineHeight:1.7, maxWidth:"420px"}}>Cada uña es un lienzo. Mirá algunos de nuestros trabajos más recientes y dejate inspirar.</p>
        </div>
        <div className="mb-port-filters">
          <button className={`mb-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Todos</button>
          <button className={`mb-filter-btn ${filter === 'nail-art' ? 'active' : ''}`} onClick={() => setFilter('nail-art')}>Nail Art</button>
          <button className={`mb-filter-btn ${filter === 'french' ? 'active' : ''}`} onClick={() => setFilter('french')}>French</button>
          <button className={`mb-filter-btn ${filter === 'minimalista' ? 'active' : ''}`} onClick={() => setFilter('minimalista')}>Minimalista</button>
        </div>
      </div>

      <div className="mb-port-grid">
        {visibleItems.map((item, idx) => (
          <div key={idx} className={`mb-port-item ${item.className || ''}`} onClick={() => openLightbox(idx)}>
            <img 
              className="mb-port-img" 
              src={item.src} 
              alt={item.title}
              onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }}
            />
            <div className="mb-port-img-placeholder" style={{display:'none'}}>{item.placeholder}</div>
            <div className="mb-port-zoom">🔍</div>
            <div className="mb-port-overlay">
              <span className="mb-port-tag">{item.tag}</span>
              <div className="mb-port-title">{item.title}</div>
              <div className="mb-port-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-port-cta">
        <h3>¿Querés este resultado?</h3>
        <p>Reservá tu turno hoy y transformá tus manos en obras de arte. Más de 500 clientas ya lo eligieron.</p>
        <a href="https://wa.me/5492664734034?text=Hola!%20Vi%20el%20portfolio%20y%20quiero%20reservar%20un%20turno%20%F0%9F%92..." target="_blank" rel="noreferrer" className="mb-btn-white">
          Reservar mi turno →
        </a>
      </div>

      {lightboxOpen && visibleItems[currentIdx] && (
        <div className="mb-lightbox open" onClick={closeLightbox}>
          <button className="mb-lb-close" onClick={closeLightbox} aria-label="Cerrar">✕</button>
          <button className="mb-lb-nav mb-lb-prev" onClick={prevLightbox} aria-label="Anterior">‹</button>
          <img className="mb-lightbox-img" src={visibleItems[currentIdx].src} alt={visibleItems[currentIdx].title} onClick={(e) => e.stopPropagation()} />
          <div className="mb-lightbox-caption" onClick={(e) => e.stopPropagation()}>
            <strong>{visibleItems[currentIdx].title}</strong>
            {visibleItems[currentIdx].desc}
          </div>
          <button className="mb-lb-nav mb-lb-next" onClick={nextLightbox} aria-label="Siguiente">›</button>
        </div>
      )}
    </section>
  );
};

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleReserveClick = () => {
        navigate('/reservar');
    };

    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/courses`)
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(console.error);
    }, []);

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
                                <img alt="Mili professional portrait" className="w-full h-full object-cover rounded-lg transform transition-transform duration-700 group-hover:scale-110" data-alt="Professional portrait of Mili, a stylish aesthetician in a modern pink-themed studio." src="/images/hero-image.png" />
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
                                        <img alt="Professional manicure and nail art session" className="w-full h-full object-cover" data-alt="Close-up of professional nail artist hands working with golden details and intricate artistic patterns in a high-end luxury spa" src="/images/about-image.png" />
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
                                    <a className="inline-flex items-center gap-3 text-primary font-bold text-xl group hover:gap-5 transition-all" href="https://www.instagram.com/mili.bellezastudy?igsh=MXVzdGMwN2tkYjZ6Ng==" target="_blank" rel="noopener noreferrer">
                                        <span>Ver mis trabajos en Instagram</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cursos Section */}
                <section id="cursos" className="mb-cursos">
                    <div className="mb-cursos-header">
                        <div>
                        <p className="mb-eyebrow">✦ Capacitaciones</p>
                        <h2 className="mb-section-title">Cursos Disponibles</h2>
                        <p className="mb-section-sub">Aprendé con las mejores técnicas y comenzá tu carrera en el mundo de la belleza.</p>
                        </div>
                    </div>

                    <div className="mb-cursos-grid">

                        {/* ── CARD 1: Manicura Completo ── */}
                        <div className="mb-curso-card">
                        <span className="mb-curso-badge disponible">Disponible</span>
                        <img
                            className="mb-curso-img"
                            src="/images/curso-manicura.jpg"
                            alt="Curso Manicura Completo"
                            onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }}
                        />
                        <div className="mb-curso-img-placeholder" style={{display:'none',background:'linear-gradient(135deg,#f8bbd9,#fce4ec)'}}>💅</div>

                        <div className="mb-curso-body">
                            <div className="mb-curso-icon">💅</div>
                            <div className="mb-curso-name">Manicura Completo</div>
                            <div className="mb-curso-desc">
                            Desde la base hasta técnicas avanzadas de nail art: acrílico, gel, decoración 3D, flores, marmolado, francés y mucho más. Incluye práctica intensiva y certificado oficial.
                            </div>
                            <div className="mb-curso-pills">
                            <span className="mb-curso-pill">📅 Fechas a confirmar</span>
                            <span className="mb-curso-pill">📜 Certificado incluido</span>
                            <span className="mb-curso-pill">🎨 Teoría + Práctica</span>
                            <span className="mb-curso-pill">🏠 Presencial</span>
                            </div>
                            <a
                            href="https://wa.me/5492664734034?text=Hola!%20Me%20interesa%20el%20Curso%20de%20Manicura%20Completo%20%F0%9F%92%85%20%C2%BFpod%C3%A9s%20darme%20m%C3%A1s%20info%3F"
                            target="_blank"
                            rel="noreferrer"
                            className="mb-curso-cta active"
                            >
                            Consultar por WhatsApp →
                            </a>
                        </div>
                        </div>

                        {/* ── CARD 2: Lifting de Pestañas ── */}
                        <div className="mb-curso-card">
                        <span className="mb-curso-badge disponible">Disponible</span>
                        <img
                            className="mb-curso-img"
                            src="/images/curso-lifting.jpg"
                            alt="Lifting de Pestañas"
                            onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }}
                        />
                        <div className="mb-curso-img-placeholder" style={{display:'none',background:'linear-gradient(135deg,#e1bee7,#f3e5f5)'}}>👁️</div>

                        <div className="mb-curso-body">
                            <div className="mb-curso-icon">👁️</div>
                            <div className="mb-curso-name">Lifting de Pestañas</div>
                            <div className="mb-curso-desc">
                            Aprendé la técnica de lifting y permanente de pestañas más demandada del mercado. Efecto natural, duradero y sin extensiones. Ideal para emprender desde casa o insertarte en salones premium.
                            </div>
                            <div className="mb-curso-pills">
                            <span className="mb-curso-pill">📅 Fechas a confirmar</span>
                            <span className="mb-curso-pill">📜 Certificado incluido</span>
                            <span className="mb-curso-pill">⚡ Alta demanda laboral</span>
                            <span className="mb-curso-pill">🏠 Presencial</span>
                            </div>
                            <a
                            href="https://wa.me/5492664734034?text=Hola!%20Me%20interesa%20el%20Curso%20de%20Lifting%20de%20Pesta%C3%B1as%20%F0%9F%91%81%EF%B8%8F%20%C2%BFpod%C3%A9s%20darme%20m%C3%A1s%20info%3F"
                            target="_blank"
                            rel="noreferrer"
                            className="mb-curso-cta active"
                            >
                            Consultar por WhatsApp →
                            </a>
                        </div>
                        </div>

                        {/* ── CARD 3: Laminado de Cejas (próximamente) ── */}
                        <div className="mb-curso-card" style={{opacity:.8}}>
                        <span className="mb-curso-badge proximamente">Próximamente ✦</span>
                        <img
                            className="mb-curso-img"
                            src="/images/curso-cejas.jpg"
                            alt="Laminado de Cejas"
                            onError={(e) => { e.currentTarget.style.display='none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display='flex'; }}
                        />
                        <div className="mb-curso-img-placeholder" style={{display:'none',background:'linear-gradient(135deg,#fff9c4,#fff8e1)'}}>✦</div>

                        <div className="mb-curso-body">
                            <div className="mb-curso-icon">✦</div>
                            <div className="mb-curso-name">Laminado de Cejas</div>
                            <div className="mb-curso-desc">
                            Muy pronto: laminado profesional, diseño y pigmentación de cejas perfectas. Anotate en la lista de espera y recibís precio early bird exclusivo antes que nadie.
                            </div>
                            <div className="mb-curso-pills">
                            <span className="mb-curso-pill">🔔 Lista de espera abierta</span>
                            <span className="mb-curso-pill">💛 Precio early bird</span>
                            <span className="mb-curso-pill">📜 Certificado incluido</span>
                            </div>
                            <a
                            href="https://wa.me/5492664734034?text=Hola!%20Quiero%20anotarme%20en%20la%20lista%20de%20espera%20para%20el%20curso%20de%20Laminado%20de%20Cejas%20%E2%9C%A6"
                            target="_blank"
                            rel="noreferrer"
                            className="mb-curso-cta waiting"
                            >
                            Anotarme en lista de espera →
                            </a>
                        </div>
                        </div>

                    </div>{/* /grid */}

                    {/* ── GALERÍA RESULTADO DE ALUMNAS ── */}
                    <div className="mb-galeria-wrap">
                        <h3>🌸 Resultado de nuestras alumnas</h3>
                        <p>Empezás desde cero y llegás a esto. Obras reales creadas durante los cursos.</p>
                        <div className="mb-galeria-grid">
                        <img src="/images/resultados-alumnas-colage.jpeg"  alt="Collage resultados alumnas" title="Nails Art – resultado grupal" />
                        <img src="/images/resultados-alumnas-colage2.jpeg"        alt="Nail art floral alumna"     title="Flores 3D rosa y negro" />
                        <img src="/images/resultado-alumna-03.png"        alt="Nail art marmolado"          title="Marmolado y flores 3D" />
                        <img src="/images/resultado-alumna-04.png"        alt="Nail art colorido"           title="Arte 3D multicolor" />
                        </div>
                    </div>

                </section>
                
                <PortfolioSection />
                <PromocionesSection />
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
                        <a className="flex items-center gap-2 text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="https://www.instagram.com/mili.bellezastudy?igsh=MXVzdGMwN2tkYjZ6Ng==" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined text-lg">photo_camera</span>
                            Instagram
                        </a>
                        <a className="flex items-center gap-2 text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="https://wa.me/5492664734034" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined text-lg">chat</span>
                            WhatsApp
                        </a>
                        <a className="flex items-center gap-2 text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="https://maps.google.com/?q=Zoilo+Concha,+M5529+San+Luis,+San+Luis,+Argentina" target="_blank" rel="noopener noreferrer">
                            <span className="material-symbols-outlined text-lg">location_on</span>
                            Ubicación
                        </a>
                        <a className="flex items-center gap-2 text-zinc-500 hover:text-pink-400 hover:translate-x-1 transition-transform font-['Plus_Jakarta_Sans'] text-sm uppercase tracking-widest" href="#">
                            <span className="material-symbols-outlined text-lg">description</span>
                            Términos
                        </a>
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
