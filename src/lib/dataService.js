// Supabase-backed data service for patients and vaccinations.
// Same exported object/function names as the old localStorage version,
// so most of the app can call this the same way — with one exception:
// EVERY method here is now ASYNC. Any caller doing
// `const patients = dataService.getPatients()` must become
// `const patients = await dataService.getPatients()`.

import { supabase } from './supabaseClient';

// Static vaccine catalog. This is reference data that rarely changes,
// so it's kept in code rather than a database table for now.
// If you later want admins to manage this list from the UI, this can
// be promoted to a real `vaccines` table.
const VACCINES = [
  {
    id: 'vaccine-1',
    name: 'Hepatitis B',
    description: 'Protects against hepatitis B virus infection',
    recommended_age_months: 0,
  },
  {
    id: 'vaccine-2',
    name: 'DTaP (Diphtheria, Tetanus, Pertussis)',
    description: 'Protects against diphtheria, tetanus, and pertussis',
    recommended_age_months: 2,
  },
  {
    id: 'vaccine-3',
    name: 'MMR (Measles, Mumps, Rubella)',
    description: 'Protects against measles, mumps, and rubella',
    recommended_age_months: 12,
  },
];

export const dataService = {
  // ---------- Patients ----------

  getPatients: async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  },

  getPatient: async (id) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  createPatient: async (patientData) => {
    const { data: userData } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...patientData,
        created_by: userData?.user?.id,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updatePatient: async (id, patientData) => {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // ---------- Vaccines (static catalog) ----------

  getVaccines: async () => {
    return VACCINES;
  },

  // ---------- Vaccination Records ----------
  // Mirrors the old shape: each record comes back with `.patients` and
  // `.vaccines` attached, since components likely read record.patients.full_name
  // and record.vaccines.name directly (same as the old localStorage version).

  getVaccinationRecords: async () => {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*, patients(*)')
      .order('due_date', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((record) => ({
      ...record,
      vaccines: VACCINES.find((v) => v.name === record.vaccine_name) || {
        name: record.vaccine_name,
      },
    }));
  },

  getVaccinationRecord: async (id) => {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*, patients(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return {
      ...data,
      vaccines: VACCINES.find((v) => v.name === data.vaccine_name) || {
        name: data.vaccine_name,
      },
    };
  },

  createVaccinationRecord: async (recordData) => {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert(recordData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateVaccinationRecord: async (id, recordData) => {
    const { data, error } = await supabase
      .from('vaccinations')
      .update(recordData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};