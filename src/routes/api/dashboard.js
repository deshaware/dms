const router = require('express').Router();
const Directory = require('../../models/Directory');
const File = require('../../models/File');
const auth = require("../../middlewares/auth");

/**
 * @swagger
 * /dashboard:
 *  get:
 *      summary: Dashboard for the logged in user
 *      description: Retrieves all the folders and files without folders
 *      tags:
 *          - Dashboard
 *      responses:
 *          401:
 *              description: Unauthorized
 *          400:
 *              description: Failed to retrieve files and folders
 *          200:
 *              description: Files and Folders retrieved successfully
 * 
 */
router.get('/', auth, async (req, res) => {
    try {
        const { _id } = req.user;
        //get all folders except the home one
        let folders = await Directory.find({ 
            isDeleted: false, 
            owner_id: _id 
        }, [
            'path','folderName'
        ]);
        folders = folders.filter( folder => folder.path.replace('/my-drive', ''))
            .map( file => { 
                return {
                    folderName: file.folderName,
                    path: file.path
            }});
        let files = await File.find({
            isDeleted: false,
            owner_id: _id
        }, [
            'fileName',
            'dir_id',
            'fileContent'
        ]).populate('dir_id').exec();
        files = files.filter( file => file.dir_id.path === '/my-drive')
            .map( file => {
                return {
                    fileName: file.fileName,
                    fileContent: file.fileContent
                }
            });
        const response = {
            status: 'SUCCESS',
            message: 'Files and Folders retrieved successfully',
            response:{
                folders,
                files
            }
        };
        res.status(200).send(response)
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message:'Failed to retrieve files and folders', error: error.message })
    }
});

module.exports = router;