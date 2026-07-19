import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, Users, Syringe, TrendingUp } from 'lucide-react';
import { dataService } from '../../lib/dataService';
import { formatDate } from '../../lib/utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ReportsPage({ userRole }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVaccinations: 0,
    completedVaccinations: 0,
    overdueVaccinations: 0,
    scheduledVaccinations: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [vaccineDistribution, setVaccineDistribution] = useState([]);
  const [ageGroupData, setAgeGroupData] = useState([]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchVaccinationStats(),
        fetchMonthlyVaccinations(),
        fetchVaccineDistribution(),
        fetchAgeGroupDistribution(),
      ]);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinationStats = async () => {
    const data = await dataService.getVaccinationRecords();

    const now = new Date();
    const completed = data.filter(v => v.administered_date) || [];
    const overdue = data.filter(v => !v.administered_date && new Date(v.due_date) < now) || [];
    const scheduled = data.filter(v => !v.administered_date && new Date(v.due_date) >= now) || [];

    setStats({
      totalVaccinations: data.length || 0,
      completedVaccinations: completed.length,
      overdueVaccinations: overdue.length,
      scheduledVaccinations: scheduled.length,
    });
  };

  const fetchMonthlyVaccinations = async () => {
    const allRecords = await dataService.getVaccinationRecords();
    const data = allRecords.filter(v => v.administered_date);

    const monthlyCount = {};
    const last6Months = [];
    const now = new Date();

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Build the key from local date parts, not toISOString() — that
      // converts to UTC and can shift the month for users east of UTC
      // (e.g. midnight in Abuja/UTC+1 becomes the previous day/month in UTC).
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      last6Months.push({ month: monthName, vaccinations: 0 });
      monthlyCount[monthKey] = 0;
    }

    // Count vaccinations by month
    data.forEach(record => {
      if (record.administered_date) {
        const monthKey = record.administered_date.slice(0, 7);
        if (monthlyCount.hasOwnProperty(monthKey)) {
          monthlyCount[monthKey]++;
        }
      }
    });

    // Update the monthly data with counts
    const updatedMonthlyData = last6Months.map((month, index) => {
      const monthKey = Object.keys(monthlyCount)[index];
      return {
        ...month,
        vaccinations: monthlyCount[monthKey] || 0,
      };
    });

    setMonthlyData(updatedMonthlyData);
  };

  const fetchVaccineDistribution = async () => {
    const allRecords = await dataService.getVaccinationRecords();
    const data = allRecords.filter(v => v.administered_date);

    const vaccineCount = {};
    data.forEach(record => {
      const vaccineName = record.vaccines?.name || 'Unknown';
      vaccineCount[vaccineName] = (vaccineCount[vaccineName] || 0) + 1;
    });

    const distribution = Object.entries(vaccineCount).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));

    setVaccineDistribution(distribution);
  };

  const fetchAgeGroupDistribution = async () => {
    const data = await dataService.getPatients();

    const ageGroups = {
      '0-1 years': 0,
      '1-2 years': 0,
      '2-5 years': 0,
      '5-12 years': 0,
      '12+ years': 0,
    };

    data.forEach(patient => {
      const birthDate = new Date(patient.date_of_birth);
      const ageInMonths = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
      
      if (ageInMonths < 12) {
        ageGroups['0-1 years']++;
      } else if (ageInMonths < 24) {
        ageGroups['1-2 years']++;
      } else if (ageInMonths < 60) {
        ageGroups['2-5 years']++;
      } else if (ageInMonths < 144) {
        ageGroups['5-12 years']++;
      } else {
        ageGroups['12+ years']++;
      }
    });

    const ageGroupArray = Object.entries(ageGroups).map(([ageGroup, patients]) => ({
      ageGroup,
      patients,
    }));

    setAgeGroupData(ageGroupArray);
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      monthlyData,
      vaccineDistribution,
      ageGroupData,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vaccination-report-${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive vaccination data and insights
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportReport}
            className="btn btn-outline px-4 py-2"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Syringe className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Vaccinations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalVaccinations}
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
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.completedVaccinations}
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
                <Calendar className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue
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
                    Scheduled
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.scheduledVaccinations}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Vaccinations */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Vaccination Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="vaccinations" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vaccine Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vaccine Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vaccineDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vaccineDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Group Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Patient Age Groups
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vaccination Completion Rate */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Vaccination Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Completion Rate</span>
              <span className="text-sm font-bold text-green-600">
                {stats.totalVaccinations > 0 
                  ? Math.round((stats.completedVaccinations / stats.totalVaccinations) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ 
                  width: stats.totalVaccinations > 0 
                    ? `${(stats.completedVaccinations / stats.totalVaccinations) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedVaccinations}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.overdueVaccinations}
                </div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.scheduledVaccinations}
                </div>
                <div className="text-xs text-gray-500">Scheduled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}