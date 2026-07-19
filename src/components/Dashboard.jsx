import React, { useState, useEffect } from 'react';
import { Users, Syringe, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { dataService } from '../lib/dataService';
import { formatDate, getVaccineStatus } from '../lib/utils';

export function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    vaccinationsThisMonth: 0,
    overdueVaccinations: 0,
    upcomingVaccinations: 0,
  });
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (user.role === 'parent') {
        await fetchParentDashboard();
      } else {
        await fetchHealthcareDashboard();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentDashboard = async () => {
    const allPatients = await dataService.getPatients();
    const children = allPatients.filter((p) => p.parent_id === user.id);

    if (children.length > 0) {
      const childIds = children.map((child) => child.id);
      const allVaccinations = await dataService.getVaccinationRecords();
      const vaccinations = allVaccinations.filter((v) => childIds.includes(v.patient_id));

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const overdue = vaccinations.filter((v) => !v.administered_date && new Date(v.due_date) < now);
      const upcoming = vaccinations.filter((v) => !v.administered_date && new Date(v.due_date) >= now);
      const thisMonthVaccinations = vaccinations.filter(
        (v) => v.administered_date && new Date(v.administered_date) >= thisMonth
      );

      setStats({
        totalPatients: children.length,
        vaccinationsThisMonth: thisMonthVaccinations.length,
        overdueVaccinations: overdue.length,
        upcomingVaccinations: upcoming.length,
      });

      // dataService.getVaccinationRecords() already attaches .patients and
      // .vaccines to each record, so no separate lookup is needed here.
      setUpcomingVaccinations(
        upcoming.slice(0, 5).map((v) => ({
          id: v.id,
          patient_name: v.patients?.full_name || 'Unknown',
          vaccine_name: v.vaccines?.name || 'Unknown',
          due_date: v.due_date,
          status: getVaccineStatus(v.due_date, v.administered_date),
        }))
      );
    } else {
      setStats({
        totalPatients: 0,
        vaccinationsThisMonth: 0,
        overdueVaccinations: 0,
        upcomingVaccinations: 0,
      });
      setUpcomingVaccinations([]);
    }
  };

  const fetchHealthcareDashboard = async () => {
    const patients = await dataService.getPatients();
    const vaccinations = await dataService.getVaccinationRecords();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const overdue = vaccinations.filter((v) => !v.administered_date && new Date(v.due_date) < now);
    const upcoming = vaccinations.filter((v) => !v.administered_date && new Date(v.due_date) >= now);
    const thisMonthVaccinations = vaccinations.filter(
      (v) => v.administered_date && new Date(v.administered_date) >= thisMonth
    );

    setStats({
      totalPatients: patients.length,
      vaccinationsThisMonth: thisMonthVaccinations.length,
      overdueVaccinations: overdue.length,
      upcomingVaccinations: upcoming.length,
    });

    setUpcomingVaccinations(
      upcoming.slice(0, 5).map((v) => ({
        id: v.id,
        patient_name: v.patients?.full_name || 'Unknown',
        vaccine_name: v.vaccines?.name || 'Unknown',
        due_date: v.due_date,
        status: getVaccineStatus(v.due_date, v.administered_date),
      }))
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'due': return 'text-orange-600 bg-orange-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.full_name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with {user.role === 'parent' ? 'your children' : 'your patients'} today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {user.role === 'parent' ? 'Children' : 'Total Patients'}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalPatients}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Syringe className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vaccinations This Month
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.vaccinationsThisMonth}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue Vaccinations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.overdueVaccinations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Vaccinations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.upcomingVaccinations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Vaccinations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Upcoming Vaccinations
          </h3>
          {upcomingVaccinations.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {upcomingVaccinations.map((vaccination, index) => (
                  <li key={vaccination.id}>
                    <div className="relative pb-8">
                      {index !== upcomingVaccinations.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            vaccination.status === 'overdue' ? 'bg-red-500' :
                            vaccination.status === 'due' ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            <Syringe className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {vaccination.vaccine_name} for{' '}
                              <span className="font-medium text-gray-900">
                                {vaccination.patient_name}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(vaccination.status)}`}>
                                {vaccination.status}
                              </span>
                              <time dateTime={vaccination.due_date}>
                                {formatDate(vaccination.due_date, 'MMM d')}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No upcoming vaccinations scheduled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}