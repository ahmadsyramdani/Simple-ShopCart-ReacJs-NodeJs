const { validationResult } = require('express-validator')
const { Order, OrderItem, Product } = require('../models')
const response = require('../util/response')
const logger = require('../config/logger')

const create = async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return response(req, res, 422, null, 'Validation failed', errors.array())
    }

    const order = await Order.create({
      status: 'complete',
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      shippingAddress: req.body.shippingAddress,
      totalPayment: req.body.totalPayment
    })

    if (await order) {
      for (const orderItem of req.body.orderItems) {
        await order.createOrderItem({
          productId: orderItem.productId,
          quantity: orderItem.quantity
        })

        const product = await Product.findOne({ where: { id: orderItem.productId } })
        await product.update({
          stock: product.stock - orderItem.quantity
        })
      }

      Order.findOne({
        where: { id: order.id },
        include: {
          model: OrderItem
        }
      }).then(result => {
        response(req, res, 201, result, 'Order is successful')
      }).catch(error => {
        logger.error(JSON.stringify(error))
        response(req, res, 500, null, 'Something went wrong..', error)
      })
    } else {
      return response(req, res, 500, null, 'Something went wrong..')
    }
  } catch (error) {
    logger.error(JSON.stringify(error))
    response(req, res, 500, null, 'Something went wrong..', error)
  }
}

module.exports = { create }
