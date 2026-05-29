require('dotenv').config()
const path = require('path')

async function run() {
  try {
    const { Photo, PriceList, Product, sequelize } = require('../models')

    await sequelize.authenticate()

    // Find a sample photo to attach pricing to
    const photo = await Photo.findOne()
    if (!photo) {
      console.error('No photos found in database to seed pricing for.')
      process.exit(1)
    }

    const userId = photo.user_id
    console.log('Found photo', photo.id, 'owner', userId)

    const [list, created] = await PriceList.findOrCreate({
      where: { user_id: userId, name: 'Default Price List' },
      defaults: { user_id: userId, name: 'Default Price List', is_default: true },
    })

    if (created) console.log('Created PriceList', list.id)
    else console.log('Using existing PriceList', list.id)

    // Create a sample product if none exist on this list
    const existing = await Product.findOne({ where: { price_list_id: list.id } })
    if (existing) {
      console.log('Product already exists for price list:', existing.id)
      process.exit(0)
    }

    const product = await Product.create({
      price_list_id: list.id,
      category: 'print',
      name: '8x10 Lustre',
      width_in: 8,
      height_in: 10,
      paper_type: 'Lustre',
      price_cents: 1800,
      is_active: true,
      sort_order: 0,
    })

    console.log('Created product', product.id)
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

run()
