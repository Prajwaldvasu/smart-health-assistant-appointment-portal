import React, { useState, useMemo, useEffect } from 'react';
import { Doctor, Location } from '../../shared/types';
import { MapPinIcon, StarIcon, DirectionsIcon } from '../../shared/Icons';

interface DoctorFinderProps {
    doctors: Doctor[];
    onSelectDoctor: (doctor: Doctor) => void;
    userLocation: Location | null;
}

const DoctorFinder: React.FC<DoctorFinderProps> = ({ doctors, onSelectDoctor, userLocation }) => {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
    const [selectedDoctorForMap, setSelectedDoctorForMap] = useState<Doctor | null>(null);

    useEffect(() => {
        if (doctors.length > 0) {
            setSelectedDoctorForMap(doctors[0]);
        }
    }, [doctors]);

    const specialties = useMemo(() => ['All', ...new Set(doctors.map(d => d.specialty))], [doctors]);

    const filteredDoctors = useMemo(() => {
        if (selectedSpecialty === 'All') {
            return doctors;
        }
        return doctors.filter(d => d.specialty === selectedSpecialty);
    }, [doctors, selectedSpecialty]);

    if (doctors.length === 0) {
        return (
            <div className="text-center text-slate-400 py-10">
                <p>No nearby doctors found for the specialties recommended by the AI.</p>
                <p className="text-sm">You can browse all healthcare providers in the "Health Map" section.</p>
            </div>
        );
    }

    const mapUrl = selectedDoctorForMap
        ? `https://maps.google.com/maps?q=${selectedDoctorForMap.location.lat},${selectedDoctorForMap.location.lng}&hl=en&z=14&output=embed`
        : `https://maps.google.com/maps?q=karnataka&hl=en&z=7&output=embed`;

    const getDirectionsUrl = (doctor: Doctor) => {
        if (!userLocation) return `https://www.google.com/maps/search/?api=1&query=${doctor.location.lat},${doctor.location.lng}`;
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${doctor.location.lat},${doctor.location.lng}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <div className="mb-4">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-1">
                        {specialties.map(specialty => (
                            <button
                                key={specialty}
                                onClick={() => setSelectedSpecialty(specialty)}
                                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${selectedSpecialty === specialty
                                    ? 'bg-brand-teal-500 text-white shadow'
                                    : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {specialty}
                            </button>
                        ))}
                    </div>
                </div>

                {userLocation && (
                    <div className="text-sm text-slate-400 bg-slate-700/50 p-3 rounded-lg flex items-center mb-4">
                        <MapPinIcon className="w-4 h-4 mr-2 text-slate-500" />
                        <span>Showing top 5 AI-recommended specialists near you.</span>
                    </div>
                )}

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.id}
                            className={`border rounded-lg p-4 transition-all duration-300 cursor-pointer ${selectedDoctorForMap?.id === doctor.id ? 'bg-slate-700 shadow-lg border-brand-teal-500' : 'bg-slate-700/60 border-slate-600/80 hover:shadow-md hover:bg-slate-700'}`}
                            onClick={() => setSelectedDoctorForMap(doctor)}
                        >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-100">{doctor.name}</h3>
                                    <p className="text-sm font-medium text-brand-teal-400">{doctor.specialty}</p>
                                    {doctor.distance && (
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{doctor.distance.toFixed(1)} KM AWAY</p>
                                    )}
                                    <div className="flex items-center mt-2 text-sm text-slate-400">
                                        <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span>{doctor.address}</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                        <StarIcon className="w-4 h-4 text-amber-400 mr-1" />
                                        <span className="text-sm font-bold text-slate-300">{doctor.rating.toFixed(1)}</span>
                                    </div>
                                    {doctor.phone && (
                                        <div className="flex items-center mt-1 text-sm text-slate-400">
                                            <span className="mr-2">📞</span>
                                            <span>{doctor.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 sm:mt-0 sm:text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-slate-300 mb-2">Availability:</p>
                                    <div className="flex flex-wrap gap-2 sm:justify-end">
                                        {doctor.availability.slice(0, 3).map(slot => (
                                            <span key={slot} className="text-xs bg-brand-teal-900 text-brand-teal-200 font-medium px-2.5 py-1 rounded-full">{slot}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                                {doctor.phone && (
                                    <a
                                        href={`tel:${doctor.phone}`}
                                        className="inline-flex justify-center items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        📞 Call
                                    </a>
                                )}
                                <a
                                    href={getDirectionsUrl(doctor)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DirectionsIcon className="w-5 h-5 mr-2" />
                                    Directions
                                </a>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectDoctor(doctor);
                                    }}
                                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-brand-teal-500 to-brand-green-500 hover:from-brand-teal-600 hover:to-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal-500 transition-all"
                                >
                                    Book Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredDoctors.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                        <p>No doctors found for the selected specialty.</p>
                    </div>
                )}
            </div>
            <div className="sticky top-24 h-[400px] lg:h-auto lg:max-h-[75vh]">
                <iframe
                    className="w-full h-full rounded-2xl shadow-lg border border-slate-700/80"
                    loading="lazy"
                    allowFullScreen
                    src={mapUrl}>
                </iframe>
            </div>
        </div>
    );
};

export default DoctorFinder;