// Updated useStores.ts for proper coordinates mapping

import { useEffect, useState } from 'react';
import { fetchStores } from '../api';

const useStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getStores = async () => {
            try {
                const data = await fetchStores();
                const mappedStores = data.map(store => {
                    // Safety check for latitude and longitude
                    if (store.latitude && store.longitude) {
                        return {
                            ...store,
                            coords: {
                                lat: parseFloat(store.latitude),
                                lng: parseFloat(store.longitude)
                            }
                        };
                    } else {
                        return null; // Or handle it in other ways as per your requirements
                    }
                }).filter(store => store !== null);

                setStores(mappedStores);
            } catch (error) {
                console.error('Error fetching stores:', error);
            } finally {
                setLoading(false);
            }
        };

        getStores();
    }, []);

    return { stores, loading };
};

export default useStores;
