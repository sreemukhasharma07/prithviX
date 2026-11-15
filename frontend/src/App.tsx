
import { useEffect, useState } from 'react';

import {
    LayoutDashboard,
    MapPin,
    CloudSun,
    Sprout,
    Repeat,
    Bell,
    User
} from 'lucide-react';

import { FARMS, zoneFor } from './data/demo';
import type { Farm, Units } from './types';

import Dashboard from './pages/Dashboard';
import MyFarm from './pages/MyFarm';
import SoilClimate from './pages/SoilClimate';
import Crops from './pages/Crops';
import Rotation from './pages/Rotation';
import Alerts from './pages/Alerts';
import FarmerHub from './/pages/FarmerHub';
const NAV = [
    ['dash', 'Dashboard', LayoutDashboard],
    ['farm', 'My Farm', MapPin],
    ['soil', 'Soil & Climate', CloudSun],
    ['crops', 'Crop Recommendations', Sprout],
    ['rot', 'Crop Rotation', Repeat],
    ['alerts', 'Alerts & Advice', Bell],
    ['hub', 'Farmer Hub', User]
] as const;

const FARM_KEY = 'prithvix.farms.v1';
const ACTIVE_FARM_KEY = 'prithvix.activeFarm';

function initialFarms(): Farm[] {
    try {
        const saved = localStorage.getItem(FARM_KEY);

        if (saved) {
            const parsed = JSON.parse(saved) as Farm[];

            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('Could not load saved farms:', error);
    }

    return FARMS;
}

export default function App() {
    const [page, setPage] = useState('dash');

    // Load farms only once.
    const [farms, setFarms] = useState<Farm[]>(initialFarms);

    const [key, setKey] = useState<string>(() => {
        return localStorage.getItem(ACTIVE_FARM_KEY) || 'hyd';
    });

    const [units, setUnits] = useState<Units>('m');

    // Save farms whenever they change.
    useEffect(() => {
        try {
            localStorage.setItem(FARM_KEY, JSON.stringify(farms));
        } catch (error) {
            console.error('Could not save farms:', error);
        }
    }, [farms]);

    // Remember selected farm.
    useEffect(() => {
        localStorage.setItem(ACTIVE_FARM_KEY, key);
    }, [key]);

    const farm = farms.find(f => f.key === key) ?? farms[0];

    // Protect against an empty farm list.
    if (!farm) {
        return <div className="app">No farm data available.</div>;
    }

    // Called when user selects a location in My Farm.
    const locate = (
        lat: number,
        lng: number,
        name?: string
    ) => {
        const customFarm: Farm = {
            key: 'custom',
            name: name || 'Custom location',
            lat,
            lng,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            z: zoneFor(lat),
            pl: [
                [0.25, 30, 0.5],
                [0.2, 31, 0.45]
            ]
        };

        setFarms(current => [
            ...current.filter(f => f.key !== 'custom'),
            customFarm
        ]);

        setKey('custom');
    };

    const time = new Date().toLocaleTimeString([], {
        timeZone: farm.tz,
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="app">

            <nav>
                <div className="logo">
                    <img
                        src="/prithviX-logo.png"
                        alt="PrithviX Logo"
                        className="brand-logo"
                    />
                    <span>PrithviX</span>
                </div>

                {NAV.map(([id, label, Icon]) => (
                    <button
                        key={id}
                        className={id === page ? 'on' : ''}
                        onClick={() => setPage(id)}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}

                <small>Global agriculture · Prototype</small>
            </nav>

            <main>

                <header>
                    <select
                        value={farm.key}
                        onChange={e => setKey(e.target.value)}
                        aria-label="Select farm"
                    >
                        {farms.map(f => (
                            <option key={f.key} value={f.key}>
                                {f.name}
                            </option>
                        ))}
                    </select>

                    <span>
                        {farm.lat.toFixed(3)}, {farm.lng.toFixed(3)}
                        {' · '}
                        {farm.tz}
                        {' · '}
                        {time}
                        {' · demo data'}
                    </span>

                    <select
                        style={{ marginLeft: 'auto' }}
                        value={units}
                        onChange={e =>
                            setUnits(e.target.value as Units)
                        }
                        aria-label="Measurement units"
                    >
                        <option value="m">Metric</option>
                        <option value="i">Imperial</option>
                    </select>
                </header>

                <div className="pg">

                    {page === 'dash' && (
                        <Dashboard farm={farm} units={units} />
                    )}

                    {page === 'farm' && (
                        <MyFarm
                            farm={farm}
                            units={units}
                            onLocate={locate}
                        />
                    )}

                    {page === 'soil' && (
                        <SoilClimate farm={farm} units={units} />
                    )}

                    {page === 'crops' && (
                        <Crops farm={farm} />
                    )}

                    {page === 'rot' && (
                        <Rotation farm={farm} />
                    )}

                    {page === 'alerts' && (
                        <Alerts farm={farm} />
                    )}

                    {page === 'hub' && (
                        <FarmerHub farm={farm} />
                    )}

                </div>
            </main>
        </div>
    );
}
