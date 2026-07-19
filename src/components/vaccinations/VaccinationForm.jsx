import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dataService } from '../../lib/dataService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertModal } from '../ui/Modal';

const vaccinationSchema = z.object({
  patient_id: z.string().min(1, 'Please select a patient'),
  vaccine_name: z.string().min(1, 'Please select a vaccine'),
  due_date: z.string().min(1, 'Due date is required'),
  administered_date: z.string().optional(),
  administered_by: z.string().optional(),
  notes: z.string().optional(),
});

export function VaccinationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(vaccinationSchema),
  });

  const administeredDate = watch('administered_date');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && patients.length > 0 && vaccines.length > 0) {
      fetchVaccinationRecord();
    }
  }, [id, isEditing, patients.length, vaccines.length]);

  const fetchInitialData = async () => {
    try {
      const patientsData = await dataService.getPatients();
      const vaccinesData = await dataService.getVaccines();

      setPatients(patientsData);
      setVaccines(vaccinesData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchVaccinationRecord = async () => {
    if (!id) return;

    try {
      const data = await dataService.getVaccinationRecord(id);

      if (data) {
        reset({
          patient_id: data.patient_id,
          vaccine_name: data.vaccine_name,
          due_date: data.due_date,
          administered_date: data.administered_date || '',
          administered_by: data.administered_by || '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching vaccination record:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const submitData = {
        ...data,
        administered_date: data.administered_date || null,
        administered_by: data.administered_by || null,
        notes: data.notes || null,
      };

      if (isEditing) {
        await dataService.updateVaccinationRecord(id, submitData);
      } else {
        await dataService.createVaccinationRecord(submitData);
      }

      navigate('/vaccinations');
    } catch (error) {
      console.error('Error saving vaccination:', error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        type="error"
      />

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Update Vaccination Record' : 'Schedule New Vaccination'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Update vaccination information' : 'Create a new vaccination schedule entry'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="patient_id" className="form-label">
                  Patient *
                </label>
                <select id="patient_id" {...register('patient_id')} className="form-input">
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="vaccine_name" className="form-label">
                  Vaccine *
                </label>
                <select id="vaccine_name" {...register('vaccine_name')} className="form-input">
                  <option value="">Select vaccine</option>
                  {vaccines.map((vaccine) => (
                    <option key={vaccine.id} value={vaccine.name}>
                      {vaccine.name}
                    </option>
                  ))}
                </select>
                {errors.vaccine_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.vaccine_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="due_date" className="form-label">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="due_date"
                  {...register('due_date')}
                  className="form-input"
                />
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="administered_date" className="form-label">
                  Administered Date
                </label>
                <input
                  type="date"
                  id="administered_date"
                  {...register('administered_date')}
                  className="form-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty if not yet administered
                </p>
              </div>
            </div>

            {administeredDate && (
              <div>
                <label htmlFor="administered_by" className="form-label">
                  Administered By
                </label>
                <input
                  type="text"
                  id="administered_by"
                  {...register('administered_by')}
                  className="form-input"
                  placeholder="Enter healthcare provider name"
                />
              </div>
            )}

            <div>
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="form-input"
                placeholder="Enter any relevant notes, reactions, or observations..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/vaccinations')}
                className="btn btn-outline px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-6 py-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : (
                  isEditing ? 'Update Record' : 'Schedule Vaccination'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}