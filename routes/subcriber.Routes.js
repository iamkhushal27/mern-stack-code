const {toggelSubscription,getChannelSubscriber}=require('../controllers/subscription.controller')
const {Router}=require('express')
const { authenrication } = require('../middlewares/auth.middlewares')
const router=Router()

router.use(authenrication)
router.route('/:channelid').post(toggelSubscription)
router.route('/channel/:channelid').get(getChannelSubscriber)

module.exports=router