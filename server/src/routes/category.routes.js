const express= require("express");
const router = express.Router();
const {getCategories, createCategory, updateCategory, deleteCategory} = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', getCategories)
router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router;