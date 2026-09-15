// Read-only connection check. Never print the URI, credentials or car contents.
import mongoose from 'mongoose';

try {
  await mongoose.connect(process.env.TASK_OWN_CAR_STORAGE_URI, {
    serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, bufferCommands: false,
  });
  await mongoose.connection.db.command({ ping: 1 });
  const activeCars = await mongoose.connection.db.collection('cars').countDocuments({ isActive: true });
  console.log(JSON.stringify({ connected: true, activeCars }));
} catch (error) {
  const safeCode = value => typeof value === 'number' || (typeof value === 'string' && /^[A-Z0-9_]+$/.test(value)) ? value : undefined;
  console.log(JSON.stringify({ connected: false, errorType: error.name, code: safeCode(error.code), causeCode: safeCode(error.cause?.code) }));
} finally {
  await mongoose.disconnect().catch(() => {});
}
