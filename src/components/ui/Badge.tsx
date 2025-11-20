import { ReactNode } from 'react';
import type { ProjectStatus, RequestStatus, RequestPriority, ApprovalStatus } from '../../lib/database.types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ children, variant = 'gray', size = 'md' }: BadgeProps) {
  const variantStyles = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const statusConfig: Record<ProjectStatus, { label: string; variant: 'gray' | 'yellow' | 'blue' | 'green' | 'red' | 'orange' }> = {
    draft: { label: 'Draft', variant: 'gray' },
    pending_supervisor: { label: 'Pending Supervisor', variant: 'yellow' },
    pending_hsm: { label: 'Pending HSM', variant: 'yellow' },
    pending_technician: { label: 'Pending Technician', variant: 'yellow' },
    approved: { label: 'Approved', variant: 'green' },
    in_progress: { label: 'In Progress', variant: 'blue' },
    completed: { label: 'Completed', variant: 'green' },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const statusConfig: Record<RequestStatus, { label: string; variant: 'orange' | 'yellow' | 'blue' | 'green' | 'red' | 'gray' }> = {
    new: { label: 'New', variant: 'orange' },
    under_review: { label: 'Under Review', variant: 'yellow' },
    quoted: { label: 'Quoted', variant: 'blue' },
    accepted: { label: 'Accepted', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'red' },
    converted_to_project: { label: 'Converted to Project', variant: 'gray' },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const priorityConfig: Record<RequestPriority, { label: string; variant: 'gray' | 'yellow' | 'orange' | 'red' }> = {
    low: { label: 'Low', variant: 'gray' },
    medium: { label: 'Medium', variant: 'yellow' },
    high: { label: 'High', variant: 'orange' },
    urgent: { label: 'Urgent', variant: 'red' },
  };

  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const statusConfig: Record<ApprovalStatus, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
    pending: { label: 'Pending', variant: 'yellow' },
    approved: { label: 'Approved', variant: 'green' },
    changes_requested: { label: 'Changes Requested', variant: 'red' },
  };

  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
