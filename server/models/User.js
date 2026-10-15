import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: [
        'Director',
        'Deputy Director',
        'Staff Member',
        'Zonal Director',
        'Planning Officer',
        'Development Officer',
        'IT Officer',
        'Sectional Head',
        'Admin',
      ],
      default: 'Director',
    },
    employeeId: {
      type: String,
      trim: true,
      default: '',
    },
    office: {
      type: String,
      default: 'Zonal Education Office - Katugastota',
    },
    phone: {
      type: String,
      required: [true, 'Please provide your contact number'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to ensure empty string email is treated as undefined (avoids duplicate key on sparse index)
userSchema.pre('validate', function (next) {
  if (this.email === '' || (typeof this.email === 'string' && !this.email.trim())) {
    this.email = undefined;
  }
  next();
});

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
