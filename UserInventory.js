const mongoose =  require('mongoose');

const userInventorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
  inventoryId: {
    type: String,
    require:true,
    unique: true,
    match: /^I-\d{5}$/
  },
  userId: {
    type: String,
    required: true,
    match: /^U-\d{5}$/,
    ref: 'User'
  },
  ingredientName: {
    type: String,
    required: [true, 'Ingredient name is required'],
    minlength: [2, 'Ingredient name must be at least 2 characters long'],
    maxlength: [50, 'Ingredient name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s\-]+$/, 'Ingredient name can only contain letters, spaces, and hyphens']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0'],
    max: [9999, 'Quantity cannot exceed 9999']
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    enum: {
      values: ['pieces', 'kg', 'g', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'dozen'],
      message: 'Please select a valid unit of measurement'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Vegetables', 'Fruits', 'Meat', 'Dairy', 'Grains', 'Spices', 'Beverages', 'Frozen', 'Canned', 'Other'],
      message: 'Please select a valid category'
    }
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Purchase date cannot be in the future'
    },
    set: function (value) {
    if (typeof value === "string") {
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) {
        throw new Error("Date must be in YYYY-MM-DD format");
      }
      return new Date(value);
    }
    return value;
  }
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required'],
    validate: {
      validator: function(v) {
        return v > this.purchaseDate;
      },
      message: 'Expiration date must be after the purchase date'
    },
    set: function (value) {
    if (typeof value === "string") {
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) {
        throw new Error("Date must be in YYYY-MM-DD format");
      }
      return new Date(value);
    }
    return value;
  }
  },
  location: {
    type: String,
    required: [true, 'Storage location is required'],
    enum: {
      values: ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cupboard'],
      message: 'Please select a valid storage location'
    }
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0.01, 'Cost must be at least $0.01'],
    max: [999.99, 'Cost cannot exceed $999.99']
  },
  createdDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Created date cannot be in the future'
    },
    set: function (value) {
    if (typeof value === "string") {
      if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) {
        throw new Error("Date must be in YYYY-MM-DD format");
      }
      return new Date(value);
    }
    return value;
  }
  }
});




userInventorySchema.index({ userId: 1 })

const Inventory = mongoose.model('Inventory', userInventorySchema, "inventory");

module.exports= Inventory;
