import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { dataService } from '../../lib/dataService';
import { authService } from '../../lib/authService';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AlertModal } from '../ui/Modal';

const patientSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  parent_id: z.string().min(1, 'Please select a parent/guardian'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  emergency_contact: z.string().min(10, 'Emergency contact is required'),
  medical_notes: z.string().optional(),
});

export function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchPatient();
    } else {
      setInitialLoading(false);
    }
  }, [id, isEditing]);

  const fetchParents = async () => {
    try {
      const data = await authService.getParents();
      setParents(data);
    } catch (error) {
      console.error('Error fetching parent accounts:', error);
    }
  };

  const fetchPatient = async () => {
    if (!id) return;

    try {
      setInitialLoading(true);
      const data = await dataService.getPatient(id);

      if (data) {
        reset({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          parent_id: data.parent_id || '',
          phone: data.phone,
          email: data.email,
          address: data.address,
          emergency_contact: data.emergency_contact,
          medical_notes: data.medical_notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const selectedParent = parents.find((p) => p.id === data.parent_id);
      const submitData = {
        ...data,
        parent_name: selectedParent?.full_name || '',
      };

      if (isEditing) {
        await dataService.updatePatient(id, submitData);
      } else {
        await dataService.createPatient(submitData);
      }

      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
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
              {isEditing ? 'Edit Patient' : 'Add New Patient'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Update patient information' : 'Enter patient details to create a new record'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  {...register('full_name')}
                  className="form-input"
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="date_of_birth" className="form-label">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  {...register('date_of_birth')}
                  className="form-input"
                />
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="form-label">
                  Gender *
                </label>
                <select id="gender" {...register('gender')} className="form-input">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="parent_id" className="form-label">
                  Parent/Guardian *
                </label>
                <select id="parent_id" {...register('parent_id')} className="form-input">
                  <option value="">Select parent/guardian</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.full_name} ({parent.email})
                    </option>
                  ))}
                </select>
                {errors.parent_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.parent_id.message}</p>
                )}
                {parents.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    No parent accounts found yet. A parent needs to register first.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className="form-input"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="form-input"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="form-label">
                Address *
              </label>
              <textarea
                id="address"
                rows={3}
                {...register('address')}
                className="form-input"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="emergency_contact" className="form-label">
                Emergency Contact *
              </label>
              <input
                type="tel"
                id="emergency_contact"
                {...register('emergency_contact')}
                className="form-input"
                placeholder="Enter emergency contact number"
              />
              {errors.emergency_contact && (
                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="medical_notes" className="form-label">
                Medical Notes
              </label>
              <textarea
                id="medical_notes"
                rows={4}
                {...register('medical_notes')}
                className="form-input"
                placeholder="Enter any relevant medical information, allergies, or special notes..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/patients')}
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
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Patient' : 'Add Patient'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}