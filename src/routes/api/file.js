const router = require('express').Router();
const Directory = require('../../models/Directory');
const File = require('../../models/File');
const User = require('../../models/User');
const auth = require("../../middlewares/auth");
const validateName = require("../../services/nameValidation.service");


router.post('/createFile', auth, async ( req, res ) => {
    try {
        const { fileName, fileContent, folderName } = req.body;
        if(! fileName || !fileContent)
            throw new Error("Please provide valid fileName and content ");
        const { _id } = req.user;
        validateName(fileName);
        const path = folderName ? '/my-drive/' + folderName : '/my-drive';
        const folder = await Directory.findOne({ path, owner_id: _id, isDeleted: false })
        if(!folder)
            throw new Error(`${folderName} not found! You may want to create a new folder before adding a file`)
        const newFile = new File({ fileName,
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
                fileName: fileName,
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', error: error.message })
    }
});

module.exports = router;
