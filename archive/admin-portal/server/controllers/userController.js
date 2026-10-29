import User from '../models/User.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Approve / Deactivate / Set Pending) (Admin only)
// @route   PUT /api/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const { id } = req.params;

    const validStatuses = ['active', 'pending', 'inactive'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, pending, or inactive.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (status) user.status = status;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User status successfully updated to ${user.status}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        office: user.office,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own Administrator account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};
