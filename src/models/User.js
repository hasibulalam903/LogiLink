// src/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"]
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email"
      }
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      index: true,
      validate: {
        validator: function (value) {
          const phone = parsePhoneNumberFromString(value, "BD");
          return phone ? phone.isValid() : false;
        },
        message: "Please provide a valid Bangladeshi phone number"
      }
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },

    role: {
      type: String,
      enum: ["customer", "owner", "driver", "admin"],
      default: "customer",
      index: true
    },

    profileImage: {
      type: String,
      default: ""
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    isPhoneVerified: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
      index: true
    },

    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

/* ===========================
   Indexes
=========================== */

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

/* ===========================
   Virtual
=========================== */

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

/* ===========================
   Pre Save Middleware
=========================== */

userSchema.pre("save", async function (next) {

  if (this.isModified("phone")) {
    const phone = parsePhoneNumberFromString(this.phone, "BD");

    if (!phone || !phone.isValid()) {
      return next(new Error("Invalid phone number"));
    }

    this.phone = phone.number;
  }

  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* ===========================
   Instance Methods
=========================== */

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* ===========================
   Static Methods
=========================== */

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ status: "active" });
};

/* ===========================
   Export Model
=========================== */

module.exports = mongoose.model("User", userSchema);