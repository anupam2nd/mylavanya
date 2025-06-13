
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface SubCategory {
  sub_category_id: number;
  category_id: number;
  sub_category_name: string;
  description?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId?: number) => {
    try {
      setLoading(true);
      let query = supabase
        .from('sub_categories')
        .select('*')
        .order('sub_category_name');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubCategories(data || []);
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sub-categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    subCategories,
    loading,
    error,
    fetchSubCategories,
    refreshCategories: fetchCategories
  };
};
