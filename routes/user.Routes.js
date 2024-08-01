const {userRigistration,loginUser,logout,regenerateAccessToken,updatePassword,updateUserName,updateFullName,updateavatar,updateCoverImage,getUserChannel,getWatchHistory}=require('../controllers/user.controller')
const upload=require('../middlewares/multr.middlewares')
const {Router}=require('express')
const {authenrication}=require('../middlewares/auth.middlewares')


const router=Router()
router.route('/register').post(upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    },
]),userRigistration)
router.route('/login').post(loginUser)
router.route('/logout').post(authenrication,logout)
router.route('/generateaccesstoken').post(regenerateAccessToken)
router.route('/passwordupdate').put(authenrication,updatePassword)
router.route('/usernamechange').put(authenrication,updateUserName)
router.route('/fullnamechange').put(authenrication,updateFullName)
router.route('/avatarchange').put(authenrication,upload.single('avatar'),updateavatar)
router.route('/coverimagechange').put(authenrication,upload.single('coverImage'),updateCoverImage)
router.route('/:usernameofchannel').get(authenrication,getUserChannel)
router.route('/getwatchhistory/:user').get(authenrication,getWatchHistory)


module.exports=router


