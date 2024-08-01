const upload=require('../middlewares/multr.middlewares')
const {Router}=require('express')
const {publishVideo,updateVideo,deleteVideo,getSingleVideo,getAllVideos,videoStatus}=require('../controllers/video.controller')
const {authenrication}=require('../middlewares/auth.middlewares')

// const upload=require('../middlewares/multr.middlewares')

const router=Router()
router.use(authenrication)

router.route('/').post(upload.fields([{
    name: "videoFile",
    maxCount: 1,
},
{
    name: "thumbnail",
    maxCount: 1,
},
]),publishVideo)
router.route('/:videoid').patch(upload.single("thumbnail"),updateVideo)
router.route('/:videoid').delete(deleteVideo)
router.route('/:videoid').get(getSingleVideo)
router.route('/').get(getAllVideos)
router.route('/ispublish/:videoid').patch(videoStatus)

module.exports=router


