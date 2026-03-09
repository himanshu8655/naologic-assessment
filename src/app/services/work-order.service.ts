import { Injectable, signal } from '@angular/core';
import {
  WorkCenterDocument,
  WorkOrderDocument,
  WorkOrderStatus,
} from '../models/work-order.models';
import { WORK_CENTERS, WORK_ORDERS } from '../data/sample-data';
import { DateUtilsService } from './date-utils.service';

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private _workCenters = signal<WorkCenterDocument[]>(WORK_CENTERS);
  private _workOrders = signal<WorkOrderDocument[]>(WORK_ORDERS);

  readonly workCenters = this._workCenters.asReadonly();
  readonly workOrders = this._workOrders.asReadonly();

  constructor(private dateUtils: DateUtilsService) {}

  getOrdersForWorkCenter(wcId: string): WorkOrderDocument[] {
    return this._workOrders().filter((o) => o.data.workCenterId === wcId);
  }

  createWorkOrder(data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  }): void {
    const id = 'wo_' + Date.now();
    const newOrder: WorkOrderDocument = {
      docId: id,
      docType: 'workOrder',
      data: { ...data },
    };
    this._workOrders.update((orders) => [...orders, newOrder]);
  }

  updateWorkOrder(
    docId: string,
    data: {
      name: string;
      status: WorkOrderStatus;
      startDate: string;
      endDate: string;
    },
  ): void {
    this._workOrders.update((orders) =>
      orders.map((o) => (o.docId === docId ? { ...o, data: { ...o.data, ...data } } : o)),
    );
  }

  deleteWorkOrder(docId: string): void {
    this._workOrders.update((orders) => orders.filter((o) => o.docId !== docId));
  }

  /**
   * Returns true if [startDate, endDate] overlaps any existing order
   * on the same work center, optionally excluding one order (for edit).
   */
  hasOverlap(
    workCenterId: string,
    startDate: string,
    endDate: string,
    excludeDocId?: string,
  ): boolean {
    const s = this.dateUtils.parseDate(startDate);
    const e = this.dateUtils.parseDate(endDate);

    return this._workOrders().some((o) => {
      if (o.data.workCenterId !== workCenterId) return false;
      if (excludeDocId && o.docId === excludeDocId) return false;
      const os = this.dateUtils.parseDate(o.data.startDate);
      const oe = this.dateUtils.parseDate(o.data.endDate);
      return s < oe && e > os;
    });
  }
}
