const pool = require('../config/db')


const getCategories = async (req,res)=>{
    try{
        const userId = req.user.id

        const result = await pool.query(
            `SELECT id, name, color, user_id FROM categories
            WHERE  user_id = $1 or user_id IS NULL
                   ORDER BY 
         CASE WHEN user_id IS NULL THEN 0 ELSE 1 END,
         name ASC`,
            [userId]
        )

        return res.json({
            success: true,
            data: result.rows
        })

    }catch(err){
        console.error('Error fetching categories:', err.message)
        res.status(500).json({ error: 'Internal server error' })
    }
}

const createCategory = async (req,res)=>{
    try{
        const {name, color} = req.body
        const userId = req.user.id

        if(!name || !color){
            return res.status(400).json({error: 'Name and color are required'})
        }

        const existing = await pool.query(
      `SELECT id FROM categories 
       WHERE LOWER(name) = LOWER($1) 
       AND (user_id = $2 OR user_id IS NULL)`,
      [name.trim(), userId]
    )

    if(existing.rows.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' })   
    } 

        const result = await pool.query(
      `INSERT INTO categories (name, color, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), color || '#868E96', userId]
    )

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0]
    })


    }catch(err){
        console.error('Error creating category:', err.message)  
        res.status(500).json({ error: 'Internal server error' })
    }
}


const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, color } = req.body
    const userId = req.user.id

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' })
    }


    const result = await pool.query(
      `UPDATE categories
       SET name = $1, color = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name.trim(), color || '#868E96', id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Category not found or you cannot edit default categories' 
      })
    }

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0]
    })

  } catch (err) {
    console.error('Update category error:', err.message)
    return res.status(500).json({ error: 'Failed to update category.' })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1 AND user_id = $2
       RETURNING id, name`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Category not found or you cannot delete default categories' 
      })
    }

    return res.json({
      success: true,
      message: `Category "${result.rows[0].name}" deleted successfully`
    })

  } catch (err) {
    console.error('Delete category error:', err.message)
    return res.status(500).json({ error: 'Failed to delete category.' })
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}