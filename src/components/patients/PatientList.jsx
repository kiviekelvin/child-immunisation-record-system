import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Eye, Filter } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { formatDate, calculateAge } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function PatientList({ userRole }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await dataService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !genderFilter || patient.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage patient records and immunization schedules
          </p>
        </div>
        {userRole !== 'parent' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/patients/new"
              className="btn btn-primary px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="form-label">
              Search patients
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                placeholder="Search by name or parent..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="gender" className="form-label">
              Filter by gender
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="form-input pl-10"
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Patients table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Age</th>
                <th className="table-header">Gender</th>
                <th className="table-header">Parent/Guardian</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Registered</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">{patient.full_name}</div>
                  </td>
                  <td className="table-cell">
                    {calculateAge(patient.date_of_birth)} years
                  </td>
                  <td className="table-cell">
                    <span className="capitalize">{patient.gender}</span>
                  </td>
                  <td className="table-cell">{patient.parent_name}</td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="table-cell">
                    {formatDate(patient.created_at, 'MMM d, yyyy')}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/patients/${patient.id}/view`}
                        className="text-primary-600 hover:text-primary-900"
                        title="View patient"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {userRole !== 'parent' && (
                        <Link
                          to={`/patients/${patient.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit patient"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || genderFilter ? 'No patients found matching your criteria.' : 'No patients registered yet.'}
            </div>
            {userRole !== 'parent' && !searchTerm && !genderFilter && (
              <Link
                to="/patients/new"
                className="mt-4 inline-flex items-center btn btn-primary px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}