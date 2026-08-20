import React, { useState, useMemo, useEffect } from 'react';
import { Location, Doctor, Hospital, KARNATAKA_CITIES } from '../../shared/types';
import { doctors, hospitals } from '../../services/karnatakaHealthData';
import { StethoscopeIcon, BuildingOfficeIcon, MapPinIcon, StarIcon, DirectionsIcon } from '../../shared/Icons';

interface HealthMapViewProps {
    userLocation: Location | null;
}

// Fix: Moved DoctorCard and its props interface before HealthMapView to resolve reference error.
interface DoctorCardProps {
    doctor: Doctor;
    onSelect: (item: Doctor | Hospital) => void;
    getDirectionsUrl: (item: Doctor | Hospital) => string;
}

// FIX: Explicitly type DoctorCard as React.FC to correctly handle React-specific props like 'key'.
const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect, getDirectionsUrl }) => (
    <div onClick={() => onSelect(doctor)} className="bg-slate-700/60 p-3 rounded-lg cursor-pointer hover:bg-slate-700 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-semibold text-slate-200">{doctor.name}</h4>
                <p className="text-sm text-brand-teal-400">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                    <StarIcon className="w-4 h-4 text-amber-400 mr-1" />
                    <span className="text-xs font-bold text-slate-300">{doctor.rating.toFixed(1)}</span>
                </div>
            </div>
            <a href={getDirectionsUrl(doctor)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-brand-teal-400" title="Get Directions">
                <DirectionsIcon className="w-5 h-5" />
            </a>
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-start">
            <MapPinIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>{doctor.address}</span>
        </p>
    </div>
);

// Fix: Moved HospitalCard and its props interface before HealthMapView to resolve reference error.
interface HospitalCardProps {
    hospital: Hospital;
    onSelect: (item: Doctor | Hospital) => void;
    getDirectionsUrl: (item: Doctor | Hospital) => string;
}

// FIX: Explicitly type HospitalCard as React.FC to correctly handle React-specific props like 'key'.
const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onSelect, getDirectionsUrl }) => (
    <div onClick={() => onSelect(hospital)} className="bg-slate-700/60 p-3 rounded-lg cursor-pointer hover:bg-slate-700 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
            <h4 className="font-semibold text-slate-200">{hospital.name}</h4>
            <a href={getDirectionsUrl(hospital)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 rounded-full text-slate-400 hover:bg-slate-600 hover:text-brand-teal-400" title="Get Directions">
                <DirectionsIcon className="w-5 h-5" />
            </a>
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-start">
            <MapPinIcon className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>{hospital.address}</span>
        </p>
    </div>
);

const HealthMapView: React.FC<HealthMapViewProps> = ({ userLocation }) => {
    const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
    const [selectedCity, setSelectedCity] = useState<string>('All');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
    const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Bengaluru
    const [mapZoom, setMapZoom] = useState(10);

    // Fix: Corrected dependency array since `doctors` is a constant import.
    const specialties = useMemo(() => ['All', ...new Set(doctors.map(d => d.specialty))], []);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(doc =>
            (selectedCity === 'All' || doc.city === selectedCity) &&
            (selectedSpecialty === 'All' || doc.specialty === selectedSpecialty)
        );
    }, [selectedCity, selectedSpecialty]);

    const filteredHospitals = useMemo(() => {
        return hospitals.filter(hosp => selectedCity === 'All' || hosp.city === selectedCity);
    }, [selectedCity]);

    useEffect(() => {
        // If user location is available and is in Karnataka, center map on them
        if (userLocation && userLocation.latitude > 11.5 && userLocation.latitude < 18.5 && userLocation.longitude > 74 && userLocation.longitude < 78.5) {
            setMapCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
            setMapZoom(12);
        }
    }, [userLocation]);


    const handleSelectItem = (item: Doctor | Hospital) => {
        setMapCenter(item.location);
        setMapZoom(15);
    };

    const getDirectionsUrl = (item: Doctor | Hospital) => {
        if (!userLocation) return `https://www.google.com/maps/search/?api=1&query=${item.location.lat},${item.location.lng}`;
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${item.location.lat},${item.location.lng}`;
    };

    const mapUrl = `https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=${mapZoom}&output=embed`;

    return (
        <div className="bg-slate-800/70 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Health Map & Directory</h2>
                    <p className="mt-1 text-slate-400">Find hospitals and specialists across Karnataka.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Filters and List */}
                <div className="lg:col-span-5">
                    {/* Tabs */}
                    <div className="flex border-b border-slate-700/80 mb-4">
                        <button onClick={() => setActiveTab('doctors')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'doctors' ? 'border-b-2 border-brand-teal-500 text-brand-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
                            <StethoscopeIcon className="w-5 h-5" />
                            <span>Doctors</span>
                        </button>
                        <button onClick={() => setActiveTab('hospitals')} className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'hospitals' ? 'border-b-2 border-brand-teal-500 text-brand-teal-400' : 'text-slate-400 hover:text-slate-200'}`}>
                            <BuildingOfficeIcon className="w-5 h-5" />
                            <span>Hospitals</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100"
                        >
                            <option value="All">All Cities</option>
                            {KARNATAKA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>

                        {activeTab === 'doctors' && (
                            <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal-500 bg-slate-700 text-slate-100"
                            >
                                <option value="All">All Specialties</option>
                                {specialties.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        )}
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {activeTab === 'doctors' && filteredDoctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} onSelect={handleSelectItem} getDirectionsUrl={getDirectionsUrl} />
                        ))}
                        {activeTab === 'hospitals' && filteredHospitals.map(hospital => (
                            <HospitalCard key={hospital.id} hospital={hospital} onSelect={handleSelectItem} getDirectionsUrl={getDirectionsUrl} />
                        ))}
                    </div>

                </div>

                {/* Map */}
                <div className="lg:col-span-7 min-h-[400px] lg:min-h-0 lg:h-auto">
                    <iframe
                        className="w-full h-full rounded-2xl shadow-lg border border-slate-700/80"
                        loading="lazy"
                        allowFullScreen
                        src={mapUrl}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default HealthMapView;