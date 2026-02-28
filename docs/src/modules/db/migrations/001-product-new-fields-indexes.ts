import { getDb } from '../mongodb';

export async function runMigration(): Promise<void> {
  const db = await getDb();

  try {
    // Create sparse index on promos.code in products collection
    const promosCodeIndex = await db.collection('products').createIndex(
      { 'promos.code': 1 },
      { sparse: true }
    );
    console.log(`Created index on products.promos.code: ${promosCodeIndex}`);

    // Create unique index on code in promo_codes collection
    const codeUniqueIndex = await db.collection('promo_codes').createIndex(
      { code: 1 },
      { unique: true }
    );
    console.log(`Created unique index on promo_codes.code: ${codeUniqueIndex}`);

    // Create index on applicableProductIds in promo_codes collection
    const applicableProductIdsIndex = await db.collection('promo_codes').createIndex(
      { applicableProductIds: 1 }
    );
    console.log(`Created index on promo_codes.applicableProductIds: ${applicableProductIdsIndex}`);

    console.log('All indexes created successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Support direct execution
if (require.main === module) {
  runMigration()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}
