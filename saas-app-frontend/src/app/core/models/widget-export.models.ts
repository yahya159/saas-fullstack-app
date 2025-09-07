export interface WidgetExport {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  embedCode: string;
  previewUrl: string;
  configUrl: string;
}

export interface WidgetApiRequest {
  name: string;
  description?: string;
  configuration: any;
  templateId?: string;
  attachedPlanId?: string;
  isPublic?: boolean;
  applicationId?: string;
}
