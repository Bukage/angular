const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Models (reusing Assignment 2 schemas at repo root)
const Recipe = require('./Recipe');
const User = require('./User');
const Inventory = require('./UserInventory');

const RECIPE = 'Recipe';
const USER = 'User';
const INVENTORY = 'Inventory';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_inventory_db';
const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function connectToMongoDB() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
}

// Utilities reused from A2
function parserIngredients(blockText) {
  if (!blockText) return [];
  const replaceNewLine = String(blockText).replace(/\r?\n/g, ',');
  const textArray = replaceNewLine
    .split(',')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return textArray;
}

function parseInstructions(blockText) {
  if (!blockText) return [];
  const textArray = String(blockText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return textArray;
}

async function IdGenerator(collection) {
  const firstChar = collection.charAt(0);
  // Sort by ObjectId to get latest inserted document reliably
  const last = await mongoose.model(collection).findOne().sort({ _id: -1 });
  let nextId = `${firstChar}-00001`;
  if (last) {
    const lastNum = parseInt(
      collection === RECIPE
        ? last.recipeId.split('-')[1]
        : collection === USER
        ? last.userId.split('-')[1]
        : last.inventoryId.split('-')[1]
    );
    nextId = `${firstChar}-${String(lastNum + 1).padStart(5, '0')}`;
  }
  return nextId;
}

// Middleware to validate userId from query for protected routes
async function requireUser(req, res, next) {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'No userId provided' });
  }
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  req.user = user;
  next();
}

// ---------- Auth ----------
app.post('/api/auth/login-33968748', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.password !== password) return res.status(401).json({ error: 'Incorrect password' });
    return res.json({
      user: {
        userId: user.userId,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register-33968748', async (req, res) => {
  try {
    const { email, password, fullname, role, phone } = req.body;
    const userId = await IdGenerator(USER);
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      userId,
      email,
      password,
      fullname,
      role,
      phone,
    });
    await newUser.save();
    return res.status(201).json({
      user: {
        userId: newUser.userId,
        email: newUser.email,
        fullname: newUser.fullname,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['Email already registered to an existing account'] });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Dashboard ----------
app.get('/api/dashboard-33968748', requireUser, async (req, res) => {
  try {
    const [recipeCount, userCount, inventoryCount] = await Promise.all([
      Recipe.countDocuments(),
      User.countDocuments(),
      Inventory.countDocuments(),
    ]);
    const user = req.user;
    res.json({
      user: {
        userId: user.userId,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
      recipeCount,
      userCount,
      inventoryCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Recipes CRUD ----------
app.get('/api/recipes-33968748', requireUser, async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/recipes-33968748/:recipeId', requireUser, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ recipeId: req.params.recipeId });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/recipes-33968748', requireUser, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'chef') return res.status(403).json({ error: 'Only chefs can add recipes' });
    const {
      title,
      cuisineType,
      prepTime,
      difficulty,
      servings,
      ingredients,
      instructions,
      mealType,
      createdDate,
    } = req.body;
    const recipeId = await IdGenerator(RECIPE);
    const newRecipe = new Recipe({
      _id: new mongoose.Types.ObjectId(),
      recipeId,
      title,
      cuisineType,
      prepTime: parseInt(prepTime),
      difficulty,
      servings: parseInt(servings),
      ingredients: Array.isArray(ingredients) ? ingredients : parserIngredients(ingredients),
      instructions: Array.isArray(instructions) ? instructions : parseInstructions(instructions),
      mealType,
      userId: user.userId,
      chef: user.fullname,
      createdDate,
    });
    await newRecipe.save();
    res.status(201).json({ recipe: newRecipe });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['A recipe with this title already exists'] });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/recipes-33968748/:recipeId', requireUser, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'chef') return res.status(403).json({ error: 'Only chefs can update recipes' });
    const update = {
      title: req.body.title?.trim(),
      cuisineType: req.body.cuisineType?.trim(),
      prepTime: parseInt(req.body.prepTime),
      difficulty: req.body.difficulty,
      servings: parseInt(req.body.servings),
      ingredients: Array.isArray(req.body.ingredients)
        ? req.body.ingredients
        : parserIngredients(req.body.ingredients),
      instructions: Array.isArray(req.body.instructions)
        ? req.body.instructions
        : parseInstructions(req.body.instructions),
      mealType: req.body.mealType,
    };
    const updated = await Recipe.findOneAndUpdate(
      { recipeId: req.params.recipeId, userId: user.userId },
      update,
      { runValidators: true, new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ recipe: updated });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    if (error.code === 11000) {
      return res.status(400).json({ errors: ['A recipe with this title already exists'] });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/recipes-33968748/:recipeId', requireUser, async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'chef') return res.status(403).json({ error: 'Only chefs can delete recipes' });
    const recipe = await Recipe.findOne({ recipeId: req.params.recipeId });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.userId !== user.userId) return res.status(403).json({ error: 'Cannot delete others\' recipes' });
    await Recipe.deleteOne({ recipeId: req.params.recipeId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Inventory CRUD + stats ----------
app.get('/api/inventory-33968748', requireUser, async (req, res) => {
  try {
    const inventory = await Inventory.find({}).sort({ createdAt: -1 });
    const today = new Date();
    const expiredItems = [];
    const expiringSoonItems = [];
    const lowStockItems = [];

    for (const item of inventory) {
      const expireDate = new Date(item.expirationDate);
      const daysUntilExp = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilExp < 0) {
        expiredItems.push({ ...item.toObject(), daysExpired: Math.abs(daysUntilExp) });
      } else if (daysUntilExp <= 7) {
        expiringSoonItems.push({ ...item.toObject(), daysUntilExpiry: daysUntilExp });
      }
      if (item.quantity < 5) lowStockItems.push(item);
    }

    const valueCalculations = await Inventory.aggregate([{ $group: { _id: null, totalValue: { $sum: '$cost' } } }]);
    const inventoryStats = {
      totalValue: valueCalculations[0]?.totalValue || 0,
      totalItems: inventory.length,
      expiredCount: expiredItems.length,
      expiringSoonCount: expiringSoonItems.length,
      lowStockCount: lowStockItems.length,
    };

    res.json({ inventory, expiredItems, expiringSoonItems, lowStockItems, inventoryStats });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/inventory-33968748/:inventoryId', requireUser, async (req, res) => {
  try {
    const item = await Inventory.findOne({ inventoryId: req.params.inventoryId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/inventory-33968748', requireUser, async (req, res) => {
  try {
    const user = req.user;
    const { ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost, createdDate } = req.body;
    const inventoryId = await IdGenerator(INVENTORY);
    const newItem = new Inventory({
      _id: new mongoose.Types.ObjectId(),
      inventoryId,
      userId: user.userId,
      ingredientName: ingredientName.trim(),
      quantity: parseFloat(quantity),
      unit,
      category,
      purchaseDate,
      expirationDate,
      location,
      cost: parseFloat(cost),
      createdDate,
    });
    await newItem.save();
    res.status(201).json({ item: newItem });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/inventory-33968748/:inventoryId', requireUser, async (req, res) => {
  try {
    const updateData = {
      ingredientName: req.body.ingredientName?.trim(),
      quantity: req.body.quantity != null ? parseFloat(req.body.quantity) : undefined,
      unit: req.body.unit,
      category: req.body.category,
      purchaseDate: req.body.purchaseDate,
      expirationDate: req.body.expirationDate,
      location: req.body.location,
      cost: req.body.cost != null ? parseFloat(req.body.cost) : undefined,
    };
    const updatedItem = await Inventory.findOneAndUpdate(
      { inventoryId: req.params.inventoryId },
      updateData,
      { runValidators: true, new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json({ item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/inventory-33968748/:inventoryId', requireUser, async (req, res) => {
  try {
    const deleted = await Inventory.findOneAndDelete({ inventoryId: req.params.inventoryId });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Serve Angular build if available ----------
const angularDist = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');
app.use(express.static(angularDist));
// Catch-all for non-API routes (Express 5 compatible)
app.get(/^\/(?!api\/).*/, (req, res, next) => {
  res.sendFile(path.join(angularDist, 'index.html'), (err) => {
    if (err) next();
  });
});

(async () => {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
})();
