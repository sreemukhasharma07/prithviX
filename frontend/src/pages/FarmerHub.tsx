
import { useEffect, useState, type FormEvent } from 'react'; import type { Farm } from '../types';
type AreaUnit = 'Acres' | 'Hectares' | 'Square metres';

type FarmerProfile = {
    farmerName: string;
    farmName: string;
    farmLocation: string;
    farmArea: string;
    areaUnit: AreaUnit;
    currentCrop: string;
    soilType: string;
    waterSource: string;
    irrigation: string;
    primaryGoal: string;
};

const PROFILE_KEY = 'prithvix.profile.v1';

const defaultProfile: FarmerProfile = {
    farmerName: '',
    farmName: '',
    farmLocation: '',
    farmArea: '',
    areaUnit: 'Acres',
    currentCrop: '',
    soilType: 'Unknown',
    waterSource: 'Unknown',
    irrigation: 'Unknown',
    primaryGoal: 'Increase Crop Yield & Quality'
};

function readProfile(): FarmerProfile {
    try {
        const saved = JSON.parse(
            localStorage.getItem(PROFILE_KEY) || '{}'
        );

        // Migrate fields from the previous FarmerHub version.
        return {
            ...defaultProfile,
            farmerName: saved.farmerName ?? saved.name ?? '',
            farmName: saved.farmName ?? '',
            farmLocation: saved.farmLocation ?? saved.country ?? '',
            farmArea: saved.farmArea ?? '',
            areaUnit: saved.areaUnit ?? 'Acres',
            currentCrop: saved.currentCrop ?? '',
            soilType: saved.soilType ?? 'Unknown',
            waterSource: saved.waterSource ?? 'Unknown',
            irrigation: saved.irrigation ?? 'Unknown',
            primaryGoal: saved.primaryGoal ?? defaultProfile.primaryGoal
        };
    } catch {
        return defaultProfile;
    }
}

export default function FarmerHub({ farm }: { farm: Farm }) {
    const [profile, setProfile] = useState<FarmerProfile>(() => {
        const saved = readProfile();

        return {
            ...saved,
            farmName: saved.farmName || farm.name
        };
    });

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setProfile(current => ({
            ...current,
            farmName: current.farmName || farm.name
        }));
    }, [farm.name]);

    function update<K extends keyof FarmerProfile>(
        key: K,
        value: FarmerProfile[K]
    ) {
        setProfile(current => ({
            ...current,
            [key]: value
        }));
        setSaved(false);
    }

    function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        setSaved(true);
    }

    return (
        <div className="farmer-hub-page">
            <form className="farmer-profile-form" onSubmit={saveProfile}>
                <div className="farmer-form-grid">

                    <label className="farmer-field">
                        <span>FARMER NAME</span>
                        <input
                            type="text"
                            value={profile.farmerName}
                            onChange={e => update('farmerName', e.target.value)}
                            placeholder="Enter farmer name"
                            required
                        />
                    </label>

                    <label className="farmer-field">
                        <span>FARM NAME</span>
                        <input
                            type="text"
                            value={profile.farmName}
                            onChange={e => update('farmName', e.target.value)}
                            placeholder="Enter farm name"
                            required
                        />
                    </label>

                    <label className="farmer-field">
                        <span>FARM LOCATION / DISTRICT</span>
                        <input
                            type="text"
                            value={profile.farmLocation}
                            onChange={e => update('farmLocation', e.target.value)}
                            placeholder="City, region, country"
                            required
                        />
                    </label>

                    <div className="farmer-field">
                        <span>FARM SIZE</span>
                        <div className="farmer-size-control">
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={profile.farmArea}
                                onChange={e => update('farmArea', e.target.value)}
                                placeholder="Enter farm size"
                                required
                            />
                            <select
                                value={profile.areaUnit}
                                onChange={e => update(
                                    'areaUnit',
                                    e.target.value as AreaUnit
                                )}
                                aria-label="Farm area unit"
                            >
                                <option>Acres</option>
                                <option>Hectares</option>
                                <option>Square metres</option>
                            </select>
                        </div>
                    </div>

                    <label className="farmer-field">
                        <span>CURRENT CROP</span>
                        <select
                            value={profile.currentCrop}
                            onChange={e => update('currentCrop', e.target.value)}
                            required
                        >
                            <option value="">Select current crop</option>
                            {[
                                'Rice / Paddy',
                                'Wheat',
                                'Maize',
                                'Cotton',
                                'Sugarcane',
                                'Soybean',
                                'Groundnut',
                                'Millets',
                                'Pulses / Legumes',
                                'Vegetables',
                                'Fruits',
                                'Other'
                            ].map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </label>

                    <label className="farmer-field">
                        <span>SOIL TYPE</span>
                        <select
                            value={profile.soilType}
                            onChange={e => update('soilType', e.target.value)}
                        >
                            {[
                                'Unknown',
                                'Black Cotton Soil (Vertisol)',
                                'Alluvial Soil',
                                'Red Soil',
                                'Sandy Soil',
                                'Clay Soil',
                                'Loamy Soil',
                                'Silty Soil',
                                'Peaty Soil',
                                'Chalky Soil',
                                'Other'
                            ].map(soil => (
                                <option key={soil} value={soil}>{soil}</option>
                            ))}
                        </select>
                    </label>

                    <label className="farmer-field">
                        <span>WATER SOURCE</span>
                        <select
                            value={profile.waterSource}
                            onChange={e => update('waterSource', e.target.value)}
                        >
                            {[
                                'Unknown',
                                'Rainfed',
                                'Borehole / Groundwater',
                                'River',
                                'Canal',
                                'Reservoir',
                                'Farm pond',
                                'Recycled water',
                                'Other'
                            ].map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                    </label>

                    <label className="farmer-field">
                        <span>IRRIGATION METHOD</span>
                        <select
                            value={profile.irrigation}
                            onChange={e => update('irrigation', e.target.value)}
                        >
                            {[
                                'Unknown',
                                'Rainfed',
                                'Drip Irrigation',
                                'Sprinkler Irrigation',
                                'Flood Irrigation',
                                'Furrow Irrigation',
                                'Subsurface Irrigation',
                                'Other'
                            ].map(method => (
                                <option key={method} value={method}>{method}</option>
                            ))}
                        </select>
                    </label>

                    <label className="farmer-field farmer-field-full">
                        <span>PRIMARY GOAL</span>
                        <select
                            value={profile.primaryGoal}
                            onChange={e => update('primaryGoal', e.target.value)}
                        >
                            {[
                                'Increase Crop Yield & Quality',
                                'Reduce Water Consumption',
                                'Improve Soil Health',
                                'Reduce Fertilizer Costs',
                                'Choose the Best Crop for My Land',
                                'Improve Crop Rotation',
                                'Manage Climate Risks',
                                'Improve Farm Profitability'
                            ].map(goal => (
                                <option key={goal} value={goal}>{goal}</option>
                            ))}
                        </select>
                    </label>

                </div>

                <div className="farmer-form-actions">
                    <button className="btn p" type="submit">
                        Save Farm Details
                    </button>

                    {saved && (
                        <span className="farmer-saved-message" role="status">
                            ✓ Farm details saved successfully.
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}
