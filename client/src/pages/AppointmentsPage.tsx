import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface Appointment {
    id: string;
    dateTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    notes: string | null;
    service: Service;
    client: User;
    specialist: User | null;
    review: any | null; // Added review relationship
}

const AppointmentsPage: React.FC = () => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    // Portfolio Modal State
    const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
    const [portfolioDesc, setPortfolioDesc] = useState('');
    const [portfolioPhoto, setPortfolioPhoto] = useState<File | null>(null);
    const [portfolioConsent, setPortfolioConsent] = useState(false);
    const [submittingPortfolio, setSubmittingPortfolio] = useState(false);
    const [portfolioError, setPortfolioError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleShare = async (review: any) => {
        const text = `¡Acabo de calificar mi experiencia con un ${review.rating}/5! ${review.comment ? `"${review.comment}"` : ''} - Clínica Estética`;
        const url = window.location.origin; 
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mi experiencia en Clínica Estética',
                    text: text,
                    url: url
                });
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/appointments', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch appointments');
                }

                const data = await response.json();
                setAppointments(data);
            } catch (err: any) {
                setError(err.message || 'Error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchAppointments();
        }
    }, [token]);

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'CANCELLED' })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel appointment');
            }

            // Update UI
            setAppointments(prev => prev.map(app =>
                app.id === id ? { ...app, status: 'CANCELLED' } : app
            ));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openReviewModal = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
        setRating(5);
        setComment('');
        setPhoto(null);
        setReviewError('');
        setReviewModalOpen(true);
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError('');
        setSubmittingReview(true);

        try {
            const formData = new FormData();
            formData.append('appointmentId', selectedAppointmentId as string);
            formData.append('rating', rating.toString());
            formData.append('comment', comment);
            if (photo) {
                formData.append('photo', photo);
            }

            const response = await fetch('http://localhost:3001/api/reviews', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit review');
            }

            const newReview = await response.json();

            // Update local state to reflect the new review
            setAppointments(prev => prev.map(app => 
                app.id === selectedAppointmentId ? { ...app, review: newReview } : app
            ));

            setReviewModalOpen(false);
        } catch (err: any) {
            setReviewError(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    const openPortfolioModal = (appointmentId: string) => {
        setSelectedAppointmentId(appointmentId);
        setPortfolioDesc('');
        setPortfolioPhoto(null);
        setPortfolioConsent(false);
        setPortfolioError('');
        setPortfolioModalOpen(true);
    };

    const handleSubmitPortfolio = async (e: React.FormEvent) => {
        e.preventDefault();
        setPortfolioError('');
        
        if (!portfolioPhoto) {
            return setPortfolioError('Es necesario subir una imagen del resultado.');
        }

        if (!portfolioConsent) {
            return setPortfolioError('Debes aceptar el uso de la imagen en nuestro portfolio.');
        }

        setSubmittingPortfolio(true);

        try {
            const formData = new FormData();
            formData.append('photo', portfolioPhoto);
            formData.append('description', portfolioDesc);
            
            const selectedAppt = appointments.find(a => a.id === selectedAppointmentId);
            if (selectedAppt) {
                formData.append('serviceCategory', selectedAppt.service.name);
                formData.append('specialistName', selectedAppt.specialist?.name || 'Clínica Estética');
            }

            const response = await fetch('http://localhost:3001/api/portfolio/client', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit portfolio item');
            }

            setPortfolioModalOpen(false);
            setSuccessMessage('¡Foto enviada con éxito! Está pendiente de aprobación.');
            setTimeout(() => setSuccessMessage(''), 5000);
        } catch (err: any) {
            setPortfolioError(err.message);
        } finally {
            setSubmittingPortfolio(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading appointments...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-headline font-bold text-on-surface">Mis Citas</h1>
                    <p className="text-on-surface-variant mt-1">Acá podés ver y gestionar tus turnos.</p>
                </div>
                <Link
                    to="/reservar"
                    className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Nuevo Turno
                </Link>
            </div>

            {error && <div className="bg-error-container text-error p-3 rounded-xl mb-4 text-sm font-medium border border-error/20">{error}</div>}
            {successMessage && <div className="bg-tertiary-container/30 text-tertiary p-3 rounded-xl mb-4 text-sm font-bold border border-tertiary/20 flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span> {successMessage}</div>}

            {appointments.length === 0 ? (
                <div className="bg-surface-container-lowest p-10 rounded-2xl text-center shadow-sm border border-outline-variant/30 flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">calendar_today</span>
                    <p className="text-on-surface-variant font-medium mb-4 text-lg">Aún no tenés ninguna cita registrada.</p>
                    <Link to="/reservar" className="text-primary font-bold hover:underline">¡Reservá tu primer servicio ahora!</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map(appointment => (
                        <div key={appointment.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/30 transition group">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-on-surface font-headline">{appointment.service.name}</h3>
                                    <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full font-bold ${appointment.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                                            appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>

                                <p className="text-on-surface-variant font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                                    {new Date(appointment.dateTime).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })}
                                </p>

                                <div className="flex gap-6 mt-3 text-sm text-on-surface-variant font-medium">
                                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">schedule</span> {appointment.service.durationMinutes} min</p>
                                    <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">payments</span> ${Number(appointment.service.price).toFixed(2)}</p>
                                </div>

                                {appointment.notes && (
                                    <div className="mt-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 inline-block">
                                        <p className="text-sm text-on-surface-variant italic">"{appointment.notes}"</p>
                                    </div>
                                )}
                                
                                {appointment.review && (
                                    <div className="mt-4 bg-primary-fixed-dim/20 border border-primary-container/30 p-4 rounded-xl text-sm text-on-surface">
                                        <div className="flex items-center gap-1 text-primary mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < appointment.review.rating ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                        {appointment.review.comment && <p className="text-on-surface-variant font-medium italic mt-1">"{appointment.review.comment}"</p>}
                                        {appointment.review.photoUrl && (
                                            <div className="mt-3">
                                                <img src={`http://localhost:3001${appointment.review.photoUrl}`} alt="Reseña" className="w-16 h-16 object-cover rounded-xl shadow-sm border border-outline-variant/30 hover:scale-[2.5] hover:z-50 relative origin-top-left transition-transform duration-300 cursor-zoom-in" />
                                            </div>
                                        )}
                                        <div className="mt-3 pt-2 border-t border-outline-variant/20">
                                            <button 
                                                onClick={() => handleShare(appointment.review)} 
                                                className="text-xs text-primary font-bold hover:text-primary/80 flex items-center gap-1.5 transition"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">share</span> Compartir
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 relative z-10 w-full md:w-auto">
                                {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                                    <button
                                        onClick={() => handleCancel(appointment.id)}
                                        className="text-error bg-error-container/50 hover:bg-error-container text-sm font-bold px-4 py-2 rounded-xl transition-colors border border-error/10 w-full"
                                    >
                                        Cancelar Turno
                                    </button>
                                )}
                                {appointment.status === 'COMPLETED' && !appointment.review && (
                                    <button
                                        onClick={() => openReviewModal(appointment.id)}
                                        className="text-primary hover:text-on-primary text-sm border border-primary/30 hover:bg-primary px-4 py-2 rounded-xl transition-all font-bold w-full"
                                    >
                                        Calificar Servicio
                                    </button>
                                )}
                                {appointment.status === 'COMPLETED' && (
                                    <button
                                        onClick={() => openPortfolioModal(appointment.id)}
                                        className="text-tertiary bg-tertiary-container/30 hover:bg-tertiary-container text-sm font-bold border border-tertiary/20 px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 w-full"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                                        Subir Variante
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-outline-variant/30 p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <h2 className="text-2xl font-headline font-bold text-on-surface mb-1">Calificar Servicio</h2>
                        <p className="text-sm text-on-surface-variant font-medium mb-5">Tu opinión es súper valiosa para nosotros.</p>
                        {reviewError && <div className="bg-error-container text-error p-3 rounded-xl mb-4 text-sm font-medium">{reviewError}</div>}
                        
                        <form onSubmit={handleSubmitReview} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Puntuación</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-primary' : 'text-outline-variant/50'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Comentario (Opcional)</label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        placeholder="¿Qué te pareció el servicio?"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none font-medium text-sm"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-2">Foto (Opcional)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setPhoto(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-sm text-on-surface-variant font-medium file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border border-outline-variant/30 file:text-sm file:font-bold file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-outline-variant/20">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition"
                                    disabled={submittingReview}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-bold transition disabled:opacity-50 shadow-md"
                                >
                                    {submittingReview ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Portfolio Modal */}
            {portfolioModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-outline-variant/30 p-6 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-tertiary">photo_library</span>
                            <h2 className="text-2xl font-headline font-bold text-on-surface">Subir al Portfolio</h2>
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium mb-5">Compartí el hermoso resultado con todos.</p>
                        
                        {portfolioError && <div className="bg-error-container text-error p-3 rounded-xl mb-4 text-sm font-medium border border-error/20">{portfolioError}</div>}
                        
                        <form onSubmit={handleSubmitPortfolio} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Sube una foto clara del resultado <span className="text-error">*</span></label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    required
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setPortfolioPhoto(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full text-sm text-on-surface-variant font-medium file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border border-outline-variant/30 file:text-sm file:font-bold file:bg-surface-container file:text-on-surface hover:file:bg-surface-container-high transition-all"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Comentario breve (Opcional)</label>
                                <textarea
                                    value={portfolioDesc}
                                    onChange={(e) => setPortfolioDesc(e.target.value)}
                                    rows={2}
                                    placeholder="¿Te encantó el resultado?"
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-on-surface focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition resize-none font-medium text-sm"
                                />
                            </div>

                            <label className="flex items-start gap-3 mt-4 p-3 bg-tertiary-fixed/30 rounded-xl border border-tertiary-container/50 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    required
                                    checked={portfolioConsent}
                                    onChange={(e) => setPortfolioConsent(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-tertiary rounded focus:ring-tertiary cursor-pointer" 
                                />
                                <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                                    Doy mi consentimiento para que esta imagen se muestre públicamente en el portfolio de la estética.
                                </span>
                            </label>
                                
                            <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-outline-variant/20">
                                <button
                                    type="button"
                                    onClick={() => setPortfolioModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-xl transition"
                                    disabled={submittingPortfolio}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPortfolio}
                                    className="px-6 py-2.5 bg-tertiary hover:bg-tertiary/90 text-on-tertiary rounded-xl font-bold transition disabled:opacity-50 shadow-md flex items-center gap-1.5"
                                >
                                    {submittingPortfolio ? 'Subiendo...' : 'Publicar'}
                                    <span className="material-symbols-outlined text-[18px]">publish</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;
