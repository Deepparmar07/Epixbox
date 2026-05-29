(async()=>{
  try{
    const { Gallery, Photo, sequelize } = require('../models')
    await sequelize.authenticate()
    const g = await Gallery.findOne({ where: { visibility: 'private' } })
    if(!g) { console.log('No private gallery'); process.exit(0) }
    console.log('Found gallery', g.id, g.slug)
    const p = await Photo.findOne({ where: { gallery_id: g.id } })
    if(!p) { console.log('No photo in private gallery'); process.exit(0) }
    console.log('Photo', p.id)
    process.exit(0)
  }catch(err){ console.error(err); process.exit(1) }
})()
