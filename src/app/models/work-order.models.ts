export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
export type Timescale = 'Hour' | 'Day' | 'Week' | 'Month';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string; // ISO format
    endDate: string; // ISO format
  };
}

export interface TimelineColumn {
  date: Date;
  label: string;
  isCurrentPeriod: boolean;
  todayFraction: number;
  width: number;
}

export interface RenderedWorkOrder {
  order: WorkOrderDocument;
  x: number; // px from left
  width: number; // px width
  top: number; // px from top of grid
}

export interface PanelMode {
  type: 'create' | 'edit';
  workCenterId?: string;
  prefillStartDate?: string;
}

export const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  complete: 'Complete',
  blocked: 'Blocked',
};

export const STATUS_OPTIONS: { value: WorkOrderStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
  { value: 'blocked', label: 'Blocked' },
];
