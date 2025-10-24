const mongoose =  require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
userId: {
    type: String,
    required:true,
    unique: true,
    match: /^U-\d{5}$/
},
email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
},
password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
    validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]+$/.test(v);
    },
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
},
fullname: {
    type: String,
    required: [true, 'Full name is required'],
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes']
},
role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
    values: ['admin', 'chef', 'manager'],
    message: 'Role must be either admin, chef, or manager'
    }
},
phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+61\s?4\d{2}\s?\d{3}\s?\d{3}$/, 'Please enter a valid phone number']
}
}, {
timestamps: true
});



const User = mongoose.model("User", userSchema);

module.exports = User;

