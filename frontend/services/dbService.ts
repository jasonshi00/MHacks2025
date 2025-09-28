
import { UserDb, DbSchema } from '../types';

export const connectAndFetchSchemas = async (config: UserDb): Promise<DbSchema[]> => {
  console.log('Connecting to database with config:', config);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock schemas
  const mockSchemas: DbSchema[] = [
    {
      tableName: 'users',
      attributes: {
        id: 'SERIAL PRIMARY KEY',
        username: 'VARCHAR(255) NOT NULL',
        email: 'VARCHAR(255) UNIQUE NOT NULL',
        created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
      }
    },
    {
      tableName: 'products',
      attributes: {
        product_id: 'SERIAL PRIMARY KEY',
        name: 'VARCHAR(255) NOT NULL',
        description: 'TEXT',
        price: 'DECIMAL(10, 2) NOT NULL',
        stock: 'INTEGER'
      }
    },
    {
      tableName: 'orders',
      attributes: {
        order_id: 'SERIAL PRIMARY KEY',
        user_id: 'INTEGER REFERENCES users(id)',
        order_date: 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
        total_amount: 'DECIMAL(10, 2)'
      }
    }
  ];

  console.log('Fetched mock schemas:', mockSchemas);
  return mockSchemas;
};