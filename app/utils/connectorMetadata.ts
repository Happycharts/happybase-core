// utils/connectorMetadata.ts

export interface ConnectorConfig {
  name: string;
  properties: Record<string, string>;
}

export const connectorTemplates: Record<string, ConnectorConfig> = {
  'Amazing Kinesis': {
    name: 'kinesis',
    properties: {
      'connector.name': 'kinesis',
      'kinesis.access-key': '',
      'kinesis.secret-key': '',
    },
  },
  'Redshift': {
    name: 'redshift',
    properties: {
      'connector.name': 'redshift',
      'connection-url': 'jdbc:redshift://example.net:5439/database',
      'connection-user': '',
      'connection-password': '',
    },
  },
  'Cassandra': {
    name: 'cassandra',
    properties: {
      'connector.name': 'cassandra',
      'cassandra.contact-points': '',
      'cassandra.load-policy.dc-aware.local-dc': '',
    },
  },
  'Clickhouse': {
    name: 'clickhouse',
    properties: {
      'connector.name': 'clickhouse',
      'connection-url': 'jdbc:clickhouse://host1:8123/',
      'connection-user': '',
      'connection-password': '',
    },
  },
};