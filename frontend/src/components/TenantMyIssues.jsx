import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertCircle, User, Wrench } from 'lucide-react';
import apiService from '../services/api';

const TenantMyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await apiService.getIssues();
      setIssues(data || []);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      reviewing: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Under Review' },
      sent_to_provider: { color: 'bg-purple-100 text-purple-800', icon: Wrench, label: 'Sent to Provider' },
      in_progress: { color: 'bg-orange-100 text-orange-800', icon: Wrench, label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      emergency: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      normal: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={urgencyConfig[urgency] || urgencyConfig.normal}>
        {urgency || 'Normal'}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your issues...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Reported</h3>
            <p className="text-gray-600">
              You haven't reported any issues yet. Use the "Report Issues" tab to submit a new issue.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">My Reported Issues</h3>
        <Badge variant="outline" className="text-sm">
          {issues.length} Total
        </Badge>
      </div>

      {issues.map((issue) => (
        <Card key={issue.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {issue.issue_category || 'General Issue'}
                  </h4>
                  {getUrgencyBadge(issue.urgency_level)}
                </div>
                
                {issue.unit_number && (
                  <p className="text-sm text-gray-600">Unit: {issue.unit_number}</p>
                )}
                
                {/* Show assigned provider if exists */}
                {issue.assigned_provider_name && (
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">
                      Assigned to: {issue.assigned_provider_name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {getStatusBadge(issue.status)}
                <p className="text-xs text-gray-500">
                  Reported: {formatDate(issue.created_at)}
                </p>
                {issue.resolved_at && (
                  <p className="text-xs text-green-600">
                    Resolved: {formatDate(issue.resolved_at)}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-3">
              <h5 className="font-medium text-gray-900 mb-1 text-sm">Description:</h5>
              <p className="text-gray-700 text-sm">{issue.description}</p>
            </div>

            {issue.ai_summary && (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <h5 className="font-medium text-blue-900 mb-1 text-xs">AI Summary:</h5>
                <p className="text-xs text-blue-800">{issue.ai_summary}</p>
              </div>
            )}

            {issue.pm_notes && (
              <div className="bg-green-50 p-3 rounded-lg mb-3">
                <h5 className="font-medium text-green-900 mb-1 text-xs">Property Manager Notes:</h5>
                <p className="text-xs text-green-800">{issue.pm_notes}</p>
              </div>
            )}

            {issue.resolution_notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-1 text-xs">Resolution:</h5>
                <p className="text-xs text-gray-700">{issue.resolution_notes}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mt-3 pt-3 border-t">
              {issue.best_time && (
                <div><span className="font-medium">Best Time:</span> {issue.best_time}</div>
              )}
              {issue.permission_to_enter && (
                <div><span className="font-medium">Entry Permission:</span> {issue.permission_to_enter}</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TenantMyIssues;
