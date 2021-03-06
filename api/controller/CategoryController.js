const { Category } = require('../models')
const response = require('../util/response')
const logger = require('../config/logger')
const validateUuid = require('uuid-validate')

const index = async (req, res) => {
  try {
    const currentPage = req.query.pages || 1
    const options = {
      page: currentPage,
      paginate: 10,
      order: [['createdAt', 'DESC']]
    }
    const { docs, pages, total } = await Category.paginate(options)
    if (docs) {
      response(req, res, 200, { docs, pages, total, currentPage }, 'Category results')
    } else {
      docs.catch(error => {
        logger.error(JSON.stringify(error))
        response(req, res, 500, null, 'Fetch categories error', error)
      })
    }
  } catch (error) {
    logger.error(JSON.stringify(error))
    response(req, res, 500, null, 'Fetch categories error', error)
  }
}

const show = async (req, res) => {
  try {
    if (!validateUuid(req.params.id)) {
      return response(req, res, 422, null, 'Invalid input syntax for type uuid')
    }

    await Category.findOne({ where: { id: req.params.id } }).then(category => {
      if (!category) {
        return response(req, res, 404, null, 'Data not found')
      }
      response(req, res, 200, category, 'Ok')
    }).catch(error => {
      logger.error(JSON.stringify(error))
      response(req, res, 500, null, 'Fetch category error', error)
    })
  } catch (error) {
    logger.error(JSON.stringify(error))
    response(req, res, 500, null, 'Fetch products error', error)
  }
}

module.exports = { index, show }
