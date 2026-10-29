import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const seedAdmin = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in server/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Cloud Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log('✅ Connected to MongoDB Cloud Atlas');

    // Check if an Admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });

    if (existingAdmin) {
      console.log(`ℹ️ An Admin user already exists:`);
      console.log(`   Name:  ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email || 'N/A'}`);
      console.log(`   Phone: ${existingAdmin.phone}`);
      console.log(`   Role:  ${existingAdmin.role}`);
      console.log('\nYou can use these credentials to log in, or update their password if needed.');
      process.exit(0);
    }

    // Create default Admin account
    const defaultEmail = 'admin@dpts.zeokatugastota.lk';
    const defaultPhone = '0812000000';
    const defaultPassword = 'adminPassword123';

    // Remove any conflicting user with same phone/email if needed
    await User.deleteOne({ $or: [{ email: defaultEmail }, { phone: defaultPhone }] });

    const newAdmin = await User.create({
      name: 'Development Section Administrator',
      email: defaultEmail,
      phone: defaultPhone,
      password: defaultPassword,
      role: 'Admin',
      employeeId: 'ADMIN-01',
      office: 'Zonal Education Office - Katugastota',
      status: 'active',
    });

    console.log('\n🎉 Successfully created default Admin account in MongoDB Atlas!');
    console.log('==================================================');
    console.log(`   Email / Contact: ${defaultEmail} (or ${defaultPhone})`);
    console.log(`   Password:        ${defaultPassword}`);
    console.log(`   Role:            ${newAdmin.role}`);
    console.log('==================================================');
    console.log('You can now log in using these credentials to enter the Admin Panel.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Admin account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
