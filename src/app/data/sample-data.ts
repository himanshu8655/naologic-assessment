import { WorkCenterDocument, WorkOrderDocument } from "../models/work-order.models";

export const WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc1', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
  { docId: 'wc2', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
  { docId: 'wc3', docType: 'workCenter', data: { name: 'Assembly Station' } },
  { docId: 'wc4', docType: 'workCenter', data: { name: 'Quality Control' } },
  { docId: 'wc5', docType: 'workCenter', data: { name: 'Packaging Line' } },
];

export const WORK_ORDERS: WorkOrderDocument[] = [

  // ── Extrusion Line A ──────────────────────────────────────
  {
    docId: 'wo1', docType: 'workOrder',
    data: { name: 'Centrix Ltd', workCenterId: 'wc1',
      status: 'complete', startDate: '2025-08-01', endDate: '2025-11-30' },
  },
  {
    docId: 'wo2', docType: 'workOrder',
    data: { name: 'Genesis Phase 2', workCenterId: 'wc1',
      status: 'in-progress', startDate: '2026-01-01', endDate: '2026-04-30' },
  },

  // ── CNC Machine 1 ─────────────────────────────────────────
  {
    docId: 'wo3', docType: 'workOrder',
    data: { name: 'Rodriques Electrics', workCenterId: 'wc2',
      status: 'in-progress', startDate: '2025-09-01', endDate: '2025-12-31' },
  },
  {
    docId: 'wo4', docType: 'workOrder',
    data: { name: 'Complexk Systems', workCenterId: 'wc2',
      status: 'blocked', startDate: '2026-02-01', endDate: '2026-05-31' },
  },

  // ── Assembly Station ──────────────────────────────────────
  {
    docId: 'wo5', docType: 'workOrder',
    data: { name: 'Konsulting Inc', workCenterId: 'wc3',
      status: 'open', startDate: '2025-08-15', endDate: '2025-11-30' },
  },
  {
    docId: 'wo6', docType: 'workOrder',
    data: { name: 'Complex Systems', workCenterId: 'wc3',
      status: 'in-progress', startDate: '2026-01-15', endDate: '2026-05-15' },
  },

  // ── Quality Control ───────────────────────────────────────
  {
    docId: 'wo7', docType: 'workOrder',
    data: { name: 'McMarrow Distribution', workCenterId: 'wc4',
      status: 'blocked', startDate: '2025-09-01', endDate: '2026-02-02' },
  },
  {
    docId: 'wo8', docType: 'workOrder',
    data: { name: 'McMarrow Extension', workCenterId: 'wc4',
      status: 'complete', startDate: '2026-02-01', endDate: '2026-06-30' },
  },

  // ── Packaging Line ────────────────────────────────────────
  {
    docId: 'wo9', docType: 'workOrder',
    data: { name: 'Spartan Distribution', workCenterId: 'wc5',
      status: 'complete', startDate: '2025-08-01', endDate: '2025-11-30' },
  },
  {
    docId: 'wo10', docType: 'workOrder',
    data: { name: 'Spartan Phase 2', workCenterId: 'wc5',
      status: 'open', startDate: '2026-01-01', endDate: '2026-04-30' },
  },
];