const mongoose =  require('mongoose');

const recipeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
  recipeId: {
    type: String,
    required: true,
    unique: true,
    match: /^R-\d{5}$/
  },
  userId: {
    type: String,
    required: true,
   match: /^U-\d{5}$/,              
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    minlength: [3, 'Recipe title must be at least 3 characters long'],
    maxlength: [100, 'Recipe title cannot exceed 100 characters']
  },
  chef: {
    type: String,
    required: [true, 'Chef name is required'],
    minlength: [2, 'Chef name must be at least 2 characters long'],
    maxlength: [50, 'Chef name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s\-']+$/, 'Chef name can only contain letters, spaces, hyphens, and apostrophes']
  },
  ingredients: {
    type: [String],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 20 && v.every(ingredient => ingredient.length >= 3);
      },
      message: 'Must have between 1-20 ingredients, each ingredient must be at least 3 characters long'
    }
  },
  instructions: {
    type: [String],
    required: [true, 'At least one instruction step is required'],
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 15 && v.every(instruction => instruction.length >= 10);
      },
      message: 'Must have between 1-15 instruction steps, each step must be at least 10 characters long'
    }
  },
  mealType: {
    type: String,
    required: [true, 'Meal type is required'],
    enum: {
      values: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      message: 'Meal type must be Breakfast, Lunch, Dinner, or Snack'
    }
  },
  cuisineType: {
    type: String,
    required: [true, 'Cuisine type is required'],
    enum: {
      values: ['Italian', 'Asian', 'Mexican', 'American', 'French', 'Indian', 'Mediterranean', 'Other'],
      message: 'Please select a valid cuisine type'
    }
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [480, 'Preparation time cannot exceed 480 minutes (8 hours)']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    }
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Must serve at least 1 person'],
    max: [20, 'Cannot serve more than 20 people']
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



recipeSchema.index({ userId: 1 }); 
recipeSchema.index({ userId: 1, title: 1 }, { unique: true });

const Recipe = mongoose.model("Recipe", recipeSchema);



module.exports = Recipe;