import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { formatDate, getVaccineStatus } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function VaccinationList({ userRole }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const data = await dataService.getVaccinationRecords();
      setVaccinations(data);
    } catch (error) {
      console.error('Error fetching vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'due':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Calendar className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'due': return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const filteredVaccinations = vaccinations.filter(vaccination => {
    const status = getVaccineStatus(vaccination.due_date, vaccination.administered_date);
    const matchesSearch = 
      vaccination.patients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaccination.vaccines?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold text-gray-900">Vaccinations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage vaccination records and schedules
          </p>
        </div>
        {userRole !== 'parent' && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/vaccinations/new"
              className="btn btn-primary px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Vaccination
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="form-label">
              Search vaccinations
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
                placeholder="Search by patient or vaccine..."
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="form-label">
              Filter by status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All statuses</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="due">Due</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vaccinations table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Patient</th>
                <th className="table-header">Vaccine</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Administered</th>
                <th className="table-header">Administered By</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVaccinations.map((vaccination) => {
                const status = getVaccineStatus(vaccination.due_date, vaccination.administered_date);
                return (
                  <tr key={vaccination.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">
                        {vaccination.patients?.full_name}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {vaccination.vaccines?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vaccination.vaccines?.description}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(vaccination.due_date)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {vaccination.administered_date ? (
                        formatDate(vaccination.administered_date)
                      ) : (
                        <span className="text-gray-400">Not administered</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {vaccination.administered_by || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {!vaccination.administered_date && userRole !== 'parent' && (
                        <Link
                          to={`/vaccinations/${vaccination.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Mark as Given
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredVaccinations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm || statusFilter ? 'No vaccinations found matching your criteria.' : 'No vaccinations scheduled yet.'}
            </div>
            {userRole !== 'parent' && !searchTerm && !statusFilter && (
              <Link
                to="/vaccinations/new"
                className="mt-4 inline-flex items-center btn btn-primary px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Vaccination
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}