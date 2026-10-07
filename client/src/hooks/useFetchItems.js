import { useState, useEffect, useCallback } from 'react';
import { getItems } from '../services/api';

export const useFetchItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getItems();
      setItems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, setItems, loading, error, refetch: fetchItems };
};
