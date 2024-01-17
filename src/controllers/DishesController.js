const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
    async create(request, response) {
    const {title, description, price, ingredients, cartegory} = request.body;
    const image = request.file.filename;
    const user_id = request.user.id

    const diskStorage = new DiskStorage()
    const filename = await diskStorage.saveFile(image)

    const [dish_id] = await knex("dishes").insert({
        title,
        description,
        image: filename,
        user_id,
        price,
        cartegory,
    });

    const ingredientsInsert = ingredients.map(name => {
        return{
            dish_id,
            name,
            user_id
        }
    });

    await knex("ingredients").insert(ingredientsInsert);

    response.json();
    }
    async show (request, response){
        const {id} = request.params;

        const dish = await knex("dishes").where({id}).first();
        const ingredients = await knex("ingredients").where({dish_id : id}).orderBy("name");

        return response.json({
            ...dish,
            ingredients
        })
        
    }
    async delete(request, response){
        const {id} = request.params;

        await knex("dishes").where({ id }).delete();

        return response.json();
    }
    async index (request, response){
        const {title, ingredients} = request.query;

        const user_id = request.user.id;

        let dishes;

        if(ingredients){
        const filterIngredients = ingredients.split(',').map(ingredient => ingredient);
        dishes = await knex("ingredients")
        .select([ 
            "dishes.id",
            "dishes.title",
            "dishes.user_id"
        ])
        .where("dishes.user_id", user_id)
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
        .orderBy("dishes.title")
        } 
        
        else {

         dishes = await knex("dishes")
        .where({user_id})
        .whereLike("title", `%${title}%`)
        .orderBy("title");

    }
    const userIngredients = await knex("ingredients").where({user_id});
    const dishesWithIngredients = dishes.map(dish => {
        const dishIngredients = userIngredients.filter(ingredient => ingredient.dish_id === dish.id)

        return {
            ...dish,
            ingredients: dishIngredients
        }
    })
    return response.json(dishesWithIngredients)
    }
}

module.exports = DishesController;