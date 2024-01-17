const { Router } = require("express");
const DishesController = require("../controllers/DishesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const upload = multer(uploadConfig.MULTER);


const dishesRoutes = Router();
const dishesController = new DishesController();
dishesRoutes.use(ensureAuthenticated);
dishesRoutes.post("/", upload.single("image"), dishesController.create );
dishesRoutes.get("/:id", dishesController.show);
dishesRoutes.delete("/:id", dishesController.delete);
dishesRoutes.get("/", dishesController.index);

module.exports = dishesRoutes;