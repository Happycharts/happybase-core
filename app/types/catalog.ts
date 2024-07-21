// app/types/catalog.ts

export interface CatalogProperty {
    value?: string;
    valueFromSecret?: {
      name: string;
      key: string;
    };
    valueFromConfigMap?: {
      name: string;
      key: string;
    };
  }
  
  interface CatalogSpec {
    connector: {
      generic: {
        connectorName: string;
        properties?: Record<string, CatalogProperty>;
      };
    };
  }
  
  export interface CatalogConfig {
    name: string;
    labels: Record<string, string>;
    spec: CatalogSpec;
  }