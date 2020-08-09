const router = require('express').Router();
const Directory = require('../../models/Directory');
const auth = require("../../middlewares/auth");
const validateName = require("../../services/nameValidation.service");

/**
 * @swagger
 * /folder/createFolder:
 *  post:
 *      summary: Creates a new folder 
 *      description: Creates a new folder under root directory
 *      tags:
 *          - Create a folder
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema: # Request body contents
 *                      type:
 *                          object
 *                      properties:
 *                          folderName:
 *                              type:
 *                                  string
 *      responses:
 *          401:
 *              description: Unauthorized
 *          201:
 *              description: Folder created Successfully
 *          400:
 *              description: Failed to create a folder
 *          422:
 *              description: Unprocessable Entity
 * 
 */
router.post('/createFolder', auth, async( req, res ) => {
    try {
        const { folderName } = req.body;
        if(!folderName)
            throw new Error("Please provide a valid fileName");
        const { _id } = req.user;
        validateName(folderName);
        //assuming no subfolders
        const rootFolder = await Directory.findOne({ path: '/my-drive', owner_id: _id, isDeleted: false })
        const newFolder = new Directory({ folderName: folderName.toLowerCase(), 
            parent_id: rootFolder._id, 
            path: '/my-drive/'+ folderName.toLowerCase(),  
            owner_id: _id,  
            createdBy: _id,  
            updatedBy: _id 
        });
        await newFolder.validateCreateDirectory( req.user )
        await newFolder.save();
        res.status(201).send({ 
            status: 'SUCCESS',
            message: 'Folder created Successfully',
            response: { 
                folder: folderName,
                path: newFolder.path
            }
        });
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: 'FAILED', message:'Failed to create a folder', error: error.message })
    }
});

module.exports = router;
