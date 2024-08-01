const {createPlaylist,deletePlaylist,addVideoToPlaylist,getUserPlaylists,getPlaylistById,removeVideoFromPlaylist,updatePlaylist}=require('../controllers/playlist.controller')
const {Router}=require('express')
const {authenrication}=require('../middlewares/auth.middlewares')

const router=Router()

router.use(authenrication)
router.route('/').post(createPlaylist)
router.route('/:playlistid').delete(deletePlaylist)
router.route('/add/:playlistid/:videoid').patch(addVideoToPlaylist)
router.route('/remove/:playlistid/:videoid').patch(removeVideoFromPlaylist)
router.route('/:userid').get(getUserPlaylists)
router.route('/getplaylist/:playlistid').get(getPlaylistById)
router.route('/update/:playlistid').patch(updatePlaylist)

module.exports=router