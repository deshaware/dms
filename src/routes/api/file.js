const router = require('express').Router();
const Directory = require('../../models/Directory');
const File = require('../../models/File');
const auth = require("../../middlewares/auth");
const validateName = require("../../services/nameValidation.service");
const { checkIfFolderExist, checkIfFileExist, getFiles, moveFileToDestinationFolder } = require('../../services/directory.service');

//tested
router.post('/createFile', auth, async ( req, res ) => {
    try {
        const { fileName, fileContent, folderName } = req.body;
        if(! fileName || !fileContent)
            throw new Error("Please provide valid fileName and content ");
        const { _id } = req.user;
        validateName(fileName);
        const path = folderName ? '/my-drive/' + folderName.toLowerCase() : '/my-drive';
        const folder = await Directory.findOne({ path, owner_id: _id, isDeleted: false })
        if(!folder)
            throw new Error(`${folderName} not found! You may want to create a new folder before adding a file`)
        const newFile = new File({ fileName: fileName.toLowerCase(),
            fileContent,
            parent_id: folder._id, 
            owner_id: _id,
            dir_id: folder._id,
            createdBy: _id,  
            updatedBy: _id 
        });
        await newFile.validateFileName( req.user, folder )
        await newFile.save();
        console.log(newFile.path)
        res.status(201).send({ 
            status: 'SUCCESS',
            message: 'File created Successfully',
            response: { 
                fileName: fileName.toLowerCase(),
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message: 'Could not create file', error: error.message })
    }
});

//tested
router.get('/getFiles/:folderName', auth, async (req, res) => {
    try {
        const { _id } = req.user;
        const { folderName } = req.params;

        if(!checkIfFolderExist(folderName.toLowerCase(), _id))
            throw new Error(`Folder ${folderName} does not exist`);
        const files = await getFiles(folderName.toLowerCase(), _id);
        res.status(200).send({
            status: 'SUCCESS',
            message: `Retrived all the files inside ${folderName}`,
            response: files
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message: 'Could not retrieve files', error: error.message })
    }
});

//not tested
router.put('/moveFile/', auth, async ( req , res) => {
    try {
        const { _id } = req.user;
        let { fileName, sourceFolder, destinationFolder } = req.body;
        if(!fileName)
            throw new Error("Invalid Filename!")
        if(sourceFolder && ! await checkIfFolderExist(sourceFolder.toLowerCase(), _id))
            throw new Error(`${sourceFolder} does not exist`);
        if(destinationFolder && ! await checkIfFolderExist(destinationFolder.toLowerCase(), _id))
            throw new Error(`${destinationFolder} does not exist`);
        if(!await checkIfFileExist(fileName.toLowerCase(), sourceFolder ? sourceFolder.toLowerCase() : null, _id))
            throw new Error(`Could not find file "${fileName}" in ${sourceFolder}`);
        await moveFileToDestinationFolder(fileName.toLowerCase(), destinationFolder ? destinationFolder.toLowerCase(): null, _id);
        res.status(201).send({ status: 'SUCCESS', message: 'File moved Successfully'});
    } catch (error) {
        res.status(400).send({ status: 'FAILED', message: 'Could not move file', error: error.message })
    }
});

//tested
router.get('/getAllFiles', auth, async (req, res) => {
    try {
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
