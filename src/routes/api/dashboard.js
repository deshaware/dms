const router = require('express').Router();
const Directory = require('../../models/Directory');
const File = require('../../models/File');
const auth = require("../../middlewares/auth");

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
        res.status(400).send({ status: 'FAILED', error: error.message })
    }
});

router.get('/getFiles', auth, async (req, res) => {
    try {
        const { folderName } = req.body;
        // if no folderName provided, try to get files in root directory
        const { _id } = req.user;
        //get all folders except the home one
        let files = await File.find({
            isDeleted: false,
            owner_id: _id
        }, [
            'fileName',
            'dir_id',
            'fileContent'
        ]).populate('dir_id').exec();
        files = files.filter( file => file.dir_id.folderName.replace('/my-drive', ''))
            .map( file => {
                return {
                    fileName: file.fileName,
                    fileContent: file.fileContent,
                    folderName: file.dir_id.path === '/my-drive' ? '' : file.dir_id.folderName,
                    path: file.dir_id.path + '/' + file.fileName
                }
            });
        const response = {
            status: 'SUCCESS',
            message: 'Files and Folders retrieved successfully',
            response:{ files }
        };
        res.status(200).send(response)
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', error: error.message })
    }
});

module.exports = router;