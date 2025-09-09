export const DATA_BASE: Data[] = [];

export interface Data {
  id: number;
  clientId: string;
  clientKeycloakSecret: string;
  clientSaasSecret: string;
}
