/**
 * Mongoose Set Up Code
 * 
 * @author FIT2095 Week 6 Lab
 */
const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/user_inventory_db';

async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

const Recipe = require("./models/schemas/Recipe");
const RECIPE = "Recipe";
const User= require("./models/schemas/User");
const USER = "User";
const UserInventory = require("./models/schemas/UserInventory");
const INVENTORY = "Inventory";


const path = require('path');

const express = require("express");

const PORT_NUMBER = 8080;


const app = express();


app.use(express.static("node_modules/bootstrap/dist/css"));

app.use(express.static("node_modules/bootstrap/dist/js"));

app.use(express.static("node_modules/bootstrap-icons/font"));

app.use(express.static('public'));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: false }));



app.get("/", (request, response) => {
    const { error } = request.query;
    response.render("login", {error});
});




app.post("/api/login-33968748", async (request, response) => {

  const { email, password } = request.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {d
      return response.redirect("/?error=Account%20not%20found");
    }

    if (user.password !== password) {
      return response.redirect("/?error=Incorrect%20password");
    }

 response.redirect(`/api/home-33968748?userId=${user.userId}`);  

} catch (err) {
    response.redirect("/?error=Server%20error,%20sorry%20please%20try%20logging%20in%20again");
  }
});

app.get("/api/register-33968748", (request, response) => {
    response.render("registration", {errors: []});
})

app.post("/api/register-33968748", async (request, response) => {
    try {
        const {email, password, fullname, role, phone} = request.body;
        const userId = await IdGenerator(USER);
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            userId: userId,
            email: email,
            password: password,
            fullname: fullname,
            role: role,
            phone: phone
            
        })
        
await newUser.save();
        response.redirect('/');
    } catch (error) {
       
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return response.status(400).render("registration", {errors: errors});
        }
        
        if (error.code === 11000) {
            return response.status(400).render("registration", {errors:['Email already registered to an existing account']});
        }
        
        response.status(500).render("error", {error: 'Server Error'});
    }
})

app.get('/api/home-33968748', async(request, response) => {

    const {userId} = request.query;

    if (!userId) {
return response.redirect("/?error=No%User%ID%was%provided");  
}
try {
    const user = await User.findOne({ userId });
    
        
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        } 
const recipeCount = await Recipe.countDocuments();
    const userCount = await User.countDocuments();
    const inventoryCount = await UserInventory.countDocuments();
  response.render("home", { user, recipeCount, userCount, inventoryCount });
    } catch (err) {
        response.status(500).redirect("/?error=Server%20error");
    }

})

app.get("/api/add-recipe-33968748", async (request, response) => {
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        if (user.role !== 'chef') {
            return response.status(403).render("error", { 
                error: "Access Denied: Only chefs can add recipes" 
            });
        }
        
        response.render("recipe-add", { 
            user,
            errors: [],
            formData: {
                title: '',
                cuisineType: '',
                prepTime: '',
                difficulty: '',
                servings: '',
                ingredients: '',
                instructions: '',
                mealType: ''
            }
        });
    } catch (err) {
        response.status(500).render("error", { error: "Server error" });
    }
});

app.post("/api/add-recipe-33968748", async (request, response) => {
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        if (user.role !== 'chef') {
            return response.status(403).render("error", { 
                error: "Access Denied: Only chefs can add recipes" 
            });
        }
        
        const { title, cuisineType, prepTime, difficulty, servings, ingredients, instructions, mealType, createdDate } = request.body;
        const recipeId = await  IdGenerator(RECIPE);
        const newRecipe = new Recipe({
            _id: new mongoose.Types.ObjectId(),
            recipeId:recipeId,
            title,
            cuisineType,
            prepTime: parseInt(prepTime),
            difficulty:difficulty,
            servings: parseInt(servings),
            ingredients: parserIngredients(ingredients),
            instructions: parseInstructions(instructions),
            mealType: mealType,
            userId: user.userId,
            chef: user.fullname,
            createdDate: createdDate

            
        });
        
        await newRecipe.save();
        
        response.redirect(`/api/home-33968748?userId=${userId}`);
        
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return response.status(400).render("recipe-add", {
                user: await User.findOne({ userId }),
                errors,
                formData: request.body
            });
        }
        
        if (error.code === 11000) {
            return response.status(400).render("recipe-add", {
                user: await User.findOne({ userId }),
                errors: ['A recipe with this name already exists'],
                formData: request.body
            });
        }
        
        response.status(500).render("error", { error: 'Server Error' });
    }
});


app.get("/api/all-recipes-33968748", async (request, response) => {
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
       
        const recipes = await Recipe.find().sort({ createdAt: -1 });
        
        response.render("all-recipes", { 
            user,
            recipes
        });
    } catch (err) {
        console.error(err);
        response.status(500).render("error", { error: "Server error" });
    }
});

app.post("/api/delete-recipe-33968748", async (request, response) => {
    const { userId } = request.query;
    const { recipeId } = request.body;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
   
        if (user.role !== 'chef') {
            return response.status(403).render("error", { 
                error: "Access Denied: Only chefs can delete recipes" 
            });
        }
        
    
        const recipe = await Recipe.findOne({ recipeId });
        
        if (!recipe) {
            return response.redirect(`/api/all-recipes-33968748?userId=${userId}&error=Recipe%20not%20found`);
        }
        

        if (recipe.userId !== user.userId) {
            return response.status(403).render("error", { 
                error: "Access Denied: You can only delete recipes you created" 
            });
        }
        
        await Recipe.findOneAndDelete({ recipeId });
      
        response.redirect(`/api/all-recipes-33968748?userId=${userId}`);
    } catch (err) {
        console.error(err);
        response.status(500).render("error", { error: "Server error" });
    }
});



app.get("/api/delete-recipe-33968748", async (request, response) => {
    const {recipeId, userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        if (user.role !== 'chef') {
            return response.status(403).render("error", { 
                error: "Access Denied: Only chefs can delete recipes" 
            });
        }
         let recipeSelect = null;
    if (recipeId) {
        
        recipeSelect = await Recipe.findOne({ recipeId}); 
        
    }
        const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
        
        response.render("delete-recipe", { 
            user,
            recipes,
            recipeSelect
           
        });
    } catch (err) {
        console.error(err);
        response.status(500).render("error", { error: "Server error" });
    }
});

app.get("/api/add-item-33968748", async (request, response) => {
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        response.render("add-item", { 
            user,
            errors: [],
            formData: {
                ingredientName: '',
                quantity: '',
                unit: '',
                category: '',
                purchaseDate: '',
                expirationDate: '',
                location: '',
                cost: '',
                createdDate: ''
            }
        });
    } catch (err) {
        response.status(500).render("error", { error: "Server error" });
    }
});

app.post("/api/add-item-33968748", async (request, response) => {

    console.log("request.body:", request.body);
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        const { ingredientName, quantity, unit, category, purchaseDate, expirationDate, location, cost , createdDate} = request.body;
        const inventoryId = await IdGenerator(INVENTORY);
       
        
        const newItem = new UserInventory({
            _id: new mongoose.Types.ObjectId(),
            inventoryId: inventoryId,
            userId: user.userId,
            ingredientName: ingredientName.trim(),
            quantity: parseFloat(quantity),
            unit: unit,
            category: category,
            purchaseDate: purchaseDate,
            expirationDate:expirationDate,
            location: location,
            cost: parseFloat(cost),
            createdDate: createdDate
        });
        
        await newItem.save();
        
        response.redirect(`/api/all-items-33968748?userId=${userId}`);
        
    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return response.status(400).render("add-item", {
                user: await User.findOne({ userId }),
                errors,
                formData: request.body
            });
        }
        
        response.status(500).render("error", { error: 'Server Error' });
    }
});

// GET: Display all inventory items with sorting and filtering
app.get("/api/all-items-33968748", async (request, response) => {
    const { userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        // Fetch all inventory items
        const inventory = await UserInventory.find({}).sort({ createdAt: -1 });
        
        // FEATURE 1: Expiration Date Tracking
        const today = new Date();
        const expiredItems = [];
        const expiringSoonItems = [];
        
        inventory.forEach(item => {
            const expireDate = new Date(item.expirationDate);
            const daysUntilExp = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExp < 0) {
                expiredItems.push({
                    ...item.toObject(),
                    daysExpired: Math.abs(daysUntilExp)
                });
            } else if (daysUntilExp <= 7) {
                expiringSoonItems.push({
                    ...item.toObject(),
                    daysUntilExpiry: daysUntilExp
                });
            }
        });
        
      
        const lowStockItems = inventory.filter(item => item.quantity < 5);
        
     
        const valueCalculations = await UserInventory.aggregate([
    {
        $group: {
            _id: null, 
            totalValue: { $sum: "$cost" }
        }
    }
]);
        
        const inventoryStats = {
           totalValue: valueCalculations[0]?.totalValue || 0,
            totalItems: inventory.length,
            expiredCount: expiredItems.length,
            expiringSoonCount: expiringSoonItems.length,
            lowStockCount: lowStockItems.length,
           
        };
        
        response.render("all-items", { 
            user,
            inventory,
            expiredItems,
            expiringSoonItems,
            lowStockItems,
            inventoryStats
        });
        
    } catch (err) {
        console.error('Error fetching inventory:', err);
        response.status(500).render("error", { error: "Server error" });
    }
});

app.get("/api/delete-item-33968748", async (request, response) => {
    const { inventoryId, userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        let itemSelect = null;
        if (inventoryId) {
            itemSelect = await UserInventory.findOne({ inventoryId });
        }
        
        const inventory = await UserInventory.find({ }).sort({ createdDate: -1 });
        
        response.render("delete-item", { 
            user,
            inventory,
            itemSelect
        });
    } catch (err) {
        console.error(err);
        response.status(500).render("error", { error: "Server error" });
    }
});


app.post("/api/delete-item-33968748", async (request, response) => {
    const { userId } = request.query;
    const { inventoryId } = request.body;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        const item = await UserInventory.findOne({ inventoryId });
        
        if (!item) {
            return response.redirect(`/api/all-items-33968748?userId=${userId}&error=Item%20not%20found`);
        }
        
        await UserInventory.findOneAndDelete({ inventoryId });
        
        response.redirect(`/api/all-items-33968748?userId=${userId}`);
    } catch (err) {
        console.error(err);
        response.status(500).render("error", { error: "Server error" });
    }
});



app.get("/api/update-item-33968748", async (request, response) => {
    
    const { inventoryId, userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        let selectedItem = null;
        if (inventoryId) {
            selectedItem = await UserInventory.findOne({ inventoryId });
        }
        
       
        const inventory = await UserInventory.find({}).sort({ createdDate: -1 });
        
        response.render("update-item", { 
            user,
            inventory,
            selectedItem,
            errors: []
        });
    } catch (err) {
        console.error('Error loading update item form:', err);
        response.status(500).render("error", { error: "Server error" });
    }
});
//Post for update item does not work 
// app.post("/api/update-item-33968748", async (request, response) => {
//     const { userId } = request.query;
//     const { 
//         inventoryId, 
//         quantity, 
//         unit, 
//         purchaseDate, 
//         expirationDate, 
//         location, 
//         cost 
//     } = request.body;
    
//     if (!userId) {
//         return response.redirect("/?error=Please%20log%20in");


//     }

  
//     try {
//         const user = await User.findOne({ userId });
//         if (!user) {
//             return response.redirect("/?error=Invalid%20user");
//         }
   
 
//         const updateData = {
//             quantity: parseFloat(quantity),
//             unit: unit,
//             purchaseDate: purchaseDate,
//             expirationDate: expirationDate,
//             location: location,
//             cost: parseFloat(cost)
//         };
        
      
//         const updatedItem = await UserInventory.findOneAndUpdate(
//             { inventoryId },
//             updateData,
//             { 
//                 runValidators: true, 
//                 new: true 
//             }
//         );
        
//         if (!updatedItem) {
//             return response.redirect(`/api/update-item-33968748?userId=${userId}&error=Item%20not%20found`);
//         }
        
       
//         response.redirect(`/api/all-items-33968748?userId=${userId}&success=Item%20updated%20successfully`);
        
//     } catch (error) {
//         console.error('Error updating item:', error);
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             const selectedItem = await UserInventory.findOne({ inventoryId });
//             const inventory = await UserInventory.find({}).sort({ createdDate: -1 });
            
//             return response.status(400).render("update-item", {
//                 user: await User.findOne({ userId }),
//                 inventory,
//                 selectedItem: selectedItem,
//                 errors
//             });
//         }
        
//         response.status(500).render("error", { error: 'Server Error' });
//     }
// });


app.get("/api/update-recipe-33968748", async (request, response) => {
    const { recipeId, userId } = request.query;
    
    if (!userId) {
        return response.redirect("/?error=Please%20log%20in");
    }
    
    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return response.redirect("/?error=Invalid%20user");
        }
        
        // Only chefs can update recipes
        if (user.role !== 'chef') {
            return response.status(403).render("error", { 
                error: "Access Denied: Only chefs can update recipes" 
            });
        }
        
        let selectedRecipe = null;
        if (recipeId) {
            selectedRecipe = await Recipe.findOne({ recipeId, userId: user.userId });
            
            if (!selectedRecipe) {
                return response.redirect(`/api/update-recipe-33968748?userId=${userId}&error=Recipe%20not%20found`);
            }

            
        }
        
        // Get all recipes owned by this user for the dropdown
        const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
        
        response.render("update-recipe", { 
            user,
            recipes,
            selectedRecipe,
            errors: []
        });
    } catch (err) {
        console.error('Error loading update recipe form:', err);
        response.status(500).render("error", { error: "Server error" });
    }
});
//Post update recipe does not work
// // POST: Update recipe
// app.post("/api/update-recipe-33968748", async (request, response) => {
//     const { userId } = request.query;
//     const { 
//         recipeId,
//         title, 
//         cuisineType, 
//         prepTime, 
//         difficulty, 
//         servings, 
//         ingredients, 
//         instructions, 
//         mealType 
//     } = request.body;
    
//     if (!userId) {
//         return response.redirect("/?error=Please%20log%20in");
//     }
     
    
//     try {
//         const user = await User.findOne({ userId });
//         if (!user) {
//             return response.redirect("/?error=Invalid%20user");
//         }
        
//         // Only chefs can update recipes
//         if (user.role !== 'chef') {
//             return response.status(403).render("error", { 
//                 error: "Access Denied: Only chefs can update recipes" 
//             });
//         }
//          const parsedServings = parseInt(servings);
// const parsedPrepTime = parseInt(prepTime);

// if (isNaN(parsedServings) || parsedServings <= 0) {
//     const selectedRecipe = await Recipe.findOne({ recipeId });
//     const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
    
//     return response.status(400).render("update-recipe", {
//         user,
//         recipes,
//         selectedRecipe: { ...selectedRecipe.toObject(), ...request.body ,  ingredients: parserIngredients(request.body.ingredients),
//             instructions: parseInstructions(request.body.instructions)},
//         errors: ['Servings must be a valid positive number']
//     });
// }
// if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
//     const selectedRecipe = await Recipe.findOne({ recipeId });
//     const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
    
//     return response.status(400).render("update-recipe", {
//         user,
//         recipes,
//         selectedRecipe: { ...selectedRecipe.toObject(), ...request.body ,  ingredients: parserIngredients(request.body.ingredients),
//             instructions: parseInstructions(request.body.instructions)},
//         errors: ['Servings must be a valid positive number']
//     });
// }
//         // Update the recipe using Mongoose - validators will handle validation
//         const updatedRecipe = await Recipe.findOneAndUpdate(
//             { recipeId, userId: user.userId },
//             {
//                 title: title.trim(),
//                 cuisineType: cuisineType.trim(),
//                 prepTime: parseInt(prepTime),
//                 difficulty: difficulty,
//                 servings: parseInt(servings),
//                 ingredients: parserIngredients(ingredients),
//                 instructions: parseInstructions(instructions),
//                 mealType: mealType
//             },
//             { 
//                 runValidators: true, 
//                 new: true 
//             }
//         );
        
//         if (!updatedRecipe) {
//             return response.redirect(`/api/update-recipe-33968748?userId=${userId}&error=Recipe%20not%20found`);
//         }
        
//         // Redirect to all recipes page with success message
//         response.redirect(`/api/all-recipes-33968748?userId=${userId}&success=Recipe%20updated%20successfully`);
        
//     } catch (error) {
//         console.error('Error updating recipe:', error);
        
//         // Fetch user again for error handling
//         const user = await User.findOne({ userId });
        
//         if (error.name === 'ValidationError') {
//             const errors = Object.values(error.errors).map(err => err.message);
//             const selectedRecipe = await Recipe.findOne({ recipeId });
//             const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
            
//             return response.status(400).render("update-recipe", {
//                 user,
//                 recipes,
//                 selectedRecipe: { ...selectedRecipe.toObject(), ...request.body },
//                 errors
//             });
//         }
        
//         if (error.code === 11000) {
//             const selectedRecipe = await Recipe.findOne({ recipeId });
//             const recipes = await Recipe.find({ userId: user.userId }).sort({ createdAt: -1 });
            
//             return response.status(400).render("update-recipe", {
//                 user,
//                 recipes,
//                 selectedRecipe: { ...selectedRecipe.toObject(), ...request.body },
//                 errors: ['A recipe with this title already exists']
//             });
//         }
        
//         response.status(500).render("error", { error: 'Server Error' });
//     }
// });

app.use((request, response) => {
    response.status(404).render("error", {error: "Page Not Found"});
}); 


async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(PORT_NUMBER, () => {
            console.log(`Server is running on http://localhost:${PORT_NUMBER}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();



function parserIngredients(blockText) {
    const replaceNewLine = blockText.replace(/\r?\n/g, ",");

    const textArray = replaceNewLine.split(",").map(line => line.trim()).filter(line => line.length>0);

  
    return textArray;
}

function parseInstructions(blockText) {
    const textArray = blockText.split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return textArray;
}
async function IdGenerator(collection) {

    const firstChar = collection.charAt(0);
    const last= await mongoose.model(collection).findOne().sort({ createdAt: -1 });

    let nextId = `${firstChar}-00001`;

    if (last) {
    const lastNum = parseInt(collection === RECIPE ? last.recipeId.split("-")[1] : collection === USER ? last.userId.split("-")[1] : last.inventoryId.split("-")[1]);
    nextId = `${firstChar}-${String(lastNum + 1).padStart(5, "0")}`;
    }

    return nextId;
}
